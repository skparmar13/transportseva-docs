import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000 }); test.setTimeout(150_000);
const origin = 'http://localhost:8080/api/';
const dashboard = (p: Page) => p.locator('app-admin-dashboard');
async function scope(context: BrowserContext) {
  const blocked: string[] = []; await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', route => {
    const r = route.request(); const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    const allowed = ['GET', 'HEAD', 'OPTIONS'].includes(r.method())
      || r.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname)
      || r.method() === 'PATCH' && /^\/api\/notifications\/[a-f0-9-]{36}\/read$/.test(url.pathname);
    if (!allowed) { blocked.push(r.method()+' '+url.pathname); return route.abort(); } return route.continue();
  }); return blocked;
}
async function login(page: Page, email = 'admin@test.local', password = 'password123', landing = 'dashboard') {
  await page.goto('/auth/login'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill(email); await page.locator('input[name=password]').fill(password);
  const [r] = await Promise.all([page.waitForResponse(r => new URL(r.url()).pathname === '/api/auth/login' && r.request().method() === 'POST'), page.getByRole('button', { name: /^Log In$/i }).click()]);
  expect(r.status()).toBe(200); await expect(page).toHaveURL('/admin/'+landing);
}
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  return page.request.get(origin+path, { headers: { Accept: 'application/json', Authorization: 'Bearer '+token } });
}

test('real dashboard totals, current activity, access bell and exact audit/queue links survive reload', async ({ page, context }, info) => {
  const blocked = await scope(context); await login(page);
  const response = await api(page, 'admin/dashboard'); expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toContain('no-store');
  const d = (await response.json()).data;
  if (process.env.E2E_ADMIN_DASHBOARD_EXPECTED_TOTALS) expect(d.totals).toEqual(JSON.parse(process.env.E2E_ADMIN_DASHBOARD_EXPECTED_TOTALS));
  for (const [key, value] of Object.entries(d.totals)) await expect(dashboard(page).locator('[data-metric="'+key+'"] .kpi-value')).toHaveText(String(value));
  await expect(dashboard(page).locator('[data-generated-at]')).toHaveText(/Updated: \d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM)/);
  expect(d.recent_activity.length).toBeGreaterThan(0); await expect(dashboard(page).locator('tr[data-activity-id]')).toHaveCount(d.recent_activity.length);
  for (const row of d.recent_activity) await expect(dashboard(page).locator('[data-activity-id="'+row.uuid+'"]')).toBeVisible();
  await expect(dashboard(page)).toContainText('Dashboard read access enabled');
  await page.goto('/admin/access');
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  const bell = page.locator('.notif-dropdown-item').filter({ hasText: 'Operational dashboard access available' }); await expect(bell).toHaveCount(1); await bell.click();
  await expect(page).toHaveURL('/admin/dashboard');
  await expect(dashboard(page).locator('[data-metric="loads_total"]')).toBeVisible();
  await dashboard(page).locator('[data-activity-id="'+d.recent_activity[0].uuid+'"] a').click();
  if (d.recent_activity[0].target_uuid) await expect(page).toHaveURL('/admin/audit?target='+d.recent_activity[0].target_uuid);
  else await expect(page).toHaveURL('/admin/audit');
  await expect(page.locator('[data-event-id="'+d.recent_activity[0].uuid+'"]')).toBeVisible();
  await page.goto('/admin/dashboard'); await dashboard(page).locator('[data-metric="pending_newsletter"]').click();
  await expect(page).toHaveURL('/admin/newsletter'); await expect(page.locator('app-newsletter-management h1')).toHaveText('Newsletter consent records');
  await page.goto('/admin/dashboard'); await page.reload(); await expect(dashboard(page).locator('[data-metric="loads_total"] .kpi-value')).toHaveText(String(d.totals.loads_total));
  await page.screenshot({ path: info.outputPath('real-admin-dashboard.png'), fullPage: true });
  expect(blocked).toEqual([]);
  await writeFile(info.outputPath('real-dashboard-evidence.json'), JSON.stringify({ actor: 'admin@test.local', totals: d.totals,
    activityIds: d.recent_activity.map((e: any) => e.uuid), independentCountComparison: !!process.env.E2E_ADMIN_DASHBOARD_EXPECTED_TOTALS, blockedWrites: blocked }, null, 2));
});

test('failed refresh hides stale statistics, shows action animation and retries to real data', async ({ page, context }) => {
  const blocked = await scope(context); await login(page); await expect(dashboard(page).locator('[data-metric="loads_total"]')).toBeVisible();
  let release!: () => void; const gate = new Promise<void>(resolve => release = resolve); let calls = 0;
  const match = '**/api/admin/dashboard';
  await page.route(match, async route => { calls++; await gate; return route.fulfill({ status: 503, json: { success: false } }); });
  try {
    await dashboard(page).getByRole('button', { name: 'Refresh dashboard', exact: true }).evaluate((b: HTMLButtonElement) => { b.click(); b.click(); });
    await expect(dashboard(page).locator('[aria-busy=true]')).toBeVisible(); await expect(dashboard(page).locator('.kpi-grid')).toHaveCount(0);
    await expect(dashboard(page).getByRole('button', { name: 'Refresh dashboard', exact: true })).toBeDisabled(); expect(calls).toBe(1);
    release(); await expect(dashboard(page).getByRole('alert')).toContainText('could not be loaded');
    await page.unroute(match); await dashboard(page).getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(dashboard(page).locator('[data-metric="loads_total"]')).toBeVisible(); expect(blocked).toEqual([]);
  } finally { release(); }
});

test('existing Operations and Support staff cannot retrieve the global dashboard or bypass its route guard', async ({ page, context }) => {
  const blocked = await scope(context);
  for (const role of ['operations', 'support']) {
    await page.evaluate(() => localStorage.clear()).catch(() => undefined);
    await login(page, 'qa-staff-20261029-'+role+'@transportseva.test', 'StaffQA@2026!', 'access');
    await expect(page.locator('.sidebar-nav a[href="/admin/dashboard"]')).toHaveCount(0);
    expect((await api(page, 'admin/dashboard')).status()).toBe(403);
    await page.goto('/admin/dashboard'); await expect(page).toHaveURL('/admin/access');
  }
  expect(blocked).toEqual([]);
});

test('controlled zero/activity-empty state translates to Hindi and revoked reads clear private content', async ({ page, context }) => {
  const blocked = await scope(context); await login(page);
  const match = '**/api/admin/dashboard';
  await page.route(match, route => route.fulfill({ json: { success: true, data: {
    dashboard_type: 'admin', generated_at: '2026-11-19T10:00:00Z', sections: ['marketplace', 'audit'],
    totals: { loads_total: 0, open_loads: 0, pending_applications: 0, bookings_total: 0, bookings_in_transit: 0, bookings_delivered: 0 }, recent_activity: [],
  } } }));
  await dashboard(page).getByRole('button', { name: 'Refresh dashboard', exact: true }).click();
  await expect(dashboard(page).locator('[data-metric="loads_total"] .kpi-value')).toHaveText('0');
  await expect(dashboard(page)).toContainText('No administrative activity has been recorded');
  await page.getByRole('button', { name: 'Change language', exact: true }).click();
  await expect(dashboard(page)).toContainText('अभी कोई प्रशासनिक गतिविधि दर्ज नहीं है');
  await page.unroute(match); await page.route(match, route => route.fulfill({ status: 403, json: { success: false } }));
  await dashboard(page).getByRole('button', { name: 'डैशबोर्ड रीफ़्रेश करें', exact: true }).click();
  await expect(dashboard(page).getByRole('alert')).toContainText('अनुमति नहीं है'); await expect(dashboard(page).locator('.kpi-grid')).toHaveCount(0);
  expect(blocked).toEqual([]);
});
