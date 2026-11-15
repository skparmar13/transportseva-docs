import {expect,test} from '@playwright/test';
test.use({trace:'off',video:'off'});test.setTimeout(300_000);
const checked=expect.configure({timeout:60_000});
test('real Transporter dashboard totals, navigation, reload and failed refresh recovery',async({page,context},info)=>{
  const blocked:string[]=[];await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{const r=route.request();const u=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))){blocked.push(r.method()+' '+u.pathname);return route.abort();}return route.continue();});
  await page.goto('/auth/login');await page.locator('input[name=identifier]').fill('qa-onboarding-1793463324476-transporter@transportseva.test');
  await page.locator('input[name=password]').fill('OnboardingQA@2026!');await page.getByRole('button',{name:/^Log In$/i}).click();
  const view=page.locator('app-transporter-dashboard');await checked(view.locator('h1')).toBeVisible();
  const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));
  async function api(path:string){const r=await page.request.get('http://localhost:8080/api/'+path,{headers:{Authorization:'Bearer '+token,Accept:'application/json'}});expect(r.status(),path).toBe(200);return(await r.json()).data;}
  const data=await api('marketplace-dashboard');expect(data.dashboard_type).toBe('provider');
  const vehicles=await api('marketplace-vehicles');expect(data.totals.vehicles_total).toBe(vehicles.length);
  for(const [key,value]of Object.entries(data.totals))await checked(view.locator('[data-metric='+key+'] .kpi-value')).toHaveText(String(value));
  await checked(view.locator('[data-record]')).toHaveCount(data.recent_vehicles.length);
  for(const v of data.recent_vehicles)await expect(view.locator('[data-record="'+v.uuid+'"]')).toContainText(v.registration_number);
  await expect(view.locator('.kpi-trend')).toHaveCount(0);await expect(view).not.toContainText('New Booking Requests');
  await view.locator('[data-metric=pending_applications]').click();await checked(page).toHaveURL('/transporter/sent-applications');
  const sent=page.locator('app-applications');await checked(sent.locator('h1')).toBeVisible();
  const applications=await api('applications/mine?per_page=100');await expect(sent.locator('tbody tr')).toHaveCount(applications.length);
  await page.reload();await checked(sent.locator('h1')).toBeVisible();await expect(page).toHaveURL('/transporter/sent-applications');
  await page.getByRole('link',{name:'Applications Received',exact:true}).click();await checked(page).toHaveURL('/transporter/applications');
  await checked(sent.locator('h1')).toContainText('Applications Received');
  await page.goto('/transporter/dashboard');await checked(view.locator('.kpi-value')).toHaveCount(4);
  const actions=[['Browse Load Board','/transporter/load-board','app-load-board'],['My Vehicles','/transporter/fleet','app-vehicle-list'],['My Drivers','/transporter/fleet/drivers','app-driver-list'],['Bookings','/transporter/requests','app-bookings']];
  for(const [label,path,selector]of actions){await view.locator('.qa-list').getByRole('link',{name:label,exact:true}).click();await checked(page).toHaveURL(path);await checked(page.locator(selector+' h1')).toBeVisible();await page.goto('/transporter/dashboard');await checked(view.locator('.kpi-value')).toHaveCount(4);}
  let release!:()=>void;const gate=new Promise<void>(r=>release=r);let reads=0;
  await page.route('**/api/marketplace-dashboard',async route=>{reads++;await gate;return route.fulfill({status:503,json:{success:false}});},{times:1});
  await view.getByRole('button',{name:'Refresh dashboard',exact:true}).click();
  try{await expect(view.locator('[aria-busy=true]').first()).toBeVisible();await expect(view.locator('.kpi-value')).toHaveCount(0);await expect(view.getByRole('button',{name:'Refresh dashboard',exact:true})).toBeDisabled();expect(reads).toBe(1);}finally{release();}
  await checked(view.getByRole('alert')).toBeVisible();await view.getByRole('button',{name:'Try again',exact:true}).click();await checked(view.locator('.kpi-value')).toHaveCount(4);
  await page.reload();await checked(view.locator('.kpi-value')).toHaveCount(4);
  await page.setViewportSize({width:390,height:844});await expect(view.locator('h1')).toBeVisible();
  expect(blocked).toEqual([]);await info.attach('transporter-dashboard.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({account:'qa-onboarding-1793463324476-transporter@transportseva.test',totals:data.totals,recentVehicles:data.recent_vehicles.length,sentApplications:applications.length,blockedBusinessWrites:blocked}))});
});
