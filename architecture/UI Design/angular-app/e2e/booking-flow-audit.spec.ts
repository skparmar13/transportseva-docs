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
      page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/auth/login', { timeout: 60_000 }),
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
      await expect(card).toContainText('Earlier recorded settlement status: settled');
      await expect(card.locator('[data-direct-payments]')).toContainText('Each party pays its own TransportSeva fee separately');
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

test('unreleased advance does not reduce confirmed unpaid freight or unlock legacy payment recording', async ({ page, context }, info) => {
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
  const actual=await card.locator('[data-confirmed-unpaid]').innerText();
  expect(actual).toBe('₹18,000.00');
  await expect(card.locator('[data-owner-token-status]')).toContainText('Paid');
  await expect(card.locator('[data-provider-token-status]')).toContainText('Paid');
  await expect(card).toContainText('Booking security tokens · Recorded payment status');
  await expect(card.getByRole('button',{name:/^Settle Final Payment$/i})).toHaveCount(0);
  await expect(card).toContainText('Shipper platform fee: ₹1,062');
  await writeFile(info.outputPath('corrected-balance.json'),JSON.stringify({controlledSettlement:true,reference:actor.reference,
    releasedAdvance:0,displayedFreight:18000,separateOwnerFee:1062,legacyPaymentActionHidden:true,businessWrites:blocked},null,2));
  await page.screenshot({path:info.outputPath('corrected-unreleased-advance.png'),fullPage:true}); expect(blocked).toEqual([]);
});

test('delivered and settled booking keeps paid tokens; pending refund and forfeiture remain distinct',async({page,context},info)=>{
  const blocked=await readOnly(context);
  await page.goto('/auth/login');await page.locator('input[name=identifier]').fill('qa-matrix-20261120-01-s@transportseva.test');
  await page.locator('input[name=password]').fill('MatrixQA@2026!20');await page.getByRole('button',{name:/^log in$/i}).click();
  await expect(page).toHaveURL('/shipper/dashboard',{timeout:60_000});
  const reference='TS-ZQXTRJ91OQ';const uuid='563a6729-7d04-4a41-9043-74f64af1ae4c';
  await page.goto('/shipper/bookings?booking='+uuid);const card=page.locator('.card').filter({hasText:reference});await expect(card).toBeVisible();
  if(await card.getByRole('button',{name:/^View Details$/i}).count())await card.getByRole('button',{name:/^View Details$/i}).click();
  await expect(card.locator('[data-owner-token-status]')).toContainText('₹1,000 · Paid');
  await expect(card.locator('[data-provider-token-status]')).toContainText('₹1,000 · Paid');
  await expect(card).not.toContainText('Provider Status Released');
  await expect(card).not.toContainText('Booking token accounted for');
  await expect(card).toContainText('The shipper pays the recipient directly');
  await page.screenshot({path:info.outputPath('real-completed-token-states.png'),fullPage:true});
  let statuses=['refund_pending','refunded'];
  await page.route('**/api/marketplace-bookings?*',async route=>{const r=await route.fetch();const body=await r.json();const b=body.data.find((b:any)=>b.uuid===uuid);
    b.owner_token_status=statuses[0];b.provider_token_status=statuses[1];b.owner_token_amount='1500.50';b.provider_token_amount='1200.00';await route.fulfill({response:r,json:body});});
  await page.reload();if(await card.getByRole('button',{name:/^View Details$/i}).count())await card.getByRole('button',{name:/^View Details$/i}).click();
  await expect(card.locator('[data-owner-token-status]')).toContainText('₹1,500.5 · Refund pending');
  await expect(card.locator('[data-provider-token-status]')).toContainText('₹1,200 · Refunded');
  statuses=['forfeiture_pending','forfeited'];await page.reload();if(await card.getByRole('button',{name:/^View Details$/i}).count())await card.getByRole('button',{name:/^View Details$/i}).click();
  await expect(card.locator('[data-owner-token-status]')).toContainText('Forfeiture pending');
  await expect(card.locator('[data-provider-token-status]')).toContainText('Forfeited');
  await page.getByRole('button',{name:'Change language',exact:true}).click();
  await expect(card.locator('[data-owner-token-status]')).toContainText('ज़ब्ती लंबित');
  await expect(card.locator('[data-provider-token-status]')).toContainText('ज़ब्त');
  expect(blocked).toEqual([]);
});
