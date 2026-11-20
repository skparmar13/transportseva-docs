import { expect, test, type Page, type Locator } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

test.use({ trace: 'off', video: 'off', actionTimeout: 25_000, navigationTimeout: 45_000 });
test.describe.configure({ mode: 'serial' });
test.setTimeout(720_000);

const run = process.env.E2E_MATRIX_RUN;
if (!run || !/^20261120-[a-z0-9]+$/.test(run)) throw new Error('Set a unique local E2E_MATRIX_RUN such as 20261120-01.');
const root = '.local-runtime/booking-matrix';
const manifestPath = `${root}/${run}.json`;
const password = 'MatrixQA@2026!20';
type Role = 'shipper' | 'transporter' | 'truck-owner';
type Actor = { code: string; role: Role; name: string; email: string; mobile: string; uuid?: string; ready?: boolean; vehicle?: any; driver?: any };
type Journey = { owner: string; winner: string; applicants: string[]; freight: number; negotiation: 'owner' | 'applicant'; load?: any; apps: Record<string, any>; booking?: any; final?: any; passed?: boolean; events: string[] };
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
    const reg = 'QAMX' + run!.replace(/\D/g, '').slice(-7) + user.code.toUpperCase();
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

test.beforeAll(async () => {
  const before = JSON.parse(await readFile(root + '/before.json', 'utf8'));
  const backup = JSON.parse((await readFile(root + '/backup.json', 'utf8')).replace(/^\uFEFF/, ''));
  expect(before.database).toBe('transportseva'); expect(before.payment_provider).toBe('mock');
  expect(before.phone_sandbox && before.email_sandbox && before.debug_otp).toBe(true); expect(before.kyc_required).toBe(false);
  expect(backup.CreateTables).toBe(109); expect(backup.Sha256).toMatch(/^[a-f0-9]{64}$/);
  try { state = JSON.parse(await readFile(manifestPath, 'utf8')); } catch (e: any) {
    if(e.code !== 'ENOENT') throw e;
    state = { run: run!, database: 'transportseva', password, actors: [
      ['s', 'shipper'], ['ta', 'transporter'], ['tb', 'transporter'], ['oa', 'truck-owner'], ['ob', 'truck-owner'],
    ].map(([code, role], i) => ({ code, role: role as Role, name: `QA Matrix ${role} ${code}`, email: `qa-matrix-${run}-${code}@transportseva.test`, mobile: '78' + run!.replace(/\D/g, '').slice(-6) + String(i + 1).padStart(2, '0') })), journeys: {
      'shipper-owner': { owner: 's', winner: 'oa', applicants: ['oa', 'ob', 'ta'], freight: 17000, negotiation: 'owner', apps: {}, events: [] },
      'shipper-transporter': { owner: 's', winner: 'ta', applicants: ['ta', 'tb', 'oa'], freight: 18500, negotiation: 'applicant', apps: {}, events: [] },
      'transporter-owner': { owner: 'ta', winner: 'oa', applicants: ['oa', 'ob', 'tb'], freight: 18000, negotiation: 'owner', apps: {}, events: [] },
      'transporter-transporter': { owner: 'ta', winner: 'tb', applicants: ['tb', 'oa', 'ob'], freight: 20000, negotiation: 'applicant', apps: {}, events: [] },
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
  await page.screenshot({ path: info.outputPath('signup-and-fleet.png'), fullPage: true });
  state.checks['signup-' + code] = 'Passed signup, verification, mandatory gate, real relogin' + (user.role === 'shipper' ? '' : ', vehicle and driver registration'); await save();
});

for (const key of ['shipper-owner', 'shipper-transporter', 'transporter-owner', 'transporter-transporter']) test(`complete booking UI: ${key}`, async ({ page }, info) => {
  const j = state.journeys[key]; const owner = actor(j.owner); const winner = actor(j.winner);
  if (j.passed) { await login(page, owner); const b = await api(page, `marketplace-bookings/${j.booking.uuid}`); expect(b.settlement.status).toBe('settled'); return; }
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
  if (!j.booking.workflow.released_milestones?.['Loading Advance']) { const card = await openBooking(page, owner, j); await workflow(page, j, () => card.getByRole('button', { name: /^Release$/i }).click()); }
  await note(j, 'Vehicle/driver selected; loading completed, confirmed and advance recorded');
  if (!j.booking.workflow.trip_started_at) { await login(page, winner); const card = await openBooking(page, winner, j); await workflow(page, j, () => card.getByRole('button', { name: /^Start Trip$/i }).click()); }
  if (!j.booking.workflow.mid_trip_milestones?.length) {
    await login(page, owner); const card = await openBooking(page, owner, j); await card.getByRole('button', { name: /Mid-Trip Payment/i }).click();
    await page.locator('input[name=midTripAmount]').fill('2000'); await page.locator('input[name=midTripTrigger]').fill('QA manual checkpoint');
    await workflow(page, j, () => page.getByRole('button', { name: /^Add Milestone$/i }).click());
  }
  if (!j.booking.workflow.mid_trip_milestones[0].released_at) { const card = await openBooking(page, owner, j); await workflow(page, j, () => card.getByRole('button', { name: /^Release$/i }).click()); }
  await note(j, 'Trip started; mid-trip 2000 added and recorded released');
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
  if (j.booking.settlement.status !== 'settled') {
    const card = await openBooking(page, owner, j); await card.getByRole('button', { name: /^Settle Final Payment$/i }).click();
    const expectedDue = Math.round((j.freight * .6 - 2000 + Number(j.booking.shipper_fee)) * 100) / 100;
    await expect(page.locator('input[name=offlineAmount]')).toHaveValue(String(expectedDue)); await page.locator('input[name=offlineReference]').fill('QA-MATRIX-STATUS-ONLY-' + run);
    await workflow(page, j, () => page.getByRole('button', { name: /Record payment status/i }).click());
  }
  expect(j.booking.status).toBe('completed'); expect(j.booking.settlement.status).toBe('settled'); expect(j.booking.workflow.pod.status).toBe('approved');
  expect(Number(j.booking.total_commission)).toBeCloseTo(Number(j.booking.shipper_fee) + Number(j.booking.provider_fee), 2);
  j.final = j.booking;
  await page.reload(); let card = await openBooking(page, owner, j); await expect(card.getByText('TransportSeva commission recorded', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('owner-completed.png'), fullPage: true });
  await login(page, winner); card = await openBooking(page, winner, j); await expect(card.getByText('TransportSeva commission recorded', { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('provider-completed.png'), fullPage: true });
  const foreign = actor(j.applicants.find(c => c !== j.winner)!); await login(page, foreign); await api(page, `marketplace-bookings/${j.booking.uuid}`, 'GET', undefined, 403);
  await note(j, 'Delivery, private POD, approval, settlement status, reload on both sides and outsider denial passed'); j.passed = true; await save();
});

test('role matrix boundaries and self-application safeguard', async ({ page }) => {
  const user = actor('ta'); const j = state.journeys['transporter-transporter']; await login(page, user);
  await api(page, `loads/${j.load.uuid}/applications`, 'POST', { applicant_role: 'transporter', applicant_name: user.name,
    vehicle_reg_number: user.vehicle.registration_number, vehicle_type: user.vehicle.vehicle_type, availability: 'QA', quoted_amount: 20000 }, 422);
  await login(page, actor('s')); await expect(page.locator('.sidebar-nav a[href="/shipper/load-board"]')).toHaveCount(0);
  await login(page, actor('oa')); await expect(page.locator('.sidebar-nav a[href="/truck-owner/post-load"]')).toHaveCount(0);
  state.checks.roleMatrix = { supported: ['shipper -> truck-owner', 'shipper -> transporter', 'transporter -> truck-owner', 'transporter -> different transporter'],
    shipperAsProvider: 'No provider UI route', truckOwnerAsPoster: 'No posting UI route', selfApplication: 'API 422' }; await save();
});
