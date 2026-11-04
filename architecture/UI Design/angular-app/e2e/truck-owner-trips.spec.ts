import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(150_000);
const owner = { portal: 'truck-owner', email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026' };
const other = { portal: 'truck-owner', email: 'verify-truck-owner-1793028294862-63@transportseva.test', password: 'TransportSevaE2E@2026' };
const shipper = { portal: 'shipper', email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026' };
const endpoint = 'account/truck-owner/trips';
const list = (page: Page) => page.locator('app-shipper-trip-list');
const detail = (page: Page) => page.locator('app-shipper-trip-details');
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

async function readOnly(context: BrowserContext) {
  const blocked: string[] = [];
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())
      && !(request.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname))) {
      blocked.push(request.method() + ' ' + url.pathname); return route.abort();
    }
    return route.continue();
  });
  return blocked;
}
async function login(page: Page, actor = owner) {
  await page.goto('/auth/login'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill(actor.email); await page.locator('input[name=password]').fill(actor.password);
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/auth/login'),
    page.getByRole('button', { name: /^log in$/i }).click(),
  ]);
  expect(response.status()).toBe(200); await expect(page).toHaveURL('/' + actor.portal + '/dashboard', { timeout: 60_000 });
}
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  return page.request.get('http://localhost:8080/api/' + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
}
async function get(page: Page, path = endpoint) {
  const r = await api(page, path); expect(r.status()).toBe(200); expect(r.headers()['cache-control']).toContain('no-store'); return (await r.json()).data;
}
async function approved(page: Page) {
  const data = await get(page, endpoint + '?per_page=50');
  const row = data.rows.find((r: any) => r.pod_status === 'approved');
  expect(row, 'Existing approved provider POD required; this read-only suite never creates a trip').toBeTruthy(); return row;
}
async function open(page: Page, uuid: string) {
  await page.goto('/truck-owner/trips/' + uuid); await expect(detail(page).locator('[data-trip-reference]')).toBeVisible();
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));

test('actual provider totals, filters, exact detail, recorded timeline, original download and reload', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const actual = await get(page, endpoint + '?per_page=50'); const row = await approved(page);
  await page.getByRole('link', { name: 'Trips', exact: true }).click();
  await expect(list(page).getByRole('heading', { name: 'My Trips', exact: true })).toBeVisible();
  for (const key of ['total', 'active', 'delivered', 'pod_outstanding']) await expect(list(page).locator('[data-trip-total="' + key + '"]')).toHaveText(String(actual.totals[key]));
  await expect(list(page).locator('[data-trip-row]')).toHaveCount(actual.rows.length);
  await list(page).locator('#trip-stage').selectOption('delivered'); await list(page).locator('#trip-search').fill(row.reference);
  await list(page).getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(list(page).locator('[data-trip-row]')).toHaveCount(1); await list(page).getByRole('link', { name: 'View trip', exact: true }).click();
  await expect(page).toHaveURL('/truck-owner/trips/' + row.uuid);
  const saved = await get(page, endpoint + '/' + row.uuid);
  expect(saved.trip.shipper_name).toBeTruthy();
  await expect(detail(page)).toContainText(saved.trip.shipper_name);
  await expect(detail(page).locator('[data-trip-vehicle]')).toHaveText(saved.trip.vehicle);
  await detail(page).getByRole('button', { name: 'Recorded timeline', exact: true }).click();
  await expect(detail(page).locator('.trip-event')).toHaveCount(saved.timeline.length);
  await expect(detail(page).locator('[data-trip-timeline]')).toContainText(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM)/);
  await detail(page).getByRole('button', { name: 'Proof of Delivery', exact: true }).click();
  await expect(detail(page).locator('[data-trip-pod-status]')).toHaveText('Approved'); await expect(detail(page).locator('input[type=file]')).toHaveCount(0);
  const source = await api(page, 'marketplace-bookings/' + row.uuid + '/pod/download'); expect(source.status()).toBe(200);
  const bytes = await source.body(); const downloaded = page.waitForEvent('download');
  await detail(page).getByRole('button', { name: 'Download original POD', exact: true }).click();
  const download = await downloaded; const stream = await download.createReadStream(); const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(download.suggestedFilename()).toBe(saved.pod.file_name); expect(hash(Buffer.concat(chunks))).toBe(hash(bytes));
  await page.reload(); await expect(detail(page).locator('[data-trip-reference]')).toHaveText(row.reference);
  await info.attach('provider-trip.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({
    user: owner.email, booking: row.uuid, reference: row.reference, load: row.load_uuid, vehicle: saved.trip.vehicle,
    timeline: saved.timeline.length, original_bytes: bytes.length, sha256: hash(bytes), blockedWrites: blocked,
  }, null, 2)) });
  expect(blocked).toEqual([]);
});

test('different provider gets zero and private 404s; shipper cannot claim provider trips', async ({ page, context, browser }, info) => {
  const blocked = await readOnly(context); await login(page); const row = await approved(page);
  const oc = await browser.newContext({ baseURL: info.project.use.baseURL }); const sc = await browser.newContext({ baseURL: info.project.use.baseURL });
  const ob = await readOnly(oc); const sb = await readOnly(sc);
  try {
    const p = await oc.newPage(); await login(p, other); await p.goto('/truck-owner/trips');
    await expect(list(p).locator('[data-trip-total=total]')).toHaveText('0'); await expect(list(p).locator('[data-trip-row]')).toHaveCount(0);
    await expect(list(p)).toContainText('no booking/trip records yet'); await p.reload(); await expect(list(p).locator('[data-trip-total=total]')).toHaveText('0');
    expect((await api(p, endpoint + '/' + row.uuid)).status()).toBe(404);
    expect((await api(p, 'marketplace-bookings/' + row.uuid + '/pod/download')).status()).toBe(403);
    expect((await api(p, endpoint + '?provider_uuid=' + row.uuid)).status()).toBe(422);
    await p.goto('/truck-owner/trips/' + row.uuid); await expect(detail(p)).toContainText('truck owner account'); await expect(detail(p).locator('[data-trip-reference]')).toHaveCount(0);
    const s = await sc.newPage(); await login(s, shipper);
    expect((await api(s, endpoint)).status()).toBe(403); expect((await api(s, endpoint + '/' + row.uuid)).status()).toBe(403);
    await s.goto('/truck-owner/trips'); await expect(s).toHaveURL('/shipper/dashboard');
    expect([...ob, ...sb]).toEqual([]);
  } finally { await oc.close(); await sc.close(); }
  expect(blocked).toEqual([]);
});

test('server-backed pagination moves between actual rows and no-match keeps real totals', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); const actual = await get(page);
  await page.route('**/api/account/truck-owner/trips?*', async (route) => {
    const url = new URL(route.request().url()); url.searchParams.set('per_page', '1');
    return route.fulfill({ response: await route.fetch({ url: url.toString() }) });
  });
  await page.goto('/truck-owner/trips'); await expect(list(page).locator('[data-trip-row]')).toHaveCount(1);
  const first = await list(page).locator('[data-trip-row]').getAttribute('data-trip-row');
  await list(page).getByRole('button', { name: 'Next', exact: true }).click(); await expect(list(page).locator('[data-trip-row]')).not.toHaveAttribute('data-trip-row', first!);
  await list(page).locator('#trip-search').fill('NO-MATCH-OWNER-IMMUTABLE-QA'); await list(page).getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(list(page).locator('[data-trip-row]')).toHaveCount(0); await expect(list(page)).toContainText('match these filters');
  await expect(list(page).locator('[data-trip-total=total]')).toHaveText(String(actual.totals.total));
  expect(blocked).toEqual([]);
});

test('held list animates, blocks duplicates and recovers honestly from a failed read', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); let reads = 0;
  let release!: () => void; const gate = new Promise<void>((resolve) => release = resolve);
  await page.route('**/api/account/truck-owner/trips?*', async (route) => {
    reads++; await gate; return route.fulfill({ status: 503, json: { success: false } });
  }, { times: 1 });
  await page.getByRole('link', { name: 'Trips', exact: true }).click();
  const refresh = list(page).getByRole('button', { name: 'Refresh', exact: true });
  try {
    await expect(list(page).locator('.trip-spinner')).toBeVisible(); await expect(refresh).toBeDisabled();
    await refresh.evaluate((button: HTMLButtonElement) => button.click()); await expect.poll(() => reads).toBe(1);
  } finally { release(); }
  await expect(list(page).getByRole('alert')).toContainText('could not be loaded'); await expect(list(page).locator('[data-trip-row]')).toHaveCount(0);
  await list(page).getByRole('button', { name: 'Retry', exact: true }).click(); await expect(list(page).locator('[data-trip-row]').first()).toBeVisible();
  expect(blocked).toEqual([]);
});

test('unassigned and absent POD states stay truthful, Hindi and narrow viewport remain usable', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const actual = await get(page, endpoint + '?per_page=50');
  const planned = actual.rows.find((r: any) => r.stage === 'planned' && !r.vehicle); const noPod = actual.rows.find((r: any) => r.stage === 'delivered' && r.pod_status === 'not_submitted');
  expect(planned).toBeTruthy(); expect(noPod).toBeTruthy();
  await open(page, planned.uuid); await expect(detail(page).locator('[data-trip-vehicle]')).toHaveText('Not assigned');
  await expect(detail(page).locator('[data-trip-gps-unavailable]')).toHaveCount(0);
  await open(page, noPod.uuid); await detail(page).getByRole('button', { name: 'Proof of Delivery', exact: true }).click();
  await expect(detail(page)).toContainText('No POD has been submitted'); await expect(detail(page).getByRole('button', { name: 'Download original POD', exact: true })).toHaveCount(0);
  await page.goto('/truck-owner/trips'); await page.getByRole('button', { name: 'Change language', exact: true }).click();
  await expect(list(page).getByRole('heading', { name: 'मेरी यात्राएँ', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); await expect(list(page).getByRole('button', { name: 'फ़िल्टर लगाएँ', exact: true })).toBeVisible();
  await info.attach('owner-trips-hindi.png', { contentType: 'image/png', body: await page.screenshot({ animations: 'disabled' }) }); expect(blocked).toEqual([]);
});

test('exact booking link works beyond the first list page and background read failure is visible', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); const row = await approved(page); await open(page, row.uuid);
  await page.route('**/api/marketplace-bookings', async (route) => {
    const response = await route.fetch(); const body = await response.json(); body.data = body.data.filter((b: any) => b.uuid !== row.uuid).slice(0, 1);
    return route.fulfill({ response, json: body });
  });
  await detail(page).locator('[data-trip-booking-link]').click(); await expect(page).toHaveURL('/truck-owner/bookings?booking=' + row.uuid);
  await expect(page.locator('app-bookings')).toContainText(row.reference);
  await open(page, row.uuid);
  await page.route('**/api/account/truck-owner/trips/' + row.uuid, (route) => route.fulfill({ status: 503, json: { success: false } }));
  await expect(detail(page)).toContainText('may be stale', { timeout: 35_000 }); await expect(detail(page).locator('[data-trip-reference]')).toHaveText(row.reference);
  await page.unroute('**/api/account/truck-owner/trips/' + row.uuid);
  await detail(page).getByRole('button', { name: 'Refresh', exact: true }).click(); await expect(detail(page)).not.toContainText('may be stale');
  expect(blocked).toEqual([]);
});
