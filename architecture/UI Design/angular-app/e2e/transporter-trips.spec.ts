import {expect,test,type BrowserContext,type Page} from '@playwright/test';
test.use({trace:'off',video:'off'});test.setTimeout(240_000);
const checked=expect.configure({timeout:60_000});
const endpoint='account/transporter/trips';
async function login(page:Page,context:BrowserContext){
  await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  const blocked:string[]=[];await context.route('**/*',route=>{const r=route.request();const u=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))){blocked.push(u.pathname);return route.abort();}return route.continue();});
  await page.goto('/auth/login');await page.locator('input[name=identifier]').fill('qa-onboarding-1793463324476-transporter@transportseva.test');
  await page.locator('input[name=password]').fill('OnboardingQA@2026!');await page.getByRole('button',{name:/^Log In$/i}).click();
  await checked(page.locator('app-transporter-dashboard h1')).toBeVisible();return blocked;
}
async function api(page:Page,path:string){const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));return page.request.get('http://localhost:8080/api/'+path,{headers:{Authorization:'Bearer '+token,Accept:'application/json'}});}
test('real Transporter empty records, reload, filters and foreign trip denial',async({page,context})=>{
  const blocked=await login(page,context);const response=await api(page,endpoint);expect(response.status()).toBe(200);expect(response.headers()['cache-control']).toContain('no-store');
  const data=(await response.json()).data;expect(data.totals.total).toBe(0);
  await page.getByRole('link',{name:'Trips',exact:true}).click();const view=page.locator('app-shipper-trip-list');
  await checked(view.locator('[data-trip-total=total]')).toHaveText('0');await expect(view.locator('[data-trip-row]')).toHaveCount(0);
  await expect(view.locator('[data-trip-empty]')).toContainText('no booking/trip records yet');
  await page.reload();await checked(view.locator('[data-trip-total=total]')).toHaveText('0');
  await view.locator('#trip-search').fill('100%_unmatched');await view.getByRole('button',{name:'Apply filters',exact:true}).click();await checked(view.locator('[data-trip-empty]')).toBeVisible();
  expect((await api(page,endpoint+'?provider_uuid=forged')).status()).toBe(422);
  const foreign='5c18b398-8a75-4017-9ecf-e268282a4852';expect((await api(page,endpoint+'/'+foreign)).status()).toBe(404);
  expect((await api(page,'marketplace-bookings/'+foreign+'/pod/download')).status()).toBe(403);
  await page.goto('/transporter/trips/'+foreign);const detail=page.locator('app-shipper-trip-details');await checked(detail.getByRole('alert')).toContainText('not a party');await expect(detail.locator('[data-trip-reference]')).toHaveCount(0);
  await detail.getByRole('link',{name:'Back to Trips',exact:true}).click();await checked(view.locator('[data-trip-total=total]')).toHaveText('0');
  expect(blocked).toEqual([]);
});

test('controlled detail-contract UI covers both party roles, saved timeline, missing original and retry',async({page,context},info)=>{
  const blocked=await login(page,context);let fail=false;
  const ids=['12345678-1234-1234-1234-123456789012','22345678-1234-1234-1234-123456789012'];
  await page.route('**/api/account/transporter/trips/*',route=>{
    const uuid=new URL(route.request().url()).pathname.split('/').pop()!;const side=uuid===ids[0]?'provider':'owner';
    if(fail)return route.fulfill({status:503,json:{success:false}});
    return route.fulfill({json:{success:true,data:{
      trip:{uuid,reference:'CONTROLLED-QA-'+side,load_uuid:null,load_reference:null,pickup_city:null,drop_city:null,material:null,pickup_date:null,status:'completed',stage:'delivered',vehicle:'CONTROLLED-VEHICLE',driver:'Controlled Driver',started_at:'2026-11-01T10:00:00Z',delivered_at:null,pod_status:'rejected',created_at:'2026-11-01T09:00:00Z',updated_at:null,pickup_address:null,drop_address:null,weight_tons:null,vehicle_type_required:null,agreed_freight:null,assignment_mode:null,driver_phone:null,provider_name:'Controlled Provider',shipper_name:'Controlled Load Owner',viewer_side:side},
      timeline:[{stage:'booking_created',occurred_at:'2026-11-01T09:00:00Z'},{stage:'trip_started',occurred_at:'2026-11-01T10:00:00Z'}],
      pod:{status:'rejected',number:null,received_by:null,remarks:null,file_name:'missing-original.pdf',uploaded_at:null,reviewed_at:null,review_note:'Controlled missing signature',download_available:false},generated_at:'2026-11-01T12:00:00Z'
    }}});
  });
  const view=page.locator('app-shipper-trip-details');
  for(const [index,side]of ['provider','owner'].entries()){
    await page.goto('/transporter/trips/'+ids[index]);await checked(view.locator('[data-trip-reference]')).toHaveText('CONTROLLED-QA-'+side);
    await expect(view).toContainText(side==='provider'?'Controlled Load Owner':'Controlled Provider');
    await expect(view.locator('[data-trip-booking-link]')).toHaveAttribute('href','/transporter/requests?booking='+ids[index]);
    await view.getByRole('button',{name:'Recorded timeline',exact:true}).click();await expect(view.locator('.trip-event')).toHaveCount(2);await expect(view.locator('[data-trip-timeline]')).toContainText('01/11/2026');
    await view.getByRole('button',{name:'Proof of Delivery',exact:true}).click();await expect(view.locator('[data-trip-pod-status]')).toHaveText('Correction requested');await expect(view).toContainText('No stored original POD');await expect(view.locator('input[type=file]')).toHaveCount(0);
  }
  fail=true;await view.getByRole('button',{name:'Refresh',exact:true}).click();await checked(view.getByRole('alert')).toBeVisible();await expect(view.locator('[data-trip-reference]')).toHaveCount(0);
  fail=false;await view.getByRole('button',{name:'Reload details',exact:true}).click();await checked(view.locator('[data-trip-reference]')).toHaveText('CONTROLLED-QA-owner');
  await page.setViewportSize({width:390,height:844});await expect(view.locator('[data-trip-reference]')).toBeVisible();
  expect(blocked).toEqual([]);await info.attach('contract-ui-scope.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({source:'controlled UI contract responses; not live Transporter bookings',roles:['owner','provider'],blockedBusinessWrites:blocked}))});
});
