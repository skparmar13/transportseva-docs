import { expect, test, type Page } from '@playwright/test';

const password = 'TransportSevaE2E@2026';
const runId = `${Date.now()}`.slice(-8);

function reviewUser(role: 'shipper' | 'truck-owner', sequence: number) {
  const mobileTail = String((Number(runId) + sequence) % 1_000_000_000).padStart(9, '0');
  return { role, name: `Review ${role === 'shipper' ? 'Shipper' : 'Fleet Owner'} ${sequence}`, email: `review-${role}-${runId}-${sequence}@transportseva.test`, mobile: `7${mobileTail}` };
}

async function signUpAndCompleteProfile(page: Page, user: ReturnType<typeof reviewUser>): Promise<void> {
  await page.goto('/auth/signup');
  await page.locator('.role-card').filter({ hasText: user.role === 'shipper' ? /Shipper/i : /Truck\s*\/\s*Fleet Owner/i }).click();
  await page.locator('input[name="fullName"]').fill(user.name);
  await page.locator('input[name="mobile"]').fill(user.mobile);
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.locator('input[name="agreeTerms"]').check();
  const otpRequested = page.waitForResponse((response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/auth/signup/request-otp'), { timeout: 45_000 });
  await page.getByRole('button', { name: /create account/i }).click();
  expect((await otpRequested).status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\/otp-verification\?next=signup/, { timeout: 45_000 });
  const otp = await page.locator('.otp-debug strong').innerText();
  const inputs = page.locator('.otp-box');
  for (const [index, digit] of [...otp].entries()) await inputs.nth(index).press(digit);
  await page.getByRole('button', { name: /verify otp/i }).click();
  await expect(page).toHaveURL(/\/auth\/profile-setup/, { timeout: 45_000 });
  await page.locator('input[name="designation"]').fill('Review workflow tester');
  await page.getByRole('button', { name: /finish setup/i }).click();
  await expect(page).toHaveURL(new RegExp(`/${user.role}/dashboard`), { timeout: 45_000 });
}

async function login(page: Page, user: { role: 'shipper' | 'truck-owner' | 'admin'; email: string }, userPassword = password): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(user.email);
  await page.locator('input[name="password"]').fill(userPassword);
  const response = page.waitForResponse((candidate) => candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith('/api/auth/login'), { timeout: 45_000 });
  await page.getByRole('button', { name: /^log in$/i }).click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`/${user.role}/dashboard`), { timeout: 45_000 });
}

async function submitReview(page: Page, portal: 'shipper' | 'truck-owner', rating: number, comment: string, expectedStatus: 200 | 201): Promise<string> {
  await page.goto(`/${portal}/reviews`);
  await expect(page.getByRole('heading', { name: /review transportseva/i })).toBeVisible({ timeout: 45_000 });
  await page.getByRole('radio', { name: `${rating} stars` }).click();
  await page.locator('#review-comment').fill(comment);
  const submitted = page.waitForResponse((response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/reviews'), { timeout: 45_000 });
  await page.getByRole('button', { name: /submit for moderation/i }).click();
  const response = await submitted;
  expect(response.status()).toBe(expectedStatus);
  const payload = await response.json() as { data: { uuid: string; status: string } };
  expect(payload.data.status).toBe('pending');
  await expect(page.getByText(/awaiting admin moderation/i)).toBeVisible({ timeout: 45_000 });
  return payload.data.uuid;
}

test.describe('moderated customer reviews', () => {
  test('shipper and fleet-owner reviews stay private until moderation and then publish with notifications', async ({ page }) => {
    test.setTimeout(600_000);
    const shipper = reviewUser('shipper', 41);
    const owner = reviewUser('truck-owner', 42);
    const shipperComment = `The review journey is clear, dependable, and transparent ${runId}.`;
    const ownerComment = `The fleet portal helps us manage marketplace work effectively ${runId}.`;

    await signUpAndCompleteProfile(page, shipper);
    const shipperReviewUuid = await submitReview(page, 'shipper', 5, shipperComment, 201);
    await signUpAndCompleteProfile(page, owner);
    const ownerReviewUuid = await submitReview(page, 'truck-owner', 4, ownerComment, 201);
    console.log(`Review test: shipper ${shipper.email} (${shipperReviewUuid}); fleet owner ${owner.email} (${ownerReviewUuid})`);

    await login(page, { role: 'admin', email: 'admin@test.local' }, 'password123');
    await page.goto('/admin/reviews');
    await expect(page.getByText(shipperComment)).toBeVisible({ timeout: 90_000 });
    const shipperCard = page.locator('.review-card').filter({ hasText: shipperComment });
    const published = page.waitForResponse(async (response) => {
      if (response.request().method() !== 'PATCH' || !/\/api\/admin\/reviews\/.+/.test(new URL(response.url()).pathname)) return false;
      const payload = await response.json().catch(() => null) as { data?: { uuid?: string } } | null;
      return payload?.data?.uuid === shipperReviewUuid;
    }, { timeout: 45_000 });
    await shipperCard.getByRole('button', { name: /approve & publish/i }).click();
    expect((await published).status()).toBe(200);

    const ownerCard = page.locator('.review-card').filter({ hasText: ownerComment });
    await ownerCard.getByRole('button', { name: /request changes/i }).click();
    await page.locator('#rejection-note').fill('Please include a specific example of the service experience.');
    const rejected = page.waitForResponse(async (response) => {
      if (response.request().method() !== 'PATCH' || !/\/api\/admin\/reviews\/.+/.test(new URL(response.url()).pathname)) return false;
      const payload = await response.json().catch(() => null) as { data?: { uuid?: string } } | null;
      return payload?.data?.uuid === ownerReviewUuid;
    }, { timeout: 45_000 });
    await page.getByRole('button', { name: /send feedback/i }).click();
    expect((await rejected).status()).toBe(200);

    await page.goto('/');
    await expect(page.getByText(shipperComment)).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(ownerComment)).toHaveCount(0);

    await login(page, shipper);
    const noticeResponse = await page.waitForResponse(async (response) => {
      if (response.request().method() !== 'GET' || !new URL(response.url()).pathname.endsWith('/api/notifications') || !response.ok()) return false;
      const body = await response.json().catch(() => null) as { data?: Array<{ id: string; title: string; data?: { review_uuid?: string } }> } | null;
      return !!body?.data?.some((item) => item.title === 'Review published' && item.data?.review_uuid === shipperReviewUuid);
    }, { timeout: 90_000 });
    const notices = await noticeResponse.json() as { data: Array<{ id: string; title: string; data?: { review_uuid?: string } }> };
    const notice = notices.data.find((item) => item.title === 'Review published' && item.data?.review_uuid === shipperReviewUuid)!;
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    const reviewLoaded = page.waitForResponse((response) => response.request().method() === 'GET'
      && new URL(response.url()).pathname.endsWith('/api/reviews/mine'), { timeout: 45_000 });
    await page.locator(`[data-notification-id="${notice.id}"]`).click();
    await expect(page).toHaveURL(/\/shipper\/reviews/, { timeout: 45_000 });
    expect((await reviewLoaded).status()).toBe(200);
    await expect(page.getByText(/published on the home page/i)).toBeVisible({ timeout: 45_000 });

    await login(page, owner);
    const ownerReviewLoaded = page.waitForResponse((response) => response.request().method() === 'GET'
      && new URL(response.url()).pathname.endsWith('/api/reviews/mine'), { timeout: 45_000 });
    await page.goto('/truck-owner/reviews');
    expect((await ownerReviewLoaded).status()).toBe(200);
    await expect(page.getByText('Please include a specific example of the service experience.')).toBeVisible({ timeout: 45_000 });
    await page.getByRole('radio', { name: '5 stars' }).click();
    await page.locator('#review-comment').fill(`${ownerComment} We value the straightforward dispatch updates.`);
    const resubmitted = page.waitForResponse((response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/reviews'), { timeout: 45_000 });
    await page.getByRole('button', { name: /submit for moderation/i }).click();
    expect((await resubmitted).status()).toBe(200);
    await expect(page.getByText(/awaiting admin moderation/i)).toBeVisible({ timeout: 45_000 });
  });
});
