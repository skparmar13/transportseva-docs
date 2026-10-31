import { expect, test, type Page, type BrowserContext } from '@playwright/test';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
type Actor = { role: 'shipper' | 'truck-owner'; email: string; password: string };
const actors: Actor[] = [
  { role: 'shipper', email: 'qa-recovery-1793377725393@transportseva.test', password: 'RecoveryFinal@2026!' },
  { role: 'shipper', email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026' },
  { role: 'truck-owner', email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026' },
  { role: 'truck-owner', email: 'verify-truck-owner-1793028294862-63@transportseva.test', password: 'TransportSevaE2E@2026' },
];
const apiBase = 'http://localhost:8080/api/';

async function readOnly(context: BrowserContext) {
  const blocked: string[] = [];
  await context.route('**/*', async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) && !/\/api\/auth\/(login|refresh|logout)$/.test(url.pathname)) {
      blocked.push(request.method() + ' ' + url.pathname); return route.abort();
    }
    return route.continue();
  });
  return blocked;
}
async function login(page: Page, actor: Actor) {
  await page.goto('/auth/login');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name="identifier"]').fill(actor.email);
  await page.locator('input[name="password"]').fill(actor.password);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  const [loggedIn] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/api/auth/login') && response.request().method() === 'POST'),
    page.getByRole('button', { name: /^log in$/i }).click(),
  ]);
  expect(loggedIn.status()).toBe(200);
  await expect(page).toHaveURL(new RegExp('/' + actor.role + '/dashboard$'), { timeout: 60_000 });
}
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  return page.request.get(apiBase + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
}
async function allPages(page: Page, path: string) {
  const rows: any[] = []; let last = 1;
  for (let current = 1; current <= last; current++) {
    const response = await api(page, path + (path.includes('?') ? '&' : '?') + 'per_page=100&page=' + current);
    expect(response.status()).toBe(200); const body = await response.json(); rows.push(...body.data);
    last = body.meta?.last_page ?? 1; expect(last).toBeLessThan(100);
  }
  return rows;
}
async function metrics(page: Page, summary: any) {
  await expect(page.locator('.kpi-value')).toHaveCount(4);
  for (const [key, value] of Object.entries(summary.totals))
    await expect(page.locator('[data-metric="' + key + '"] .kpi-value')).toHaveText(String(value));
  await expect(page.locator('.kpi-trend')).toHaveCount(0);
  await expect(page.locator('.kpi-grid')).not.toContainText(/Earnings|Payment Ledger Due|₹|%/);
}

test.beforeEach(async ({ context }, info) => {
  expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
});

for (const actor of actors) {
  test('scoped dashboard, reload and real row routing: ' + actor.email, async ({ page, context }) => {
    test.setTimeout(180_000); const blocked = await readOnly(context); await login(page, actor);
    const response = await api(page, 'marketplace-dashboard'); expect(response.status()).toBe(200);
    const summary = (await response.json()).data;
    expect(summary.dashboard_type).toBe(actor.role === 'shipper' ? 'shipper' : 'provider');
    await metrics(page, summary);
    const self = await api(page, 'auth/me'); expect(self.status()).toBe(200); const identity = (await self.json()).data;
    // Forged query scope must be ignored, including a requested opposite role.
    const spoofed = await api(page, 'marketplace-dashboard?owner_uuid=00000000-0000-0000-0000-000000000000&role=admin&per_page=1&page=999');
    expect(spoofed.status()).toBe(200); const spoofedBody = (await spoofed.json()).data;
    expect(spoofedBody.totals).toEqual(summary.totals); expect(spoofedBody.dashboard_type).toBe(summary.dashboard_type);
    const records = summary.recent_loads ?? summary.recent_vehicles;
    expect(records.length).toBeLessThanOrEqual(6); await expect(page.locator('tbody tr')).toHaveCount(records.length);
    if (actor.role === 'shipper') {
      const loads = await allPages(page, 'loads?mine=true');
      expect(summary.totals.loads_posted).toBe(loads.length);
      for (const row of records) expect(loads.map((load) => load.uuid)).toContain(row.uuid);
      if (!records.length) await expect(page.getByText('No loads posted yet.', { exact: true })).toBeVisible();
      await expect(page.locator('[data-metric=pending_applications]')).toHaveAttribute('href', '/shipper/applications');
    } else {
      const fleetResponse = await api(page, 'marketplace-vehicles'); expect(fleetResponse.status()).toBe(200);
      const fleet = (await fleetResponse.json()).data;
      expect(summary.totals.vehicles_total).toBe(fleet.length);
      expect(summary.totals.vehicles_on_trip).toBe(fleet.filter((v: any) => v.availability_status === 'on_trip').length);
      expect(summary.totals.vehicles_available).toBe(fleet.filter((v: any) => v.availability_status === 'available').length);
      for (const row of records) expect(fleet.map((v: any) => v.uuid)).toContain(row.uuid);
      await expect(page.locator('[data-metric=pending_applications]')).toHaveAttribute('href', '/truck-owner/my-applications');
      if (!records.length) await expect(page.getByText('No vehicles registered yet.', { exact: true })).toBeVisible();
    }
    await page.reload(); await metrics(page, summary);
    if (actor.role === 'truck-owner') await expect(page.locator('app-truck-owner-dashboard')).not.toContainText('earnings summary for today');
    const screenshot = test.info().outputPath('dashboard.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    await test.info().attach('dashboard-screen', { path: screenshot, contentType: 'image/png' });
    if (records.length) {
      const row = records[0];
      await page.locator('tr[data-record="' + row.uuid + '"] a').click();
      await expect(page).toHaveURL(new RegExp('/' + actor.role + '/' + (actor.role === 'shipper' ? 'load-board/' : 'vehicles/') + row.uuid + '$'));
      if (actor.role === 'truck-owner') await expect(page.getByRole('heading', { name: row.registration_number, exact: true })).toBeVisible();
      else await expect(page.locator('h1')).toContainText(row.pickup_city);
    }
    expect(blocked).toEqual([]);
    await test.info().attach('dashboard-' + actor.email.split('@')[0] + '.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({
      database: 'transportseva', email: actor.email, uuid: identity.uuid, totals: summary.totals,
      recent_record_uuids: records.map((row: any) => row.uuid), query_scope_spoof_ignored: true, business_write_attempts: blocked,
    }, null, 2)) });
  });
}

for (const actor of [actors[0], actors[2]]) {
  test(actor.role + ' loading, duplicate guard, API failure/retry, refreshed zero and Hindi state', async ({ page, context }) => {
    test.setTimeout(180_000); const blocked = await readOnly(context);
    let release!: () => void; const gate = new Promise<void>((resolve) => release = resolve); let requests = 0;
    await page.route('**/api/marketplace-dashboard', async (route) => { requests++; await gate; await route.continue(); });
    await login(page, actor);
    try {
      await expect(page.getByText('Loading your dashboard…', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Refresh dashboard' })).toBeDisabled();
      await expect(page.locator('.kpi-value')).toHaveCount(0); expect(requests).toBe(1);
    } finally { release(); }
    await expect(page.locator('.kpi-value')).toHaveCount(4); await page.unroute('**/api/marketplace-dashboard');
    await page.route('**/api/marketplace-dashboard', (route) => route.fulfill({ status: 503, json: { success: false } }));
    await page.getByRole('button', { name: 'Refresh dashboard' }).click();
    await expect(page.getByRole('alert')).toContainText('Dashboard data could not be loaded.');
    await expect(page.locator('.kpi-value')).toHaveCount(0); await expect(page.locator('tbody tr')).toHaveCount(0);
    await page.unroute('**/api/marketplace-dashboard');
    await page.getByRole('button', { name: 'Try again', exact: true }).click(); await expect(page.locator('.kpi-value')).toHaveCount(4);
    const empty = actor.role === 'shipper'
      ? { dashboard_type: 'shipper', totals: { loads_posted: 0, pending_applications: 0, in_transit_bookings: 0, delivered_bookings: 0 }, recent_loads: [] }
      : { dashboard_type: 'provider', totals: { vehicles_total: 0, vehicles_on_trip: 0, vehicles_available: 0, pending_applications: 0 }, recent_vehicles: [] };
    await page.route('**/api/marketplace-dashboard', (route) => route.fulfill({ json: { success: true, data: { ...empty, generated_at: '2026-10-31T10:00:00Z' } } }));
    await page.getByRole('button', { name: 'Refresh dashboard' }).click(); await metrics(page, empty);
    await expect(page.locator('tbody tr')).toHaveCount(0);
    await context.addInitScript(() => localStorage.setItem('ts_lang', 'hi')); await page.reload();
    await expect(page.getByRole('button', { name: 'डैशबोर्ड रीफ़्रेश करें' })).toBeVisible();
    await expect(page.locator('.kpi-grid')).toContainText('लंबित आवेदन');
    expect(blocked).toEqual([]);
  });
}
