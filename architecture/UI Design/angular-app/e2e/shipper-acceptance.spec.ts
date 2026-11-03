import { expect, test, type BrowserContext, type Page } from '@playwright/test';
test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(150_000);
const account = { email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026' };
async function login(page: Page, context: BrowserContext) {
  const blocked: string[] = [];
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', (route) => {
    const r = route.request(); const u = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname)) return route.abort();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) && !(r.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))) {
      blocked.push(r.method() + ' ' + u.pathname); return route.abort();
    }
    return route.continue();
  });
  await page.goto('/auth/login'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill(account.email); await page.locator('input[name=password]').fill(account.password);
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'), page.getByRole('button', { name: /^log in$/i }).click()]);
  expect(r.status()).toBe(200); await expect(page).toHaveURL('/shipper/dashboard', { timeout: 60_000 }); return blocked;
}
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const r = await page.request.get('http://localhost:8080/api/' + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
  expect(r.status()).toBe(200); return r.json();
}
async function targets(page: Page) {
  const loads = (await api(page, 'loads?mine=true&per_page=100')).data; const trips = (await api(page, 'account/trips?per_page=50')).data;
  expect(loads.length).toBeGreaterThan(0); expect(trips.rows.length).toBeGreaterThan(0);
  return { loads, trip: trips.rows[0] };
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));
const screens = [
  ['dashboard', 'app-shipper-dashboard', 'marketplace-dashboard'],
  ['post-load', 'app-post-load', ''],
  ['my-loads', 'app-my-loads', 'loads?mine=true&per_page=100'],
  ['load-board/:id', 'app-load-details', ''],
  ['applications', 'app-applications', 'account/reports'],
  ['bookings', 'app-bookings', 'marketplace-bookings?per_page=100'],
  ['reviews', 'app-my-review', 'reviews/mine'],
  ['kyc', 'app-my-kyc', 'marketplace-kyc'],
  ['trips', 'app-shipper-trip-list', 'account/trips'],
  ['trips/:id', 'app-shipper-trip-details', ''],
  ['reports', 'app-shipper-reports', 'account/reports'],
  ['documents', 'app-shipper-documents', 'account/documents'],
  ['notifications', 'app-notifications', 'notifications'],
  ['support', 'app-support', 'support-tickets'],
  ['profile', 'app-account-profile-page', 'account/profile'],
] as const;
for (const [path, selector, endpoint] of screens) {
  test('shipper route, server binding and reload: ' + path, async ({ page, context }, info) => {
    const blocked = await login(page, context); const real = await targets(page);
    const actual = path === 'load-board/:id' ? 'load-board/' + real.loads[0].uuid : path === 'trips/:id' ? 'trips/' + real.trip.uuid : path;
    const response = endpoint ? await api(page, endpoint) : null;
    await page.goto('/shipper/' + actual); const view = page.locator(selector);
    await expect(view).toBeVisible(); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    await expect(view.locator('h1').first()).toBeVisible();
    if (path === 'dashboard') {
      await expect(view.locator('.kpi-value')).toHaveCount(4);
      for (const [key, value] of Object.entries(response.data.totals))
        await expect(view.locator('[data-metric="' + key + '"] .kpi-value')).toHaveText(String(value));
      await expect(view.locator('[data-record]')).toHaveCount(response.data.recent_loads.length);
      for (const load of response.data.recent_loads) await expect(view.locator('[data-record="' + load.uuid + '"]')).toContainText(load.material);
    }
    if (path === 'my-loads') {
      await expect(view.locator('tbody tr')).toHaveCount(response.data.length);
      await expect(view.locator('tbody tr').first().locator('td').nth(5)).toHaveText('₹' + Number(response.data[0].budget).toLocaleString('en-IN', { maximumFractionDigits: 2 }));
    }
    if (path === 'applications') await expect(view.locator('tbody tr')).toHaveCount(response.data.summary.loads.applications);
    if (path === 'bookings') await expect(view).toContainText(response.data[0].booking_reference);
    if (path === 'trips') await expect(view.locator('[data-trip-total=total]')).toHaveText(String(response.data.totals.total));
    if (path === 'trips/:id') await expect(view.locator('[data-trip-reference]')).toHaveText(real.trip.reference);
    if (path === 'load-board/:id') await expect(view).toContainText(real.loads[0].material);
    if (path === 'reports') await expect(view.locator('[data-report-total=loads]')).toHaveText(String(response.data.summary.loads.total));
    if (path === 'documents') await expect(view.locator('[data-document-total=total]')).toHaveText(String(response.data.totals.total));
    if (path === 'profile') await expect(view).toContainText(account.email);
    if (path === 'post-load') await expect(view.locator('input[name=material]')).toBeVisible();
    await page.reload(); await expect(page.locator(selector).locator('h1').first()).toBeVisible(); await expect(page).toHaveURL('/shipper/' + actual);
    await info.attach('route.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ route: '/shipper/' + actual, component: selector, account: account.email, reload: true, blockedWrites: blocked }, null, 2)) });
    expect(blocked).toEqual([]);
  });
}

test('Applications Received never turns an API failure into a successful empty list and supports retry', async ({ page, context }) => {
  await login(page, context);
  await page.route(/\/api\/(?:account\/applications|loads\/[^/]+\/applications)(?:\?|$)/, (route) => route.fulfill({ status: 503, json: { success: false, message: 'QA service unavailable' } }));
  await page.goto('/shipper/applications'); const view = page.locator('app-applications');
  await expect(view.getByRole('alert')).toBeVisible(); await expect(view).not.toContainText('No applications yet');
  await expect(view.getByRole('button', { name: /retry/i })).toBeVisible();
  await page.unroute(/\/api\/(?:account\/applications|loads\/[^/]+\/applications)(?:\?|$)/);
  await view.getByRole('button', { name: /retry/i }).click();
  await expect(view.locator('tbody tr').first()).toBeVisible();
});
test('My Loads exposes real server pagination, not a silently capped list', async ({ page, context }) => {
  await login(page, context);
  await page.route('**/api/loads?*', async (route) => {
    const url = new URL(route.request().url()); url.searchParams.set('per_page', '1');
    return route.fulfill({ response: await route.fetch({ url: url.toString() }) });
  });
  await page.goto('/shipper/my-loads'); const view = page.locator('app-my-loads');
  await expect(view.locator('tbody tr')).toHaveCount(1); await expect(view.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
  const first = await view.locator('tbody tr b').first().innerText();
  await view.getByRole('button', { name: 'Next', exact: true }).click(); await expect(view.locator('tbody tr b').first()).not.toHaveText(first);
});
test('KYC read failure does not offer a misleading new submission form', async ({ page, context }) => {
  await login(page, context); await page.route('**/api/marketplace-kyc', (route) => route.fulfill({ status: 503, json: { success: false } }));
  await page.goto('/shipper/kyc'); const view = page.locator('app-my-kyc');
  await expect(view.getByRole('alert')).toBeVisible(); await expect(view.locator('#kyc-business-name')).toHaveCount(0);
  await expect(view.getByRole('button', { name: /retry/i })).toBeVisible();
  await page.unroute('**/api/marketplace-kyc');
  await view.getByRole('button', { name: /retry/i }).click();
  await expect(view).toContainText('KYC approved');
});
test('Review read failure does not offer a misleading writable rating form', async ({ page, context }) => {
  await login(page, context); await page.route('**/api/reviews/mine', (route) => route.fulfill({ status: 503, json: { success: false } }));
  await page.goto('/shipper/reviews'); const view = page.locator('app-my-review');
  await expect(view.getByRole('alert')).toBeVisible(); await expect(view.locator('#review-comment')).toHaveCount(0);
  await expect(view.getByRole('button', { name: /retry/i })).toBeVisible();
  await page.unroute('**/api/reviews/mine');
  await view.getByRole('button', { name: /retry/i }).click();
  await expect(view.locator('fieldset')).toBeVisible();
});
test('Notification PATCH failure retains unread state, displays an error and allows retry', async ({ page, context }) => {
  await login(page, context); const unread = await api(page, 'notifications/unread?per_page=1'); expect(unread.data.length, 'Existing QA unread notification required').toBeGreaterThan(0);
  const id = unread.data[0].id;
  await page.route('**/api/notifications/*/read', (route) => route.fulfill({ status: 503, json: { success: false } }));
  await page.goto('/shipper/notifications'); const view = page.locator('app-notifications');
  await view.getByRole('button', { name: /^unread/i }).click(); const row = view.locator('[data-notification-id="' + id + '"]');
  await expect(row).toBeVisible(); await row.getByRole('button', { name: /mark as read/i }).click();
  await expect(view.getByRole('alert')).toBeVisible(); await expect(row).toHaveClass(/unread/);
});
