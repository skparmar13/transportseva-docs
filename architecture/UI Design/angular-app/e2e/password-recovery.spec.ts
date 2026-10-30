import { expect, test, type Page } from '@playwright/test';

// Local sandbox only. Existing account passwords are never changed.
test.use({ trace: 'off', video: 'off' });
const suffix = String(Date.now());
const account = {
  email: 'qa-recovery-' + suffix + '@transportseva.test',
  phone: '6' + suffix.slice(-9),
  original: 'RecoveryStart@2026!',
  afterEmail: 'RecoveryEmail@2026!',
  final: 'RecoveryFinal@2026!',
};
const apiBase = 'http://localhost:8080/api';
function responseFor(page: Page, path: string) {
  return page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/api/auth/' + path), { timeout: 45_000 });
}
async function enterOtp(page: Page, code: string) {
  for (let i = 0; i < 6; i++) await page.locator('.otp-box').nth(i).fill(code[i]);
}
async function recover(page: Page, identifier: string, password: string) {
  await page.goto('/auth/forgot-password');
  await page.getByLabel('Email or Mobile Number', { exact: true }).fill(identifier);
  const requested = responseFor(page, 'password/request-otp');
  await page.getByRole('button', { name: /^send otp$/i }).click();
  expect((await requested).status()).toBe(202);
  await expect(page.getByText('If an active account matches', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: /resend otp/i })).toBeDisabled();
  const code = await page.locator('.otp-debug strong').innerText();
  expect(code).toMatch(/^\d{6}$/);
  await enterOtp(page, '000000');
  const invalid = responseFor(page, 'password/verify-otp');
  await page.getByRole('button', { name: /^verify otp$/i }).click();
  expect((await invalid).status()).toBe(422);
  await expect(page.getByRole('alert')).toContainText('Invalid or expired code');
  await enterOtp(page, code);
  const verified = responseFor(page, 'password/verify-otp');
  await page.getByRole('button', { name: /^verify otp$/i }).click();
  const verifyResponse = await verified;
  expect(verifyResponse.status()).toBe(200);
  const verifyData = (await verifyResponse.json()).data;
  const retry = await page.request.post(apiBase + '/auth/password/verify-otp', { data: verifyResponse.request().postDataJSON() });
  expect(retry.status()).toBe(200);
  expect((await retry.json()).data.reset_token).toBe(verifyData.reset_token);
  await page.getByLabel('New Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password', { exact: true }).fill('Mismatch@123');
  await page.getByRole('button', { name: /^reset password$/i }).click();
  await expect(page.getByText('Passwords do not match.', { exact: true })).toBeVisible();
  await page.getByLabel('Confirm Password', { exact: true }).fill(password);
  const reset = responseFor(page, 'password/reset');
  await page.getByRole('button', { name: /^reset password$/i }).click();
  const resetResponse = await reset;
  expect(resetResponse.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Password reset successfully', exact: true })).toBeVisible();
  const replay = await page.request.post(apiBase + '/auth/password/reset', { data: resetResponse.request().postDataJSON() });
  expect(replay.status()).toBe(422);
  expect(await page.evaluate(() => localStorage.getItem('transportseva.access_token'))).toBeNull();
  await page.locator('.recovery-success a').click();
  await expect(page).toHaveURL(/\/auth\/login\?reason=password-reset/);
  await page.locator('input[name="identifier"]').fill(account.email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /^log in$/i }).click();
  await expect(page).toHaveURL(/\/shipper\/dashboard/, { timeout: 45_000 });
}

test('visible signup, email recovery, SMS recovery, old-session revocation and final login', async ({ page }) => {
  test.setTimeout(360_000);
  expect(new URL(test.info().project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  await page.goto('/auth/signup');
  await page.locator('.role-card').filter({ hasText: /Shipper/i }).click();
  await page.locator('input[name="fullName"]').fill('Password Recovery QA');
  await page.locator('input[name="mobile"]').fill(account.phone);
  await page.locator('input[name="email"]').fill(account.email);
  await page.locator('input[name="password"]').fill(account.original);
  await page.locator('input[name="confirmPassword"]').fill(account.original);
  await page.locator('input[name="agreeTerms"]').check();
  const signupOtp = responseFor(page, 'signup/request-otp');
  await page.getByRole('button', { name: /create account/i }).click();
  expect((await signupOtp).status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\/otp-verification\?next=signup/);
  const code = await page.locator('.otp-debug strong').innerText();
  await enterOtp(page, code);
  await page.getByRole('button', { name: /^verify otp$/i }).click();
  await expect(page).toHaveURL(/\/auth\/profile-setup/);
  await page.locator('input[name="designation"]').fill('Local recovery test');
  await page.getByRole('button', { name: /finish setup/i }).click();
  await expect(page).toHaveURL(/\/shipper\/dashboard/);
  const session = await page.evaluate(() => ({
    access: localStorage.getItem('transportseva.access_token'),
    refresh: localStorage.getItem('transportseva.refresh_token'),
    user: JSON.parse(localStorage.getItem('transportseva.api_user') ?? '{}'),
  }));
  await recover(page, account.email, account.afterEmail);
  expect((await page.request.get(apiBase + '/auth/me', { headers: { Authorization: 'Bearer ' + session.access } })).status()).toBe(401);
  expect((await page.request.post(apiBase + '/auth/refresh', { data: { refresh_token: session.refresh } })).status()).toBe(401);
  expect((await page.request.post(apiBase + '/auth/login', { data: { email: account.email, password: account.original } })).status()).toBe(401);
  await recover(page, account.phone, account.final);
  expect((await page.request.post(apiBase + '/auth/login', { data: { email: account.email, password: account.afterEmail } })).status()).toBe(401);
  await test.info().attach('recovery-evidence.json', { body: Buffer.from(JSON.stringify({
    database: 'transportseva', user_uuid: session.user.uuid, email: account.email, mobile: account.phone,
    final_password: account.final, signup: 'UI + sandbox OTP', email_recovery: 'passed (sandbox)',
    sms_recovery: 'passed (sandbox)', invalid_otp: 'rejected', verify_retry: 'passed',
    reset_replay: 'rejected', old_passwords: 'rejected', old_sessions: 'revoked',
    actual_delivery: 'not tested - deferred by user', existing_account_passwords: 'unchanged',
  }, null, 2)), contentType: 'application/json' });
});

test('unknown account gets generic recovery UI without a false verification success', async ({ page }) => {
  await page.goto('/auth/forgot-password');
  await page.getByLabel('Email or Mobile Number', { exact: true }).fill('missing-' + suffix + '@transportseva.test');
  await page.getByRole('button', { name: /^send otp$/i }).click();
  await expect(page.getByText('If an active account matches', { exact: false })).toBeVisible();
  const code = await page.locator('.otp-debug strong').innerText();
  await enterOtp(page, code);
  const verified = responseFor(page, 'password/verify-otp');
  await page.getByRole('button', { name: /^verify otp$/i }).click();
  expect((await verified).status()).toBe(422);
  await expect(page.getByRole('alert')).toContainText('Invalid or expired code');
});

test('recovery action shows activity, blocks double submit and recovers after a connection error', async ({ page }) => {
  await page.goto('/auth/forgot-password');
  await page.route('**/api/auth/password/request-otp', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.abort('failed');
  });
  await page.getByLabel('Email or Mobile Number', { exact: true }).fill('connection-test@transportseva.test');
  const button = page.getByRole('button', { name: /^send otp$/i });
  await button.click();
  await expect(page.locator('.action-spinner')).toBeVisible();
  await expect(page.getByRole('button', { name: /sending/i })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('connection');
  await expect(button).toBeEnabled();
});
