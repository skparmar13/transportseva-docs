import { prepareReviewedDispatch, attestDispatch } from './helpers/dispatch-evidence';
import { test, expect as baseExpect, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

test.use({ trace: 'off', video: 'off', screenshot: 'off', actionTimeout: 60000, navigationTimeout: 60000 });
test.setTimeout(1200000);
const expect = baseExpect.configure({ timeout: 60000 });
const dir = '.local-runtime/commercial-terms-20261127';
let source: any, state: any;
const actor = (code: string) => source.actors.find((a: any) => a.code === code);
const save = () => writeFile(`${dir}/journey.json`, JSON.stringify(state, null, 2));
const wait = (page: Page, method: string, path: string) => page.waitForResponse(r => r.request().method() === method && new URL(r.url()).pathname === '/api/' + path, { timeout: 60000 });
async function submit(page: Page, method: string, path: string, action: () => Promise<any>, status = 200) {
  const [r] = await Promise.all([wait(page, method, path), action()]); const body = await r.json();
  expect(r.status(), `${method} ${path}: ${JSON.stringify(body)}`).toBe(status); return body.data;
}
async function api(page: Page, path: string, method = 'GET', data?: any, status = 200) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const r = await page.request.fetch('http://localhost:8080/api/' + path, { method, headers: { Accept: 'application/json', Authorization: 'Bearer ' + token }, ...(data ? { data } : {}) });
  const body = await r.json(); expect(r.status(), `${method} ${path}: ${JSON.stringify(body)}`).toBe(status); return body.data;
}
async function login(page: Page, code: string) {
  const a = actor(code); await page.goto('/auth/login'); await page.locator('input[name=identifier]').fill(a.email); await page.locator('input[name=password]').fill(source.password);
  await submit(page, 'POST', 'auth/login', () => page.getByRole('button', { name: /^log in$/i }).click());
  await expect(page).toHaveURL(`/${a.role}/dashboard`, { timeout: 60000 });
}
async function openLoad(page: Page, code: string) {
  await page.goto(`/${actor(code).role}/load-board/${state.load.uuid}`);
  await expect(page.getByText(/Loading load details/i)).toBeHidden({ timeout: 60000 });
  await expect(page.getByText(/^Loading applications?…$/i)).toBeHidden({ timeout: 60000 });
}
async function openBooking(page: Page, code: string) {
  await page.goto(`/${actor(code).role}/bookings?booking=${state.booking.uuid}`);
  const card = page.locator('.card').filter({ hasText: state.booking.booking_reference }); await expect(card).toBeVisible({ timeout: 60000 }); return card;
}
async function terms(page: Page, code: string) { const card = await openBooking(page, code); const t = card.locator('app-booking-commercial-terms'); await expect(t.getByText('Gross freight, per trip')).toBeVisible({ timeout: 60000 }); return t; }
async function workflow(page: Page, action: () => Promise<any>) { state.booking = await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/workflow`, action); await save(); }
async function transfer(page: Page, milestone: string, amount: number, mid?: string) {
  await login(page, 's'); const card = await openBooking(page, 's'); const panel = card.locator('[data-direct-payments]');
  let ledger = await api(page, `marketplace-bookings/${state.booking.uuid}/direct-payments`);
  if (!ledger.instruction?.current) {
    await panel.locator('input[type=password]').fill(source.password);
    await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/bank-instructions`, () => panel.getByRole('button', { name: 'Acknowledge bank instructions' }).click());
  }
  const reference = `QATERMS27${state.booking.booking_reference}${milestone}`.replace(/[^a-z0-9]/gi, '').toUpperCase();
  ledger = await api(page, `marketplace-bookings/${state.booking.uuid}/direct-payments`);
  let receipt = ledger.receipts.find((r: any) => r.reference === reference);
  if (!receipt) {
    if (milestone === 'loading_advance') {
      await api(page, `marketplace-bookings/${state.booking.uuid}/direct-payments`, 'POST', {
        amount: amount + 1, transfer_date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()),
        reference: reference + 'OVER', milestone, instruction_version: ledger.instruction.version, request_uuid: crypto.randomUUID(),
      }, 422);
      state.checks.agreed_advance_cap_enforced = true;
    }
    await panel.locator('select[name=milestone]').selectOption(milestone); if (mid) await panel.locator('select[name=milestone_uuid]').selectOption(mid);
    await panel.locator('#receipt-amount').fill(String(amount)); await panel.locator('#receipt-reference').fill(reference);
    ledger = await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/direct-payments`, () => panel.getByRole('button', { name: 'Report transfer', exact: true }).click(), 201);
    receipt = ledger.receipts.find((r: any) => r.reference === reference); expect(receipt.status).toBe('reported_by_payer');
  }
  if (receipt.status === 'reported_by_payer') {
    await login(page, 'oa'); const providerPanel = (await openBooking(page, 'oa')).locator('[data-direct-payments]');
    if (milestone === 'loading_advance') {
      await api(page, `marketplace-bookings/${state.booking.uuid}/workflow`, 'POST', { action: 'start_trip' }, 422);
      state.checks.payer_report_does_not_unlock_dispatch = true;
    }
    ledger = await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/direct-payments/${receipt.uuid}/decision`, () => providerPanel.locator(`[data-receipt="${receipt.uuid}"]`).getByRole('button', { name: 'Confirm money received' }).click());
    expect(ledger.receipts.find((r: any) => r.uuid === receipt.uuid).status).toBe('confirmed_received');
  }
  state.receipts[milestone] = { uuid: receipt.uuid, amount, status: 'confirmed_received' }; await save();
}
test.beforeAll(async () => {
  source = JSON.parse(await readFile('.local-runtime/booking-full-20261122/20261122-01.json', 'utf8'));
  try { state = JSON.parse(await readFile(`${dir}/journey.json`, 'utf8')); }
  catch { state = { database: 'transportseva', run: 'commercial-terms-20261127', actors: ['s', 'oa', 'ob'].map(code => ({ code, email: actor(code).email, role: actor(code).role })), apps: {}, checks: {}, receipts: {} }; }
});
test('visible commercial agreement through direct-payment and POD lifecycle', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const starts = new Map<any, number>();
  page.on('request', r => { if (r.url().includes(':8080/api/')) starts.set(r, Date.now()); });
  page.on('response', r => { const start = starts.get(r.request()); if (start && Date.now() - start > 5000) console.log('Slow API', new URL(r.url()).pathname, r.status(), Date.now() - start); });
  if (state.passed) { await login(page, 's'); await terms(page, 's'); expect((await api(page, `marketplace-bookings/${state.booking.uuid}/commercial-terms`)).status).toBe('agreed'); return; }
  await test.step('Post a fresh load and prepare a separate QA vehicle and driver', async () => {
    if (!state.load) {
      await login(page, 's'); await page.goto('/shipper/post-load');
      await page.locator('input#pickup-city').fill('Delhi'); await page.locator('input#drop-city').fill('Jaipur');
      await page.locator('input[name=material]').fill('QA commercial agreement per-trip goods'); await page.locator('input[name=weightTons]').fill('16');
      await page.locator('select[name=vehicleType]').selectOption({ label: '32ft Trailer' }); await page.locator('input[name=budget]').fill('22000');
      state.load = await submit(page, 'POST', 'loads', () => page.getByRole('button', { name: /Post Load to Marketplace/i }).click(), 201); await save();
    }
    if (!state.vehicle) {
      await login(page, 'oa'); await page.goto('/truck-owner/vehicles'); await page.getByRole('button', { name: /add vehicle/i }).first().click();
      for (const [name, value] of Object.entries({ regNumber: 'QATERMS271126', make: 'Tata', model: 'Agreement QA', yearOfMake: '2024', capacityTons: '24' })) await page.locator(`input[name=${name}]`).fill(value);
      await page.locator('select[name=vehicleType]').selectOption({ label: '32ft Trailer' });
      state.vehicle = await submit(page, 'POST', 'marketplace-vehicles', () => page.getByRole('button', { name: /^add vehicle$/i }).last().click(), 201); await save();
    }
    if (!state.driver) {
      await login(page, 'oa'); await page.goto('/truck-owner/drivers'); await page.getByRole('button', { name: /add driver/i }).first().click();
      await page.locator('input[name=name]').fill('QA Commercial Terms Driver'); await page.locator('input[name=phone]').fill('7911270001'); await page.locator('input[name=licenseNumber]').fill('QATERMS-271126');
      state.driver = await submit(page, 'POST', 'marketplace-drivers', () => page.getByRole('button', { name: /^add driver$/i }).last().click(), 201); await save();
    }
  });
  await test.step('Multiple applicants and exact negotiated award', async () => {
    for (const code of ['oa', 'ob']) if (!state.apps[code]) {
      await login(page, code); await openLoad(page, code); await page.getByRole('button', { name: /Apply for this Load/i }).click();
      await page.locator('select[name=vehicleRegNumber]').selectOption(code === 'oa' ? state.vehicle.registration_number : actor(code).vehicle.registration_number);
      await expect(page.locator('select[name=vehicleType]')).toHaveCount(0);
      await page.locator('input[name=availability]').fill('QA ready today'); await page.locator('input[name=quotedAmount]').fill('19000');
      state.apps[code] = await submit(page, 'POST', `loads/${state.load.uuid}/applications`, () => page.getByRole('button', { name: /Submit Application/i }).click(), 201); await save();
    }
    if (!state.booking) {
      await login(page, 's'); await openLoad(page, 's');
      const scope = page.locator('app-load-details').getByText(state.vehicle.registration_number, { exact: false }).first().locator('xpath=ancestor::div[contains(@style,"border") and contains(@style,"padding")][1]');
      await scope.getByRole('button', { name: /View Offers|View Negotiation/i }).click(); await scope.locator('input[name=counterAmount]').fill('17000');
      await submit(page, 'POST', `applications/${state.apps.oa.uuid}/offers`, () => scope.getByRole('button', { name: /Send Counter-Offer/i }).click(), 201);
      await login(page, 'oa'); await openLoad(page, 'oa'); await page.getByRole('button', { name: /^Accept/i }).click();
      state.booking = await submit(page, 'POST', `loads/${state.load.uuid}/applications/${state.apps.oa.uuid}/booking`, () => page.getByRole('button', { name: /^Confirm$/i }).click(), 201); await save();
      expect(state.booking.commercial_agreement.status).toBe('awaiting_acceptance');
    }
  });
  await test.step('One acknowledgement, changed proposal, stale refusal, bilateral acceptance and download', async () => {
    await login(page, 's'); await openLoad(page, 's');
    let agreement = await api(page, `marketplace-bookings/${state.booking.uuid}/commercial-terms`);
    if (agreement.status !== 'agreed') {
      const entry = page.getByRole('link', { name: 'Review commercial terms' }); await expect(entry).toBeVisible(); await entry.click();
      await expect(page).toHaveURL(new RegExp(`booking=${state.booking.uuid}`));
      let t = page.locator('app-booking-commercial-terms'); await expect(t.getByText('Gross freight, per trip')).toBeVisible();
      await api(page, `marketplace-bookings/${state.booking.uuid}/token-orders`, 'POST', {}, 422); state.checks.token_before_agreement_blocked = true;
      if (agreement.current.version === 1) {
        state.old = agreement.current;
        if (!agreement.current.owner_accepted_at) {
          await t.getByRole('checkbox').check(); await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/commercial-terms/accept`, () => t.getByRole('button', { name: 'Accept this version' }).click());
          await api(page, `marketplace-bookings/${state.booking.uuid}/token-orders`, 'POST', {}, 422); state.checks.one_party_insufficient = true;
        }
        await login(page, 'oa'); t = await terms(page, 'oa'); await t.getByRole('button', { name: 'Propose changes' }).click();
        await t.locator('input[name=advance]').fill('30'); await t.locator('input[name=dispatch]').check(); await t.locator('input[name=due]').fill('7');
        await t.locator('input[name=pickupFree]').fill('4'); await t.locator('input[name=deliveryFree]').fill('4'); await t.locator('input[name=detention]').fill('200');
        await t.locator('select[name=insurance]').selectOption('shipper_arranged'); await t.locator('input[name=acknowledged]').check();
        agreement = await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/commercial-terms`, () => t.getByRole('button', { name: 'Propose and accept new version' }).click(), 201);
        expect(agreement.current.owner_accepted_at).toBeNull(); expect(agreement.current.financials.advance_amount).toBe(5100); await save();
      }
      await login(page, 's');
      await api(page, `marketplace-bookings/${state.booking.uuid}/commercial-terms/accept`, 'POST', { version: state.old.version, fingerprint: state.old.fingerprint, acknowledged: true }, 409); state.checks.stale_version_blocked = true;
      t = await terms(page, 's'); await expect(t).toContainText('₹5,100.00'); await t.getByRole('checkbox').check();
      agreement = await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/commercial-terms/accept`, () => t.getByRole('button', { name: 'Accept this version' }).click()); expect(agreement.status).toBe('agreed');
    }
    const t = await terms(page, 's'); const [download] = await Promise.all([page.waitForEvent('download'), t.getByRole('button', { name: 'Download agreed confirmation' }).click()]);
    expect(download.suggestedFilename()).toContain('-v2.html'); state.agreement = agreement; state.checks.confirmation_download = true; await save();
  });
  await test.step('Pay both test tokens, assign fleet, and verify dispatch and actual advance gates', async () => {
    for (const code of ['s', 'oa']) {
      await login(page, code); state.booking = await api(page, `marketplace-bookings/${state.booking.uuid}`);
      if ((code === 's' ? state.booking.owner_token_status : state.booking.provider_token_status) === 'paid') continue;
      await openLoad(page, code); await page.getByRole('button', { name: /^Pay token$/i }).click(); await expect(page.getByText(/Token paid|booking token paid successfully/i).first()).toBeVisible({ timeout: 60000 });
    }
    await login(page, 'oa'); state.booking = await api(page, `marketplace-bookings/${state.booking.uuid}`); expect(state.booking.status).toBe('confirmed'); await save();
    if (!state.booking.workflow.vehicle_assignment) { const card = await openBooking(page, 'oa'); await card.getByRole('button', { name: /^Assign Vehicle$/i }).click(); await page.locator('select[name=vehicleRegInput]').selectOption(state.vehicle.registration_number); await workflow(page, () => page.getByRole('button', { name: /^Assign$/i }).click()); }
    if (!state.booking.workflow.driver_assignment) { const card = await openBooking(page, 'oa'); await card.getByRole('button', { name: /^Assign Driver$/i }).click(); await page.locator('select[name=driverIdInput]').selectOption(state.driver.uuid); await workflow(page, () => page.getByRole('button', { name: /^Assign$/i }).click()); }
    if (!state.booking.workflow.loading_completed_at) { const card = await openBooking(page, 'oa'); await workflow(page, () => card.getByRole('button', { name: /^Mark Loading Completed$/i }).click()); }
    await login(page, 's');
    if (!state.booking.workflow.loading_confirmed_at) { const card = await openBooking(page, 's'); await workflow(page, () => card.getByRole('button', { name: /^Confirm Loading$/i }).click()); }
    await transfer(page, 'loading_advance', 5100);
    await login(page, 'oa'); state.booking = await api(page, `marketplace-bookings/${state.booking.uuid}`);
    if (!state.booking.workflow.trip_started_at) { await prepareReviewedDispatch(page, state.booking.uuid, () => login(page, 'oa')); const card = await openBooking(page, 'oa'); await attestDispatch(card); await workflow(page, () => card.getByRole('button', { name: /^Start Trip$/i }).click()); }
  });
  await test.step('Mid-trip receipt, delivery, approved POD and remaining gross balance', async () => {
    await login(page, 's'); state.booking = await api(page, `marketplace-bookings/${state.booking.uuid}`);
    if (!state.booking.workflow.mid_trip_milestones?.length) {
      const card = await openBooking(page, 's'); await card.getByRole('button', { name: /Mid-Trip Payment/i }).click(); await page.locator('input[name=midTripAmount]').fill('2000'); await page.locator('input[name=midTripTrigger]').fill('QA checkpoint'); await workflow(page, () => page.getByRole('button', { name: /^Add Milestone$/i }).click());
    }
    await transfer(page, 'mid_trip', 2000, state.booking.workflow.mid_trip_milestones[0].id);
    await login(page, 'oa'); state.booking = await api(page, `marketplace-bookings/${state.booking.uuid}`);
    if (!state.booking.workflow.trip_completed_at) { const card = await openBooking(page, 'oa'); await workflow(page, () => card.getByRole('button', { name: /^Mark Trip Completed$/i }).click()); }
    if (!state.booking.workflow.pod) {
      const card = await openBooking(page, 'oa'); await card.getByRole('button', { name: /^Upload POD$/i }).click(); await page.locator('input[name=podNumber]').fill('QA-TERMS-271126'); await page.locator('input[name=podReceivedBy]').fill('QA consignee');
      await page.locator('#pod-file').setInputFiles({ name: 'qa-pod.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
      state.booking = await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/pod`, () => page.getByRole('button', { name: /^Submit POD$/i }).click(), 201); await save();
    }
    await login(page, 's');
    if (state.booking.workflow.pod.status !== 'approved') { const card = await openBooking(page, 's'); await card.getByRole('button', { name: /^Approve POD$/i }).click(); state.booking = await submit(page, 'POST', `marketplace-bookings/${state.booking.uuid}/pod/review`, () => page.getByRole('dialog').getByRole('button', { name: /^Approve POD$/i }).click()); await save(); }
    await transfer(page, 'final', 9900);
    state.ledger = await api(page, `marketplace-bookings/${state.booking.uuid}/direct-payments`); state.booking = await api(page, `marketplace-bookings/${state.booking.uuid}`);
    expect(state.ledger.amounts.confirmed_received).toBe(17000); expect(state.ledger.amounts.confirmed_unpaid).toBe(0);
    expect(state.booking.status).toBe('completed'); expect(state.booking.workflow.pod.status).toBe('approved');
    expect(Number(state.booking.shipper_fee)).toBe(1003); expect(Number(state.booking.provider_fee)).toBe(1003);
    state.checks.browser_errors = errors; expect(errors).toEqual([]); state.passed = true; await save();
  });
});
