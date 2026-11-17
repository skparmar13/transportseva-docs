import {expect,test,type BrowserContext} from '@playwright/test';
import {createHash} from 'node:crypto';
test.use({trace:'off',video:'off',actionTimeout:20_000});test.setTimeout(120_000);
const base='http://localhost:8080/api/';
async function readOnly(context:BrowserContext){
  const blocked:string[]=[];await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{const req=route.request();const url=new URL(req.url());
    if(!['localhost','127.0.0.1'].includes(url.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(req.method())&&!(req.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname))){blocked.push(req.method()+' '+url.pathname);return route.abort();}return route.continue();});return blocked;
}
test('homepage reads live records with fast warm API responses',async({page,context},info)=>{
  const blocked=await readOnly(context);
  const [reviews,loads]=await Promise.all([
    page.waitForResponse(r=>new URL(r.url()).pathname==='/api/public/reviews'&&r.request().method()==='GET'),
    page.waitForResponse(r=>new URL(r.url()).pathname==='/api/loads/recent'&&r.request().method()==='GET'),page.goto('/')]);
  await Promise.all([reviews.finished(),loads.finished()]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  const summary:any[]=[];
  for(const response of [reviews,loads]){
    expect(response.status()).toBe(200);const url=new URL(response.url());const body=await response.json();
    if(process.env.E2E_API_CONTROL_URL){
      const controlBase=new URL(process.env.E2E_API_CONTROL_URL);expect(['localhost','127.0.0.1']).toContain(controlBase.hostname);expect(controlBase.username+controlBase.password).toBe('');
      const control=await page.request.get(controlBase.origin+url.pathname+url.search);expect(control.status()).toBe(200);expect(body.data).toEqual((await control.json()).data);
    }
    const timing=response.request().timing();const ms=timing.responseEnd-timing.requestStart;
    expect(ms).toBeGreaterThan(0);expect(ms).toBeLessThan(2000);
    summary.push({path:url.pathname,rows:body.data.length,responseMs:ms,dataSha256:createHash('sha256').update(JSON.stringify(body.data)).digest('hex')});
    if(url.pathname.endsWith('reviews')&&body.data.length)await expect(page.locator('.testimonials')).toContainText(body.data[0].comment);
    if(url.pathname.endsWith('recent')&&body.data.length)await expect(page.locator('app-home')).toContainText(body.data[0].load_id.replace(/^#/,''));
  }
  expect((await page.request.get(base+'account/profile',{headers:{Accept:'application/json'}})).status()).toBe(401);
  expect(blocked).toEqual([]);await info.attach('home-api-performance.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({summary,controlCompared:!!process.env.E2E_API_CONTROL_URL,blockedBusinessWrites:blocked}))});
});
for(const actor of [
  {role:'shipper',reportPath:'account/reports',email:'verify-shipper-1793028294862-61@transportseva.test',uuid:'8fbee589-49f2-4a3f-bf8d-7e2013614e02'},
  {role:'truck-owner',reportPath:'account/truck-owner/reports',email:'verify-truck-owner-1793028294862-62@transportseva.test',uuid:'ab8b83d6-cbde-4331-a287-082a48190a10'},
])test('cached worker keeps '+actor.role+' identity and report permissions separate',async({page,context},info)=>{
  const blocked=await readOnly(context);await page.goto('/auth/login');await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill(actor.email);await page.locator('input[name=password]').fill('TransportSevaE2E@2026');
  const [login]=await Promise.all([page.waitForResponse(r=>new URL(r.url()).pathname==='/api/auth/login'&&r.request().method()==='POST'),page.getByRole('button',{name:/^Log In$/i}).click()]);
  expect(login.status()).toBe(200);await expect(page).toHaveURL('/'+actor.role+'/dashboard',{timeout:30_000});
  const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));const headers={Authorization:'Bearer '+token,Accept:'application/json'};
  const me=await page.request.get(base+'auth/me',{headers});expect(me.status()).toBe(200);expect((await me.json()).data.uuid).toBe(actor.uuid);
  const own=await page.request.get(base+actor.reportPath,{headers});expect(own.status()).toBe(200);expect(own.headers()['cache-control']).toContain('no-store');
  expect((await page.request.get(base+'account/transporter/reports',{headers})).status()).toBe(403);
  expect(blocked).toEqual([]);await info.attach('account-cache-isolation.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({account:actor.email,uuid:actor.uuid,ownReportStatus:200,wrongRoleStatus:403,blockedBusinessWrites:blocked}))});
});
