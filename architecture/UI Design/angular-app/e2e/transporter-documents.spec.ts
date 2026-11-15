import {expect,test,type Page,type BrowserContext} from '@playwright/test';
import {createHash} from 'node:crypto';
test.use({trace:'off',video:'off'});test.setTimeout(240_000);
const checked=expect.configure({timeout:60_000});
const endpoint='account/transporter/documents';
async function login(page:Page,context:BrowserContext){
  const blocked:string[]=[];await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{const r=route.request();const u=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(u.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(u.pathname))){blocked.push(u.pathname);return route.abort();}return route.continue();});
  await page.goto('/auth/login');await page.locator('input[name=identifier]').fill('qa-onboarding-1793463324476-transporter@transportseva.test');await page.locator('input[name=password]').fill('OnboardingQA@2026!');
  await page.getByRole('button',{name:/^Log In$/i}).click();await checked(page.locator('app-transporter-dashboard h1')).toBeVisible();return blocked;
}
async function api(page:Page,path:string){const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));return page.request.get('http://localhost:8080/api/'+path,{headers:{Authorization:'Bearer '+token,Accept:'application/json'}});}
test('real private document hub: own zero/KYC states, failed reads, reload and foreign downloads denied',async({page,context})=>{
  const blocked=await login(page,context);const response=await api(page,endpoint);expect(response.status()).toBe(200);expect(response.headers()['cache-control']).toContain('no-store');
  const data=(await response.json()).data;expect(data.totals.total).toBe(0);
  await page.getByRole('link',{name:'Documents',exact:true}).click();const view=page.locator('app-shipper-documents');await checked(view.locator('[data-document-total=total]')).toHaveText('0');
  await expect(view.locator('[data-document-empty]')).toBeVisible();await page.reload();await checked(view.locator('[data-document-total=total]')).toHaveText('0');
  await page.goto('/transporter/documents?tab=kyc');await checked(view.locator('[data-document-kyc]')).toBeVisible();
  if(data.kyc)await expect(view).toContainText(data.kyc.business_name);else await expect(view.locator('[data-kyc-empty]')).toBeVisible();
  await view.getByRole('link',{name:'Manage KYC',exact:true}).click();await checked(page).toHaveURL('/transporter/kyc');await checked(page.locator('app-my-kyc h1')).toBeVisible();
  await page.goto('/transporter/documents');await checked(view.locator('[data-document-total=total]')).toHaveText('0');
  let release!:()=>void;const gate=new Promise<void>(r=>release=r);let reads=0;
  await page.route('**/api/account/transporter/documents?*',async route=>{reads++;await gate;return route.fulfill({status:503,json:{success:false}});},{times:1});
  await view.getByRole('button',{name:'Refresh',exact:true}).click();
  try{await expect(view.locator('.doc-spinner')).toBeVisible();await expect(view.getByRole('button',{name:'Refresh',exact:true})).toBeDisabled();await expect.poll(()=>reads).toBe(1);}finally{release();}
  await checked(view.getByRole('alert')).toBeVisible();await expect(view.locator('[data-document-empty]')).toHaveCount(0);
  await view.getByRole('button',{name:'Retry',exact:true}).click();await checked(view.locator('[data-document-total=total]')).toHaveText('0');
  expect((await api(page,endpoint+'?owner_uuid=forged')).status()).toBe(422);
  expect((await api(page,endpoint+'/pods/5c18b398-8a75-4017-9ecf-e268282a4852/download')).status()).toBe(404);
  expect((await api(page,endpoint+'/kyc/64085729-c4cf-4627-81ed-8477a656303d/download')).status()).toBe(404);
  expect(blocked).toEqual([]);
});

test('controlled document contracts: paging, original bytes, missing files and Transporter links',async({page,context},info)=>{
  const blocked=await login(page,context);const uuid='12345678-1234-1234-1234-123456789012';const kyc='22345678-1234-1234-1234-123456789012';let missing=false;
  const bytes=Buffer.from('%PDF-CONTROLLED-TRANSPORTER-DOCUMENT');
  await page.route('**/api/account/transporter/documents/**/download',route=>route.fulfill({contentType:'application/pdf',body:bytes}));
  await page.route('**/api/account/transporter/documents?*',route=>{
    const url=new URL(route.request().url());const pageNo=Number(url.searchParams.get('page')||1);const q=url.searchParams.get('q');
    return route.fulfill({json:{success:true,data:{
      pods:q?[]:[{booking_uuid:uuid,booking_reference:'CONTROLLED-DOC-'+pageNo,load_uuid:null,load_reference:null,pickup_city:null,drop_city:null,status:'approved',number:'CONTROLLED-POD',received_by:'Controlled Receiver',file_name:'controlled-original.pdf',uploaded_at:'2026-11-01T10:00:00Z',reviewed_at:null,review_note:'<script>display as text</script>',download_available:!missing}],
      kyc:{uuid:kyc,business_name:'Controlled Own Business',status:'approved',file_name:'controlled-identity.pdf',submitted_at:'2026-11-01T10:00:00Z',reviewed_at:null,review_note:null,download_available:!missing},
      totals:{total:2,approved:2,pending_approval:0,rejected:0,other:0},generated_at:'2026-11-01T12:00:00Z'
    },meta:{current_page:pageNo,last_page:q?1:2,total:q?0:2}}});
  });
  await page.goto('/transporter/documents');const view=page.locator('app-shipper-documents');await checked(view.locator('[data-document-row]')).toContainText('CONTROLLED-DOC-1');
  await expect(view.locator('[data-document-row] script')).toHaveCount(0);
  await expect(view.getByRole('link',{name:'Open booking / POD actions',exact:true})).toHaveAttribute('href','/transporter/requests?booking='+uuid);
  await expect(view.getByRole('link',{name:'View trip',exact:true})).toHaveAttribute('href','/transporter/trips/'+uuid);
  await view.getByRole('button',{name:'Next',exact:true}).click();await checked(view.locator('[data-document-row]')).toContainText('CONTROLLED-DOC-2');
  async function download(name:string){const wait=page.waitForEvent('download');await view.getByRole('button',{name:'Download original',exact:true}).click();const file=await wait;expect(file.suggestedFilename()).toBe(name);const stream=await file.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream)chunks.push(Buffer.from(chunk));expect(createHash('sha256').update(Buffer.concat(chunks)).digest('hex')).toBe(createHash('sha256').update(bytes).digest('hex'));}
  await download('controlled-original.pdf');await view.getByRole('button',{name:'My KYC document',exact:true}).click();await download('controlled-identity.pdf');
  missing=true;await view.getByRole('button',{name:'Refresh',exact:true}).click();await checked(view.locator('[data-file-unavailable]')).toBeVisible();await expect(view.locator('[data-kyc-status]')).toHaveText('Approved');
  await view.getByRole('button',{name:'Booking PODs',exact:true}).click();await expect(view.locator('[data-document-status]')).toHaveText('Approved');await expect(view.getByRole('button',{name:'Download original',exact:true})).toHaveCount(0);
  await view.locator('#document-search').fill('no-match');await view.getByRole('button',{name:'Apply filters',exact:true}).click();await checked(view.locator('[data-document-empty]')).toContainText('No POD documents match');await expect(view.locator('[data-document-total=total]')).toHaveText('2');
  await page.setViewportSize({width:390,height:844});await expect(view.locator('h1')).toBeVisible();expect(blocked).toEqual([]);
  await info.attach('document-contract-scope.json',{contentType:'application/json',body:Buffer.from(JSON.stringify({source:'controlled UI document records and controlled original bytes; not live account documents',blockedBusinessWrites:blocked}))});
});
