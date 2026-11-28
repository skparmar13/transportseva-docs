import { test, expect as baseExpect, Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { prepareReviewedDispatch, attestDispatch } from './helpers/dispatch-evidence';
test.use({trace:'off',video:'off',screenshot:'off',actionTimeout:60000,navigationTimeout:60000});test.setTimeout(1200000);
const expect=baseExpect.configure({timeout:60000}),dir='.local-runtime/consignment-20261128';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
let source:any,state:any;const actor=(code:string)=>source.actors.find((a:any)=>a.code===code);const save=()=>writeFile(`${dir}/journey.json`,JSON.stringify(state,null,2));
async function api(page:Page,path:string,method='GET',data?:any,status=200){const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));const r=await page.request.fetch('http://localhost:8080/api/'+path,{method,headers:{Accept:'application/json',Authorization:'Bearer '+token},...(data?{data}:{})});const b=await r.json();expect(r.status(),`${path}: ${JSON.stringify(b)}`).toBe(status);return b.data;}
async function click(page:Page,path:string,action:()=>Promise<any>,status=200){const[r]=await Promise.all([page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/'+path),action()]);const b=await r.json();expect(r.status(),JSON.stringify(b)).toBe(status);return b.data;}
async function login(page:Page,code:string){await page.goto('/auth/login');await page.locator('input[name=identifier]').fill(actor(code).email);await page.locator('input[name=password]').fill(source.password);await click(page,'auth/login',()=>page.getByRole('button',{name:/^log in$/i}).click());await expect(page).toHaveURL(`/${actor(code).role}/dashboard`);}
async function card(page:Page,j:any,code:string){const role=actor(code).role;await page.goto(`/${role}/${role==='transporter'?'requests':'bookings'}?booking=${j.booking.uuid}`);const c=page.locator('.card').filter({hasText:j.booking.booking_reference});await expect(c.locator('app-booking-consignment').getByRole('button',{name:'Refresh LR/GR',exact:true})).toBeEnabled();return c;}
test.beforeAll(async()=>{source=JSON.parse(await readFile('.local-runtime/booking-full-20261122/20261122-01.json','utf8'));try{state=JSON.parse(await readFile(`${dir}/journey.json`,'utf8'));}catch{state={date:'2026-11-28',database:'transportseva',synthetic:true,cases:{}};}});
for(const type of ['LR','GR'])test(`visible ${type} issuance, amendment and exact POD link`,async({page})=>{
 const code=type==='LR'?'oa':'ta',j=state.cases[type]??={type,provider:actor(code).email,owner:actor('s').email,checks:{}};const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 if(j.passed){await login(page,code);await card(page,j,code);return;}
 await test.step('Prepare a fresh labelled booking and reviewed QA assignments',async()=>{
  await login(page,code);
  if(!j.vehicle){j.vehicle=await api(page,'marketplace-vehicles','POST',{registration_number:`QACONS281126${type}`,vehicle_type:'32ft Trailer',make:'Tata',model:'QA Consignment',year_of_make:2024,capacity_tons:24},201);await save();}
  if(!j.driver){j.driver=await api(page,'marketplace-drivers','POST',{name:`QA Consignment ${type} Driver`,phone:type==='LR'?'7911280141':'7911280142',license_number:`QACONS-DL-281126-${type}`},201);await save();}
  await login(page,'s');if(!j.load){await page.goto('/shipper/post-load');await page.locator('input#pickup-city').fill('Delhi');await page.locator('input#drop-city').fill('Jaipur');await page.locator('input[name=material]').fill(`QA ${type} consignment goods`);await page.locator('input[name=weightTons]').fill('16');await page.locator('select[name=vehicleType]').selectOption({label:'32ft Trailer'});await page.locator('input[name=budget]').fill('22000');j.load=await click(page,'loads',()=>page.getByRole('button',{name:/Post Load to Marketplace/i}).click(),201);await save();}
  await login(page,code);if(!j.application){j.application=await api(page,`loads/${j.load.uuid}/applications`,'POST',{applicant_role:actor(code).role,applicant_name:`QA ${type} carrier`,vehicle_reg_number:j.vehicle.registration_number,vehicle_type:'32ft Trailer',availability:'QA ready today',quoted_amount:17000},201);await save();}
  await login(page,'s');if(!j.booking){await api(page,`loads/${j.load.uuid}/applications/${j.application.uuid}/accept`,'POST');j.booking=await api(page,`loads/${j.load.uuid}/applications/${j.application.uuid}/booking`,'POST',undefined,201);await save();}
  for(const who of ['s',code]){await login(page,who);const t=await api(page,`marketplace-bookings/${j.booking.uuid}/commercial-terms`);if(!(who==='s'?t.current.owner_accepted_at:t.current.provider_accepted_at))await api(page,`marketplace-bookings/${j.booking.uuid}/commercial-terms/accept`,'POST',{version:t.current.version,fingerprint:t.current.fingerprint,acknowledged:true});}
  for(const who of ['s',code]){await login(page,who);const b=await api(page,`marketplace-bookings/${j.booking.uuid}`);if((who==='s'?b.owner_token_status:b.provider_token_status)==='paid')continue;const order=await api(page,`marketplace-bookings/${j.booking.uuid}/token-orders`,'POST',{},201);await api(page,`marketplace-bookings/${j.booking.uuid}/token-orders/${order.uuid}/checkout`,'POST');await api(page,`marketplace-bookings/${j.booking.uuid}/token-orders/${order.uuid}/status`);}
  await login(page,code);j.booking=await api(page,`marketplace-bookings/${j.booking.uuid}`);
  const workflow=async(data:any)=>{j.booking=await api(page,`marketplace-bookings/${j.booking.uuid}/workflow`,'POST',data);await save();};
  if(!j.booking.workflow.vehicle_assignment)await workflow({action:'assign_vehicle',mode:type==='LR'?'Own Fleet':'Subcontracted',vehicle_reg_number:type==='LR'?j.vehicle.registration_number:'QACONSSUB281126',subcontracted_to:'Synthetic QA partner'});
  if(!j.booking.workflow.driver_assignment)await workflow({action:'assign_driver',driver_uuid:j.driver.uuid});
  await prepareReviewedDispatch(page,j.booking.uuid,()=>login(page,code));
 });
 await test.step('Issue and amend LR/GR visibly, retaining the original version and private scan',async()=>{
  let c=await card(page,j,code),p=c.locator('app-booking-consignment');
  if(!j.v1){await p.getByRole('button',{name:'Issue LR/GR',exact:true}).click();await p.locator('select[name=document_type]').selectOption(type);await p.locator('input[name=number]').fill(`QA/${type}/281126`);
   for(const[key,value]of Object.entries({issuer_name:`QA ${type} Carrier`,issuer_address:'Synthetic carrier address, Jaipur',consignor_name:'QA Consignor',consignor_address:'Synthetic Delhi consignor address',consignee_name:'QA Consignee',consignee_address:'Synthetic Jaipur consignee address'}))await p.locator(`[data-lr-field=${key}]`).fill(value);
   await p.locator('input[name=package_count]').fill('100');await p.locator('input[name=package_unit]').fill('cartons');await p.locator('input[name=lr-scan]').setInputFiles({name:`SYNTHETIC-QA-${type}.png`,mimeType:'image/png',buffer:png});await p.locator('input[name=lr-attested]').check();
   j.v1=await click(page,`marketplace-bookings/${j.booking.uuid}/consignment`,()=>p.getByRole('button',{name:'Issue document version',exact:true}).click(),201);await save();expect(j.v1.snapshot.vehicle_registration).toBe(j.booking.workflow.vehicle_assignment.vehicle_reg_number);expect(j.v1.snapshot.weight_tons).toBe(16);
  }
  if(!j.v2){await p.getByRole('button',{name:'Amend LR/GR',exact:true}).click();await p.locator('[data-lr-field=consignee_address]').fill('Corrected synthetic Jaipur destination address');await p.locator('input[name=package_count]').fill('101');await p.locator('textarea[name=amendment_reason]').fill('Synthetic consignee address and package-count correction.');await p.locator('input[name=lr-attested]').check();j.v2=await click(page,`marketplace-bookings/${j.booking.uuid}/consignment`,()=>p.getByRole('button',{name:'Issue document version',exact:true}).click(),201);await save();}
  await expect(p.locator('[data-consignment-current]')).toContainText('v2');
  const[download]=await Promise.all([page.waitForEvent('download'),p.getByRole('button',{name:'Download printable LR/GR',exact:true}).click()]);expect(download.suggestedFilename()).toContain('-v2.html');const stream=await download.createReadStream();const chunks:Buffer[]=[];if(stream)for await(const chunk of stream)chunks.push(Buffer.from(chunk));const html=Buffer.concat(chunks).toString('utf8');expect(html).toContain('Corrected synthetic Jaipur');expect(html).toContain('101 cartons');j.checks.printable_download=true;
  await login(page,'s');c=await card(page,j,'s');p=c.locator('app-booking-consignment');await expect(p.getByRole('button',{name:'Amend LR/GR',exact:true})).toHaveCount(0);await expect(p).toContainText('101 cartons');j.checks.shipper_read_only=true;
 });
 await test.step('Start and deliver, freeze v2 in POD, approve and retrieve from Documents',async()=>{
  await login(page,code);j.booking=await api(page,`marketplace-bookings/${j.booking.uuid}`);const wf=async(data:any)=>{j.booking=await api(page,`marketplace-bookings/${j.booking.uuid}/workflow`,'POST',data);await save();};
  if(!j.booking.workflow.loading_completed_at)await wf({action:'loading_completed'});await login(page,'s');if(!j.booking.workflow.loading_confirmed_at)await wf({action:'confirm_loading'});
  await login(page,code);let c=await card(page,j,code);if(!j.booking.workflow.trip_started_at){await attestDispatch(c);j.booking=await click(page,`marketplace-bookings/${j.booking.uuid}/workflow`,()=>c.locator('app-booking-dispatch').getByRole('button',{name:'Start Trip',exact:true}).click());await save();}
  if(!j.booking.workflow.trip_completed_at){j.booking=await click(page,`marketplace-bookings/${j.booking.uuid}/workflow`,()=>c.getByRole('button',{name:'Mark Trip Completed',exact:true}).click());await save();}
  if(!j.booking.workflow.pod){await c.getByRole('button',{name:'Upload POD',exact:true}).click();await page.locator('input[name=podNumber]').fill(`QA-POD-${type}-281126`);await page.locator('input[name=podReceivedBy]').fill('QA synthetic consignee');await page.locator('#pod-file').setInputFiles({name:'SYNTHETIC-QA-POD.png',mimeType:'image/png',buffer:png});j.booking=await click(page,`marketplace-bookings/${j.booking.uuid}/pod`,()=>page.getByRole('button',{name:'Submit POD',exact:true}).click(),201);await save();}
  expect(j.booking.workflow.pod.consignment.uuid).toBe(j.v2.uuid);expect(j.booking.workflow.pod.consignment.version).toBe(2);await expect(c.locator('[data-pod-consignment]')).toContainText(`${type} QA/${type}/281126 · v2`);await expect(c.getByRole('button',{name:'Amend LR/GR',exact:true})).toHaveCount(0);j.checks.pod_exact_version=true;j.checks.amendment_locked_after_pod=true;
  await login(page,'s');c=await card(page,j,'s');if(j.booking.workflow.pod.status!=='approved'){await c.getByRole('button',{name:'Approve POD',exact:true}).click();j.booking=await click(page,`marketplace-bookings/${j.booking.uuid}/pod/review`,()=>page.getByRole('dialog').getByRole('button',{name:'Approve POD',exact:true}).click());await save();}
  await page.goto('/shipper/documents?tab=consignments');const list=page.locator('app-consignment-list');await expect(list).toContainText(`QA/${type}/281126`);const entry=list.locator('article').filter({hasText:`QA/${type}/281126`});await entry.getByRole('link',{name:'View booking and LR/GR',exact:true}).click();await expect(page).toHaveURL(new RegExp(`booking=${j.booking.uuid}`));j.checks.documents_exact_booking_link=true;
  await login(page,'ob');const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));const r=await page.request.get(`http://localhost:8080/api/marketplace-bookings/${j.booking.uuid}/consignment/${j.v2.uuid}/scan`,{headers:{Accept:'application/json',Authorization:'Bearer '+token}});expect(r.status()).toBe(403);j.checks.foreign_scan_denied=true;
  expect(errors).toEqual([]);j.checks.browser_errors=errors;j.passed=true;await save();
 });
});

test('POD references are visible in Documents and trip details for all booking parties',async({page})=>{
 for(const type of ['LR','GR']){
  const j=state.cases[type];expect(j?.passed).toBe(true);
  for(const code of ['s',type==='LR'?'oa':'ta']){
   await login(page,code);const role=actor(code).role;
   await page.goto(`/${role}/documents`);const row=page.locator('[data-document-row]').filter({hasText:j.booking.booking_reference});await expect(row.locator('[data-pod-lr-reference]')).toContainText(`${type} QA/${type}/281126 · v2`);
   await page.goto(`/${role}/trips/${j.booking.uuid}`);await page.locator('app-shipper-trip-details').getByRole('button',{name:'Proof of Delivery',exact:true}).click();await expect(page.locator('[data-trip-lr-reference]')).toContainText(`${type} QA/${type}/281126 · v2`);
  }
  j.checks.pod_reference_in_documents_and_trip_details=true;await save();
 }
});
