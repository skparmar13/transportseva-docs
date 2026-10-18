import { expect, test, type Page } from '@playwright/test';

const password = 'TransportSevaE2E@2026';
const runId = `${Date.now()}`.slice(-8);

function testUser(role: 'shipper' | 'truck-owner', sequence: number) {
  const mobileTail = String((Number(runId) + sequence) % 1_000_000_000).padStart(9, '0');
  return {
    role,
    name: `Marketplace ${role === 'shipper' ? 'Shipper' : 'Fleet Owner'} ${sequence}`,
    email: `e2e-${role}-${runId}-${sequence}@transportseva.test`,
    mobile: `6${mobileTail}`,
  };
}

async function signUpAndCompleteProfile(
  page: Page,
  user: ReturnType<typeof testUser>,
): Promise<void> {
  await page.goto('/auth/signup');
  // Role cards also contain their help-button labels, so match their visible
  // role text rather than treating the full card content as the exact label.
  await page.locator('.role-card').filter({
    hasText: user.role === 'shipper' ? /Shipper/i : /Truck\s*\/\s*Fleet Owner/i,
  }).click();
  await page.locator('input[name="fullName"]').fill(user.name);
  await page.locator('input[name="mobile"]').fill(user.mobile);
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/auth\/otp-verification\?next=signup/);
  const otp = await page.locator('.otp-debug strong').innerText();
  expect(otp).toMatch(/^\d{6}$/);
  // The app advances focus after each keystroke. Click and press each digit
  // so the assertion verifies every reactive OTP box before submitting.
  const otpInputs = page.locator('.otp-box');
  for (const [index, digit] of [...otp].entries()) {
    const input = otpInputs.nth(index);
    await input.click();
    await input.press(digit);
    await expect(input).toHaveValue(digit);
  }
  await page.getByRole('button', { name: /verify otp/i }).click();

  await expect(page).toHaveURL(/\/auth\/profile-setup/);
  await page.locator('input[name="designation"]').fill('Marketplace test user');
  await page.getByRole('button', { name: /finish setup/i }).click();
  await expect(page).toHaveURL(new RegExp(`/${user.role === 'shipper' ? 'shipper' : 'truck-owner'}/dashboard`));
}

async function login(page: Page, user: ReturnType<typeof testUser>): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(user.email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /^log in$/i }).click();
  await expect(page).toHaveURL(new RegExp(`/${user.role === 'shipper' ? 'shipper' : 'truck-owner'}/dashboard`));
}

async function postLoad(page: Page): Promise<string> {
  await page.goto('/shipper/post-load');
  await page.locator('input#pickup-city').fill('Delhi');
  await page.locator('input#drop-city').fill('Navi Mumbai');
  await page.locator('input[name="material"]').fill('E2E steel coils');
  await page.locator('input[name="weightTons"]').fill('16');
  await page.locator('select[name="vehicleType"]').selectOption({ label: '32ft Trailer' });
  await page.locator('input[name="budget"]').fill('20000');

  const response = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith('/api/loads'),
  );
  await page.getByRole('button', { name: /post load to marketplace/i }).click();
  const payload = await (await response).json() as { data: { uuid: string } };
  expect(payload.data.uuid).toBeTruthy();
  await expect(page.getByText(/load .* posted successfully/i)).toBeVisible();
  return payload.data.uuid;
}

async function registerVehicle(page: Page, registrationNumber: string): Promise<void> {
  await page.goto('/truck-owner/vehicles');
  await page.getByRole('button', { name: /add vehicle/i }).first().click();
  await page.locator('input[name="regNumber"]').fill(registrationNumber);
  await page.locator('input[name="make"]').fill('Tata');
  await page.locator('input[name="model"]').fill('Signa E2E');
  await page.locator('select[name="vehicleType"]').selectOption({ label: '32ft Trailer' });
  await page.locator('input[name="yearOfMake"]').fill('2024');
  await page.locator('input[name="capacityTons"]').fill('24');

  const response = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith('/api/marketplace-vehicles'),
  );
  await page.getByRole('button', { name: /^add vehicle$/i }).last().click();
  expect((await response).status()).toBe(201);
  await expect(page.getByText(registrationNumber, { exact: true })).toBeVisible();
}

async function applyForLoad(page: Page, loadUuid: string, registrationNumber: string, quote: string): Promise<void> {
  await page.goto(`/truck-owner/load-board/${loadUuid}`);
  await page.getByRole('button', { name: /apply for this load/i }).click();

  const vehicleSelect = page.locator('select[name="vehicleRegNumber"]');
  await expect(vehicleSelect.locator('option', { hasText: registrationNumber })).toHaveCount(1);
  await vehicleSelect.selectOption(registrationNumber);
  await expect(page.locator('select[name="vehicleType"]')).toHaveCount(0);

  await page.locator('input[name="availability"]').fill('Available today');
  await page.locator('input[name="quotedAmount"]').fill(quote);
  const response = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST' && /\/api\/loads\/[^/]+\/applications$/.test(new URL(candidate.url()).pathname),
  );
  await page.getByRole('button', { name: /submit application/i }).click();
  expect((await response).status()).toBe(201);
  await expect(page.getByText(/your application/i)).toBeVisible();
}

test.describe('Marketplace browser journey', () => {
  test('the application entry point loads for a fleet owner', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /log in to your account/i })).toBeVisible();
  });

  test('signup, OTP verification, and profile completion redirect to the correct portal', async ({ page }) => {
    await signUpAndCompleteProfile(page, testUser('shipper', 1));
    await expect(page.getByText(/Marketplace Shipper 1/i)).toBeVisible();
  });

  test('two fleet owners register their own vehicles and apply to one newly posted load', async ({ page }) => {
    // The local PHP development server services requests serially; this
    // scenario deliberately creates three accounts and two applications.
    test.setTimeout(480_000);
    const shipper = testUser('shipper', 11);
    const firstOwner = testUser('truck-owner', 2);
    const secondOwner = testUser('truck-owner', 3);
    const firstVehicle = `TSE${runId}A`;
    const secondVehicle = `TSE${runId}B`;

    await signUpAndCompleteProfile(page, shipper);
    const loadUuid = await postLoad(page);

    await signUpAndCompleteProfile(page, firstOwner);
    await registerVehicle(page, firstVehicle);
    await applyForLoad(page, loadUuid, firstVehicle, '18500');

    await signUpAndCompleteProfile(page, secondOwner);
    await registerVehicle(page, secondVehicle);
    await applyForLoad(page, loadUuid, secondVehicle, '18000');

    await login(page, shipper);
    await page.goto(`/shipper/load-board/${loadUuid}`);
    // The page fetches the load first and then its applications so a clear
    // loader is shown instead of rendering stale data. Give the local API
    // enough time to complete that real round trip.
    await expect(page.getByText(/loading load details/i)).toBeHidden({ timeout: 45_000 });
    await expect(page.getByText(firstVehicle)).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(secondVehicle)).toBeVisible({ timeout: 45_000 });
  });
});
