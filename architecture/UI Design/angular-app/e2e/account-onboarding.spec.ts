import { expect, test, type BrowserContext, type Page } from '@playwright/test';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(150_000);
const run = process.env.E2E_ONBOARDING_RUN ?? Date.now().toString();
const password = 'OnboardingQA@2026!';
const apiBase = 'http://localhost:8080/api/';
const profile = (page: Page) => page.locator('app-account-profile-page');
const roles = ['shipper', 'transporter', 'truck-owner'] as const;
type Actor = { role: string; email: string; password: string };

async function scoped(context: BrowserContext) {
  const blocked: string[] = [];
  await context.route('**/*', (route) => {
    const r = route.request(); const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    const allowed = ['GET', 'HEAD', 'OPTIONS'].includes(r.method())
      || (r.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout|signup\/(request-otp|verify-otp))$/.test(url.pathname))
      || (r.method() === 'PUT' && url.pathname === '/api/account/profile')
      || (r.method() === 'POST' && /^\/api\/account\/email\/(request-otp|verify-otp)$/.test(url.pathname));
    if (!allowed) { blocked.push(r.method() + ' ' + url.pathname); return route.abort(); }
    return route.continue();
  });
  return blocked;
}
async function login(page: Page, actor: Actor) {
  await page.goto('/auth/login'); await page.locator('input[name=identifier]').fill(actor.email); await page.locator('input[name=password]').fill(actor.password);
  const [response] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'), page.getByRole('button', { name: /^log in$/i }).click()]);
  expect(response.status()).toBe(200); const user = (await response.json()).data.user;
  await expect(page).toHaveURL(new RegExp('/' + actor.role + '/' + (user.portal_access_ready ? 'dashboard' : 'profile') + '$'), { timeout: 60_000 });
  return user;
}
async function save(page: Page, expected = 200) {
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/account/profile') && r.request().method() === 'PUT'), profile(page).getByRole('button', { name: 'Save profile', exact: true }).click()]);
  expect(r.status()).toBe(expected); return (await r.json()).data;
}
async function verify(page: Page) {
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/account/email/request-otp') && r.request().method() === 'POST'), profile(page).getByRole('button', { name: 'Send verification code', exact: true }).click()]);
  expect(r.status()).toBe(202); const code = (await r.json()).data;
  // Explicitly require sandbox. These tests never send external mail.
  expect(code.delivery_status).toBe('sandbox'); expect(code.debug_otp).toMatch(/^\d{6}$/);
  await expect(profile(page)).toContainText('no email was sent');
  const wrong = code.debug_otp === '111111' ? '222222' : '111111';
  await profile(page).locator('#email-code').fill(wrong);
  const [invalid] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/account/email/verify-otp') && r.request().method() === 'POST'), profile(page).getByRole('button', { name: 'Verify email', exact: true }).click()]);
  expect(invalid.status()).toBe(422); await expect(profile(page)).toContainText('Invalid or expired verification code.');
  await profile(page).locator('#email-code').fill(code.debug_otp);
  const [valid] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/account/email/verify-otp') && r.request().method() === 'POST'), profile(page).getByRole('button', { name: 'Verify email', exact: true }).click()]);
  expect(valid.status()).toBe(200); expect((await valid.json()).data.portal_access_ready).toBe(true);
  await expect(profile(page)).toContainText('Email verified');
}
async function evidence(page: Page, actor: Actor, uuid: string) {
  await test.info().attach('qa-account.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ database: 'transportseva', ...actor, uuid, real_email_delivery: false }, null, 2)) });
  await page.evaluate(() => window.scrollTo(0, 0));
  await test.info().attach('completed-profile.png', { contentType: 'image/png', body: await page.screenshot({ animations: 'disabled' }) });
}
test.beforeEach(async ({ context }, info) => {
  expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
});

for (const [index, role] of roles.entries()) test('visible signup → profile → email verification → relogin: ' + role, async ({ page, context }) => {
  const blocked = await scoped(context);
  const actor = { role, email: `qa-onboarding-${run}-${role}@transportseva.test`, password };
  const mobile = '98' + run.slice(-7) + index;
  await page.goto('/auth/signup'); await expect(page.locator('vite-error-overlay')).toHaveCount(0); await page.locator('.role-card').nth(index).click();
  await page.locator('input[name=fullName]').fill('QA Onboarding ' + role);
  await page.locator('input[name=mobile]').fill(mobile); await page.locator('input[name=email]').fill(actor.email);
  await page.locator('input[name=password]').fill(password); await page.locator('input[name=confirmPassword]').fill(password); await page.locator('input[name=agreeTerms]').check();
  const [otpResponse] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/signup/request-otp') && r.request().method() === 'POST'), page.getByRole('button', { name: /Create Account/i }).click()]);
  expect(otpResponse.status()).toBe(200); const phoneOtp = (await otpResponse.json()).data.debug_otp; expect(phoneOtp).toMatch(/^\d{6}$/);
  await expect(page).toHaveURL(/\/auth\/otp-verification/);
  for (let i = 0; i < 6; i++) await page.locator('.otp-box').nth(i).fill(phoneOtp[i]);
  const [verified] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/signup/verify-otp') && r.request().method() === 'POST'), page.getByRole('button', { name: /^Verify OTP$/i }).click()]);
  expect(verified.status()).toBe(200); const uuid = (await verified.json()).data.user.uuid;
  await expect(page).toHaveURL(new RegExp('/' + role + '/profile$'), { timeout: 60_000 });
  await expect(profile(page).locator('#personal-email')).toHaveValue(actor.email);
  await expect(page.locator('.sidebar-nav a')).toHaveCount(1);
  await page.goto('/' + role + '/dashboard'); await expect(page).toHaveURL(new RegExp('/' + role + '/profile$'));
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const denied = await page.request.get(apiBase + 'marketplace-dashboard', { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } }); expect(denied.status()).toBe(403);
  await profile(page).locator('#personal-designation').fill('QA ' + role + ' coordinator');
  await profile(page).locator('#personal-address').fill('QA optional profile only - 31/10/2026');
  await profile(page).locator('#personal-city').fill('Jaipur'); await profile(page).locator('#personal-pincode').fill('302022');
  await profile(page).locator('input[name=notify_email]').uncheck(); await profile(page).locator('input[name=notify_sms]').uncheck();
  // A failed write must preserve the draft and must not display saved success.
  await page.route('**/api/account/profile', async (route) => route.request().method() === 'PUT' ? route.fulfill({ status: 503, json: { success: false, message: 'QA temporary save failure' } }) : route.continue(), { times: 1 });
  await save(page, 503); await expect(profile(page)).toContainText('QA temporary save failure'); await expect(profile(page)).not.toContainText('Profile saved.');
  const saved = await save(page); expect(saved.profile.notify_email).toBe(false); expect(saved.account.portal_access_ready).toBe(false);
  await expect(profile(page)).toContainText('Profile saved.');
  expect(await page.evaluate(() => sessionStorage.getItem('transportseva.pending_signup'))).toBeNull();
  await page.reload(); await expect(profile(page).locator('#personal-designation')).toHaveValue('QA ' + role + ' coordinator');
  await expect(profile(page).locator('input[name=notify_email]')).not.toBeChecked(); await expect(profile(page).locator('input[name=notify_sms]')).not.toBeChecked();
  await verify(page); await evidence(page, actor, uuid);
  await profile(page).getByRole('button', { name: 'Continue to dashboard' }).click(); await expect(page).toHaveURL(new RegExp('/' + role + '/dashboard$'));
  await page.getByRole('button', { name: /log out/i }).click();
  const user = await login(page, actor); expect(user.portal_access_ready).toBe(true); expect(blocked).toEqual([]);
});

test('existing driver is forced to Profile and can finish without Company/staff/billing', async ({ page, context }) => {
  const blocked = await scoped(context); const actor = { role: 'driver', email: 'driver1@test.local', password: 'password123' };
  const user = await login(page, actor); await page.goto('/driver/profile');
  await expect(profile(page).getByRole('heading', { name: 'My profile', exact: true })).toBeVisible();
  if (user.profile_completion_required) await save(page);
  if (user.email_verification_required) await verify(page);
  await expect(profile(page).locator('app-account-business-profile')).toHaveCount(0);
  await evidence(page, actor, user.uuid); await profile(page).getByRole('button', { name: 'Continue to dashboard' }).click(); await expect(page).toHaveURL(/\/driver\/dashboard$/);
  expect(blocked).toEqual([]);
});

test('existing QA shipper: forged cached flags cannot bypass gate; stale profile edits show a recoverable conflict', async ({ page, context }) => {
  const blocked = await scoped(context); const actor = { role: 'shipper', email: 'qa-recovery-1793377725393@transportseva.test', password: 'RecoveryFinal@2026!' };
  const user = await login(page, actor);
  if (!user.portal_access_ready) {
    await page.evaluate(() => { const u = JSON.parse(localStorage.getItem('transportseva.api_user')!); u.portal_access_ready = true; u.profile_completion_required = false; u.email_verification_required = false; localStorage.setItem('transportseva.api_user', JSON.stringify(u)); });
    await page.goto('/shipper/my-loads'); await expect(page).toHaveURL(/\/shipper\/profile$/);
  }
  await page.goto('/auth/profile-setup'); await expect(page).toHaveURL(/\/shipper\/profile$/);
  if (user.profile_completion_required) await save(page);
  if (user.email_verification_required) await verify(page);
  const otherTab = await context.newPage(); await otherTab.goto('/shipper/profile');
  await expect(profile(otherTab).locator('#personal-city')).toBeVisible();
  await profile(page).locator('#personal-city').fill('QA concurrency ' + run); await save(page);
  await profile(otherTab).locator('#personal-city').fill('Unsaved stale draft'); await save(otherTab, 409);
  await expect(profile(otherTab).locator('#personal-city')).toHaveValue('Unsaved stale draft');
  await profile(otherTab).getByRole('button', { name: /Load latest profile/ }).click(); await expect(profile(otherTab).locator('#personal-city')).toHaveValue('QA concurrency ' + run);
  await otherTab.close(); await evidence(page, actor, user.uuid); expect(blocked).toEqual([]);
});

// These are the already-authorized, labelled regression accounts. Do not mark
// them verified directly in SQL or weaken the new gate to keep old tests green.
for (const actor of [
  { role: 'shipper', email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026' },
  { role: 'truck-owner', email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026' },
  { role: 'truck-owner', email: 'verify-truck-owner-1793028294862-63@transportseva.test', password: 'TransportSevaE2E@2026' },
]) test('existing regression QA finishes actual onboarding: ' + actor.email, async ({ page, context }) => {
  const blocked = await scoped(context); const user = await login(page, actor);
  await page.goto('/' + actor.role + '/profile'); await expect(profile(page).locator('#personal-email')).toHaveValue(actor.email);
  if (user.profile_completion_required) await save(page);
  if (user.email_verification_required) await verify(page);
  await evidence(page, actor, user.uuid); await profile(page).getByRole('button', { name: 'Continue to dashboard' }).click();
  await expect(page).toHaveURL(new RegExp('/' + actor.role + '/dashboard$')); expect(blocked).toEqual([]);
});
