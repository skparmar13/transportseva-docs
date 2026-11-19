import { expect, test, type BrowserContext, type Page, type Download } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

test.use({trace:'off',video:'off',actionTimeout:20_000});test.setTimeout(180_000);
const origin='http://localhost:8080/api/';const view=(p:Page)=>p.locator('app-admin-reports');
async function scoped(context:BrowserContext){
  const blocked:string[]=[];await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{const r=route.request();const url=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(url.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname))&&!(r.method()==='PATCH'&&/^\/api\/notifications\/[a-f0-9-]{36}\/read$/.test(url.pathname))){blocked.push(r.method()+' '+url.pathname);return route.abort();}return route.continue();});return blocked;
}
async function login(p:Page,email='admin@test.local',password='password123',landing='dashboard'){
  await p.goto('/auth/login');await expect(p.locator('vite-error-overlay')).toHaveCount(0);await p.locator('input[name=identifier]').fill(email);await p.locator('input[name=password]').fill(password);
  const[r]=await Promise.all([p.waitForResponse(r=>new URL(r.url()).pathname==='/api/auth/login'&&r.request().method()==='POST'),p.getByRole('button',{name:/^Log In$/i}).click()]);expect(r.status()).toBe(200);await expect(p).toHaveURL('/admin/'+landing);
}
async function api(p:Page,path:string){const token=await p.evaluate(()=>localStorage.getItem('transportseva.access_token'));return p.request.get(origin+path,{headers:{Accept:'application/json',Authorization:'Bearer '+token}});}
async function csv(download:Download){const file=await download.path();expect(file).toBeTruthy();const text=await readFile(file!,'utf8');return{text,rows:text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).slice(1).map(line=>line.split(',').map(v=>v.replace(/^"|"$/g,'')))};}
async function exportCsv(p:Page){const[d]=await Promise.all([p.waitForEvent('download'),view(p).getByRole('button',{name:'Export matching groups (CSV)',exact:true}).click()]);return{download:d,...await csv(d)};}

test('real access bell, three independent cohorts and full/applied CSV downloads survive reload',async({page,context},info)=>{
  const blocked=await scoped(context);expect((await page.request.get(origin+'admin/reports',{headers:{Accept:'application/json'}})).status()).toBe(401);await login(page);
  await page.goto('/admin/access');await page.getByRole('button',{name:'Notifications',exact:true}).click();
  await page.locator('.notif-dropdown-item').filter({hasText:'Operational reports access available'}).click();await expect(page).toHaveURL('/admin/reports');
  const independent=process.env.E2E_ADMIN_REPORT_EXPECTED_TOTALS?JSON.parse(process.env.E2E_ADMIN_REPORT_EXPECTED_TOTALS):null;const evidence:any[]=[];
  for(const table of ['loads','applications','bookings']){
    if(table!=='loads')await view(page).getByRole('button',{name:table==='applications'?'Applications':'Bookings',exact:true}).click();
    const response=await api(page,'admin/reports?table='+table);expect(response.status()).toBe(200);expect(response.headers()['cache-control']).toContain('no-store');const d=(await response.json()).data;
    if(independent)expect(d.summary.total).toBe(independent[table]);
    await expect(view(page).locator('[data-report-total]')).toHaveText(String(d.summary.total));
    const exported=await exportCsv(page);expect(exported.rows.reduce((n,row)=>n+Number(row[3]),0)).toBe(d.summary.total);
    expect(exported.rows.every(row=>row[0]===table&&row[4]==='Asia/Kolkata')).toBe(true);expect(exported.text).not.toContain('owner_uuid');
    await exported.download.saveAs(info.outputPath('real-'+table+'.csv'));evidence.push({table,total:d.summary.total,groups:exported.rows.length});
  }
  await view(page).getByRole('button',{name:'Loads',exact:true}).click();await view(page).getByLabel('Created from (IST)',{exact:true}).fill('2026-10-01');await view(page).getByLabel('Created through (IST)',{exact:true}).fill('2026-10-31');await view(page).getByLabel('Table status',{exact:true}).selectOption('open');
  const[filtered]=await Promise.all([page.waitForResponse(r=>new URL(r.url()).pathname==='/api/admin/reports'&&new URL(r.url()).searchParams.get('from')==='2026-10-01'),view(page).getByRole('button',{name:'Apply filters',exact:true}).click()]);expect(filtered.status()).toBe(200);const applied=(await filtered.json()).data;
  await expect(view(page).locator('[data-applied]')).toContainText('01/10/2026');
  await view(page).getByLabel('Created from (IST)',{exact:true}).fill('2026-01-01');await view(page).getByLabel('Table status',{exact:true}).selectOption('cancelled');
  const exported=await exportCsv(page);expect(exported.rows.every(row=>row[2]==='open'&&row[5]==='01/10/2026'&&row[6]==='31/10/2026')).toBe(true);expect(exported.rows.reduce((n,row)=>n+Number(row[3]),0)).toBe(applied.summary.statuses.open);
  await exported.download.saveAs(info.outputPath('applied-loads.csv'));await page.reload();await expect(view(page).locator('[data-report-total]')).toHaveText(String(independent?.loads??39));
  await page.screenshot({path:info.outputPath('real-admin-reports.png'),fullPage:true});expect(blocked).toEqual([]);await writeFile(info.outputPath('real-report-evidence.json'),JSON.stringify({actor:'admin@test.local',datasets:evidence,independentComparison:!!independent,blockedWrites:blocked},null,2));
});

test('held read and failed export animate, prevent duplicates and recover into real results',async({page,context})=>{
  const blocked=await scoped(context);await login(page);await page.goto('/admin/reports');await expect(view(page).locator('[data-report-total]')).toBeVisible();
  let release!:()=>void;const gate=new Promise<void>(r=>release=r);let reads=0;const list='**/api/admin/reports?*';await page.route(list,async route=>{reads++;await gate;return route.fulfill({status:503,json:{success:false}});});
  try{await view(page).getByRole('button',{name:'Refresh report',exact:true}).evaluate((b:HTMLButtonElement)=>{b.click();b.click();});await expect(view(page).locator('[aria-busy=true]')).toBeVisible();await expect(view(page).locator('table')).toHaveCount(0);expect(reads).toBe(1);release();await expect(view(page).getByRole('alert')).toContainText('could not be loaded');await page.unroute(list);await view(page).getByRole('button',{name:'Try again',exact:true}).click();await expect(view(page).locator('[data-report-total]')).toBeVisible();}finally{release();}
  let releaseExport!:()=>void;const exportGate=new Promise<void>(r=>releaseExport=r);let exports=0;const exportPath='**/api/admin/reports/export?*';await page.route(exportPath,async route=>{exports++;await exportGate;return route.fulfill({status:503,json:{success:false}});});
  try{await view(page).getByRole('button',{name:'Export matching groups (CSV)',exact:true}).evaluate((b:HTMLButtonElement)=>{b.click();b.click();});await expect(view(page).getByRole('button',{name:'Preparing CSV…',exact:true})).toBeDisabled();await expect(view(page).getByLabel('Table status',{exact:true})).toBeDisabled();expect(exports).toBe(1);releaseExport();await expect(view(page).getByRole('alert')).toContainText('CSV could not be prepared');await page.unroute(exportPath);const downloaded=await exportCsv(page);expect(downloaded.rows.length).toBeGreaterThan(0);expect(blocked).toEqual([]);}finally{releaseExport();}
});

test('Operations and Finance staff cannot navigate, read or export aggregate reports',async({page,context})=>{
  const blocked=await scoped(context);for(const role of ['operations','finance']){await page.evaluate(()=>localStorage.clear()).catch(()=>undefined);await login(page,'qa-staff-20261029-'+role+'@transportseva.test','StaffQA@2026!','access');await expect(page.locator('.sidebar-nav a[href="/admin/reports"]')).toHaveCount(0);expect((await api(page,'admin/reports')).status()).toBe(403);expect((await api(page,'admin/reports/export')).status()).toBe(403);await page.goto('/admin/reports');await expect(page).toHaveURL('/admin/access');}expect(blocked).toEqual([]);
});

test('controlled server paging and Hindi empty state do not invent records or mutate main data',async({page,context})=>{
  const blocked=await scoped(context);await login(page);await page.route('**/api/admin/reports?*',route=>{
    const url=new URL(route.request().url());const page=Number(url.searchParams.get('page'));const empty=!!url.searchParams.get('from');const total=empty?0:26;
    return route.fulfill({json:{success:true,data:{table:'loads',filters:{from:url.searchParams.get('from'),to:url.searchParams.get('to'),status:'all',timezone:'Asia/Kolkata',basis:'created_at'},summary:{total,statuses:{open:total,applications_received:0,booked:0,closed:0,cancelled:0,other:0}},rows:empty?[]:Array.from({length:page===1?25:1},(_,i)=>({date:'2030-01-'+String(page===1?i+1:26).padStart(2,'0'),status:'open',records:1})),generated_at:'2026-11-19T10:00:00Z'},meta:{current_page:page,last_page:empty?1:2,total:empty?0:26}}});
  });await page.goto('/admin/reports');await expect(view(page).locator('tbody tr')).toHaveCount(25);await view(page).getByRole('button',{name:'Next',exact:true}).click();await expect(view(page).locator('tbody tr')).toHaveCount(1);await expect(view(page)).toContainText('Page 2 / 2');await expect(view(page).locator('tbody')).toContainText('26/01/2030');
  await view(page).getByLabel('Created from (IST)',{exact:true}).fill('2037-01-01');await view(page).getByRole('button',{name:'Apply filters',exact:true}).click();await expect(view(page).locator('[data-report-total]')).toHaveText('0');await page.getByRole('button',{name:'Change language',exact:true}).click();await expect(view(page)).toContainText('मेल खाने वाले समूह नहीं मिले');expect(blocked).toEqual([]);
});
