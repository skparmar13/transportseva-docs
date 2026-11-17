import { expect, test, type BrowserContext } from '@playwright/test';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000 });
test.setTimeout(90_000);
const feed = '**/api/loads/recent?*';

async function readOnly(context: BrowserContext, language = 'en') {
  const blocked: string[] = [];
  await context.addInitScript(lang => localStorage.setItem('ts_lang', lang), language);
  await context.route('**/*', route => {
    const request = route.request(); const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      blocked.push(request.method() + ' ' + url.pathname); return route.abort();
    }
    return route.continue();
  });
  return blocked;
}

test('held load read shows animation, failed read retries once and recovers to real API records', async ({ page, context }, info) => {
  const blocked = await readOnly(context); let requests = 0;
  let releaseFailure!: () => void; let releaseRetry!: () => void;
  const first = new Promise<void>(resolve => releaseFailure = resolve);
  const retry = new Promise<void>(resolve => releaseRetry = resolve);
  await page.route(feed, async route => {
    requests++;
    if (requests === 1) { await first; return route.fulfill({ status: 503, json: { success: false, message: 'Browser-only failure' } }); }
    await retry; return route.continue();
  });
  try {
    await page.goto('/');
    const section = page.locator('#current-loads');
    await expect(section.locator('[role=status][aria-busy=true]')).toContainText('Loading current loads');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByLabel('Source city', { exact: true })).toBeDisabled();
    await expect(section.locator('table')).toHaveCount(0);
    await expect(section.locator('.public-load-spinner')).toHaveCSS('animation-name', /public-load-spin$/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(section.locator('.public-load-spinner')).toHaveCSS('animation-name', 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.screenshot({ path: info.outputPath('load-preview-loading.png') });
    releaseFailure();
    await expect(section.getByRole('alert')).toContainText('Current loads could not be loaded.');
    await expect(section).not.toContainText('No open loads');
    await page.screenshot({ path: info.outputPath('load-preview-error.png') });
    await section.getByRole('button', { name: 'Try again', exact: true }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
    await expect(section.locator('[aria-busy=true]')).toBeVisible(); expect(requests).toBe(2);
    const realResponse = page.waitForResponse(r => new URL(r.url()).pathname === '/api/loads/recent' && r.status() === 200);
    releaseRetry(); const response = await realResponse; const body = await response.json();
    expect(body.success).toBe(true); expect(body.data.length).toBeGreaterThan(0);
    await expect(section.locator('tbody')).toContainText(body.data[0].load_id);
    await expect(section.locator('tbody')).toContainText(body.data[0].pickup_city);
    await expect(section.locator('[role=alert]')).toHaveCount(0);
    await expect(section.getByLabel('Source city', { exact: true })).toBeEnabled();
    expect(requests).toBe(2); expect(blocked).toEqual([]);
    await page.screenshot({ path: info.outputPath('load-preview-real-recovery.png') });
    await info.attach('real-load-recovery.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({
      firstLoadUuid: body.data[0].uuid, firstLoadReference: body.data[0].load_id, returnedRows: body.data.length,
      feedRequests: requests, blockedWrites: blocked,
    })) });
  } finally { releaseFailure(); releaseRetry(); }
});

test('successful empty feed has its own Hindi message and no invented rows', async ({ page, context }) => {
  const blocked = await readOnly(context, 'hi');
  await page.route(feed, route => route.fulfill({ json: { success: true, data: [] } }));
  await page.goto('/'); const section = page.locator('#current-loads');
  await expect(section.getByRole('status')).toHaveText('अभी कोई खुला लोड उपलब्ध नहीं है।');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('table')).toHaveCount(0); await expect(section.getByRole('button')).toHaveCount(0);
  await expect(section).not.toContainText('publicLoads.'); expect(blocked).toEqual([]);
});

test('preview filters and 10/20 limit are local, and clear filters recovers from no matches', async ({ page, context }, info) => {
  const blocked = await readOnly(context); let requests = 0;
  const rows = Array.from({ length: 20 }, (_, i) => ({ uuid: 'preview-browser-'+i, load_id: 'LD-0099'+String(i).padStart(2, '0'),
    pickup_city: i === 0 ? 'Jaipur' : 'Delhi', drop_city: 'Mumbai', material: 'Explicit browser fixture',
    vehicle_type: i === 0 ? 'Mini Truck' : '32ft Trailer', status: 'open', budget: '20000.00',
    weight_tons: '16.00', created_at: '2026-11-17 12:30:00' }));
  await page.route(feed, route => { requests++; return route.fulfill({ json: { success: true, data: rows } }); });
  await page.goto('/'); const section = page.locator('#current-loads');
  await expect(section.locator('tbody tr')).toHaveCount(10);
  await expect(section.locator('tbody')).toContainText('LD-009900');
  await section.scrollIntoViewIfNeeded();
  await section.getByLabel('Show loads', { exact: true }).selectOption('20');
  await expect(section.locator('tbody tr')).toHaveCount(20);
  await expect(section.locator('tbody tr').first()).toContainText('₹20,000');
  await section.getByLabel('Source city', { exact: true }).fill('  JAIPUR ');
  await section.getByLabel('Vehicle type', { exact: true }).selectOption('Mini Truck');
  await expect(section.locator('tbody tr')).toHaveCount(1);
  await section.getByLabel('Destination city', { exact: true }).fill('Chennai');
  await expect(section.getByRole('status')).toHaveText('No current loads match these filters.');
  await expect(section).not.toContainText('No open loads are available');
  await expect(section).toContainText('Filters apply to this preview.');
  await section.getByRole('button', { name: 'Clear filters' }).click();
  await expect(section.locator('tbody tr')).toHaveCount(20);
  await expect(section.getByLabel('Source city', { exact: true })).toHaveValue('');
  await expect(section.getByLabel('Destination city', { exact: true })).toHaveValue('');
  await expect(section.getByLabel('Vehicle type', { exact: true })).toHaveValue('All');
  expect(requests).toBe(1); expect(blocked).toEqual([]);
  await page.screenshot({ path: info.outputPath('load-preview-filter-recovery.png') });
});

test('an HTTP 200 failed envelope is an error, not a successful empty feed', async ({ page, context }) => {
  const blocked = await readOnly(context);
  await page.route(feed, route => route.fulfill({ json: { success: false, data: [] } }));
  await page.goto('/'); const section = page.locator('#current-loads');
  await expect(section.getByRole('alert')).toContainText('Current loads could not be loaded.');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(section).not.toContainText('No open loads are available'); expect(blocked).toEqual([]);
});
