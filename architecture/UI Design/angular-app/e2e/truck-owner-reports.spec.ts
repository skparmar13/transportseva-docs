import { expect, test, type BrowserContext, type Page, type Locator } from '@playwright/test';
import { createHash } from 'node:crypto';
test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(180_000);
const owner = { email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'truck-owner' };
const other = { email: 'verify-truck-owner-1793028294862-63@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'truck-owner' };
const wrongRole = { email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'shipper' };
const screen = (p: Page) => p.locator('app-truck-owner-reports');
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
async function report(page: Page, table = 'applications', q = '') {
  const r = await api(page, 'account/truck-owner/reports?per_page=50&table=' + table + (q ? '&q=' + encodeURIComponent(q) : ''));
  expect(r.status()).toBe(200); expect(r.headers()['cache-control']).toContain('no-store'); return (await r.json()).data;
}
async function open(page: Page) {
  await page.goto('/truck-owner/reports'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
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
  const original = await api(page, 'account/truck-owner/reports/export?' + query); expect(original.status()).toBe(200);
  expect(original.headers()['cache-control']).toContain('no-store'); expect(original.headers()['x-report-timezone']).toBe('Asia/Kolkata');
  const bytes = await original.body(); const wait = page.waitForEvent('download'); await button.click(); const download = await wait;
  const stream = await download.createReadStream(); const chunks: Buffer[] = []; for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(createHash('sha256').update(Buffer.concat(chunks)).digest('hex')).toBe(createHash('sha256').update(bytes).digest('hex'));
  return { rows: csvRows(bytes), filename: download.suggestedFilename(), sha256: createHash('sha256').update(bytes).digest('hex') };
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));


test('real sent applications and provider bookings match independent APIs, paginate and export every applied row', async ({ page, context }, info) => {
  const blocked = await readOnly(context); await login(page);
  const actual = await report(page); const apps = await all(page, 'applications/mine');
  const bookings = (await all(page, 'marketplace-bookings')).filter((b) => b.viewer_side === 'provider');
  expect(actual.summary.applications.total).toBe(apps.length);
  for (const status of ['pending','negotiating','accepted','rejected','withdrawn'])
    expect(actual.summary.applications.statuses[status]).toBe(apps.filter((a) => a.status === status).length);
  expect(actual.summary.bookings.total).toBe(bookings.length);
  expect(actual.summary.bookings.stages.delivered).toBe(bookings.filter((b) => b.status === 'completed').length);
  expect(apps.length).toBeGreaterThan(1);
  await page.route('**/api/account/truck-owner/reports?*', async (route) => {
    const url = new URL(route.request().url()); url.searchParams.set('per_page','1');
    return route.fulfill({ response: await route.fetch({ url: url.toString() }) });
  });
  await open(page); await expect(screen(page).locator('[data-report-row]')).toHaveCount(1);
  await expect(screen(page).locator('[data-report-total=applications]')).toHaveText(String(apps.length));
  const first = await screen(page).locator('[data-report-row] b').first().innerText();
  await screen(page).getByRole('button',{name:'Next',exact:true}).click();
  await expect(screen(page).locator('[data-report-row] b').first()).not.toHaveText(first);
  const csv = await exportCsv(page, screen(page).locator('[data-report-export]'), 'table=applications');
  expect(csv.rows.length).toBe(apps.length+1); expect(csv.filename).toBe('transportseva-truck-owner-applications-report.csv');
  const target = actual.rows.find((a:any) => a.load_uuid); expect(target).toBeTruthy();
  await screen(page).locator('#report-search').fill(target.reference);
  await screen(page).getByRole('button',{name:'Apply filters',exact:true}).click();
  await expect(screen(page).locator('[data-report-row]')).toHaveCount(1);
  await screen(page).getByRole('link',{name:'View load',exact:true}).click();
  await expect(page).toHaveURL('/truck-owner/load-board/'+target.load_uuid);
  await expect(page.locator('app-load-details')).toContainText(target.load_reference);
  await open(page); await page.reload(); await expect(screen(page).locator('[data-report-total=applications]')).toHaveText(String(apps.length));
  await info.attach('owner-report-applications.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({
    user:owner.email,applications:apps.length,bookings:bookings.length,application:target.uuid,load:target.load_uuid,csvRows:csv.rows.length-1,csvSha256:csv.sha256,businessWrites:blocked
  },null,2))}); expect(blocked).toEqual([]);
});

test('real booking route, assignments and POD counts export with exact trip and booking links', async ({ page,context },info)=>{
  const blocked=await readOnly(context); await login(page); const actual=await report(page,'bookings');
  const row=actual.rows.find((b:any)=>b.stage==='delivered'&&b.vehicle); expect(row).toBeTruthy();
  expect(row.load_uuid).toBeTruthy(); expect(row.pickup_city).toBeTruthy();
  expect(JSON.stringify(actual)).not.toMatch(/gross_freight|provider_payout|file_path|driver_phone|owner_uuid/);
  await open(page); await screen(page).getByRole('button',{name:'Bookings & delivery',exact:true}).click();
  await screen(page).locator('#report-search').fill(row.reference); await screen(page).getByRole('button',{name:'Apply filters',exact:true}).click();
  await expect(screen(page).locator('[data-report-row]')).toHaveCount(1); await expect(screen(page).locator('[data-report-row]')).toContainText(row.vehicle);
  await expect(screen(page).locator('[data-report-row]')).toContainText(row.pickup_city);
  const csv=await exportCsv(page,screen(page).locator('[data-report-export]'),'table=bookings&q='+encodeURIComponent(row.reference));
  expect(csv.rows.length).toBe(2); expect(csv.rows[1][0]).toBe(row.uuid); expect(csv.filename).toBe('transportseva-truck-owner-bookings-report.csv');
  await screen(page).getByRole('link',{name:'View trip',exact:true}).click(); await expect(page).toHaveURL('/truck-owner/trips/'+row.uuid);
  await expect(page.locator('[data-trip-reference]')).toHaveText(row.reference);
  await open(page); await screen(page).getByRole('button',{name:'Bookings & delivery',exact:true}).click();
  await screen(page).locator('[data-report-row]').filter({hasText:row.reference}).getByRole('link',{name:'Open booking',exact:true}).click();
  await expect(page).toHaveURL('/truck-owner/bookings?booking='+row.uuid); await expect(page.locator('app-bookings')).toContainText(row.reference);
  await info.attach('owner-report-booking.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({booking:row.uuid,reference:row.reference,load:row.load_uuid,csvSha256:csv.sha256,businessWrites:blocked},null,2))});
  expect(blocked).toEqual([]);
});

test('another provider receives only own activity; shipper cannot read or export provider reports', async ({page,context,browser},info)=>{
  const blocked=await readOnly(context); await login(page); const own=await report(page); const target=own.rows[0]; expect(target).toBeTruthy();
  const oc=await browser.newContext({baseURL:info.project.use.baseURL}); const sc=await browser.newContext({baseURL:info.project.use.baseURL});
  const ob=await readOnly(oc);const sb=await readOnly(sc);
  try {
    const p=await oc.newPage();await login(p,other);await open(p);
    const apps=await all(p,'applications/mine');const actual=await report(p);
    expect(actual.summary.applications.total).toBe(apps.length); await expect(screen(p).locator('[data-report-total=applications]')).toHaveText(String(apps.length));
    expect((await report(p,'applications',target.reference)).rows).toEqual([]);
    const csv=await api(p,'account/truck-owner/reports/export?table=applications&q='+encodeURIComponent(target.reference));
    expect(csv.status()).toBe(200);expect(csvRows(await csv.body()).length).toBe(1);
    expect((await api(p,'account/truck-owner/reports?provider_uuid=forged')).status()).toBe(422);
    const s=await sc.newPage();await login(s,wrongRole);
    expect((await api(s,'account/truck-owner/reports')).status()).toBe(403);
    expect((await api(s,'account/truck-owner/reports/export')).status()).toBe(403);
    await s.goto('/truck-owner/reports');await expect(s).toHaveURL('/shipper/dashboard');
    expect([...ob,...sb]).toEqual([]);
  }finally{await oc.close();await sc.close();}
  expect(blocked).toEqual([]);
});

test('held reads animate and block duplicates; retry and date correction return honest zero cohorts',async({page,context})=>{
  const blocked=await readOnly(context);await login(page);let reads=0;let release!:()=>void;const gate=new Promise<void>(r=>release=r);
  await page.route('**/api/account/truck-owner/reports?*',async route=>{reads++;await gate;return route.fulfill({status:503,json:{success:false}});},{times:1});
  await page.getByRole('link',{name:'Reports & Analytics',exact:true}).click();
  try{
    await expect(screen(page).locator('.report-spinner')).toBeVisible();
    const refresh=screen(page).getByRole('button',{name:'Refresh',exact:true});await expect(refresh).toBeDisabled();await refresh.evaluate((b:HTMLButtonElement)=>b.click());
    await expect.poll(()=>reads).toBe(1);
  }finally{release();}
  await expect(screen(page)).toContainText('could not be loaded');await screen(page).getByRole('button',{name:'Retry',exact:true}).click();
  await expect(screen(page).locator('[data-report-row]').first()).toBeVisible();
  await screen(page).locator('#report-from').fill('2030-01-02');await screen(page).locator('#report-to').fill('2030-01-01');
  await screen(page).getByRole('button',{name:'Apply filters',exact:true}).click();await expect(screen(page)).toContainText('From must not be after');
  await screen(page).locator('#report-to').fill('2030-01-02');await screen(page).getByRole('button',{name:'Apply filters',exact:true}).click();
  await expect(screen(page).locator('[data-report-total=applications]')).toHaveText('0');await expect(screen(page).locator('[data-report-total=bookings]')).toHaveText('0');
  await expect(screen(page).locator('[data-report-export]')).toBeDisabled();await expect(screen(page).locator('[data-report-applied]')).toContainText('02/01/2030');
  expect(blocked).toEqual([]);
});

test('CSV feedback blocks duplicate export and retains rows after an export failure without using draft filters',async({page,context})=>{
  const blocked=await readOnly(context);await login(page);await open(page);await expect(screen(page).locator('[data-report-row]').first()).toBeVisible();
  await screen(page).locator('#report-search').fill('UNAPPLIED');let exports=0;let release!:()=>void;const gate=new Promise<void>(r=>release=r);
  await page.route('**/api/account/truck-owner/reports/export?*',async route=>{
    exports++;expect(new URL(route.request().url()).searchParams.has('q')).toBe(false);await gate;return route.fulfill({status:503,json:{success:false}});
  });
  const button=screen(page).locator('[data-report-export]');await button.click();
  try{
    await expect(screen(page).locator('.report-spinner')).toBeVisible();await expect(button).toBeDisabled();await button.evaluate((b:HTMLButtonElement)=>b.click());
    await expect.poll(()=>exports).toBe(1);await expect(screen(page).getByRole('button',{name:'Refresh',exact:true})).toBeDisabled();
  }finally{release();}
  await expect(screen(page)).toContainText('could not be exported');await expect(screen(page).locator('[data-report-row]').first()).toBeVisible();expect(blocked).toEqual([]);
});

test('no-match preserves cohort totals and supports Hindi and narrow layouts',async({page,context},info)=>{
  const blocked=await readOnly(context);await login(page);const actual=await report(page);await open(page);
  await screen(page).locator('#report-search').fill('NO-MATCH-OWNER-REPORT-QA');await screen(page).getByRole('button',{name:'Apply filters',exact:true}).click();
  await expect(screen(page).locator('[data-report-empty]')).toContainText('No records match');
  await expect(screen(page).locator('[data-report-total=applications]')).toHaveText(String(actual.summary.applications.total));
  await expect(screen(page).locator('[data-report-export]')).toBeDisabled();await page.getByRole('button',{name:'Change language',exact:true}).click();
  await expect(screen(page).getByRole('heading',{name:'रिपोर्ट और विश्लेषण',exact:true})).toBeVisible();
  await expect(screen(page)).toContainText('भेजे गए आवेदन');await page.setViewportSize({width:390,height:844});
  await expect(screen(page).getByRole('heading',{name:'रिपोर्ट और विश्लेषण',exact:true})).toBeVisible();
  await info.attach('owner-report-hindi.png',{contentType:'image/png',body:await page.screenshot({animations:'disabled'})});expect(blocked).toEqual([]);
});

