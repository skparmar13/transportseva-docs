// Real provider-owned hub; business writes and external hosts are blocked.
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(120_000);
const owner = { email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'truck-owner' };
const empty = { email: 'verify-truck-owner-1793028294862-63@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'truck-owner' };
const wrongRole = { email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'shipper' };
const hub = (page: Page) => page.locator('app-shipper-documents');
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
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
async function documents(page: Page) {
  const r = await api(page, 'account/truck-owner/documents?per_page=50'); expect(r.status()).toBe(200);
  expect(r.headers()['cache-control']).toContain('no-store'); return (await r.json()).data;
}
async function open(page: Page, tab = 'pods') {
  await page.goto('/truck-owner/documents' + (tab === 'kyc' ? '?tab=kyc' : ''));
  await expect(page.locator('vite-error-overlay')).toHaveCount(0); await expect(hub(page).getByRole('heading', { name: 'Documents', exact: true })).toBeVisible();
}
async function originalDownload(page: Page, button: import('@playwright/test').Locator, path: string) {
  const r = await api(page, path); expect(r.status()).toBe(200); expect(r.headers()['cache-control']).toContain('no-store');
  const original = await r.body(); const wait = page.waitForEvent('download'); await button.click(); const download = await wait;
  const stream = await download.createReadStream(); const chunks: Buffer[] = []; for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(hash(Buffer.concat(chunks))).toBe(hash(original));
  return { bytes: original.length, sha256: hash(original), filename: download.suggestedFilename() };
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));

test('owned POD history → real filters → original bytes → exact trip and booking links → reload', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const data = await documents(page);
  const pod = data.pods.find((p: any) => p.download_available); expect(pod, 'Read-only test needs an existing original POD').toBeTruthy();
  expect(JSON.stringify(data)).not.toMatch(/file_path|document_path|pan_number|gstin|provider_uuid/);
  await open(page); await expect(hub(page).locator('[data-document-total=total]')).toHaveText(String(data.totals.total));
  await hub(page).locator('#document-status').selectOption(pod.status); await hub(page).locator('#document-search').fill(pod.booking_reference);
  await hub(page).getByRole('button', { name: 'Apply filters', exact: true }).click(); await expect(hub(page).locator('[data-document-row]')).toHaveCount(1);
  const row = hub(page).locator('[data-document-row]'); await expect(row).toContainText(pod.file_name);
  const file = await originalDownload(page, row.getByRole('button', { name: 'Download original', exact: true }), 'account/truck-owner/documents/pods/' + pod.booking_uuid + '/download');
  expect(file.filename).toBe(pod.file_name); expect(await hub(page).locator('input[type=file]').count()).toBe(0);
  await row.getByRole('link', { name: 'View trip', exact: true }).click(); await expect(page).toHaveURL('/truck-owner/trips/' + pod.booking_uuid);
  await expect(page.locator('[data-trip-reference]')).toHaveText(pod.booking_reference);
  await open(page); const selected = hub(page).locator('[data-document-row]').filter({ hasText: pod.booking_reference });
  await selected.getByRole('link', { name: 'Open booking / POD actions', exact: true }).click(); await expect(page).toHaveURL('/truck-owner/bookings?booking=' + pod.booking_uuid);
  await expect(page.locator('app-bookings b').filter({ hasText: pod.booking_reference })).toBeVisible();
  await open(page); await page.reload(); await expect(hub(page)).toContainText(pod.booking_reference);
  await info.attach('document-record.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ account: owner.email, booking: pod.booking_uuid, reference: pod.booking_reference, original: file, businessWrites: blocked }, null, 2)) });
  await info.attach('documents.png', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' }); expect(blocked).toEqual([]);
});

test('own KYC original downloads byte-for-byte and management opens the actual KYC route', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const data = await documents(page); expect(data.kyc?.download_available).toBe(true);
  await open(page, 'kyc'); await expect(hub(page).locator('[data-kyc-status]')).toHaveText('Approved');
  const file = await originalDownload(page, hub(page).getByRole('button', { name: 'Download original', exact: true }), 'account/truck-owner/documents/kyc/' + data.kyc.uuid + '/download');
  expect(file.filename).toBe(data.kyc.file_name);
  await page.reload(); await expect(hub(page).locator('[data-document-kyc]')).toContainText(data.kyc.business_name);
  await hub(page).getByRole('link', { name: 'Manage KYC', exact: true }).click(); await expect(page).toHaveURL('/truck-owner/kyc');
  await info.attach('kyc-original.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ account: owner.email, profile: data.kyc.uuid, original: file, businessWrites: blocked }, null, 2)) });
  expect(blocked).toEqual([]);
});

test('different truck owner cannot read foreign documents; shipper cannot claim provider hub', async ({ page, context, browser }, info) => {
  const blocked = await readOnly(context); await login(page); const own = await documents(page); const pod = own.pods[0]; expect(pod).toBeTruthy(); expect(own.kyc).toBeTruthy();
  const emptyContext = await browser.newContext({ baseURL: info.project.use.baseURL }); const providerContext = await browser.newContext({ baseURL: info.project.use.baseURL });
  const emptyBlocked = await readOnly(emptyContext); const providerBlocked = await readOnly(providerContext);
  try {
    const other = await emptyContext.newPage(); await login(other, empty); await open(other);
    await expect(hub(other).locator('[data-document-total=total]')).toHaveText('0'); await expect(hub(other).locator('[data-document-empty]')).toContainText('No POD documents');
    await hub(other).getByRole('button', { name: 'My KYC document', exact: true }).click();
    // This zero-POD QA account may have its own KYC from an earlier
    // QA run. Compare its actual record; never delete it for a test.
    const otherDocuments = await documents(other);
    if (otherDocuments.kyc) {
      expect(otherDocuments.kyc.uuid).not.toBe(own.kyc.uuid);
      await expect(hub(other)).toContainText(otherDocuments.kyc.file_name);
      // Filenames may coincide; exact UUID authorization is checked below.
    } else await expect(hub(other).locator('[data-kyc-empty]')).toBeVisible();
    expect((await api(other, 'account/truck-owner/documents/pods/' + pod.booking_uuid + '/download')).status()).toBe(404);
    expect((await api(other, 'account/truck-owner/documents/kyc/' + own.kyc.uuid + '/download')).status()).toBe(404);
    expect((await api(other, 'account/truck-owner/documents?owner_uuid=' + own.kyc.uuid)).status()).toBe(422);
    const p = await providerContext.newPage(); await login(p, wrongRole);
    for (const path of ['account/truck-owner/documents', 'account/truck-owner/documents/pods/' + pod.booking_uuid + '/download', 'account/truck-owner/documents/kyc/' + own.kyc.uuid + '/download']) expect((await api(p, path)).status()).toBe(403);
    await p.goto('/truck-owner/documents'); await expect(p).toHaveURL('/shipper/dashboard');
    expect([...emptyBlocked, ...providerBlocked]).toEqual([]);
  } finally { await emptyContext.close(); await providerContext.close(); }
  expect(blocked).toEqual([]);
});

test('slow list animates, duplicate reads are guarded, failed refresh clears old content and retry recovers', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); let reads = 0;
  let release!: () => void; const pending = new Promise<void>((resolve) => release = resolve);
  await page.route('**/api/account/truck-owner/documents?*', async (route) => { reads++; await pending; return route.fulfill({ status: 503, json: { success: false } }); }, { times: 1 });
  // Enter through the actual sidebar so SSR/hydration cannot consume a one-shot
  // client fixture before its loading state is observed.
  await page.getByRole('link', { name: 'Documents', exact: true }).click();
  const refresh = hub(page).getByRole('button', { name: 'Refresh', exact: true });
  try {
    await expect(hub(page).locator('.doc-spinner')).toBeVisible();
    await expect(refresh).toBeDisabled(); await refresh.evaluate((b: HTMLButtonElement) => b.click());
    await expect.poll(() => reads).toBe(1);
  } finally { release(); }
  await expect(hub(page)).toContainText('could not be loaded'); expect(reads).toBe(1);
  await hub(page).getByRole('button', { name: 'Retry', exact: true }).click(); await expect(hub(page).locator('[data-document-row]').first()).toBeVisible();
  await page.route('**/api/account/truck-owner/documents?*', (route) => route.fulfill({ status: 503, json: { success: false } }), { times: 1 });
  await refresh.click(); await expect(hub(page)).toContainText('could not be loaded'); await expect(hub(page).locator('[data-document-row]')).toHaveCount(0);
  await hub(page).getByRole('button', { name: 'Retry', exact: true }).click(); await expect(hub(page).locator('[data-document-row]').first()).toBeVisible(); expect(blocked).toEqual([]);
});

test('download failure animates once, blocks duplicate clicks and reports error without synthetic success', async ({ page, context }) => {
  const blocked = await readOnly(context); await login(page); await open(page); let downloads = 0;
  let release!: () => void; const pending = new Promise<void>((resolve) => release = resolve);
  await page.route('**/api/account/truck-owner/documents/pods/*/download', async (route) => { downloads++; await pending; return route.fulfill({ status: 503, json: { success: false } }); });
  // The label changes to Downloading: target the same element, not a future enabled retry.
  const button = hub(page).locator('[data-document-row] button').first(); await button.click();
  try {
    await expect(hub(page).locator('.doc-spinner')).toBeVisible(); await expect(button).toBeDisabled();
    await button.evaluate((b: HTMLButtonElement) => b.click()); await expect.poll(() => downloads).toBe(1);
    await expect(hub(page).getByRole('button', { name: 'Refresh', exact: true })).toBeDisabled();
  } finally { release(); }
  await expect(hub(page)).toContainText('could not be downloaded'); expect(downloads).toBe(1);
  await expect(hub(page).locator('[data-document-row]').first()).toBeVisible(); expect(blocked).toEqual([]);
});

test('missing-original UI fixture keeps recorded statuses; real no-match, Hindi and narrow viewport states work', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page); const data = await documents(page);
  await page.route('**/api/account/truck-owner/documents?*', async (route) => {
    const response = await route.fetch(); const body = await response.json();
    body.data.pods = body.data.pods.map((p: any) => ({ ...p, download_available: false })); if (body.data.kyc) body.data.kyc.download_available = false;
    return route.fulfill({ response, json: body });
  }, { times: 1 });
  await page.getByRole('link', { name: 'Documents', exact: true }).click();
  await expect(hub(page).locator('[data-file-unavailable]').first()).toBeVisible();
  await expect(hub(page).getByRole('button', { name: 'Download original', exact: true })).toHaveCount(0);
  await expect(hub(page).locator('[data-document-status]').first()).toHaveText('Approved');
  await hub(page).getByRole('button', { name: 'My KYC document', exact: true }).click(); await expect(hub(page).locator('[data-kyc-status]')).toHaveText('Approved');
  await expect(hub(page).locator('[data-file-unavailable]')).toBeVisible(); await hub(page).getByRole('button', { name: 'Booking PODs', exact: true }).click();
  await hub(page).locator('#document-search').fill('NO-MATCH-DOCUMENT-IMMUTABLE-QA'); await hub(page).getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(hub(page).locator('[data-document-empty]')).toContainText('match these filters');
  await expect(hub(page).locator('[data-document-total=total]')).toHaveText(String(data.totals.total));
  await page.getByRole('button', { name: 'Change language', exact: true }).click(); await expect(hub(page).getByRole('heading', { name: 'दस्तावेज़', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); await expect(hub(page).getByRole('heading', { name: 'दस्तावेज़', exact: true })).toBeVisible();
  await info.attach('documents-narrow-hindi.png', { body: await page.screenshot({ animations: 'disabled' }), contentType: 'image/png' }); expect(blocked).toEqual([]);
});
