import { expect, test, type Page } from '@playwright/test';
test.use({ trace: 'off', video: 'off', actionTimeout: 30_000 });
test.setTimeout(1_200_000);
const checked = expect.configure({ timeout: 60_000 });
async function guardedView(page: Page, selector: string) {
  const view=page.locator(selector);const retry=page.getByRole('button',{name:'Retry session check',exact:true});
  for(let attempt=0;attempt<3;attempt++) {
    await checked(page.locator('.route-loader')).toHaveCount(0);
    await checked(view.or(retry)).toBeVisible();
    if(await view.isVisible()) return view;
    console.log('Transient session check required explicit retry:',page.url());
    await retry.click();
  }
  await checked(view).toBeVisible();return view;
}
test.beforeEach(async ({context}) => {
  await context.route('**/*',route=>{
    const r=route.request();const u=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname)))return route.abort();
    return route.continue();
  });
});
test('Truck Owner operational screens use real records, survive reload and expose working dashboard links', async ({ page, context }, info) => {
  expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  const blocked: string[] = []; const rows: object[] = [];
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', route => {
    const r = route.request(); const u = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname)) return route.abort();
    if (!['GET','HEAD','OPTIONS'].includes(r.method()) && !(r.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))) { blocked.push(r.method() + ' ' + u.pathname); return route.abort(); }
    return route.continue();
  });
  await page.goto('/auth/login');
  await page.locator('input[name=identifier]').fill('verify-truck-owner-1793028294862-62@transportseva.test');
  await page.locator('input[name=password]').fill('TransportSevaE2E@2026');
  await page.getByRole('button', {name:/^Log In$/i}).click(); await checked(page).toHaveURL('/truck-owner/dashboard');
  async function api(path: string) {
    const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
    const r = await page.request.get('http://localhost:8080/api/' + path, {headers:{Accept:'application/json',Authorization:'Bearer '+token}});
    expect(r.status(), path).toBe(200); return (await r.json()).data;
  }
  const dashboard = await api('marketplace-dashboard'); const vehicles = await api('marketplace-vehicles');
  const drivers = await api('marketplace-drivers'); const apps = await api('applications/mine?per_page=100');
  const trips = await api('account/truck-owner/trips?per_page=50'); const docs = await api('account/truck-owner/documents');
  const reports = await api('account/truck-owner/reports');
  expect(vehicles.length).toBeGreaterThan(0); expect(drivers.length).toBeGreaterThan(0); expect(apps.length).toBeGreaterThan(0);
  const load = apps.find((a:any) => a.load)?.load; expect(load).toBeTruthy(); expect(trips.rows.length).toBeGreaterThan(0);
  const screens = [
    ['dashboard','app-truck-owner-dashboard'],['load-board','app-load-board'],['load-board/'+load.uuid,'app-load-details'],
    ['applications','app-applications'],['bookings','app-bookings'],['reviews','app-my-review'],
    ['vehicles','app-vehicle-list'],['vehicles/'+vehicles[0].uuid,'app-registered-vehicle-details'],
    ['drivers','app-driver-list'],['drivers/'+drivers[0].uuid,'app-registered-driver-details'],
    ['trips','app-shipper-trip-list'],['trips/'+trips.rows[0].uuid,'app-shipper-trip-details'],
    ['reports','app-truck-owner-reports'],['documents','app-shipper-documents'],['kyc','app-my-kyc'],
    ['notifications','app-notifications'],['support','app-support'],['profile','app-account-profile-page'],
  ];
  for (const [path,selector] of screens) await test.step(path, async () => {
    await page.goto('/truck-owner/'+path); const view=await guardedView(page,selector);
    await checked(view).toBeVisible(); await checked(view.locator('h1').first()).toBeVisible();
    await expect(page.locator('vite-error-overlay')).toHaveCount(0);
    if(path==='dashboard') for(const key of ['vehicles_total','vehicles_on_trip','vehicles_available','pending_applications']) await checked(view.locator('[data-metric='+key+'] .kpi-value')).toHaveText(String(dashboard.totals[key]));
    if(path==='vehicles') await checked(view.locator('tbody tr')).toHaveCount(vehicles.length);
    if(path==='drivers') await checked(view.locator('tbody tr')).toHaveCount(drivers.length);
    if(path.startsWith('vehicles/')) await checked(view).toContainText(vehicles[0].registration_number);
    if(path.startsWith('drivers/')) await checked(view).toContainText(drivers[0].phone);
    if(path==='trips') await checked(view.locator('[data-trip-total=total]')).toHaveText(String(trips.totals.total));
    if(path==='reports') await checked(view.locator('[data-report-total=applications]')).toHaveText(String(reports.summary.applications.total));
    if(path==='documents') await checked(view.locator('[data-document-total=total]')).toHaveText(String(docs.totals.total));
    await page.reload(); await guardedView(page,selector); await checked(page.locator(selector).locator('h1').first()).toBeVisible(); await expect(page).toHaveURL('/truck-owner/'+path);
    rows.push({path:'/truck-owner/'+path,reload:true,selector}); console.log('Verified Truck Owner route:',path);
  });
  await page.goto('/truck-owner/dashboard'); await guardedView(page,'app-truck-owner-dashboard');
  await checked(page.locator('[data-metric=pending_applications]')).toBeVisible();
  await page.locator('[data-metric=pending_applications]').click(); await checked(page).toHaveURL('/truck-owner/applications');
  await checked(page.locator('app-applications h1')).toBeVisible();
  expect(blocked).toEqual([]);
  await info.attach('truck-owner-acceptance.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({account:'verify-truck-owner-1793028294862-62@transportseva.test',routes:rows,blockedWrites:blocked},null,2))});
});

test('vehicle directory shows a held read and a retryable failure rather than an empty fleet', async ({page,context}) => {
  await context.addInitScript(() => localStorage.setItem('ts_lang','en'));
  await page.goto('/auth/login'); await page.locator('input[name=identifier]').fill('verify-truck-owner-1793028294862-62@transportseva.test');
  await page.locator('input[name=password]').fill('TransportSevaE2E@2026'); await page.getByRole('button',{name:/^Log In$/i}).click(); await checked(page).toHaveURL('/truck-owner/dashboard');
  let release!:()=>void;const gate=new Promise<void>(r=>release=r);
  await page.route('**/api/marketplace-vehicles',async route=>{await gate;return route.fulfill({status:503,json:{success:false}});},{times:1});
  await page.getByRole('link',{name:'My Vehicles',exact:true}).first().click(); const view=await guardedView(page,'app-vehicle-list');
  try { await checked(view.getByRole('status')).toContainText('Loading registered vehicles'); await expect(view).not.toContainText('No vehicles found'); } finally {release();}
  await checked(view.getByRole('alert')).toBeVisible(); await expect(view).not.toContainText('No vehicles found');
  await view.getByRole('button',{name:'Retry',exact:true}).click(); await checked(view.locator('tbody tr').first()).toBeVisible();
});
