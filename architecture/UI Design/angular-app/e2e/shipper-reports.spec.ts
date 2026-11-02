import { expect, test, type BrowserContext, type Page, type Locator } from '@playwright/test';
import { createHash } from 'node:crypto';
test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(180_000);
const owner = { email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'shipper' };
const empty = { email: 'qa-recovery-1793377725393@transportseva.test', password: 'RecoveryFinal@2026!', portal: 'shipper' };
const provider = { email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'truck-owner' };
const screen = (p: Page) => p.locator('app-shipper-reports');
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
  return page.request.get('http://localhost:8080/api/' + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
}
async function all(page: Page, path: string) {
  const rows: any[] = []; let last = 1;
  for (let i = 1; i <= last; i++) {
    const r = await api(page, path + (path.includes('?') ? '&' : '?') + 'per_page=100&page=' + i);
    expect(r.status()).toBe(200); const body = await r.json(); rows.push(...body.data); last = body.meta?.last_page || 1; expect(last).toBeLessThan(100);
  }
  return rows;
}
async function report(page: Page, table = 'loads', q = '') {
  const r = await api(page, 'account/reports?per_page=50&table=' + table + (q ? '&q=' + encodeURIComponent(q) : ''));
  expect(r.status()).toBe(200); expect(r.headers()['cache-control']).toContain('no-store'); return (await r.json()).data;
}
async function open(page: Page) {
  await page.goto('/shipper/reports'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await expect(screen(page).getByRole('heading', { name: 'Reports & Analytics', exact: true })).toBeVisible();
}
function csvRows(bytes: Buffer) {
  const text = bytes.toString('utf8').replace(/^\uFEFF/, ''); const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
    else if (c === '\n' && !quoted) { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r' || quoted) cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
async function exportCsv(page: Page, button: Locator, query: string) {
  const original = await api(page, 'account/reports/export?' + query); expect(original.status()).toBe(200);
  expect(original.headers()['cache-control']).toContain('no-store'); expect(original.headers()['x-report-timezone']).toBe('Asia/Kolkata');
  const bytes = await original.body(); const wait = page.waitForEvent('download'); await button.click(); const download = await wait;
  const stream = await download.createReadStream(); const chunks: Buffer[] = []; for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(createHash('sha256').update(Buffer.concat(chunks)).digest('hex')).toBe(createHash('sha256').update(bytes).digest('hex'));
  return { rows: csvRows(bytes), filename: download.suggestedFilename(), sha256: createHash('sha256').update(bytes).digest('hex') };
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));

test('real load/application totals → server-backed pagination → full applied-filter CSV → exact load and reload', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const actual = await report(page);
  const loads = await all(page, 'loads?mine=true'); const bookings = (await all(page, 'marketplace-bookings')).filter((b) => b.viewer_side === 'owner');
  let applications = 0; let pending = 0; let multipleApplicantLoads = 0;
  for (const load of loads) {
    const apps = await all(page, 'loads/' + load.uuid + '/applications'); applications += apps.length; pending += apps.filter((a) => a.status === 'pending').length;
    if (apps.length > 1) multipleApplicantLoads++;
  }
  expect(actual.summary.loads.total).toBe(loads.length); expect(actual.summary.loads.applications).toBe(applications);
  expect(actual.summary.loads.pending_applications).toBe(pending); expect(actual.summary.bookings.total).toBe(bookings.length);
  expect(actual.summary.bookings.stages.delivered).toBe(bookings.filter((b) => b.status === 'completed').length);
  expect(loads.length).toBeGreaterThan(1);
  // Read-only pagination fixture: request real per_page=1 responses, not fake rows or new main records.
  await page.route('**/api/account/reports?*', async (route) => {
    const url = new URL(route.request().url()); url.searchParams.set('per_page', '1');
    return route.fulfill({ response: await route.fetch({ url: url.toString() }) });
  });
  await open(page); await expect(screen(page).locator('[data-report-total=loads]')).toHaveText(String(loads.length));
  await expect(screen(page).locator('[data-report-total=applications]')).toHaveText(String(applications));
  await expect(screen(page).locator('[data-report-row]')).toHaveCount(1);
  const first = await screen(page).locator('[data-report-row] b').first().innerText();
  await screen(page).locator('#report-search').fill('UNAPPLIED-DRAFT-MUST-NOT-CHANGE-EXPORT');
  const csv = await exportCsv(page, screen(page).locator('[data-report-export]'), 'table=loads');
  expect(csv.rows.length).toBe(loads.length + 1); expect(csv.filename).toBe('transportseva-shipper-loads-report.csv');
  expect(new Set(csv.rows.slice(1).map((row) => row[0]))).toEqual(new Set(loads.map((l) => l.uuid)));
  await screen(page).getByRole('button', { name: 'Next', exact: true }).click(); await expect(screen(page).locator('[data-report-row] b').first()).not.toHaveText(first);
  await expect(screen(page).locator('[data-report-row]')).toHaveCount(1); await expect(screen(page).locator('#report-search')).toHaveValue('UNAPPLIED-DRAFT-MUST-NOT-CHANGE-EXPORT');
  const href = await screen(page).locator('[data-report-row] a').getAttribute('href'); await screen(page).locator('[data-report-row] a').click();
  await expect(page).toHaveURL(href!); await expect(page.locator('h1')).toBeVisible();
  await open(page); await page.reload(); await expect(screen(page).locator('[data-report-total=loads]')).toHaveText(String(loads.length));
  await info.attach('report-totals.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ account: owner.email, totals: actual.summary, independentlyCounted: { loads: loads.length, applications, pending, bookings: bookings.length, multipleApplicantLoads }, exportedRows: csv.rows.length - 1, csvSha256: csv.sha256, businessWrites: blocked }, null, 2)) });
  await info.attach('reports-loads.png', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' }); expect(blocked).toEqual([]);
});

test('real booking stages and assignments → matching filtered CSV → exact Trip and Booking destinations', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const actual = await report(page, 'bookings'); const row = actual.rows.find((r: any) => r.stage === 'delivered' && r.vehicle); expect(row).toBeTruthy();
  expect(JSON.stringify(actual)).not.toMatch(/gross_freight|provider_payout|shipper_fee|file_path|driver_phone/);
  await open(page); await screen(page).getByRole('button', { name: 'Bookings & delivery', exact: true }).click();
  await screen(page).locator('#report-search').fill(row.reference); await screen(page).getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(screen(page).locator('[data-report-row]')).toHaveCount(1); await expect(screen(page).locator('[data-report-row]')).toContainText(row.vehicle);
  await expect(screen(page).locator('[data-report-total=bookings]')).toHaveText(String(actual.summary.bookings.total));
  const csv = await exportCsv(page, screen(page).locator('[data-report-export]'), 'table=bookings&q=' + encodeURIComponent(row.reference));
  expect(csv.rows.length).toBe(2); expect(csv.rows[1][0]).toBe(row.uuid); expect(csv.filename).toBe('transportseva-shipper-bookings-report.csv');
  await screen(page).getByRole('link', { name: 'View trip', exact: true }).click(); await expect(page).toHaveURL('/shipper/trips/' + row.uuid); await expect(page.locator('[data-trip-reference]')).toHaveText(row.reference);
  await open(page); await screen(page).getByRole('button', { name: 'Bookings & delivery', exact: true }).click();
  const target = screen(page).locator('[data-report-row]').filter({ hasText: row.reference });
  await target.getByRole('link', { name: 'Open booking', exact: true }).click(); await expect(page).toHaveURL('/shipper/bookings?booking=' + row.uuid);
  await expect(page.locator('app-bookings b').filter({ hasText: row.reference })).toBeVisible();
  await info.attach('report-booking.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ booking: row.uuid, reference: row.reference, csvRows: csv.rows.length - 1, csvSha256: csv.sha256, businessWrites: blocked }, null, 2)) }); expect(blocked).toEqual([]);
});

test('empty shipper sees real zero and no foreign rows; provider cannot read/export Shipper Reports', async ({ page, context, browser }, info) => {
  const blocked = await readOnly(context); await login(page); const own = await report(page); expect(own.rows.length).toBeGreaterThan(0);
  const otherContext = await browser.newContext({ baseURL: info.project.use.baseURL }); const providerContext = await browser.newContext({ baseURL: info.project.use.baseURL });
  const otherBlocked = await readOnly(otherContext); const providerBlocked = await readOnly(providerContext);
  try {
    const other = await otherContext.newPage(); await login(other, empty); await open(other);
    await expect(screen(other).locator('[data-report-total=loads]')).toHaveText('0'); await expect(screen(other).locator('[data-report-empty]')).toContainText('No records yet'); await expect(screen(other).locator('[data-report-export]')).toBeDisabled();
    const zero = await report(other, 'loads', own.rows[0].reference); expect(zero.rows).toEqual([]); expect(zero.summary.loads.total).toBe(0);
    const csv = await api(other, 'account/reports/export?table=loads&q=' + encodeURIComponent(own.rows[0].reference)); expect(csv.status()).toBe(200); expect(csvRows(await csv.body()).length).toBe(1);
    expect((await api(other, 'account/reports?owner_uuid=forged')).status()).toBe(422);
    const p = await providerContext.newPage(); await login(p, provider);
    expect((await api(p, 'account/reports')).status()).toBe(403); expect((await api(p, 'account/reports/export')).status()).toBe(403);
    await p.goto('/shipper/reports'); await expect(p).toHaveURL('/truck-owner/dashboard');
    expect([...otherBlocked, ...providerBlocked]).toEqual([]);
  } finally { await otherContext.close(); await providerContext.close(); }
  expect(blocked).toEqual([]);
});

test('loading/duplicate guard → honest read failure and retry → reversed-date correction with filters still accessible', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); let reads = 0; let release!: () => void; const pending = new Promise<void>((resolve) => release = resolve);
  await page.route('**/api/account/reports?*', async (route) => { reads++; await pending; return route.fulfill({ status: 503, json: { success: false } }); }, { times: 1 });
  await open(page);
  try { await expect(screen(page).locator('.report-spinner')).toBeVisible(); const refresh = screen(page).getByRole('button', { name: 'Refresh', exact: true }); await expect(refresh).toBeDisabled(); await refresh.evaluate((b: HTMLButtonElement) => b.click()); expect(reads).toBe(1); } finally { release(); }
  await expect(screen(page)).toContainText('could not be loaded'); await expect(screen(page).locator('#report-from')).toBeVisible();
  await screen(page).getByRole('button', { name: 'Retry', exact: true }).click(); await expect(screen(page).locator('[data-report-row]').first()).toBeVisible();
  await screen(page).locator('#report-from').fill('2026-11-02'); await screen(page).locator('#report-to').fill('2026-10-31');
  await screen(page).getByRole('button', { name: 'Apply filters', exact: true }).click(); await expect(screen(page)).toContainText('From must not be after');
  await expect(screen(page).locator('[data-report-row]')).toHaveCount(0); await screen(page).locator('#report-to').fill('2026-11-02');
  await screen(page).getByRole('button', { name: 'Apply filters', exact: true }).click(); await expect(screen(page).locator('[data-report-applied]')).toContainText('02/11/2026'); expect(blocked).toEqual([]);
});

test('CSV preparation animates, ignores an unapplied draft and blocks duplicate export/refresh before honest failure', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); await open(page); await expect(screen(page).locator('[data-report-row]').first()).toBeVisible();
  await screen(page).locator('#report-search').fill('UNAPPLIED'); let exports = 0; let release!: () => void; const pending = new Promise<void>((resolve) => release = resolve);
  await page.route('**/api/account/reports/export?*', async (route) => { exports++; expect(new URL(route.request().url()).searchParams.has('q')).toBe(false); await pending; return route.fulfill({ status: 503, json: { success: false } }); });
  const button = screen(page).locator('[data-report-export]'); await button.click();
  try {
    await expect(screen(page).locator('.report-spinner')).toBeVisible(); await expect(button).toBeDisabled(); await button.evaluate((b: HTMLButtonElement) => b.click());
    await expect.poll(() => exports).toBe(1); await expect(screen(page).getByRole('button', { name: 'Refresh', exact: true })).toBeDisabled();
  } finally { release(); }
  await expect(screen(page)).toContainText('could not be exported'); expect(exports).toBe(1); await expect(screen(page).locator('[data-report-row]').first()).toBeVisible(); expect(blocked).toEqual([]);
});

test('real no-match retains cohort totals, disables empty export and renders Hindi/narrow screen without sample figures', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const actual = await report(page); await open(page);
  await screen(page).locator('#report-search').fill('NO-MATCH-REPORT-IMMUTABLE-QA');
  await screen(page).getByRole('button', { name: 'Apply filters', exact: true }).click(); await expect(screen(page).locator('[data-report-empty]')).toContainText('No records match');
  await expect(screen(page).locator('[data-report-total=loads]')).toHaveText(String(actual.summary.loads.total)); await expect(screen(page).locator('[data-report-export]')).toBeDisabled();
  await page.getByRole('button', { name: 'Change language', exact: true }).click(); await expect(screen(page).getByRole('heading', { name: 'रिपोर्ट और विश्लेषण', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); await expect(screen(page).getByRole('heading', { name: 'रिपोर्ट और विश्लेषण', exact: true })).toBeVisible();
  await info.attach('reports-narrow-hindi.png', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' }); expect(blocked).toEqual([]);
});
