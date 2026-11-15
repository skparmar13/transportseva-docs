import {expect,test,type Page,type BrowserContext} from '@playwright/test';
test.use({trace:'off',video:'off',actionTimeout:20_000});test.setTimeout(300_000);
const checked=expect.configure({timeout:60_000});
async function login(page:Page,context:BrowserContext,transporter=false){
  const blocked:string[]=[];await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{const r=route.request();const u=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))){blocked.push(u.pathname);return route.abort();}return route.continue();});
  await page.goto('/auth/login');await expect(page.locator('vite-error-overlay')).toHaveCount(0);await page.locator('input[name=identifier]').fill(transporter?'qa-onboarding-1793463324476-transporter@transportseva.test':'verify-truck-owner-1793028294862-62@transportseva.test');
  await page.locator('input[name=password]').fill(transporter?'OnboardingQA@2026!':'TransportSevaE2E@2026');await page.getByRole('button',{name:/^Log In$/i}).click();
  await checked(page).toHaveURL('/'+(transporter?'transporter':'truck-owner')+'/dashboard');return blocked;
}
async function api(page:Page,path:string){const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));return page.request.get('http://localhost:8080/api/'+path,{headers:{Authorization:'Bearer '+token,Accept:'application/json'}});}
test('real Truck Owner sent applications: next, previous, failed-page retry and exact load navigation',async({page,context},info)=>{
  const blocked=await login(page,context);const first=await api(page,'applications/mine?per_page=1');expect(first.status()).toBe(200);expect(first.headers()['cache-control']).toContain('no-store');const body=await first.json();expect(body.meta.total).toBeGreaterThan(1);
  const second=await api(page,'applications/mine?per_page=1&page=2');expect(second.status()).toBe(200);const next=await second.json();expect(body.data[0].uuid).not.toBe(next.data[0].uuid);
  let failPage=false;const pages:number[]=[];
  await page.route('**/api/applications/mine?*',async route=>{const url=new URL(route.request().url());if(!url.searchParams.has('page'))return route.fallback();const p=Number(url.searchParams.get('page'));pages.push(p);
    if(failPage&&p===2)return route.fulfill({status:503,json:{success:false,message:'Temporary application read failure'}});
    url.searchParams.set('per_page','1');const response=await route.fetch({url:url.toString()});return route.fulfill({response});});
  await page.goto('/truck-owner/applications');const view=page.locator('app-applications');
  await checked(view).toContainText('Total applications: '+body.meta.total+' · Page 1 of '+body.meta.total);
  await expect(view.locator('tbody tr')).toHaveCount(1);await expect(view.getByRole('button',{name:'Previous',exact:true})).toBeDisabled();
  failPage=true;await view.getByRole('button',{name:'Next',exact:true}).click();await checked(view.getByRole('alert')).toBeVisible();await expect(view.locator('tbody')).toHaveCount(0);await expect(view).not.toContainText('No applications yet');
  failPage=false;await view.getByRole('button',{name:'Retry',exact:true}).click();await checked(view).toContainText('Page 2 of '+body.meta.total);await expect(view.locator('tbody')).toContainText(next.data[0].vehicle_reg_number);
  await view.getByRole('button',{name:'Previous',exact:true}).click();await checked(view).toContainText('Page 1 of '+body.meta.total);
  await view.getByRole('button',{name:'View Load',exact:true}).click();await checked(page).toHaveURL('/truck-owner/load-board/'+body.data[0].load_uuid);
  expect(pages).toEqual([1,2,2,1]);expect(blocked).toEqual([]);
  await info.attach('real-pagination.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({account:'verify-truck-owner-1793028294862-62@transportseva.test',total:body.meta.total,applicationUuids:[body.data[0].uuid,next.data[0].uuid],pages,method:'Real API responses requested with per_page=1 to exercise paging without creating records.',blockedBusinessWrites:blocked}))});
});

test('Transporter real received/sent scope, then controlled populated received-page and retry UI',async({page,context},info)=>{
  const blocked=await login(page,context,true);const paths=['account/transporter/applications','applications/mine'];const totals:number[]=[];const view=page.locator('app-applications');
  for(const [i,path]of paths.entries()){
    const response=await api(page,path+'?page=1&per_page=20');expect(response.status()).toBe(200);expect(response.headers()['cache-control']).toContain('no-store');const data=await response.json();totals.push(data.meta.total);
    await page.goto(i===0?'/transporter/applications':'/transporter/sent-applications');await checked(view).toContainText('Total applications: '+data.meta.total);await expect(view.locator('tbody tr')).toHaveCount(data.data.length);
    expect((await api(page,path+'?owner_uuid=forged')).status()).toBe(422);
  }
  expect((await api(page,'account/applications')).status()).toBe(403);
  let fail=false;const requests:number[]=[];const uuid='5c18b398-8a75-4017-9ecf-e268282a4852';
  await page.route('**/api/account/transporter/applications?*',route=>{const p=Number(new URL(route.request().url()).searchParams.get('page'));requests.push(p);
    if(fail)return route.fulfill({status:503,json:{success:false,message:'Controlled temporary read failure'}});
    return route.fulfill({json:{success:true,data:[{uuid,load_uuid:uuid,applicant_role:'truck-owner',applicant_name:'CONTROLLED APPLICANT PAGE '+p,vehicle_reg_number:'CONTROLLED123',vehicle_type:'32ft Trailer',availability:'Today',quoted_amount:17000,current_offer_amount:18000,status:'pending',load:{uuid,load_id:'CONTROLLED-LOAD',pickup_city:'Delhi',drop_city:'Jaipur',budget:20000,status:'open'}}],meta:{current_page:p,last_page:2,total:21}}});});
  await page.goto('/transporter/applications');await checked(view.locator('tbody')).toContainText('CONTROLLED APPLICANT PAGE 1');await expect(view).toContainText('₹18,000');
  fail=true;await view.getByRole('button',{name:'Next',exact:true}).click();await checked(view.getByRole('alert')).toBeVisible();await expect(view.locator('tbody')).toHaveCount(0);
  fail=false;await view.getByRole('button',{name:'Retry',exact:true}).click();await checked(view.locator('tbody')).toContainText('CONTROLLED APPLICANT PAGE 2');await expect(view.getByRole('button',{name:'Next',exact:true})).toBeDisabled();
  await view.getByRole('button',{name:'Previous',exact:true}).click();await checked(view.locator('tbody')).toContainText('CONTROLLED APPLICANT PAGE 1');
  expect(requests).toEqual([1,2,2,1]);expect(blocked).toEqual([]);
  await info.attach('transporter-pagination-scope.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({account:'qa-onboarding-1793463324476-transporter@transportseva.test',realReceivedAndSentTotals:totals,populatedUiSource:'Controlled received-application responses; positive database scope/pagination tested transactionally in *_test.',requests,blockedBusinessWrites:blocked}))});
});
