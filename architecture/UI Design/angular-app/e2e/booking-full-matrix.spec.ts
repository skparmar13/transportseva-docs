import { expect, test, type Page, type Locator } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

test.use({ trace: 'off', video: 'off', screenshot: 'off', actionTimeout: 30_000, navigationTimeout: 60_000 });
test.setTimeout(900_000);

const run = process.env.E2E_MATRIX_RUN;
if (!run || !/^20261122-[a-z0-9]+$/.test(run)) throw new Error('Set a unique local E2E_MATRIX_RUN such as 20261122-01.');
const root = '.local-runtime/booking-full-20261122';
const manifestPath = `${root}/${run}.json`;
const password = 'FullBookingQA@2026!22';
type Role = 'shipper' | 'transporter' | 'truck-owner';
type Actor = { code: string; role: Role; name: string; email: string; mobile: string; uuid?: string; ready?: boolean; vehicle?: any; driver?: any; bank?: any };
type Journey = { owner: string; winner: string; applicants: string[]; freight: number; negotiation: 'owner' | 'applicant'; advance?: boolean; mid?: number; load?: any; apps: Record<string, any>; booking?: any; final?: any; ledger?: any; receipts?: Record<string, any>; passed?: boolean; events: string[] };
let state: { run: string; database: string; password: string; actors: Actor[]; journeys: Record<string, Journey>; checks: Record<string, any> };
const actor = (code: string) => state.actors.find(a => a.code === code)!;
const response = (page: Page, method: string, path: string) => page.waitForResponse(r => r.request().method() === method && new URL(r.url()).pathname === '/api/' + path, { timeout: 60_000 });
async function save() { await mkdir(root, { recursive: true }); await writeFile(manifestPath, JSON.stringify(state, null, 2)); }
async function submit(page: Page, method: string, path: string, action: () => Promise<unknown>, status = 200) {
  const [r] = await Promise.all([response(page, method, path), action()]);
  const body = await r.json(); expect(r.status(), `${method} ${path}: ${JSON.stringify(body)}`).toBe(status); return body.data;
}
async function api(page: Page, path: string, method = 'GET', data?: any, status = 200) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const r = await page.request.fetch('http://localhost:8080/api/' + path, { method, headers: { Accept: 'application/json', Authorization: 'Bearer ' + token }, ...(data ? { data } : {}) });
  const body = await r.json(); expect(r.status(), `${method} ${path}: ${JSON.stringify(body)}`).toBe(status); return body.data;
}
async function login(page: Page, user: Actor) {
  await page.goto('/auth/login'); await page.locator('input[name=identifier]').fill(user.email); await page.locator('input[name=password]').fill(password);
  const data = await submit(page, 'POST', 'auth/login', () => page.getByRole('button', { name: /^log in$/i }).click());
  expect(data.user.uuid).toBe(user.uuid);
  await expect(page).toHaveURL(`/${user.role}/${data.user.portal_access_ready ? 'dashboard' : 'profile'}`, { timeout: 60_000 });
}
async function ensureProfile(page: Page, user: Actor) {
  const profile = page.locator('app-account-profile-page');
  if (!page.url().endsWith('/profile')) return;
  await expect(profile.locator('#personal-email')).toHaveValue(user.email);
  await profile.locator('#personal-designation').fill('Local booking matrix QA');
  await profile.locator('#personal-city').fill('Jaipur'); await profile.locator('#personal-pincode').fill('302022');
  await profile.locator('input[name=notify_email]').uncheck(); await profile.locator('input[name=notify_sms]').uncheck();
  const saved = await submit(page, 'PUT', 'account/profile', () => profile.getByRole('button', { name: 'Save profile', exact: true }).click());
  if (!saved.account.portal_access_ready) {
    const challenge = await submit(page, 'POST', 'account/email/request-otp', () => profile.getByRole('button', { name: 'Send verification code', exact: true }).click(), 202);
    expect(challenge.delivery_status).toBe('sandbox'); expect(challenge.debug_otp).toMatch(/^\d{6}$/);
    await profile.locator('#email-code').fill(challenge.debug_otp);
    const verified = await submit(page, 'POST', 'account/email/verify-otp', () => profile.getByRole('button', { name: 'Verify email', exact: true }).click());
    expect(verified.portal_access_ready).toBe(true);
  }
  await profile.getByRole('button', { name: 'Continue to dashboard', exact: true }).click();
  await expect(page).toHaveURL(`/${user.role}/dashboard`, { timeout: 60_000 });
}
async function signup(page: Page, user: Actor) {
  if (user.uuid) { await login(page, user); await ensureProfile(page, user); return; }
  await page.goto('/auth/signup');
  await page.locator('.role-card').nth(['shipper', 'transporter', 'truck-owner'].indexOf(user.role)).click();
  for (const [name, value] of Object.entries({ fullName: user.name, email: user.email, mobile: user.mobile, password, confirmPassword: password })) await page.locator(`input[name=${name}]`).fill(value);
  await page.locator('input[name=agreeTerms]').check();
  const otp = await submit(page, 'POST', 'auth/signup/request-otp', () => page.getByRole('button', { name: /Create Account/i }).click());
  expect(otp.debug_otp).toMatch(/^\d{6}$/); await expect(page).toHaveURL(/otp-verification/);
  for (const [i, digit] of [...otp.debug_otp].entries()) await page.locator('.otp-box').nth(i).fill(String(digit));
  const verified = await submit(page, 'POST', 'auth/signup/verify-otp', () => page.getByRole('button', { name: /^Verify OTP$/i }).click());
  user.uuid = verified.user.uuid; await save();
  await expect(page).toHaveURL(`/${user.role}/profile`, { timeout: 60_000 });
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const blocked = await page.request.get('http://localhost:8080/api/marketplace-dashboard', { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
  expect(blocked.status()).toBe(403);
  await ensureProfile(page, user);
}
async function assets(page: Page, user: Actor) {
  if (user.role === 'shipper') return;
  if (!user.vehicle) {
    await page.goto(`/${user.role}/${user.role === 'transporter' ? 'fleet' : 'vehicles'}`); await page.getByRole('button', { name: /add vehicle/i }).first().click();
    const reg = 'QAFULL' + run!.replace(/\D/g, '').slice(-7) + user.code.toUpperCase();
    for (const [name, value] of Object.entries({ regNumber: reg, make: 'Tata', model: 'Matrix QA', yearOfMake: '2024', capacityTons: '24' })) await page.locator(`input[name=${name}]`).fill(value);
    await page.locator('select[name=vehicleType]').selectOption({ label: '32ft Trailer' });
    user.vehicle = await submit(page, 'POST', 'marketplace-vehicles', () => page.getByRole('button', { name: /^add vehicle$/i }).last().click(), 201); await save();
  }
  if (!user.driver) {
    await page.goto(`/${user.role}/${user.role === 'transporter' ? 'fleet/drivers' : 'drivers'}`); await page.getByRole('button', { name: /add driver/i }).first().click();
    await page.locator('input[name=name]').fill(user.name + ' Driver'); await page.locator('input[name=phone]').fill(user.mobile);
    await page.locator('input[name=licenseNumber]').fill('MATRIX-' + run + '-' + user.code);
    user.driver = await submit(page, 'POST', 'marketplace-drivers', () => page.getByRole('button', { name: /^add driver$/i }).last().click(), 201); await save();
  }
}
async function openLoad(page: Page, user: Actor, j: Journey) {
  await page.goto(`/${user.role}/load-board/${j.load.uuid}`); await expect(page.getByText(/loading load details/i)).toBeHidden({ timeout: 60_000 });
}
function applicationCard(page: Page, user: Actor) {
  return page.locator('app-load-details').getByText(user.vehicle.registration_number, { exact: false }).first()
    .locator('xpath=ancestor::div[contains(@style,"border") and contains(@style,"padding")][1]');
}
async function openBooking(page: Page, user: Actor, j: Journey): Promise<Locator> {
  await page.goto(`/${user.role}/${user.role === 'transporter' ? 'requests' : 'bookings'}?booking=${j.booking.uuid}`);
  const card = page.locator('.card').filter({ hasText: j.booking.booking_reference }); await expect(card).toBeVisible({ timeout: 60_000 });
  const expand = card.getByRole('button', { name: /^view details$/i }); if (await expand.count()) await expand.click(); return card;
}
async function workflow(page: Page, j: Journey, action: () => Promise<unknown>) {
  const b = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/workflow`, action); j.booking = b; await save(); return b;
}
async function note(j: Journey, message: string) { j.events.push(message); await save(); }

async function adminLogin(page: Page) {
  await page.goto('/auth/staff/login'); await page.locator('input[name=email]').fill('admin@test.local'); await page.locator('input[name=password]').fill('password123');
  await submit(page, 'POST', 'auth/login', () => page.locator('form button[type=submit]').click()); await expect(page).toHaveURL(/\/admin\//, { timeout: 60_000 });
}
async function saveBank(page: Page, user: Actor) {
  await login(page, user); await page.goto(`/${user.role}/profile`); const setup = page.locator('[data-recipient-bank-setup]');
  await expect(setup).toBeVisible({ timeout: 60_000 });
  await setup.getByRole('button', { name: /Add bank account|Submit new bank details/ }).click();
  await setup.locator('#bank-holder').fill(user.name + ' Synthetic Recipient'); await setup.locator('#bank-name').fill('QA Synthetic Only Bank');
  const number = '0000261122' + String(1000 + state.actors.indexOf(user) * 10 + (user.bank?.version ?? 0));
  await setup.locator('#bank-number').fill(number); await setup.locator('#bank-repeat').fill(number); await setup.locator('#bank-ifsc').fill('TEST0000001');
  await setup.locator('#bank-password').fill(password); await setup.locator('input[name=sharing_consent]').check();
  user.bank = await submit(page, 'PUT', 'account/recipient-bank', () => setup.getByRole('button', { name: 'Submit for review', exact: true }).click());
  user.bank = user.bank.account; await save(); await expect(setup.locator('[data-bank-review-status]')).toContainText('Pending admin review');
  expect(await setup.textContent()).not.toContain(number);
}
async function bankReview(page: Page, user: Actor, decision: 'manually_reviewed' | 'rejected') {
  await adminLogin(page); await page.goto('/admin/bank-reviews');
  const row = page.locator('[data-bank-review-queue] article').filter({ hasText: user.email }); await row.getByRole('button', { name: 'Review submission' }).click();
  const review = page.locator('[data-selected-bank]'); await review.locator('#bank-review-password').fill('password123');
  await review.locator('#bank-review-evidence').fill(`QA synthetic review ${run} ${user.code}; no real account verification`);
  await review.locator('#bank-review-note').fill(decision === 'rejected' ? 'QA synthetic rejection case. Resubmit corrected details.' : 'QA synthetic account only. Do not transfer real money.');
  await review.locator('input[name=attested]').check();
  const result = await submit(page, 'POST', `admin/recipient-bank-accounts/${user.bank.uuid}/review`, () => review.getByRole('button', { name: decision === 'rejected' ? 'Reject submission' : 'Record manual approval', exact: true }).click());
  user.bank = result.account; expect(user.bank.status).toBe(decision); await save();
}
async function transfer(page: Page, j: Journey, milestone: 'loading_advance' | 'mid_trip' | 'final', total: number, midId?: string, split = false) {
  for (let part = 0; part < (split ? 2 : 1); part++) {
    const amount = split ? total / 2 : total; const key = milestone + part; const owner = actor(j.owner), provider = actor(j.winner);
    await login(page, owner); let card = await openBooking(page, owner, j); let panel = card.locator('[data-direct-payments]');
    let ledger = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`); expect(ledger.allocation).toBe('gross'); expect(ledger.bank.status).toBe('manually_reviewed');
    if (!ledger.instruction?.current) {
      await panel.locator('input[type=password]').fill(password);
      ledger = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/bank-instructions`, () => panel.getByRole('button', { name: 'Acknowledge bank instructions' }).click());
    }
    const reference = ('QAFULL' + run + j.booking.booking_reference + key).replace(/[^a-z0-9]/gi, '').toUpperCase();
    let receipt = ledger.receipts.find((r: any) => r.reference === reference);
    if (!receipt) {
      const before = ledger.amounts.confirmed_received;
      await panel.locator('select[name=milestone]').selectOption(milestone);
      if (midId) await panel.locator('select[name=milestone_uuid]').selectOption(midId);
      await panel.locator('#receipt-amount').fill(String(amount)); await panel.locator('#receipt-reference').fill(reference);
      ledger = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/direct-payments`, () => panel.getByRole('button', { name: 'Report transfer', exact: true }).click(), 201);
      expect(ledger.amounts.confirmed_received).toBe(before);
      receipt = ledger.receipts.find((r: any) => r.reference === reference); expect(receipt.status).toBe('reported_by_payer');
    }
    if (receipt.status === 'reported_by_payer') {
      await login(page, provider); card = await openBooking(page, provider, j); panel = card.locator('[data-direct-payments]');
      const before = (await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`)).amounts.confirmed_received;
      ledger = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/direct-payments/${receipt.uuid}/decision`, () => panel.locator(`[data-receipt="${receipt.uuid}"]`).getByRole('button', { name: 'Confirm money received' }).click());
      expect(ledger.amounts.confirmed_received).toBeCloseTo(before + amount, 2); expect(ledger.amounts.owner_fee).toBe(Number(j.booking.shipper_fee)); expect(ledger.amounts.provider_fee).toBe(Number(j.booking.provider_fee));
    } else expect(receipt.status).toBe('confirmed_received');
    j.receipts ??= {}; j.receipts[key] = { uuid: receipt.uuid, amount, bankVersion: receipt.bank_version, status: 'confirmed_received' }; await note(j, `${milestone}: ${amount} reported and recipient confirmed`);
  }
}
async function testTrackingRoute(page: Page, user: Actor, j: Journey) {
  await login(page, user); const card = await openBooking(page, user, j);
  await card.getByRole('button', { name: 'Track Assigned Vehicle', exact: true }).click();
  await expect(page).toHaveURL(/\/tracking\?/, { timeout: 60_000 });
  const url = new URL(page.url()); expect(url.searchParams.get('booking')).toBe(j.booking.uuid);
  expect(url.searchParams.get('vehicle')).toBe(actor(j.winner).vehicle.registration_number.toUpperCase());
  await note(j, 'Tracking action preserved the exact booking context');
}
async function testTripRecord(page: Page, user: Actor, j: Journey) {
  await page.goto(`/${user.role}/trips/${j.booking.uuid}`);
  await expect(page.getByText(j.booking.booking_reference, { exact: false }).first()).toBeVisible({ timeout: 60_000 });
}

test.beforeAll(async () => {
  const before = JSON.parse(await readFile(root + '/before.json', 'utf8'));
  const backup = JSON.parse((await readFile(root + '/backup.json', 'utf8')).replace(/^\uFEFF/, ''));
  expect(before.database).toBe('transportseva'); expect(before.payment_provider).toBe('mock');
  expect(before.phone_sandbox && before.email_sandbox && before.debug_otp).toBe(true); expect(before.kyc_required).toBe(false);
  expect(backup.CreateTables).toBe(113); expect(backup.Sha256).toMatch(/^[a-f0-9]{64}$/i); expect(before.freight_allocation).toBe('gross');
  try { state = JSON.parse(await readFile(manifestPath, 'utf8')); } catch (e: any) {
    if(e.code !== 'ENOENT') throw e;
    state = { run: run!, database: 'transportseva', password, actors: [
      ['s', 'shipper'], ['ta', 'transporter'], ['tb', 'transporter'], ['oa', 'truck-owner'], ['ob', 'truck-owner'],
    ].map(([code, role], i) => ({ code, role: role as Role, name: `QA Full ${role} ${code}`, email: `qa-full-${run}-${code}@transportseva.test`, mobile: '79' + run!.replace(/\D/g, '').slice(-6) + String(i + 1).padStart(2, '0') })), journeys: {
      'shipper-owner': { owner: 's', winner: 'oa', applicants: ['oa', 'ob', 'ta'], freight: 17000, negotiation: 'owner', apps: {}, events: [] },
      'shipper-transporter': { owner: 's', winner: 'ta', applicants: ['ta', 'tb', 'oa'], freight: 18500, negotiation: 'applicant', apps: {}, events: [] },
      'transporter-owner': { owner: 'ta', winner: 'oa', applicants: ['oa', 'ob', 'tb'], freight: 18000, negotiation: 'owner', apps: {}, events: [] },
      'transporter-transporter': { owner: 'ta', winner: 'tb', applicants: ['tb', 'oa', 'ob'], freight: 20000, negotiation: 'applicant', apps: {}, events: [] },
      'no-advance': { owner: 's', winner: 'ob', applicants: ['ob', 'oa', 'tb'], freight: 19000, negotiation: 'applicant', advance: false, mid: 0, apps: {}, events: [] },
    }, checks: {} }; await save();
  }
});
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

for (const code of ['s', 'ta', 'tb', 'oa', 'ob']) test(`fresh signup, profile, sandbox email verification, relogin and owned fleet: ${code}`, async ({ page }, info) => {
  const user = actor(code); await signup(page, user); user.ready = true; await save();
  await page.getByRole('button', { name: /log out/i }).click(); await expect(page).toHaveURL(/auth\/login/);
  await login(page, user); await assets(page, user);
  
  state.checks['signup-' + code] = 'Passed signup, verification, mandatory gate, real relogin' + (user.role === 'shipper' ? '' : ', vehicle and driver registration'); await save();
});

for (const code of ['ta', 'tb', 'oa', 'ob']) test(`private bank setup and documented manual review: ${code}`, async ({ page }) => {
  const user = actor(code); await login(page, user); const saved = await api(page, 'account/recipient-bank'); user.bank = saved.account;
  if (user.bank?.status === 'manually_reviewed') return;
  if (!user.bank || user.bank.status === 'rejected') await saveBank(page, user);
  if (code === 'ob' && user.bank.version === 1) { await bankReview(page, user, 'rejected'); await saveBank(page, user); }
  await bankReview(page, user, 'manually_reviewed');
});

for (const key of ['shipper-owner', 'shipper-transporter', 'transporter-owner', 'transporter-transporter', 'no-advance']) test(`complete booking UI: ${key}`, async ({ page }, info) => {
  const j = state.journeys[key]; const owner = actor(j.owner); const winner = actor(j.winner);
  if (j.passed) { await login(page, owner); const b = await api(page, `marketplace-bookings/${j.booking.uuid}`); expect(b.status).toBe('completed'); const d = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`); expect(d.amounts.confirmed_unpaid).toBe(0); return; }
  if (!j.load) await test.step('Post a fresh load through UI', async () => {
    await login(page, owner); await page.goto(`/${owner.role}/post-load`);
    const behalf = page.locator('input[name=onBehalfOfCustomer]'); if (await behalf.count()) await behalf.fill('QA matrix customer');
    await page.locator('input#pickup-city').fill('Delhi'); await page.locator('input#drop-city').fill('Navi Mumbai');
    await page.locator('input[name=material]').fill(`QA Matrix ${run} ${key}`); await page.locator('input[name=weightTons]').fill('16');
    await page.locator('select[name=vehicleType]').selectOption({ label: '32ft Trailer' }); await page.locator('input[name=budget]').fill('22000');
    j.load = await submit(page, 'POST', 'loads', () => page.getByRole('button', { name: /Post Load to Marketplace/i }).click(), 201); await note(j, 'Fresh load posted through UI');
  });
  for (const code of j.applicants) if (!j.apps[code]) await test.step(`Apply using registered fleet: ${code}`, async () => {
    const provider = actor(code); await login(page, provider); await openLoad(page, provider, j);
    await page.getByRole('button', { name: /Apply for this Load/i }).click();
    await page.locator('select[name=vehicleRegNumber]').selectOption(provider.vehicle.registration_number);
    await expect(page.locator('select[name=vehicleType]')).toHaveCount(0);
    await page.locator('input[name=availability]').fill('QA available today'); await page.locator('input[name=quotedAmount]').fill('21000');
    j.apps[code] = await submit(page, 'POST', `loads/${j.load.uuid}/applications`, () => page.getByRole('button', { name: /Submit Application/i }).click(), 201); await note(j, `${code} applied through owned-vehicle dropdown`);
  });
  if (!j.booking) await test.step('Negotiate, accept one offer and reject competing applicants', async () => {
    const sender = j.negotiation === 'owner' ? owner : winner; const recipient = j.negotiation === 'owner' ? winner : owner;
    await login(page, sender); await openLoad(page, sender, j);
    const scope = sender.code === owner.code ? applicationCard(page, winner) : page.locator('app-load-details');
    await scope.getByRole('button', { name: /View Offers|View Negotiation/i }).click();
    await scope.locator('input[name=counterAmount]').fill(String(j.freight));
    await submit(page, 'POST', `applications/${j.apps[j.winner].uuid}/offers`, () => scope.getByRole('button', { name: /Send Counter-Offer/i }).click(), 201);
    await login(page, recipient); await openLoad(page, recipient, j);
    const acceptScope = recipient.code === owner.code ? applicationCard(page, winner) : page.locator('app-load-details');
    await acceptScope.getByRole('button', { name: /^Accept/i }).click();
    const accepted = response(page, 'POST', `loads/${j.load.uuid}/applications/${j.apps[j.winner].uuid}/accept`);
    j.booking = await submit(page, 'POST', `loads/${j.load.uuid}/applications/${j.apps[j.winner].uuid}/booking`, () => page.getByRole('button', { name: /^Confirm$/i }).click(), 201);
    expect((await accepted).status()).toBe(200); await save(); expect(Number(j.booking.gross_freight)).toBe(j.freight);
    await login(page, owner); const apps = await api(page, `loads/${j.load.uuid}/applications`);
    for (const code of j.applicants) expect(apps.find((a: any) => a.uuid === j.apps[code].uuid)?.status).toBe(code === j.winner ? 'accepted' : 'rejected');
    await note(j, 'Counter-offer accepted at exact amount; two competing applications rejected');
  });
  await test.step('Pay both mock booking tokens through UI', async () => {
    for (const party of [owner, winner]) {
      await login(page, party); let b = await api(page, `marketplace-bookings/${j.booking.uuid}`);
      if ((party.code === owner.code ? b.owner_token_status : b.provider_token_status) === 'paid') continue;
      await openLoad(page, party, j);
      const scope = party.code === owner.code ? applicationCard(page, winner) : page.locator('app-load-details');
      const checked = response(page, 'POST', `marketplace-bookings/${j.booking.uuid}/token-orders`);
      await scope.getByRole('button', { name: /^Pay token$/i }).click(); expect((await checked).status()).toBe(201);
      await expect(scope.getByText(/Token paid|booking token paid successfully/i).first()).toBeVisible({ timeout: 60_000 });
    }
    j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`); expect(j.booking.status).toBe('confirmed'); await note(j, 'Both mock tokens paid; booking confirmed');
  });
  await login(page, winner); j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`);
  if (!j.booking.workflow.vehicle_assignment) {
    const card = await openBooking(page, winner, j); await card.getByRole('button', { name: /Assign Vehicle/i }).click();
    await page.locator('select[name=vehicleRegInput]').selectOption(winner.vehicle.registration_number);
    await workflow(page, j, () => page.getByRole('button', { name: /^Assign$/i }).click());
  }
  if (!j.booking.workflow.driver_assignment) {
    const card = await openBooking(page, winner, j); await card.getByRole('button', { name: /Assign Driver/i }).click();
    await page.locator('select[name=driverIdInput]').selectOption(winner.driver.uuid);
    await workflow(page, j, () => page.getByRole('button', { name: /^Assign$/i }).click());
  }
  if (!j.booking.workflow.loading_completed_at) { const card = await openBooking(page, winner, j); await workflow(page, j, () => card.getByRole('button', { name: /Mark Loading Completed/i }).click()); }
  await login(page, owner);
  if (!j.booking.workflow.loading_confirmed_at) { const card = await openBooking(page, owner, j); await workflow(page, j, () => card.getByRole('button', { name: /^Confirm Loading$/i }).click()); }
  await note(j, 'Vehicle/driver selected and loading confirmed');
  if (j.advance !== false) await transfer(page, j, 'loading_advance', Math.round(j.freight * 40) / 100);
  if (!j.booking.workflow.trip_started_at) { await login(page, winner); const card = await openBooking(page, winner, j); await workflow(page, j, () => card.getByRole('button', { name: /^Start Trip$/i }).click()); }
  await testTrackingRoute(page, owner, j);
  if (j.mid !== 0) {
    await login(page, owner);
    if (!j.booking.workflow.mid_trip_milestones?.length) {
      const card = await openBooking(page, owner, j); await card.getByRole('button', { name: /Mid-Trip Payment/i }).click();
      await page.locator('input[name=midTripAmount]').fill('2000'); await page.locator('input[name=midTripTrigger]').fill('QA synthetic checkpoint');
      await workflow(page, j, () => page.getByRole('button', { name: /^Add Milestone$/i }).click());
    }
    await transfer(page, j, 'mid_trip', 2000, j.booking.workflow.mid_trip_milestones[0].id, key === 'transporter-transporter');
  }
  await login(page, winner);
  if (!j.booking.workflow.trip_completed_at) { const card = await openBooking(page, winner, j); await workflow(page, j, () => card.getByRole('button', { name: /Mark Trip Completed/i }).click()); }
  if (!j.booking.workflow.pod) {
    const card = await openBooking(page, winner, j); await card.getByRole('button', { name: /^Upload POD$/i }).click();
    await page.locator('input[name=podNumber]').fill('QA-' + key + '-' + run); await page.locator('input[name=podReceivedBy]').fill('QA matrix consignee');
    await page.locator('#pod-file').setInputFiles({ name: 'qa-signed-pod.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
    j.booking = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/pod`, () => page.getByRole('button', { name: /^Submit POD$/i }).click(), 201); await save();
  }
  await login(page, owner);
  if (j.booking.workflow.pod.status !== 'approved') {
    const card = await openBooking(page, owner, j); await card.getByRole('button', { name: /^Approve POD$/i }).click();
    j.booking = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/pod/review`, () => page.getByRole('dialog').getByRole('button', { name: /^Approve POD$/i }).click()); await save();
  }
  if (!j.booking.settlement) { const card = await openBooking(page, owner, j); await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/settle`, () => card.getByRole('button', { name: /^Prepare Settlement$/i }).click(), 201); j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`); await save(); }
  await login(page, owner); const beforeFinal = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`);
  await transfer(page, j, 'final', beforeFinal.amounts.available_to_report);
  await login(page, owner); j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`);
  j.ledger = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`);
  expect(j.booking.status).toBe('completed'); expect(j.booking.workflow.pod.status).toBe('approved');
  expect(j.ledger.amounts.recipient_basis).toBe(j.freight); expect(j.ledger.amounts.confirmed_received).toBe(j.freight);
  expect(j.ledger.amounts.confirmed_unpaid).toBe(0); expect(j.ledger.amounts.awaiting_or_disputed).toBe(0);
  expect(Number(j.booking.total_commission)).toBeCloseTo(Number(j.booking.shipper_fee) + Number(j.booking.provider_fee), 2);
  expect(j.booking.owner_token_status).toBe('paid'); expect(j.booking.provider_token_status).toBe('paid');
  j.final = j.booking;
  await page.reload(); let card = await openBooking(page, owner, j); await expect(card.locator('[data-direct-payments]')).toContainText('confirmed the full freight amount');
  await testTripRecord(page, owner, j);
  await login(page, winner); card = await openBooking(page, winner, j); await expect(card.locator('[data-direct-payments]')).toContainText('confirmed the full freight amount');
  await testTripRecord(page, winner, j);
  const foreign = actor(j.applicants.find(c => c !== j.winner)!); await login(page, foreign); await api(page, `marketplace-bookings/${j.booking.uuid}`, 'GET', undefined, 403);
  await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`, 'GET', undefined, 403);
  await note(j, 'Delivery, private POD approval, full gross recipient confirmation, reload, trip details and outsider denial passed'); j.passed = true; await save();
});
test('role matrix boundaries and self-application safeguard', async ({ page }) => {
  const user = actor('ta'); await login(page, user);
  if (!state.checks.selfLoad) state.checks.selfLoad = await api(page, 'loads', 'POST', { pickup_city: 'Delhi', drop_city: 'Jaipur', material: `QA open self-application guard ${run}`, weight_tons: 10, vehicle_type: '32ft Trailer', budget: 20000 }, 201);
  await save();
  await api(page, `loads/${state.checks.selfLoad.uuid}/applications`, 'POST', { applicant_role: 'transporter', applicant_name: user.name,
    vehicle_reg_number: user.vehicle.registration_number, vehicle_type: user.vehicle.vehicle_type, availability: 'QA', quoted_amount: 20000 }, 422);
  await login(page, actor('s')); await expect(page.locator('.sidebar-nav a[href="/shipper/load-board"]')).toHaveCount(0);
  await api(page, `loads/${state.checks.selfLoad.uuid}/applications`, 'POST', { applicant_role: 'truck-owner', applicant_name: 'QA spoofed provider', vehicle_reg_number: actor('oa').vehicle.registration_number, vehicle_type: '32ft Trailer', availability: 'QA', quoted_amount: 20000 }, 403);
  await login(page, actor('oa')); await expect(page.locator('.sidebar-nav a[href="/truck-owner/post-load"]')).toHaveCount(0);
  await api(page, 'loads', 'POST', { posted_by_role: 'shipper', pickup_city: 'Delhi', drop_city: 'Jaipur', material: 'QA forbidden truck owner posting', weight_tons: 10, vehicle_type: '32ft Trailer', budget: 20000 }, 403);
  state.checks.roleMatrix = { supported: ['shipper -> truck-owner', 'shipper -> transporter', 'transporter -> truck-owner', 'transporter -> different transporter'],
    shipperAsProvider: 'No provider UI route; API 403', truckOwnerAsPoster: 'No posting UI route; API 403', selfApplication: 'API 422 on a fresh open load' }; await save();
});

test('load identity stays canonical when caller supplies a different permitted poster role', async ({ page }) => {
  for (const j of Object.values(state.journeys)) {
    const owner = actor(j.owner); await login(page, owner);
    const data = { pickup_city: j.load.pickup_city, drop_city: j.load.drop_city, material: j.load.material, weight_tons: Number(j.load.weight_tons), vehicle_type: j.load.vehicle_type, budget: Number(j.load.budget), posted_by_role: owner.role === 'shipper' ? 'transporter' : 'shipper' };
    j.load = await api(page, `loads/${j.load.uuid}`, 'PUT', data); expect(j.load.posted_by_role).toBe(owner.role); expect(j.load.posted_by_name).toBe(owner.name); await save();
  }
  state.checks.canonicalPosterIdentity = 'Passed; only new QA loads updated, shipment terms unchanged'; await save();
});

async function focusedBooking(page: Page, key: string): Promise<Journey> {
  state.checks.edgeCases ??= {};
  const j: Journey = state.checks.edgeCases[key] ??= { owner: 's', winner: key === 'receipt-dispute' ? 'oa' : 'ob', applicants: [], freight: 17000, negotiation: 'applicant', apps: {}, events: [] };
  const owner = actor(j.owner), provider = actor(j.winner);
  if (!j.load) { await login(page, owner); j.load = await api(page, 'loads', 'POST', { posted_by_role: owner.role, posted_by_name: owner.name, pickup_city: 'Delhi', drop_city: 'Jaipur', material: `QA Full focused ${key} ${run}`, weight_tons: 10, vehicle_type: '32ft Trailer', budget: 22000 }, 201); await save(); }
  if (!j.apps[provider.code]) { await login(page, provider); j.apps[provider.code] = await api(page, `loads/${j.load.uuid}/applications`, 'POST', { applicant_role: provider.role, applicant_name: provider.name, vehicle_reg_number: provider.vehicle.registration_number, vehicle_type: provider.vehicle.vehicle_type, availability: 'QA today', quoted_amount: j.freight }, 201); await save(); }
  if (!j.booking) { await login(page, owner); const path = `loads/${j.load.uuid}/applications/${j.apps[provider.code].uuid}`; await api(page, path + '/accept', 'POST'); j.booking = await api(page, path + '/booking', 'POST', undefined, 201); await save(); }
  return j;
}
async function focusedTokens(page: Page, j: Journey) {
  for (const party of [actor(j.owner), actor(j.winner)]) {
    await login(page, party); const b = await api(page, `marketplace-bookings/${j.booking.uuid}`);
    if ((party.code === j.owner ? b.owner_token_status : b.provider_token_status) === 'paid') continue;
    await openLoad(page, party, j); const scope = party.code === j.owner ? applicationCard(page, actor(j.winner)) : page.locator('app-load-details');
    await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/token-orders`, () => scope.getByRole('button', { name: /^Pay token$/i }).click(), 201);
    await expect(scope.getByText(/Token paid|booking token paid successfully/i).first()).toBeVisible({ timeout: 60_000 });
  }
  j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`); expect(j.booking.status).toBe('confirmed'); await save();
}
async function focusedAssignments(page: Page, j: Journey) {
  const provider = actor(j.winner); await login(page, provider); j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`);
  if (!j.booking.workflow.vehicle_assignment) { const card = await openBooking(page, provider, j); await card.getByRole('button', { name: 'Assign Vehicle', exact: true }).click(); await page.locator('select[name=vehicleRegInput]').selectOption(provider.vehicle.registration_number); await workflow(page, j, () => page.getByRole('button', { name: /^Assign$/i }).click()); }
  if (!j.booking.workflow.driver_assignment) { const card = await openBooking(page, provider, j); await card.getByRole('button', { name: 'Assign Driver', exact: true }).click(); await page.locator('select[name=driverIdInput]').selectOption(provider.driver.uuid); await workflow(page, j, () => page.getByRole('button', { name: /^Assign$/i }).click()); }
}
async function requestCancellation(page: Page, j: Journey) {
  const provider = actor(j.winner); await login(page, provider); const card = await openBooking(page, provider, j);
  await card.getByRole('button', { name: 'Request cancellation', exact: true }).click(); await page.locator('textarea[name=cancellationReason]').fill('QA synthetic cancellation request: admin call decision required.');
  const dispute = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/disputes/cancellation-request`, () => page.getByRole('button', { name: 'Send to TransportSeva', exact: true }).click(), 201);
  j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`); expect(j.booking.status).toBe('disputed'); await save(); return dispute;
}
async function adminDecision(page: Page, j: Journey, dispute: any, resolution: 'continue' | 'cancel', paid: boolean) {
  await adminLogin(page); await page.goto(`/admin/bookings?booking=${j.booking.uuid}`);
  const card = page.locator('.card').filter({ hasText: j.booking.booking_reference }); await expect(card).toBeVisible({ timeout: 60_000 });
  const expand = card.getByRole('button', { name: /^View Details$/i }); if (await expand.count()) await expand.click();
  await card.getByRole('button', { name: 'Record decision after call', exact: true }).click();
  await page.locator('#decision-booking').selectOption(resolution); await page.locator('#decision-owner-token').selectOption(paid && resolution === 'cancel' ? 'refund' : 'no_action');
  await page.locator('#decision-provider-token').selectOption(paid && resolution === 'cancel' ? 'retain' : 'no_action');
  await page.locator('#decision-commission').selectOption(resolution === 'cancel' ? 'waive' : 'no_action'); await page.locator('#decision-summary').fill(`QA simulated phone-call outcome: ${resolution}. This records a decision only.`);
  await submit(page, 'POST', `marketplace-disputes/${dispute.uuid}/resolve`, () => page.getByRole('dialog').getByRole('button', { name: 'Record decision after call', exact: true }).click());
}

test('cancellation before tokens needs an admin decision and does not invent refunds', async ({ page }) => {
  const j = await focusedBooking(page, 'cancel-before-tokens'); if (j.passed) return;
  const dispute = await requestCancellation(page, j);
  await api(page, `marketplace-disputes/${dispute.uuid}/resolve`, 'POST', { resolution: 'cancel', owner_token_decision: 'no_action', provider_token_decision: 'no_action', commission_decision: 'waive', summary: 'QA unauthorized party resolution attempt' }, 403);
  await adminDecision(page, j, dispute, 'cancel', false); await login(page, actor(j.owner)); j.final = await api(page, `marketplace-bookings/${j.booking.uuid}`);
  expect(j.final.status).toBe('cancelled'); expect(j.final.owner_token_status).not.toBe('refunded'); expect(j.final.provider_token_status).not.toBe('refunded'); j.passed = true; await save();
});

test('assigned booking pauses for dispute, resumes after admin call, and cancellation releases resources', async ({ page }) => {
  const j = await focusedBooking(page, 'cancel-assigned'); if (j.passed) return;
  await login(page, actor(j.winner)); const saved = await api(page, `marketplace-bookings/${j.booking.uuid}`);
  if (saved.status === 'cancelled') {
    const decisions = Object.values(saved.workflow.dispute_decisions ?? {}) as any[];
    expect(decisions.some(d => d.booking_decision === 'continue')).toBe(true);
    expect(decisions.some(d => d.booking_decision === 'cancel' && d.owner_token_decision === 'refund' && d.provider_token_decision === 'retain')).toBe(true);
    expect(saved.owner_token_status).toBe('paid'); expect(saved.provider_token_status).toBe('paid');
    const provider = actor(j.winner), vehicles = await api(page, 'marketplace-vehicles'), drivers = await api(page, 'marketplace-drivers');
    expect(vehicles.find((v: any) => v.uuid === provider.vehicle.uuid).is_busy).toBe(false); expect(drivers.find((d: any) => d.uuid === provider.driver.uuid).is_busy).toBe(false);
    j.final = saved; j.passed = true; await note(j, 'Admin continued then cancelled after simulated calls; resources released; refund/retain decisions recorded without inventing token execution'); return;
  }
  await focusedTokens(page, j); await focusedAssignments(page, j); const provider = actor(j.winner);
  let card = await openBooking(page, provider, j); await card.getByRole('button', { name: 'Raise a dispute', exact: true }).click();
  await page.locator('textarea[name=disputeReason]').fill('QA operational dispute to verify pause and admin continuation.');
  const dispute = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/disputes`, () => page.getByRole('dialog').getByRole('button', { name: /Submit|Raise dispute/i }).click(), 201);
  await api(page, `marketplace-bookings/${j.booking.uuid}/workflow`, 'POST', { action: 'loading_completed' }, 422);
  await adminDecision(page, j, dispute, 'continue', true); await login(page, provider); card = await openBooking(page, provider, j);
  await workflow(page, j, () => card.getByRole('button', { name: 'Mark Loading Completed', exact: true }).click());
  const cancellation = await requestCancellation(page, j); await adminDecision(page, j, cancellation, 'cancel', true);
  await login(page, provider); j.final = await api(page, `marketplace-bookings/${j.booking.uuid}`); expect(j.final.status).toBe('cancelled');
  expect(j.final.owner_token_status).toBe('paid'); expect(j.final.provider_token_status).toBe('paid');
  expect(j.final.workflow.dispute_decisions[cancellation.uuid].owner_token_decision).toBe('refund');
  expect(j.final.workflow.dispute_decisions[cancellation.uuid].provider_token_decision).toBe('retain');
  const vehicles = await api(page, 'marketplace-vehicles'); const drivers = await api(page, 'marketplace-drivers');
  expect(vehicles.find((v: any) => v.uuid === provider.vehicle.uuid).is_busy).toBe(false); expect(drivers.find((d: any) => d.uuid === provider.driver.uuid).is_busy).toBe(false);
  j.passed = true; await save();
});

test('a disputed direct receipt reserves funds without claiming confirmation or admin resolution', async ({ page }) => {
  const j = await focusedBooking(page, 'receipt-dispute'); if (j.passed) return;
  await login(page, actor(j.owner)); const persisted = await api(page, `marketplace-bookings/${j.booking.uuid}`);
  if (persisted.status === 'completed' && persisted.workflow.pod?.status === 'approved') {
    j.booking = persisted; const current = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`);
    if (current.amounts.available_to_report > 0) await transfer(page, j, 'final', current.amounts.available_to_report);
    await login(page, actor(j.owner)); j.ledger = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`);
    expect(j.ledger.amounts.confirmed_received).toBe(j.freight - 500); expect(j.ledger.amounts.confirmed_unpaid).toBe(500);
    expect(j.ledger.amounts.awaiting_or_disputed).toBe(500); expect(j.ledger.amounts.available_to_report).toBe(0);
    j.final = persisted; j.passed = true; await note(j, 'Resumed after persisted POD approval; gross less disputed 500 confirmed, disputed reservation unchanged'); return;
  }
  await focusedTokens(page, j); await focusedAssignments(page, j); let card = await openBooking(page, actor(j.winner), j);
  if (!j.booking.workflow.loading_completed_at) await workflow(page, j, () => card.getByRole('button', { name: 'Mark Loading Completed', exact: true }).click());
  await login(page, actor(j.owner)); card = await openBooking(page, actor(j.owner), j); if (!j.booking.workflow.loading_confirmed_at) await workflow(page, j, () => card.getByRole('button', { name: 'Confirm Loading', exact: true }).click());
  const panel = card.locator('[data-direct-payments]'); let ledger = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`);
  if (!ledger.instruction?.current) { await panel.locator('input[type=password]').fill(password); ledger = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/bank-instructions`, () => panel.getByRole('button', { name: 'Acknowledge bank instructions' }).click()); }
  await expect(panel.locator('select[name=milestone]')).toHaveValue('loading_advance');
  await panel.locator('select[name=milestone]').selectOption('loading_advance'); await panel.locator('#receipt-amount').fill('500');
  const reference = ('QAFOCUSED' + run + j.booking.booking_reference).replace(/[^a-z0-9]/gi, '').toUpperCase(); await panel.locator('#receipt-reference').fill(reference);
  ledger = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/direct-payments`, () => panel.getByRole('button', { name: 'Report transfer', exact: true }).click(), 201);
  const receipt = ledger.receipts.find((r: any) => r.reference === reference); await login(page, actor(j.winner)); card = await openBooking(page, actor(j.winner), j);
  const item = card.locator(`[data-receipt="${receipt.uuid}"]`); await item.locator('textarea').fill('QA synthetic transfer disputed: recipient did not receive funds.');
  ledger = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/direct-payments/${receipt.uuid}/decision`, () => item.getByRole('button', { name: 'Dispute receipt', exact: true }).click());
  expect(ledger.amounts.confirmed_received).toBe(0); expect(ledger.amounts.confirmed_unpaid).toBe(j.freight); expect(ledger.amounts.awaiting_or_disputed).toBe(500);
  await login(page, actor(j.winner)); card = await openBooking(page, actor(j.winner), j);
  await workflow(page, j, () => card.getByRole('button', { name: 'Start Trip', exact: true }).click());
  await workflow(page, j, () => card.getByRole('button', { name: 'Mark Trip Completed', exact: true }).click());
  for (let revision = state.checks.edgePodRejected ? 2 : 1; revision <= 2; revision++) {
    await login(page, actor(j.winner)); card = await openBooking(page, actor(j.winner), j);
    await card.getByRole('button', { name: revision === 1 ? 'Upload POD' : 'Upload corrected POD', exact: true }).click();
    await page.locator('input[name=podNumber]').fill(`QA-FOCUSED-${run}-${revision}`); await page.locator('input[name=podReceivedBy]').fill('QA synthetic consignee');
    await page.locator('#pod-file').setInputFiles({ name: `qa-pod-revision-${revision}.png`, mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
    j.booking = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/pod`, () => page.getByRole('button', { name: 'Submit POD', exact: true }).click(), 201);
    await login(page, actor(j.owner)); card = await openBooking(page, actor(j.owner), j);
    await card.getByRole('button', { name: revision === 1 ? 'Request correction' : 'Approve POD', exact: true }).click();
    if (revision === 1) await page.locator('textarea[name=podReviewNote]').fill('QA first revision rejected: consignee proof needs correction.');
    j.booking = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/pod/review`, () => page.getByRole('dialog').getByRole('button', { name: revision === 1 ? 'Request correction' : 'Approve POD', exact: true }).click());
    expect(j.booking.workflow.pod.status).toBe(revision === 1 ? 'rejected' : 'approved');
    if (revision === 1) state.checks.edgePodRejected = true;
    if (revision === 2) await expect(card.locator('[data-direct-payments] select[name=milestone]')).toHaveValue('final');
    await save();
  }
  await transfer(page, j, 'final', j.freight - 500); await login(page, actor(j.owner)); j.ledger = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`);
  expect(j.ledger.amounts.confirmed_unpaid).toBe(500); expect(j.ledger.amounts.awaiting_or_disputed).toBe(500); expect(j.ledger.amounts.available_to_report).toBe(0);
  j.final = await api(page, `marketplace-bookings/${j.booking.uuid}`); j.passed = true; await note(j, 'POD correction/resubmission approved; expected limitation: disputed 500 remains reserved pending unimplemented receipt adjudication');
});

test('bank account reveals stay private and notification links target the correct booking', async ({ page }) => {
  const j = state.journeys['shipper-owner']; const user = actor(j.winner); await adminLogin(page); await page.goto('/admin/bank-reviews');
  await page.locator('#bank-queue-status').selectOption('all'); const row = page.locator('[data-bank-review-queue] article').filter({ hasText: user.email }); await row.getByRole('button', { name: 'Review submission' }).click();
  const review = page.locator('[data-selected-bank]'); await review.locator('#bank-review-password').fill('password123'); await review.locator('#bank-reveal-reason').fill('QA explicit private reveal for completed booking regression');
  const revealed = await submit(page, 'POST', `admin/recipient-bank-accounts/${user.bank.uuid}/reveal`, () => review.getByRole('button', { name: 'Reveal account for 60 seconds' }).click());
  expect(revealed.account_number).toMatch(/^0[0-9]+$/); await review.getByRole('button', { name: 'Hide account', exact: true }).click();
  await login(page, actor(j.owner)); const card = await openBooking(page, actor(j.owner), j); const panel = card.locator('[data-direct-payments]');
  await panel.locator('input[type=password]').fill(password); await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/bank-instructions/reveal`, () => panel.getByRole('button', { name: 'Reveal account for 60 seconds' }).click());
  await expect(panel.locator('[data-full-bank]')).toBeVisible(); await panel.getByRole('button', { name: 'Hide account', exact: true }).click();
  await page.goto('/shipper/dashboard'); await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  await expect(page.locator('.notif-dropdown-item').first()).toBeVisible(); const notices = await api(page, 'notifications?per_page=100');
  let chosen: any = null;
  for (const item of await page.locator('.notif-dropdown-item').all()) {
    const id = await item.getAttribute('data-notification-id'); const n = notices.find((n: any) => (n.uuid ?? n.id) === id);
    if (n?.data?.booking_uuid) { chosen = n; await item.click(); break; }
  }
  expect(chosen).toBeTruthy(); await expect(page).toHaveURL(`/shipper/bookings?booking=${chosen.data.booking_uuid}`); const uuid = new URL(page.url()).searchParams.get('booking');
  expect(Object.values(state.journeys).some(v => v.booking?.uuid === uuid) || Object.values(state.checks.edgeCases ?? {}).some((v: any) => v.booking?.uuid === uuid)).toBe(true);
  await expect(page.locator('[data-direct-payments]')).toBeVisible({ timeout: 60_000 }); state.checks.privateRevealAndBell = 'Passed'; await save();
});

test('each fresh booking event notifies the correct participant and declined applicants', async ({ page }) => {
  const notices: Record<string, any[]> = {};
  for (const user of state.actors) { await login(page, user); notices[user.code] = await api(page, 'notifications?per_page=100'); }
  const coverage: any[] = [];
  for (const [key, j] of Object.entries(state.journeys)) {
    expect(j.passed, key + ' completed').toBe(true);
    const owner = notices[j.owner], provider = notices[j.winner];
    const ownerTitles = ['Vehicle assigned', 'Driver assigned', 'Loading confirmation requested', 'Trip started', 'Trip completed', 'Proof of delivery submitted', 'Direct payment receipt confirmed'];
    const providerTitles = ['Loading confirmed', 'Bank instructions acknowledged', 'Direct payment reported', 'POD approved'];
    if (j.mid !== 0) providerTitles.push('Mid-trip payment added');
    for (const title of ownerTitles) expect(owner.some(n => n.title === title && n.data?.booking_uuid === j.booking.uuid), `${key}: owner ${title}`).toBe(true);
    for (const title of providerTitles) expect(provider.some(n => n.title === title && n.data?.booking_uuid === j.booking.uuid), `${key}: provider ${title}`).toBe(true);
    for (const loser of j.applicants.filter(c => c !== j.winner)) expect(notices[loser].some(n => n.title === 'Application declined' && n.data?.application_uuid === j.apps[loser].uuid), `${key}: declined ${loser}`).toBe(true);
    const counterRecipient = j.negotiation === 'owner' ? j.winner : j.owner;
    expect(notices[counterRecipient].some(n => n.title === 'New counter-offer received' && n.data?.application_uuid === j.apps[j.winner].uuid)).toBe(true);
    const providerReports = provider.filter(n => n.title === 'Direct payment reported' && n.data?.booking_uuid === j.booking.uuid);
    expect(providerReports.length).toBe(Object.keys(j.receipts ?? {}).length);
    coverage.push({ key, booking: j.booking.booking_reference, ownerEvents: ownerTitles.length, providerEventTypes: providerTitles.length, confirmedReceipts: providerReports.length, declinedApplicants: 2 });
  }
  state.checks.notificationCoverage = coverage; await save();
});

test('resume the saved approved POD booking without duplicating transfers', async ({ page }) => {
  const j = state.checks.edgeCases['pod-refresh']; expect(j).toBeTruthy();
  await login(page, actor(j.owner)); j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`);
  expect(j.booking.workflow.pod.status).toBe('approved');
  await transfer(page, j, 'final', j.freight);
  await login(page, actor(j.owner)); j.ledger = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`);
  expect(j.ledger.amounts.confirmed_unpaid).toBe(0); j.final = j.booking; j.passed = true; await save();
});

test('fresh POD approval enables final freight reporting on the same page', async ({ page }) => {
  // A separate retained case proves the live transition; a reload of an
  // already approved POD cannot prove that the parent refresh binding works.
  const j = await focusedBooking(page, 'pod-refresh-current-build'); if (j.passed) return;
  await focusedTokens(page, j); await focusedAssignments(page, j); const provider = actor(j.winner), owner = actor(j.owner);
  let card = await openBooking(page, provider, j); await workflow(page, j, () => card.getByRole('button', { name: 'Mark Loading Completed', exact: true }).click());
  await login(page, owner); card = await openBooking(page, owner, j); await workflow(page, j, () => card.getByRole('button', { name: 'Confirm Loading', exact: true }).click());
  let panel = card.locator('[data-direct-payments]'); await panel.locator('input[type=password]').fill(password);
  await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/bank-instructions`, () => panel.getByRole('button', { name: 'Acknowledge bank instructions' }).click());
  await login(page, provider); card = await openBooking(page, provider, j); await workflow(page, j, () => card.getByRole('button', { name: 'Start Trip', exact: true }).click());
  await workflow(page, j, () => card.getByRole('button', { name: 'Mark Trip Completed', exact: true }).click());
  await card.getByRole('button', { name: 'Upload POD', exact: true }).click(); await page.locator('input[name=podNumber]').fill(`QA-FRESH-POD-${run}`); await page.locator('input[name=podReceivedBy]').fill('QA synthetic consignee');
  await page.locator('#pod-file').setInputFiles({ name: 'qa-fresh-pod.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
  j.booking = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/pod`, () => page.getByRole('button', { name: 'Submit POD', exact: true }).click(), 201); await save();
  await login(page, owner); card = await openBooking(page, owner, j); panel = card.locator('[data-direct-payments]');
  await expect(panel.locator('select[name=milestone]')).toHaveCount(0);
  await card.getByRole('button', { name: 'Approve POD', exact: true }).click();
  j.booking = await submit(page, 'POST', `marketplace-bookings/${j.booking.uuid}/pod/review`, () => page.getByRole('dialog').getByRole('button', { name: 'Approve POD', exact: true }).click()); await save();
  await expect(panel.locator('select[name=milestone]')).toHaveValue('final');
  await transfer(page, j, 'final', j.freight); await login(page, owner); j.ledger = await api(page, `marketplace-bookings/${j.booking.uuid}/direct-payments`);
  expect(j.ledger.amounts.confirmed_unpaid).toBe(0); j.final = await api(page, `marketplace-bookings/${j.booking.uuid}`); j.passed = true; await save();
});
