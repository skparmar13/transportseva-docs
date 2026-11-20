import { expect, test, type BrowserContext } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000 });
test.setTimeout(150_000);
const actors = [
  { role: 'shipper', email: 'verify-shipper-1793028294862-61@transportseva.test', reference: 'TS-KOQKWAZAA8', uuid: '5c18b398-8a75-4017-9ecf-e268282a4852' },
  { role: 'truck-owner', email: 'verify-truck-owner-1793028294862-62@transportseva.test', reference: 'TS-KOQKWAZAA8', uuid: '5c18b398-8a75-4017-9ecf-e268282a4852' },
  { role: 'shipper', email: 'e2e-shipper-90594444-11@transportseva.test', reference: 'TS-SXIFZM3X1R', uuid: '346c7138-9071-4698-886c-37ba3e80c85e' },
];
async function readOnly(context: BrowserContext) {
  const blocked: string[] = [];
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', route => {
    const request = route.request(); const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) && !(request.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname))) {
      blocked.push(request.method() + ' ' + url.pathname); return route.abort();
    }
    return route.continue();
  });
  return blocked;
}
for (const actor of actors) {
  test(`saved ${actor.reference} respects access for ${actor.email}`, async ({ page, context }, info) => {
    const blocked = await readOnly(context);
    await page.goto('/auth/login');
    await page.locator('input[name=identifier]').fill(actor.email);
    await page.locator('input[name=password]').fill('TransportSevaE2E@2026');
    const [login] = await Promise.all([
      page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/auth/login'),
      page.getByRole('button', { name: /^log in$/i }).click(),
    ]);
    expect(login.status()).toBe(200);
    if(actor.reference==='TS-SXIFZM3X1R') {
      await expect(page).toHaveURL('/shipper/profile',{timeout:60_000});
      const token=await page.evaluate(()=>localStorage.getItem('transportseva.access_token'));
      const denied=await page.request.get(`http://localhost:8080/api/marketplace-bookings/${actor.uuid}`,{headers:{Accept:'application/json',Authorization:'Bearer '+token}});
      expect(denied.status()).toBe(403); expect((await denied.json()).code).toBe('ACCOUNT_ONBOARDING_REQUIRED');
      await page.screenshot({path:info.outputPath('legacy-profile-gate.png'),fullPage:true});
      await writeFile(info.outputPath('legacy-profile-gate.json'),JSON.stringify({actor,result:'Profile completion required; booking UI not accessible until completed',blockedWrites:blocked},null,2));
      expect(blocked).toEqual([]); return;
    }
    await expect(page).toHaveURL(`/${actor.role}/dashboard`, { timeout: 60_000 });
    const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
    const response = await page.request.get(`http://localhost:8080/api/marketplace-bookings/${actor.uuid}`, {
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
    });
    expect(response.status()).toBe(200); const booking = (await response.json()).data;
    expect(booking.booking_reference).toBe(actor.reference);
    expect(Number(booking.shipper_payable) - Number(booking.provider_payout)).toBeCloseTo(Number(booking.total_commission), 2);
    await page.goto(`/${actor.role}/bookings?booking=${actor.uuid}`);
    const card = page.locator('.card').filter({ hasText: actor.reference });
    await expect(card).toBeVisible({ timeout: 60_000 });
    const expand = card.getByRole('button', { name: /view details/i });
    if (await expand.count()) await expand.click();
    if (booking.settlement?.status === 'settled') {
      await expect(card.getByText('TransportSeva commission recorded', { exact: true })).toBeVisible();
      await expect(card.getByText('₹2,183', { exact: true })).toBeVisible();
    } else {
      expect(booking.workflow.pod.status).toBe('approved');
      await expect(card.getByText(/POD approved/i)).toBeVisible();
      expect(Number(booking.gross_freight)).toBe(18000);
      await expect(card.getByText('₹18,000', { exact: true }).first()).toBeVisible();
    }
    await page.screenshot({ path: info.outputPath('booking-view.png'), fullPage: true });
    await page.reload(); await expect(card).toBeVisible({ timeout: 60_000 });
    expect(blocked).toEqual([]);
    await writeFile(info.outputPath('booking-evidence.json'), JSON.stringify({ actor, booking, blockedWrites: blocked, writes: 'Authentication only' }, null, 2));
  });
}

test('documents the unreleased-advance balance mismatch with a controlled settlement response', async ({ page, context }, info) => {
  const actor=actors[0]; const blocked=await readOnly(context);
  await page.goto('/auth/login');
  await page.locator('input[name=identifier]').fill(actor.email);
  await page.locator('input[name=password]').fill('TransportSevaE2E@2026');
  await page.getByRole('button',{name:/^log in$/i}).click();
  await expect(page).toHaveURL('/shipper/dashboard',{timeout:60_000});
  await page.route('**/api/marketplace-bookings?*',async route=>{
    const response=await route.fetch(); const body=await response.json();
    const booking=body.data.find((b:any)=>b.uuid===actor.uuid);
    expect(booking.workflow.released_milestones?.['Loading Advance']).toBeFalsy();
    booking.settlement={uuid:'00000000-0000-4000-8000-000000000001',booking_uuid:booking.uuid,
      gross_freight:booking.gross_freight,shipper_fee:booking.shipper_fee,provider_fee:booking.provider_fee,
      shipper_payable:booking.shipper_payable,provider_payout:booking.provider_payout,status:'pending',settled_at:null};
    await route.fulfill({response,json:body});
  });
  await page.goto(`/shipper/bookings?booking=${actor.uuid}`);
  const card=page.locator('.card').filter({hasText:actor.reference}); await expect(card).toBeVisible();
  const expand=card.getByRole('button',{name:/view details/i}); if(await expand.count())await expand.click();
  const actual=await card.getByText('Final freight balance',{exact:true}).locator('..').locator('strong').innerText();
  const due=await card.getByText('Final payment due from shipper',{exact:true}).locator('..').locator('strong').innerText();
  // Reproduction assertion documents a known defect; this is not a correctness sign-off.
  expect(actual).toBe('₹10,800'); expect(due).toBe('₹11,862');
  await writeFile(info.outputPath('known-balance-gap.json'),JSON.stringify({controlledSettlement:true,reference:actor.reference,
    releasedAdvance:0,actualDisplayedFreight:10800,expectedFreight:18000,actualDisplayedDue:11862,expectedDue:19062,
    undercount:7200,businessWrites:blocked},null,2));
  await page.screenshot({path:info.outputPath('unreleased-advance-gap.png'),fullPage:true}); expect(blocked).toEqual([]);
});
