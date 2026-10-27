import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const setup = process.env.E2E_AUDIT_SETUP_REPORT ? JSON.parse(readFileSync(process.env.E2E_AUDIT_SETUP_REPORT, 'utf8')) : null;
const previous = setup?.suites.flatMap((suite: any) => suite.specs).flatMap((spec: any) => spec.tests).flatMap((entry: any) => entry.results)
  .flatMap((result: any) => result.attachments).filter((attachment: any) => attachment.name === 'admin-access-records.json')
  .map((attachment: any) => JSON.parse(Buffer.from(attachment.body, 'base64').toString())).find((record: any) => record.usersCreated?.length);
const run = previous?.run ?? String(Date.now());
const password = 'TransportSevaE2E@2026';
const ownerEmail = 'verify-truck-owner-1793028294862-62@transportseva.test';
const created = previous?.usersCreated[0] ?? { role: 'shipper', email: `audit-shipper-${run}@transportseva.test`, name: `Audit Verification ${run.slice(-6)}`, mobile: `7${String(Number(run.slice(-8)) + 81).padStart(9, '0')}`, password };
const evidence: Record<string, unknown> = { run, database: 'transportseva', usersCreated: previous?.usersCreated ?? [], existingUsers: [ownerEmail, 'admin@test.local'], realPayments: 'skipped', gps: 'skipped' };

const response = (page: Page, method: string, path: string) => page.waitForResponse((result) => result.request().method() === method && new URL(result.url()).pathname.endsWith(`/api/${path}`), { timeout: 90_000 });
async function request(page: Page, method: string, path: string, expected = 200, data?: unknown) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const base = await page.evaluate(() => window.TRANSPORTSEVA_CONFIG?.apiBaseUrl ?? 'http://localhost:8080/api');
  expect(new URL(base).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  const result = await page.request.fetch(`${base}/${path}`, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, ...(data ? { data } : {}) });
  expect(result.status(), `${method} ${path}`).toBe(expected);
  return expected === 405 ? null : result.json();
}
async function login(page: Page, email: string, secret = password) {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(email);
  await page.locator('input[name="password"]').fill(secret);
  const loggedIn = response(page, 'POST', 'auth/login');
  await page.getByRole('button', { name: /^log in$/i }).click();
  expect((await loggedIn).status()).toBe(200);
  await expect(page).toHaveURL(/\/(truck-owner|admin|shipper)\/dashboard/, { timeout: 90_000 });
}

test('anonymous, demo staff, and forged local roles cannot enter administration', async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto('/admin/audit');
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 90_000 });
  await page.goto('/auth/staff/login');
  await expect(page.locator('.staff-demo')).toHaveCount(0);
  await page.locator('#staff-email').fill(`not-a-staff-${run}@transportseva.test`);
  await page.locator('#staff-password').fill('NotARealStaffPassword!');
  const denied = response(page, 'POST', 'auth/login');
  await page.getByRole('button', { name: 'Sign in to staff console' }).click();
  expect((await denied).status()).toBe(401);
  await expect(page.getByRole('alert')).toBeVisible();
  await login(page, ownerEmail);
  for (const path of ['admin/audit-events', 'admin/access/roles', 'users', 'roles', 'permissions']) await request(page, 'GET', path, 403);
  await request(page, 'POST', 'roles', 403, { name: 'No unauthorized role should be created' });
  await page.evaluate(() => {
    const user = JSON.parse(localStorage.getItem('transportseva.api_user') ?? '{}');
    localStorage.setItem('transportseva.api_user', JSON.stringify({ ...user, role: 'admin', roles: ['Super Admin'] }));
  });
  await page.goto('/admin/audit');
  await expect(page).toHaveURL(/\/truck-owner\/dashboard/, { timeout: 90_000 });
  await expect(page.getByRole('heading', { name: 'Audit Logs', exact: true })).toHaveCount(0);
  evidence['accessBoundaries'] = 'anonymous redirect, real staff rejection, non-admin APIs 403, forged local role redirected';
  await test.info().attach('admin-access-records.json', { body: Buffer.from(JSON.stringify(evidence, null, 2)), contentType: 'application/json' });
});

test('real moderation creates safe persistent audit history and roles are read-only', async ({ page }) => {
  test.setTimeout(600_000);
  try {
    if (previous) {
      await login(page, created.email, created.password);
      expect((await request(page, 'GET', 'reviews/mine')).data).toBeNull();
    } else {
    await page.goto('/auth/signup');
    await page.locator('.role-card').filter({ hasText: /Shipper/i }).click();
    for (const [name, value] of Object.entries({ fullName: created.name, mobile: created.mobile, email: created.email, password, confirmPassword: password })) await page.locator(`input[name="${name}"]`).fill(value);
    await page.locator('input[name="agreeTerms"]').check();
    const requested = response(page, 'POST', 'auth/signup/request-otp');
    await page.getByRole('button', { name: /create account/i }).click();
    expect((await requested).status()).toBe(200);
    await expect(page).toHaveURL(/otp-verification/, { timeout: 90_000 });
    const otp = await page.locator('.otp-debug strong').innerText();
    for (const [index, digit] of [...otp].entries()) await page.locator('.otp-box').nth(index).press(digit);
    const verified = response(page, 'POST', 'auth/signup/verify-otp');
    await page.getByRole('button', { name: /verify otp/i }).click();
    expect((await verified).status()).toBe(200);
    evidence['usersCreated'] = [created];
    await expect(page).toHaveURL(/profile-setup/, { timeout: 90_000 });
    await page.locator('input[name="designation"]').fill('Admin audit verification');
    await page.getByRole('button', { name: /finish setup/i }).click();
    await expect(page).toHaveURL(/\/shipper\/dashboard/, { timeout: 90_000 });
    }
    await page.goto('/shipper/reviews');
    await page.getByRole('radio', { name: '4 stars', exact: true }).click();
    const comment = `Audit scenario ${run.slice(-6)}: this private test review should receive feedback, not publication.`;
    await page.locator('#review-comment').fill(comment);
    const submitted = response(page, 'POST', 'reviews');
    await page.getByRole('button', { name: 'Submit for moderation' }).click();
    const submittedResult = await submitted;
    expect(submittedResult.status()).toBe(201);
    const review = (await submittedResult.json()).data;
    expect(review.status).toBe('pending'); evidence['reviewUuid'] = review.uuid;

    await page.goto('/auth/staff/login');
    await page.locator('#staff-email').fill('admin@test.local');
    await page.locator('#staff-password').fill('password123');
    const signedIn = response(page, 'POST', 'auth/login');
    await page.getByRole('button', { name: 'Sign in to staff console' }).click();
    expect((await signedIn).status()).toBe(200);
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 90_000 });
    expect((await request(page, 'GET', `admin/audit-events?target_uuid=${review.uuid}`)).data).toHaveLength(0);
    await page.goto('/admin/reviews');
    const card = page.locator('article.review-card').filter({ hasText: comment });
    await expect(card).toBeVisible({ timeout: 90_000 });
    await card.getByRole('button', { name: 'Request changes' }).click();
    const note = `AUDIT-PRIVATE-NOTE-${run}: please clarify the review before publication.`;
    await page.locator('#rejection-note').fill(note);
    const moderated = response(page, 'PATCH', `admin/reviews/${review.uuid}`);
    await page.getByRole('dialog').getByRole('button', { name: 'Send feedback' }).click();
    expect((await moderated).status()).toBe(200);
    const saved = await request(page, 'GET', `admin/audit-events?target_uuid=${review.uuid}`);
    expect(saved.data).toHaveLength(1);
    const event = saved.data[0]; evidence['eventUuid'] = event.uuid;
    expect(event.action).toBe('review.rejected');
    expect(event.before_state.status).toBe('pending'); expect(event.after_state.status).toBe('rejected');
    expect(JSON.stringify(event)).not.toContain(note); expect(JSON.stringify(event)).not.toContain(created.email);
    await page.goto(`/admin/audit?target=${review.uuid}`);
    const row = page.locator(`[data-event-id="${event.uuid}"]`);
    await expect(row).toContainText('Review changes requested', { timeout: 90_000 });
    await expect(row).toContainText(review.uuid);
    await expect(row.locator('td').first()).toHaveText(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM)/);
    await page.getByRole('button', { name: 'Security', exact: true }).click();
    await expect(page.getByText('No recorded activity matches these filters.')).toBeVisible();
    await page.getByRole('button', { name: 'Review', exact: true }).click();
    await expect(row).toBeVisible();
    await page.reload(); await expect(row).toBeVisible({ timeout: 90_000 });
    await request(page, 'PATCH', 'admin/audit-events', 405, { action: 'forged' });
    const rolesLoaded = response(page, 'GET', 'admin/access/roles');
    await page.goto('/admin/roles');
    const roles = (await (await rolesLoaded).json()).data;
    expect(roles.length).toBeGreaterThan(0);
    await expect(page.getByRole('heading', { name: roles[0].name, exact: true })).toBeVisible();
    await expect(page.getByRole('note')).toContainText('Read-only inspection');
    await expect(page.getByRole('button', { name: /save/i })).toHaveCount(0);
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(0);
    expect((await request(page, 'GET', `admin/audit-events?target_uuid=${review.uuid}`)).data).toHaveLength(1);
    console.log(`Admin audit: review ${review.uuid}; event ${event.uuid}; user ${created.email}`);
  } finally {
    await test.info().attach('admin-access-records.json', { body: Buffer.from(JSON.stringify(evidence, null, 2)), contentType: 'application/json' });
  }
});
