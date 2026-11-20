import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000 });
test.setTimeout(240_000);

test('fresh booking matrix concerns the correct users and bell links open their exact bookings', async ({ page, context }, info) => {
  const run=process.env.E2E_MATRIX_RUN;
  if(!run || !/^20261120-[a-z0-9]+$/.test(run))throw new Error('Explicit local matrix run required.');
  const s=JSON.parse(await readFile(`.local-runtime/booking-matrix/${run}.json`,'utf8'));
  expect(Object.values(s.journeys).every((j:any)=>j.passed)).toBe(true);
  const blocked:string[]=[];const notices:Record<string,any[]>={};const links:any[]=[];
  await context.addInitScript(()=>localStorage.setItem('ts_lang','en'));
  await context.route('**/*',route=>{
    const r=route.request();const url=new URL(r.url());
    if(!['localhost','127.0.0.1'].includes(url.hostname))return route.abort();
    if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!(r.method()==='POST'&&/^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname))&&!(r.method()==='PATCH'&&/^\/api\/notifications\/[a-f0-9-]{36}\/read$/.test(url.pathname))){blocked.push(r.method()+' '+url.pathname);return route.abort();}
    return route.continue();
  });
  for(const user of s.actors){
    await page.goto('/auth/login');await page.locator('input[name=identifier]').fill(user.email);await page.locator('input[name=password]').fill(s.password);
    await page.getByRole('button',{name:/^log in$/i}).click();await expect(page).toHaveURL(`/${user.role}/dashboard`,{timeout:60_000});
    const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));
    const r=await page.request.get('http://localhost:8080/api/notifications?per_page=100',{headers:{Accept:'application/json',Authorization:'Bearer '+token}});
    expect(r.status()).toBe(200);notices[user.code]=(await r.json()).data;
    const ownJourney=Object.values(s.journeys).reverse().find((j:any)=>j.owner===user.code||j.winner===user.code) as any;
    if(ownJourney){
      const notice=notices[user.code].find(n=>n.data?.booking_uuid===ownJourney.booking.uuid&&['Final settlement completed','Trip completed','POD approved'].includes(n.title));
      expect(notice,'Participant has an actionable completed-booking bell').toBeTruthy();
      await page.getByRole('button',{name:'Notifications',exact:true}).click();
      await page.locator('.notif-dropdown-item').filter({hasText:notice.title}).filter({hasText:ownJourney.booking.booking_reference}).first().click();
      const expected=`/${user.role}/${user.role==='transporter'?'requests':'bookings'}?booking=${ownJourney.booking.uuid}`;
      await expect(page).toHaveURL(expected);await expect(page.locator('.card').filter({hasText:ownJourney.booking.booking_reference})).toBeVisible();
      links.push({user:user.code,title:notice.title,booking:ownJourney.booking.booking_reference,destination:expected});
    }
  }
  const coverage:any[]=[];
  for(const [key,j]of Object.entries(s.journeys)as [string,any][]){
    const owner=notices[j.owner];const provider=notices[j.winner];
    for(const title of ['Vehicle assigned','Driver assigned','Loading confirmation requested','Trip started','Trip completed','Proof of delivery submitted']){
      expect(owner.some(n=>n.title===title&&n.data?.booking_uuid===j.booking.uuid),`${key}: owner ${title}`).toBe(true);
    }
    for(const title of ['Loading confirmed','Payment milestone released','Mid-trip payment added','POD approved','Final settlement completed']){
      expect(provider.some(n=>n.title===title&&n.data?.booking_uuid===j.booking.uuid),`${key}: provider ${title}`).toBe(true);
    }
    for(const loser of j.applicants.filter((c:string)=>c!==j.winner)){
      expect(notices[loser].some(n=>n.title==='Application declined'&&n.data?.application_uuid===j.apps[loser].uuid),`${key}: competing applicant ${loser}`).toBe(true);
    }
    const counterRecipient=j.negotiation==='owner'?j.winner:j.owner;
    expect(notices[counterRecipient].some(n=>n.title==='New counter-offer received'&&n.data?.application_uuid===j.apps[j.winner].uuid)).toBe(true);
    coverage.push({key,booking:j.booking.booking_reference,ownerEvents:6,providerEventTypes:5,declinedApplicants:2,counterRecipient});
  }
  expect(blocked).toEqual([]);
  await writeFile(info.outputPath('notification-matrix.json'),JSON.stringify({coverage,links,blockedWrites:blocked},null,2));
});
