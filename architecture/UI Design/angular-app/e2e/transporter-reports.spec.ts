import {expect,test,type Page,type BrowserContext} from '@playwright/test';
import {createHash} from 'node:crypto';
import {reportFixture,reportBookingFixture,reportApplicationFixture} from '../src/app/features/transporter/reports/report.fixtures';
test.use({trace:'off',video:'off'});test.setTimeout(300_000);
const checked=expect.configure({timeout:60_000});const resource='account/transporter/reports';
async function login(page:Page,context:BrowserContext){
  const blocked:string[]=[];await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{const r=route.request();const u=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))){blocked.push(u.pathname);return route.abort();}return route.continue();});
  await page.goto('/auth/login');await page.locator('input[name=identifier]').fill('qa-onboarding-1793463324476-transporter@transportseva.test');await page.locator('input[name=password]').fill('OnboardingQA@2026!');
  await page.getByRole('button',{name:/^Log In$/i}).click();await checked(page.locator('app-transporter-dashboard h1')).toBeVisible();return blocked;
}
async function api(page:Page,path:string){const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));return page.request.get('http://localhost:8080/api/'+path,{headers:{Authorization:'Bearer '+token,Accept:'application/json'}});}
const tabs=[['loads','Loads & applications'],['applications','Applications sent'],['bookings','Bookings & delivery']] as const;
test('real Transporter report tables, scoped totals, private CSV, date validation and read retry',async({page,context},info)=>{
  const blocked=await login(page,context);const actual:any={};
  for(const [table]of tabs){const r=await api(page,resource+'?table='+table);expect(r.status()).toBe(200);expect(r.headers()['cache-control']).toContain('no-store');actual[table]=(await r.json()).data;
    const csv=await api(page,resource+'/export?table='+table);expect(csv.status()).toBe(200);expect(csv.headers()['x-report-timezone']).toBe('Asia/Kolkata');expect((await csv.body()).subarray(0,3).toString('hex')).toBe('efbbbf');
    expect(JSON.stringify(actual[table])).not.toMatch(/"owner_uuid"|"provider_uuid"|"password"|"workflow"|"provider_payout"/);
  }
  const loads=await api(page,'loads?mine=true&per_page=100');expect(loads.status()).toBe(200);expect(actual.loads.summary.loads.total).toBe((await loads.json()).meta.total);
  const apps=await api(page,'applications/mine?per_page=100');expect(apps.status()).toBe(200);expect(actual.loads.summary.applications.total).toBe((await apps.json()).meta.total);
  await page.getByRole('link',{name:'Reports & Analytics',exact:true}).click();const view=page.locator('app-transporter-reports');
  for(const [table,label]of tabs){await checked(view.getByRole('button',{name:label,exact:true})).toBeEnabled();await view.getByRole('button',{name:label,exact:true}).click();
    await checked(view.locator('[data-report-total=loads]')).toHaveText(String(actual[table].summary.loads.total));
    await checked(view.locator('[data-report-total=applications]')).toHaveText(String(actual[table].summary.applications.total));
    await checked(view.locator('[data-report-total=bookings]')).toHaveText(String(actual[table].summary.bookings.total));
    if(!actual[table].rows.length){await expect(view.locator('[data-report-empty]')).toBeVisible();await expect(view.locator('[data-report-export]')).toBeDisabled();}
  }
  await page.reload();await checked(view.locator('[data-report-total=loads]')).toHaveText(String(actual.loads.summary.loads.total));
  await view.locator('#report-from').fill('2030-01-02');await view.locator('#report-to').fill('2030-01-01');await view.getByRole('button',{name:'Apply filters',exact:true}).click();await expect(view).toContainText('From must not be after');
  await view.locator('#report-to').fill('2030-01-02');await view.getByRole('button',{name:'Apply filters',exact:true}).click();await checked(view.locator('[data-report-total=loads]')).toHaveText('0');
  await page.route('**/api/account/transporter/reports?*',route=>route.fulfill({status:503,json:{success:false}}),{times:1});await view.getByRole('button',{name:'Refresh',exact:true}).click();await checked(view.getByRole('alert')).toBeVisible();
  await view.getByRole('button',{name:'Retry',exact:true}).click();await checked(view.locator('[data-report-total=loads]')).toHaveText('0');
  expect((await api(page,resource+'?owner_uuid=forged')).status()).toBe(422);expect((await api(page,resource+'/export?page=1')).status()).toBe(422);
  expect(blocked).toEqual([]);await info.attach('real-transporter-report.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({account:'qa-onboarding-1793463324476-transporter@transportseva.test',summary:actual.loads.summary,blockedBusinessWrites:blocked}))});
});

test('controlled populated reports: all row types, paging, exact links and applied CSV export feedback',async({page,context},info)=>{
  const blocked=await login(page,context);let failExport=false;const exported:string[]=[];const bytes=Buffer.from('\ufeffReference,Goods\r\nCONTROLLED,Controlled CSV\r\n');
  await page.route('**/api/account/transporter/reports/export?*',route=>{exported.push(route.request().url());return failExport?route.fulfill({status:503,json:{success:false}}):route.fulfill({contentType:'text/csv; charset=UTF-8',body:bytes});});
  await page.route('**/api/account/transporter/reports?*',route=>{
    const url=new URL(route.request().url());const table=url.searchParams.get('table');const original=table==='bookings'?reportBookingFixture:table==='applications'?reportApplicationFixture:reportFixture;const data=structuredClone(original);const pageNo=Number(url.searchParams.get('page')||1);
    data.filters={from:url.searchParams.get('from'),to:url.searchParams.get('to'),q:url.searchParams.get('q')||'',timezone:'Asia/Kolkata',basis:'created_at'};
    if(data.filters.q==='NO-MATCH')data.rows=[];
    else data.rows=data.rows.map(row=>({...row,reference:'CONTROLLED-'+table+'-'+pageNo}));
    return route.fulfill({json:{success:true,data,meta:{current_page:pageNo,last_page:data.rows.length?2:1,total:data.rows.length?2:0}}});
  });
  await page.goto('/transporter/reports');const view=page.locator('app-transporter-reports');await checked(view.locator('[data-report-row]')).toContainText('CONTROLLED-loads-1');
  await expect(view.locator('[data-report-total=received]')).toHaveText('2');await expect(view.locator('[data-report-total=applications]')).toHaveText('4');await expect(view.locator('script')).toHaveCount(0);
  await view.getByRole('button',{name:'Next',exact:true}).click();await checked(view.locator('[data-report-row]')).toContainText('CONTROLLED-loads-2');
  await view.getByRole('button',{name:'Applications sent',exact:true}).click();await checked(view.locator('[data-report-row]')).toContainText('PROPOSED-ONLY');await expect(view.getByRole('link',{name:'Open booking',exact:true})).toHaveAttribute('href','/transporter/requests?booking='+reportFixture.rows[0].uuid);
  await view.getByRole('button',{name:'Bookings & delivery',exact:true}).click();await checked(view.locator('[data-report-row]')).toContainText('ACTUAL1234');await expect(view.getByRole('link',{name:'View trip',exact:true})).toHaveAttribute('href','/transporter/trips/'+reportFixture.rows[0].uuid);
  await view.locator('#report-search').fill('UNAPPLIED');failExport=true;await view.locator('[data-report-export]').click();await checked(view.getByRole('alert')).toBeVisible();await expect(view.locator('[data-report-row]')).toHaveCount(1);expect(exported.at(-1)).not.toContain('UNAPPLIED');
  failExport=false;const wait=page.waitForEvent('download');await view.locator('[data-report-export]').click();const file=await wait;expect(file.suggestedFilename()).toBe('transportseva-transporter-bookings-report.csv');const stream=await file.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream)chunks.push(Buffer.from(chunk));expect(createHash('sha256').update(Buffer.concat(chunks)).digest('hex')).toBe(createHash('sha256').update(bytes).digest('hex'));
  await view.locator('#report-search').fill('NO-MATCH');await view.getByRole('button',{name:'Apply filters',exact:true}).click();await checked(view.locator('[data-report-empty]')).toBeVisible();await expect(view.locator('[data-report-total=loads]')).toHaveText('1');
  await page.setViewportSize({width:390,height:844});await expect(view.locator('h1')).toBeVisible();expect(blocked).toEqual([]);
  await info.attach('report-contract-scope.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({source:'controlled populated report and CSV responses; not live account records',blockedBusinessWrites:blocked}))});
});
