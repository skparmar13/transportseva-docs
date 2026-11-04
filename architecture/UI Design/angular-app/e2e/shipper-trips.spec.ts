import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(120_000);
const apiBase = 'http://localhost:8080/api/';
const owner = { email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'shipper' };
const empty = { email: 'qa-recovery-1793377725393@transportseva.test', password: 'RecoveryFinal@2026!', portal: 'shipper' };
const provider = { email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'truck-owner' };
const list = (p: Page) => p.locator('app-shipper-trip-list');
const detail = (p: Page) => p.locator('app-shipper-trip-details');
async function readOnly(context: BrowserContext) {
  const blocked: string[] = [];
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', (route) => {
    const r = route.request(); const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) && !(r.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname))) {
      blocked.push(r.method() + ' ' + url.pathname); return route.abort();
    }
    return route.continue();
  });
  return blocked;
}
async function login(page: Page, user = owner) {
  await page.goto('/auth/login'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill(user.email); await page.locator('input[name=password]').fill(user.password);
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'), page.getByRole('button', { name: /^log in$/i }).click()]);
  expect(r.status()).toBe(200); await expect(page).toHaveURL('/' + user.portal + '/dashboard', { timeout: 60_000 });
}
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  return page.request.get(apiBase + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
}
async function rows(page: Page) { const r = await api(page, 'account/trips?per_page=50'); expect(r.status()).toBe(200); return (await r.json()).data; }
async function approved(page: Page) { const data = await rows(page); const row = data.rows.find((r: any) => r.pod_status === 'approved'); expect(row, 'Existing approved QA POD booking is required; this read-only suite does not create bookings').toBeTruthy(); return row; }
async function open(page: Page, uuid: string) {
  await page.goto('/shipper/trips/' + uuid); await expect(page.locator('vite-error-overlay')).toHaveCount(0); await expect(detail(page).locator('[data-trip-reference]')).toBeVisible();
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));

test('owned history → server filters → exact details → recorded timeline → private original POD download and reload', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const data = await rows(page); const row = data.rows.find((r: any) => r.pod_status === 'approved'); expect(row).toBeTruthy();
  await page.goto('/shipper/trips');
  await expect(list(page).locator('[data-trip-total=total]')).toHaveText(String(data.totals.total));
  await expect(list(page).locator('[data-trip-total=delivered]')).toHaveText(String(data.totals.delivered));
  await list(page).locator('#trip-stage').selectOption('delivered'); await list(page).locator('#trip-search').fill(row.reference);
  await list(page).getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(list(page).locator('[data-trip-row]')).toHaveCount(1); await expect(list(page).locator('[data-trip-row]')).toContainText(row.reference);
  await list(page).getByRole('link', { name: 'View trip', exact: true }).click(); await expect(page).toHaveURL('/shipper/trips/' + row.uuid);
  const r = await api(page, 'account/trips/' + row.uuid); expect(r.status()).toBe(200); const actual = (await r.json()).data;
  expect(actual.pod.download_available).toBe(true); expect(JSON.stringify(actual)).not.toContain('file_path');
  await expect(detail(page).locator('[data-trip-reference]')).toHaveText(actual.trip.reference);
  await expect(detail(page).locator('[data-trip-vehicle]')).toHaveText(actual.trip.vehicle);
  await expect(detail(page).locator('[data-trip-gps-unavailable]')).toContainText('not connected');
  await detail(page).getByRole('button', { name: 'Recorded timeline', exact: true }).click();
  await expect(detail(page).locator('.trip-event')).toHaveCount(actual.timeline.length); await expect(detail(page).locator('[data-trip-timeline]')).toContainText(/(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM))/);
  await detail(page).getByRole('button', { name: 'Proof of Delivery', exact: true }).click(); await expect(detail(page).locator('[data-trip-pod-status]')).toHaveText('Approved');
  expect(await detail(page).locator('input[type=file]').count()).toBe(0);
  const original = await api(page, 'marketplace-bookings/' + row.uuid + '/pod/download'); expect(original.status()).toBe(200); const originalBytes = await original.body();
  const downloaded = page.waitForEvent('download'); await detail(page).getByRole('button', { name: 'Download original POD', exact: true }).click(); const download = await downloaded;
  expect(download.suggestedFilename()).toBe(actual.pod.file_name);
  const stream = await download.createReadStream(); const chunks: Buffer[] = []; for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(createHash('sha256').update(Buffer.concat(chunks)).digest('hex')).toBe(createHash('sha256').update(originalBytes).digest('hex'));
  await page.reload(); await expect(detail(page).locator('[data-trip-reference]')).toHaveText(actual.trip.reference);
  await info.attach('shipper-trip-record.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ database: 'transportseva', user: owner.email, booking: row.uuid, reference: row.reference, stage: actual.trip.stage, vehicle: actual.trip.vehicle, timelineEvents: actual.timeline.length, podStatus: actual.pod.status, originalBytes: originalBytes.length, sha256: createHash('sha256').update(originalBytes).digest('hex'), noMutations: true }, null, 2)) });
  await info.attach('shipper-trip-overview.png', { contentType: 'image/png', body: await page.screenshot({ animations: 'disabled' }) }); expect(blocked).toEqual([]);
});

test('empty shipper sees zero records, foreign trip stays private, provider cannot claim shipper history', async ({ page, context, browser }, info) => {
  const blocked = await readOnly(context); await login(page); const row = await approved(page);
  const emptyContext = await browser.newContext({ baseURL: info.project.use.baseURL }); const providerContext = await browser.newContext({ baseURL: info.project.use.baseURL });
  const emptyBlocked = await readOnly(emptyContext); const providerBlocked = await readOnly(providerContext);
  try {
    const other = await emptyContext.newPage(); await login(other, empty); await other.goto('/shipper/trips');
    await expect(list(other).locator('[data-trip-total=total]')).toHaveText('0'); await expect(list(other).locator('[data-trip-empty]')).toContainText('no booking/trip records yet'); await other.reload(); await expect(list(other).locator('[data-trip-row]')).toHaveCount(0);
    await other.goto('/shipper/trips/' + row.uuid); await expect(detail(other)).toContainText('does not belong'); await expect(detail(other).locator('[data-trip-reference]')).toHaveCount(0);
    expect((await api(other, 'account/trips/' + row.uuid)).status()).toBe(404); expect((await api(other, 'account/trips?owner_uuid=' + row.uuid)).status()).toBe(422);
    const p = await providerContext.newPage(); await login(p, provider); expect((await api(p, 'account/trips')).status()).toBe(403); expect((await api(p, 'account/trips/' + row.uuid)).status()).toBe(403);
    await p.goto('/shipper/trips'); await expect(p).toHaveURL(/\/truck-owner\/dashboard$/);
    expect([...emptyBlocked, ...providerBlocked]).toEqual([]);
  } finally { await emptyContext.close(); await providerContext.close(); }
  expect(blocked).toEqual([]);
});

test('delayed history loads animate and duplicate refresh is guarded; failed reads retry honestly and Hindi works', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); let reads = 0;
  let release!: () => void; const gate = new Promise<void>((resolve) => release = resolve);
  await page.route('**/api/account/trips?*', async (route) => { reads++; await gate; return route.fulfill({ status: 503, json: { success: false } }); }, { times: 1 });
  await page.getByRole('link', { name: 'Trip History', exact: true }).click();
  const refresh = list(page).getByRole('button', { name: 'Refresh', exact: true });
  try {
    await expect(list(page).locator('.trip-spinner')).toBeVisible(); await expect(refresh).toBeDisabled();
    await refresh.evaluate((b: HTMLButtonElement) => b.click()); await expect.poll(() => reads).toBe(1);
  } finally { release(); }
  await expect(list(page)).toContainText('could not be loaded'); expect(reads).toBe(1); await expect(list(page).locator('[data-trip-row]')).toHaveCount(0);
  await list(page).getByRole('button', { name: 'Retry', exact: true }).click(); await expect(list(page).locator('[data-trip-row]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Change language', exact: true }).click(); await expect(list(page)).toContainText('यात्रा इतिहास'); expect(blocked).toEqual([]);
});

test('missing original POD and unassigned planned booking show truthful stored states, never prototype uploads or guessed dates', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); const data = await rows(page);
  const noPod = data.rows.find((r: any) => r.stage === 'delivered' && r.pod_status === 'not_submitted'); const planned = data.rows.find((r: any) => r.stage === 'planned' && !r.vehicle); expect(noPod).toBeTruthy(); expect(planned).toBeTruthy();
  await open(page, noPod.uuid); await detail(page).getByRole('button', { name: 'Proof of Delivery', exact: true }).click(); await expect(detail(page)).toContainText('No POD has been submitted');
  await expect(detail(page).getByRole('button', { name: 'Download original POD', exact: true })).toHaveCount(0); await expect(detail(page).locator('input[type=file]')).toHaveCount(0);
  await open(page, planned.uuid); await expect(detail(page).locator('[data-trip-vehicle]')).toHaveText('Not assigned');
  await detail(page).getByRole('button', { name: 'Recorded timeline', exact: true }).click(); await expect(detail(page).locator('.trip-event')).toHaveCount(1);
  await page.goto('/shipper/trips/sample-trip-id'); await expect(detail(page)).toContainText('unavailable'); await expect(detail(page).locator('[data-trip-reference]')).toHaveCount(0); expect(blocked).toEqual([]);
});

test('trip POD-review deep link retrieves its exact older booking even when absent from the initial page', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const row = await approved(page); await open(page, row.uuid);
  await page.route('**/api/marketplace-bookings?*', async (route) => { const r = await route.fetch(); expect(r.status()).toBe(200); const json = await r.json(); json.data = json.data.filter((b: any) => b.uuid !== row.uuid); json.meta = { ...json.meta, last_page: 2 }; return route.fulfill({ response: r, json }); });
  let exactRequests = 0; page.on('request', (r) => { if (r.method() === 'GET' && r.url().endsWith('/api/marketplace-bookings/' + row.uuid)) exactRequests++; });
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/marketplace-bookings/' + row.uuid) && r.request().method() === 'GET'), detail(page).locator('[data-trip-booking-link]').click()]);
  expect(r.status()).toBe(200); expect((await r.json()).data.uuid).toBe(row.uuid); expect(exactRequests).toBe(1);
  await expect(page).toHaveURL('/shipper/bookings?booking=' + row.uuid); await expect(page.locator('app-bookings b').filter({ hasText: row.reference })).toBeVisible(); await expect(page.getByRole('button', { name: /^hide details$/i })).toHaveCount(1);
  await info.attach('exact-trip-booking-link.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ booking: row.uuid, reference: row.reference, initialListOmittedTarget: true, detailReadWasReal: true, noMutations: true })) }); expect(blocked).toEqual([]);
});

test('an interrupted live detail check labels the record stale, preserves it and recovers with refresh', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); const row = await approved(page); await open(page, row.uuid);
  await page.route('**/api/account/trips/' + row.uuid, (route) => route.fulfill({ status: 503, json: { success: false } }), { times: 1 });
  await expect(detail(page)).toContainText('may be stale', { timeout: 20_000 }); await expect(detail(page).locator('[data-trip-reference]')).toHaveText(row.reference);
  await detail(page).getByRole('button', { name: 'Refresh', exact: true }).click(); await expect(detail(page)).not.toContainText('may be stale'); await expect(detail(page).locator('[data-trip-reference]')).toHaveText(row.reference); expect(blocked).toEqual([]);
});
