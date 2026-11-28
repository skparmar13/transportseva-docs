import { test, expect as baseExpect, Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { prepareReviewedDispatch } from './helpers/dispatch-evidence';

test.use({ trace: 'off', video: 'off', screenshot: 'off', actionTimeout: 60000, navigationTimeout: 60000 });
test.setTimeout(1200000);
const expect = baseExpect.configure({ timeout: 60000 });
const dir = '.local-runtime/dispatch-compliance-20261128';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const until = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(Date.now() + 60 * 86400000));
let source: any, state: any;
const actor = (code: string) => source.actors.find((a: any) => a.code === code);
const save = () => writeFile(`${dir}/journey.json`, JSON.stringify(state, null, 2));
async function api(page: Page, path: string, method = 'GET', data?: any, status = 200) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const r = await page.request.fetch('http://localhost:8080/api/' + path, { method, headers: { Accept: 'application/json', Authorization: 'Bearer ' + token }, ...(data ? { data } : {}) });
  const b = await r.json(); expect(r.status(), `${method} ${path}: ${JSON.stringify(b)}`).toBe(status); return b.data;
}
async function clickResponse(page: Page, path: string, action: () => Promise<any>, status = 200) {
  const [r] = await Promise.all([page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/' + path), action()]);
  const body = await r.json(); expect(r.status(), JSON.stringify(body)).toBe(status); return body.data;
}
async function login(page: Page, code: string) {
  if (code === 'admin') {
    await page.goto('/auth/staff/login'); await page.locator('input[name=email]').fill('admin@test.local'); await page.locator('input[name=password]').fill('password123');
    await clickResponse(page, 'auth/login', () => page.getByRole('button', { name: /log in|sign in/i }).click()); await expect(page).toHaveURL(/\/admin\//); return;
  }
  await page.goto('/auth/login'); await page.locator('input[name=identifier]').fill(actor(code).email); await page.locator('input[name=password]').fill(source.password);
  await clickResponse(page, 'auth/login', () => page.getByRole('button', { name: /^log in$/i }).click()); await expect(page).toHaveURL(`/${actor(code).role}/dashboard`);
}
async function bookingPanel(page: Page, j: any, code: string) {
  const role = actor(code).role; await page.goto(`/${role}/${role === 'transporter' ? 'requests' : 'bookings'}?booking=${j.booking.uuid}`);
  const panel = page.locator('app-booking-dispatch'); await expect(panel).toContainText('Load weight'); return panel;
}
async function assetPanel(page: Page, kind: string, id: string, code: string, j: any) {
  if (kind === 'booking_vehicle') return (await bookingPanel(page, j, code)).locator('app-asset-compliance');
  const role = actor(code).role; await page.goto(`/${role}/${role === 'transporter' ? 'fleet/' : ''}${kind === 'driver' ? 'drivers' : 'vehicles'}/${id}`);
  const panel = page.locator('app-asset-compliance'); await expect(panel.getByRole('button', { name: 'Refresh documents' })).toBeEnabled(); return panel;
}
async function upload(page: Page, kind: string, id: string, code: string, j: any, renew = false) {
  const panel = await assetPanel(page, kind, id, code, j);
  await panel.getByRole('button', { name: renew ? 'Submit renewed documents' : 'Submit dispatch documents', exact: true }).click();
  for (const key of kind === 'driver' ? ['licence'] : ['rc', 'insurance', 'fitness', 'permit', 'puc']) {
    const doc = panel.locator(`[data-document-kind=${key}]`); await doc.locator('input[type=date]').fill(until);
    if (!renew) await doc.locator('input[type=file]').setInputFiles({ name: `SYNTHETIC-QA-${key}.png`, mimeType: 'image/png', buffer: png });
  }
  const v = await clickResponse(page, `fleet-compliance/${kind}/${id}`, () => panel.getByRole('button', { name: 'Submit evidence for review', exact: true }).click(), 201);
  await expect(panel.locator('[data-evidence-status]')).toContainText('pending'); return v;
}
async function review(page: Page, v: any, payload = 22, reject = false) {
  await page.goto(`/admin/kyc?fleet=${v.uuid}`); const p = page.locator('[data-selected-fleet-evidence]'); await expect(p).toContainText(`v${v.version}`);
  await p.locator('textarea[name=fleet-review-note]').fill(reject ? 'Synthetic QA rejection exercise; resubmit evidence for review.' : 'Synthetic QA workflow evidence only; not genuine government verification.');
  await p.locator('input[name=fleet-evidence-reference]').fill('SYNTHETIC-QA-20261128'); await p.locator('input[name=fleet-review-attested]').check();
  if (v.asset_type === 'driver') await p.getByRole('checkbox', { name: '32ft Trailer', exact: true }).check();
  else { await p.locator('input[name=review-gvw]').fill('35000'); await p.locator('input[name=review-unladen]').fill('12000'); await p.locator('input[name=review-payload]').fill(String(payload)); }
  return clickResponse(page, `admin/marketplace-kyc/assets/${v.uuid}/review`, () => p.getByRole('button', { name: reject ? 'Request fleet document changes' : 'Approve fleet evidence', exact: true }).click());
}
test.beforeAll(async () => {
  source = JSON.parse(await readFile('.local-runtime/booking-full-20261122/20261122-01.json', 'utf8'));
  try { state = JSON.parse(await readFile(`${dir}/journey.json`, 'utf8')); } catch { state = { database: 'transportseva', date: '2026-11-28', synthetic_documents: true, cases: {} }; }
});

for (const mode of ['Own Fleet', 'Subcontracted']) test(`visible dispatch evidence: ${mode}`, async ({ page }) => {
  const code = mode === 'Own Fleet' ? 'oa' : 'ta', key = code; const j = state.cases[key] ??= { mode, provider: actor(code).email, owner: actor('s').email, checks: {} };
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  if (j.passed) { await login(page, code); await bookingPanel(page, j, code); return; }
  await test.step('Prepare fresh labelled load, fleet, application, agreement and mock tokens through real APIs', async () => {
    await login(page, code);
    if (!j.vehicle) { j.vehicle = await api(page, 'marketplace-vehicles', 'POST', { registration_number: `QADISP281126${key.toUpperCase()}`, vehicle_type: '32ft Trailer', make: 'Tata', model: 'Synthetic Dispatch QA', year_of_make: 2024, capacity_tons: 24 }, 201); await save(); }
    if (!j.driver) { j.driver = await api(page, 'marketplace-drivers', 'POST', { name: `QA Dispatch 20261128 ${key}`, phone: code === 'oa' ? '7911280028' : '7911280029', license_number: `QADL-DISPATCH-20261128-${key}` }, 201); await save(); }
    await login(page, 's');
    if (!j.load) { j.load = await api(page, 'loads', 'POST', { pickup_city: 'Delhi', drop_city: 'Jaipur', material: `QA dispatch evidence ${mode}`, weight_tons: 16, vehicle_type: '32ft Trailer', budget: 22000 }, 201); await save(); }
    await login(page, code);
    if (!j.application) { j.application = await api(page, `loads/${j.load.uuid}/applications`, 'POST', { applicant_role: actor(code).role, applicant_name: `QA Dispatch ${code}`, vehicle_reg_number: j.vehicle.registration_number, vehicle_type: j.vehicle.vehicle_type, availability: 'QA ready today', quoted_amount: 17000 }, 201); await save(); }
    await login(page, 's');
    if (!j.booking) { await api(page, `loads/${j.load.uuid}/applications/${j.application.uuid}/accept`, 'POST'); j.booking = await api(page, `loads/${j.load.uuid}/applications/${j.application.uuid}/booking`, 'POST', undefined, 201); await save(); }
    for (const who of ['s', code]) {
      await login(page, who); const t = await api(page, `marketplace-bookings/${j.booking.uuid}/commercial-terms`);
      if (!(who === 's' ? t.current.owner_accepted_at : t.current.provider_accepted_at)) await api(page, `marketplace-bookings/${j.booking.uuid}/commercial-terms/accept`, 'POST', { version: t.current.version, fingerprint: t.current.fingerprint, acknowledged: true });
    }
    for (const who of ['s', code]) {
      await login(page, who); const b = await api(page, `marketplace-bookings/${j.booking.uuid}`); if ((who === 's' ? b.owner_token_status : b.provider_token_status) === 'paid') continue;
      const order = await api(page, `marketplace-bookings/${j.booking.uuid}/token-orders`, 'POST', {}, 201);
      await api(page, `marketplace-bookings/${j.booking.uuid}/token-orders/${order.uuid}/checkout`, 'POST'); await api(page, `marketplace-bookings/${j.booking.uuid}/token-orders/${order.uuid}/status`);
    }
    await login(page, code); j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}`); expect(j.booking.status).toBe('confirmed');
    const workflow = async (data: any) => { j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}/workflow`, 'POST', data); await save(); };
    if (!j.booking.workflow.vehicle_assignment) await workflow({ action: 'assign_vehicle', mode, vehicle_reg_number: mode === 'Own Fleet' ? j.vehicle.registration_number : 'QASUB281126TA', subcontracted_to: 'Synthetic QA partner' });
    if (!j.booking.workflow.driver_assignment) await workflow({ action: 'assign_driver', driver_uuid: j.driver.uuid });
    if (!j.booking.workflow.loading_completed_at) await workflow({ action: 'loading_completed' });
    await login(page, 's'); if (!j.booking.workflow.loading_confirmed_at) await workflow({ action: 'confirm_loading' });
  });
  const kind = mode === 'Own Fleet' ? 'vehicle' : 'booking_vehicle'; const id = kind === 'vehicle' ? j.vehicle.uuid : j.booking.uuid;
  await test.step('Missing evidence blocks visible Start Trip and the API', async () => {
    await login(page, code); let c = await api(page, `marketplace-bookings/${j.booking.uuid}/dispatch-checks`);
    if (!j.vehicleEvidence) { expect(c.ready).toBe(false); const p = await bookingPanel(page, j, code); await expect(p.getByRole('button', { name: 'Start Trip', exact: true })).toBeDisabled(); await api(page, `marketplace-bookings/${j.booking.uuid}/workflow`, 'POST', { action: 'start_trip', operator_attested: true, route_check_note: 'Synthetic QA route reference.' }, 422); j.checks.missing_documents_blocked = true; }
    if (!j.vehicleEvidence) { j.vehicleEvidence = await upload(page, kind, id, code, j); await save(); }
    if (!j.driverEvidence) { j.driverEvidence = await upload(page, 'driver', j.driver.uuid, code, j); await save(); }
  });
  await test.step('Manual review, rejection, renewal, overload and revocation use visible screens', async () => {
    await login(page, 'admin');
    if (j.vehicleEvidence.status === 'pending') { j.vehicleEvidence = await review(page, j.vehicleEvidence, mode === 'Own Fleet' ? 14 : 22); await save(); }
    if (j.driverEvidence.status === 'pending') { j.driverEvidence = await review(page, j.driverEvidence, 22, mode === 'Own Fleet' && j.driverEvidence.version === 1); await save(); }
    if (j.driverEvidence.status === 'rejected') { await login(page, code); j.driverEvidence = await upload(page, 'driver', j.driver.uuid, code, j, true); await save(); await login(page, 'admin'); j.driverEvidence = await review(page, j.driverEvidence); j.checks.rejected_driver_renewed = true; await save(); }
    if (mode === 'Own Fleet' && j.vehicleEvidence.version === 1) {
      await login(page, code); const p = await bookingPanel(page, j, code); await expect(p).toContainText('Load weight exceeds'); await expect(p.getByRole('button', { name: 'Start Trip', exact: true })).toBeDisabled();
      await api(page, `marketplace-bookings/${j.booking.uuid}/workflow`, 'POST', { action: 'start_trip', capacity_tons: 99, operator_attested: true, route_check_note: 'Synthetic QA route check.' }, 422); j.checks.overload_and_client_tamper_blocked = true;
      await login(page, 'admin'); await page.goto(`/admin/kyc?fleet=${j.vehicleEvidence.uuid}`); const q = page.locator('[data-selected-fleet-evidence]'); await expect(q).toContainText('approved'); await q.locator('textarea[name=fleet-review-note]').fill('Synthetic QA revocation exercise requiring renewed review.');
      j.vehicleEvidence = await clickResponse(page, `admin/marketplace-kyc/assets/${j.vehicleEvidence.uuid}/revoke`, () => q.getByRole('button', { name: 'Revoke fleet approval' }).click()); await save();
      await login(page, code); expect((await api(page, `marketplace-bookings/${j.booking.uuid}/dispatch-checks`)).ready).toBe(false); j.checks.revocation_blocks_departure = true;
      j.vehicleEvidence = await upload(page, kind, id, code, j, true); await save(); await login(page, 'admin'); j.vehicleEvidence = await review(page, j.vehicleEvidence, 22); await save();
    }
  });
  await test.step('Attested departure stores the reviewed evidence and shipper sees the snapshot', async () => {
    await login(page, code); const p = await bookingPanel(page, j, code); await expect(p.locator('[data-dispatch-ready]')).toContainText('checks passed');
    await expect(p.getByRole('button', { name: 'Start Trip', exact: true })).toBeDisabled(); await p.locator('input[name=dispatch-operator-attested]').check(); await p.locator('textarea[name=dispatch-route-note]').fill('Synthetic QA route, permit coverage and actual vehicle/driver/load checked.');
    j.booking = await clickResponse(page, `marketplace-bookings/${j.booking.uuid}/workflow`, () => p.getByRole('button', { name: 'Start Trip', exact: true }).click()); await save();
    expect(j.booking.status).toBe('in_transit'); const snap = j.booking.workflow.dispatch_check; expect(snap.vehicle_compliance_uuid).toBe(j.vehicleEvidence.uuid); expect(snap.driver_compliance_uuid).toBe(j.driverEvidence.uuid); expect(snap.load_weight_kg).toBe(16000); expect(snap.permitted_payload_kg).toBe(22000);
    await login(page, 's'); const shipper = await bookingPanel(page, j, 's'); await expect(shipper.locator('[data-departure-record]')).toContainText('Departure checks recorded');
    const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token')); const privateDoc = await page.request.get(`http://localhost:8080/api/fleet-compliance/${j.vehicleEvidence.uuid}/document/rc`, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } }); expect(privateDoc.status()).toBe(403); j.checks.shipper_document_privacy = true;
    // Finish this synthetic delivery to release the new QA assets; no freight receipt is fabricated.
    await login(page, code); j.booking = await api(page, `marketplace-bookings/${j.booking.uuid}/workflow`, 'POST', { action: 'complete_trip' }); expect(j.booking.status).toBe('completed');
    j.checks.snapshot = snap; j.checks.browser_errors = errors; expect(errors).toEqual([]); j.passed = true; await save();
  });
});

test('shared booking fixture renews synthetic evidence and preserves historical departure', async ({ page }) => {
  const j = state.cases.oa; expect(j?.passed).toBe(true);
  if (j.checks.shared_fixture_renewal) return;
  await login(page, 'oa'); const snapshot = (await api(page, `marketplace-bookings/${j.booking.uuid}`)).workflow.dispatch_check;
  const view = await api(page, `fleet-compliance/driver/${j.driver.uuid}`);
  if (view.current.status === 'approved') {
    await login(page, 'admin'); await api(page, `admin/marketplace-kyc/assets/${view.current.uuid}/revoke`, 'POST', { version: view.current.version, fingerprint: view.current.fingerprint, note: 'Synthetic later review exercise; departure history must remain unchanged.' });
  }
  await login(page, 'oa'); await prepareReviewedDispatch(page, j.booking.uuid, () => login(page, 'oa'));
  const renewed = await api(page, `fleet-compliance/driver/${j.driver.uuid}`); expect(renewed.current.status).toBe('approved'); expect(renewed.current.version).toBeGreaterThan(view.current.version);
  expect((await api(page, `marketplace-bookings/${j.booking.uuid}`)).workflow.dispatch_check).toEqual(snapshot);
  j.checks.shared_fixture_renewal = { current_driver_version: renewed.current.version, departure_driver_version: snapshot.driver_version, snapshot_preserved: true }; await save();
});
