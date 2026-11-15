import { expect, test } from '@playwright/test';
test.use({ trace:'off',video:'off' });test.setTimeout(300_000);
const checked=expect.configure({timeout:60_000});
test('one server identity check per navigation, slow success and transient recovery keep valid sessions',async({page,context},info)=>{
  const blocked:string[]=[];const checks:string[]=[];
  await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{const r=route.request();const u=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))){blocked.push(u.pathname);return route.abort();}return route.continue();});
  page.on('request',r=>{if(r.url().endsWith('/api/auth/me'))checks.push(r.url());});
  await page.goto('/auth/login');await page.locator('input[name=identifier]').fill('verify-truck-owner-1793028294862-62@transportseva.test');
  await page.locator('input[name=password]').fill('TransportSevaE2E@2026');await page.getByRole('button',{name:/^Log In$/i}).click();
  await checked(page.locator('app-truck-owner-dashboard h1')).toBeVisible();expect(checks.length).toBe(1);
  const evidence:object[]=[];
  for(const [path,selector] of [['drivers','app-driver-list'],['vehicles','app-vehicle-list'],['dashboard','app-truck-owner-dashboard']]){
    const before=checks.length;await page.goto('/truck-owner/'+path);await checked(page.locator(selector+' h1')).toBeVisible();
    expect(checks.length-before).toBe(1);await expect(page).toHaveURL('/truck-owner/'+path);evidence.push({path,identityRequests:checks.length-before});
  }
  await page.route('**/api/auth/me',async route=>{const response=await route.fetch();await new Promise(r=>setTimeout(r,16_000));await route.fulfill({response});},{times:1});
  let before=checks.length;await page.reload();await checked(page.locator('app-truck-owner-dashboard h1')).toBeVisible();
  await expect(page).toHaveURL('/truck-owner/dashboard');expect(checks.length-before).toBe(1);
  await page.route('**/api/auth/me',route=>route.fulfill({status:503,json:{success:false}}),{times:1});
  before=checks.length;await page.reload();await checked(page.locator('app-truck-owner-dashboard h1')).toBeVisible();
  await expect(page).toHaveURL('/truck-owner/dashboard');expect(checks.length-before).toBe(2);
  expect(await page.evaluate(()=>Boolean(localStorage.getItem('transportseva.access_token')))).toBe(true);expect(blocked).toEqual([]);
  await info.attach('session-checks.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({navigation:evidence,slowResponseSeconds:16,slowRequestCount:1,transient503Requests:2,blockedBusinessWrites:blocked}))});
});
