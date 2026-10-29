import { expect, test, type Page } from '@playwright/test';

const qaPassword = 'StaffQA@2026!';
const prefix = 'qa-staff-20261029';
const accounts = [
  { code: 'SUPER_ADMIN', email: 'admin@test.local', password: 'password123', allowed: ['admin/access/roles', 'admin/reviews', 'admin/marketplace-kyc'], denied: [] },
  { code: 'OPERATIONS_MANAGER', email: `${prefix}-operations@transportseva.test`, password: qaPassword, allowed: ['admin/reviews'], denied: ['admin/access/roles', 'admin/marketplace-kyc', 'marketplace-bookings'] },
  { code: 'KYC_OFFICER', email: `${prefix}-kyc@transportseva.test`, password: qaPassword, allowed: ['admin/marketplace-kyc'], denied: ['admin/access/roles', 'admin/reviews', 'marketplace-bookings'] },
  { code: 'FINANCE_MANAGER', email: `${prefix}-finance@transportseva.test`, password: qaPassword, allowed: [], denied: ['admin/access/roles', 'admin/reviews', 'admin/marketplace-kyc', 'marketplace-bookings'] },
  { code: 'SUPPORT_AGENT', email: `${prefix}-support@transportseva.test`, password: qaPassword, allowed: [], denied: ['admin/access/roles', 'admin/reviews', 'admin/marketplace-kyc', 'marketplace-bookings'] },
];

async function api(page: Page, method: string, path: string, status: number, data?: unknown) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const base = await page.evaluate(() => window.TRANSPORTSEVA_CONFIG?.apiBaseUrl ?? 'http://localhost:8080/api');
  expect(new URL(base).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  const result = await page.request.fetch(`${base}/${path}`, { method, headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, ...(data === undefined ? {} : { data }) });
  expect(result.status(), `${method} ${path}`).toBe(status);
  return result.json();
}

for (const account of accounts) {
  test(`verified ${account.code} login and direct API boundaries`, async ({ page }) => {
    test.setTimeout(360_000);
    await page.goto('/auth/staff/login');
    await page.locator('#staff-email').fill(account.email);
    await page.locator('#staff-password').fill(account.password);
    const loggedIn = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/api/auth/login'));
    await page.getByRole('button', { name: 'Sign in to staff console' }).click();
    expect((await loggedIn).status()).toBe(200);
    await expect(page).toHaveURL(/\/admin\/access$/, { timeout: 90_000 });
    await expect(page.getByRole('heading', { name: 'Staff Access', exact: true })).toBeVisible();
    await expect(page.getByText('Policy enforcement: Active', { exact: true })).toBeVisible();
    const self = (await api(page, 'GET', 'auth/me', 200)).data;
    expect(self.staff_access.enforced).toBe(true);
    expect(self.staff_access.ready).toBe(true);
    expect(self.staff_access.role_code).toBe(account.code);
    const results: Record<string, number> = {};
    for (const path of account.allowed) { await api(page, 'GET', path, 200); results[path] = 200; }
    for (const path of account.denied) { await api(page, 'GET', path, 403); results[path] = 403; }
    const events = (await api(page, 'GET', 'admin/audit-events', 200)).data;
    if (account.code === 'OPERATIONS_MANAGER') expect(events.every((event: any) => event.target_type === 'review' && event.category !== 'Security')).toBe(true);
    if (account.code === 'KYC_OFFICER') expect(events.every((event: any) => event.target_type === 'kyc' && event.category !== 'Security')).toBe(true);
    if (account.code === 'FINANCE_MANAGER' || account.code === 'SUPPORT_AGENT') expect(events).toEqual([]);

    // Neither a forged grant payload nor a cached Super Admin label is authority.
    await api(page, 'POST', 'roles', 403, { name: 'No staff role should be created', code: 'NOT_ALLOWED' });
    await api(page, 'POST', 'marketplace-bookings/00000000-0000-4000-8000-000000000001/workflow', 403, { action: 'settle_final_payment' });
    if (account.code !== 'SUPER_ADMIN') {
      await page.evaluate(() => {
        const user = JSON.parse(localStorage.getItem('transportseva.api_user') ?? '{}');
        localStorage.setItem('transportseva.api_user', JSON.stringify({ ...user, roles: ['Super Admin'], staff_access: { enforced: true, ready: true, role_code: 'SUPER_ADMIN', routes: ['roles'], permissions: ['role.view'] } }));
      });
      await page.goto('/admin/roles');
      await expect(page).toHaveURL(/\/admin\/access$/, { timeout: 90_000 });
      await expect(page.getByText(account.code, { exact: true })).toBeVisible();
      await expect(page.locator('.sidebar-nav a[href="/admin/roles"]')).toHaveCount(0);
      await expect(page.locator('.sidebar-nav a[href="/admin/financials"]')).toHaveCount(0);
    }
    if (account.code === 'OPERATIONS_MANAGER') {
      await page.goto('/admin/reviews'); await expect(page.getByRole('heading', { name: 'Customer Reviews', exact: true })).toBeVisible();
      await expect(page.locator('.sidebar-nav a[href="/admin/kyc"]')).toHaveCount(0);
    }
    if (account.code === 'KYC_OFFICER') {
      await page.goto('/admin/kyc'); await expect(page.getByRole('heading', { name: 'Business KYC Verification', exact: true })).toBeVisible();
      await expect(page.locator('.sidebar-nav a[href="/admin/reviews"]')).toHaveCount(0);
    }
    if (account.code === 'SUPER_ADMIN') {
      await page.goto('/admin/roles'); await expect(page.getByText('Read-only inspection.', { exact: false })).toBeVisible();
      await expect(page.locator('input[type="checkbox"]')).toHaveCount(0);
      await page.getByRole('button', { name: 'Notifications', exact: true }).click();
      const notification = page.locator('.notif-dropdown-item').filter({ hasText: 'Staff access updated' });
      await expect(notification.first()).toBeVisible(); await notification.first().click();
      await expect(page).toHaveURL(/\/admin\/access$/, { timeout: 90_000 });
    }
    await test.info().attach('staff-access-evidence.json', { body: Buffer.from(JSON.stringify({ database: 'transportseva', user_uuid: self.uuid,
      email: account.email, role: account.code, enforcement: true, requests: results, audit_rows: events.length,
      scope_limit: 'Assigned-case finance/support and staff editing remain disabled', real_payment: 'skipped', gps: 'skipped' }, null, 2)), contentType: 'application/json' });
  });
}

test('anonymous and marketplace accounts cannot use staff access', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto('/admin/access'); await expect(page).toHaveURL(/\/auth\/login/, { timeout: 90_000 });
  await page.locator('input[name="identifier"]').fill('verify-truck-owner-1793028294862-62@transportseva.test');
  await page.locator('input[name="password"]').fill('TransportSevaE2E@2026');
  await page.getByRole('button', { name: /^log in$/i }).click();
  await expect(page).toHaveURL(/\/truck-owner\/dashboard/, { timeout: 90_000 });
  await api(page, 'GET', 'admin/access/session', 403);
  await api(page, 'GET', 'admin/reviews', 403);
  await api(page, 'GET', 'marketplace-bookings?per_page=20', 200);
  await page.goto('/admin/access'); await expect(page).toHaveURL(/\/truck-owner\/dashboard/, { timeout: 90_000 });
});
