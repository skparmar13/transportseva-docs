import { expect, test, type Locator, type Page, type Response } from '@playwright/test';

// All accounts are created through the real signup UI in transportseva.
// API setup creates fresh bookings for the focused UI scenarios; it never
// edits an existing booking or bypasses an operational transition.
const run = process.env.E2E_VERIFICATION_RUN_ID ?? String(Date.now());
const password = 'TransportSevaE2E@2026';
type Actor = { role: 'shipper' | 'truck-owner' | 'admin'; email: string; name: string; mobile?: string; token?: string };
const actor = (role: 'shipper' | 'truck-owner', sequence: number): Actor => ({
  role, email: `verify-${role}-${run}-${sequence}@transportseva.test`,
  name: `Verification ${role} ${run.slice(-6)} ${sequence}`,
  mobile: `7${String((Number(run.slice(-8)) + sequence) % 1e9).padStart(9, '0')}`,
});
const shipper = actor('shipper', 61);
const owner = actor('truck-owner', 62);
const outsider = actor('truck-owner', 63);
const admin: Actor = { role: 'admin', email: 'admin@test.local', name: 'Test administrator' };
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const evidence: Record<string, unknown> = { run, password, users: [shipper, owner, outsider].map(({ token, ...user }) => user), realPayments: 'skipped', gps: 'skipped' };
let registration = `VERIFY${run.slice(-9)}`;

function response(page: Page, method: string, suffix: string): Promise<Response> {
  return page.waitForResponse((r) => r.request().method() === method && new URL(r.url()).pathname.endsWith(`/api/${suffix}`), { timeout: 90_000 });
}

async function signup(page: Page, user: Actor): Promise<void> {
  await page.goto('/auth/signup');
  await page.locator('.role-card').filter({ hasText: user.role === 'shipper' ? /Shipper/i : /Truck\s*\/\s*Fleet Owner/i }).click();
  for (const [name, value] of Object.entries({ fullName: user.name, mobile: user.mobile!, email: user.email, password, confirmPassword: password })) {
    await page.locator(`input[name="${name}"]`).fill(value);
  }
  await page.locator('input[name="agreeTerms"]').check();
  const requested = response(page, 'POST', 'auth/signup/request-otp');
  await page.getByRole('button', { name: /create account/i }).click();
  expect((await requested).status()).toBe(200);
  await expect(page).toHaveURL(/otp-verification/, { timeout: 90_000 });
  const otp = await page.locator('.otp-debug strong').innerText();
  for (const [i, digit] of [...otp].entries()) await page.locator('.otp-box').nth(i).press(digit);
  await page.getByRole('button', { name: /verify otp/i }).click();
  await expect(page).toHaveURL(/profile-setup/, { timeout: 90_000 });
  await page.locator('input[name="designation"]').fill('KYC cancellation POD verification');
  await page.getByRole('button', { name: /finish setup/i }).click();
  await expect(page).toHaveURL(new RegExp(`/${user.role}/dashboard`), { timeout: 90_000 });
  user.token = await page.evaluate(() => localStorage.getItem('transportseva.access_token') ?? '');
}

async function login(page: Page, user: Actor): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.role === 'admin' ? 'password123' : password);
  const loggedIn = response(page, 'POST', 'auth/login');
  await page.getByRole('button', { name: /^log in$/i }).click();
  expect((await loggedIn).status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`/${user.role}/dashboard`), { timeout: 90_000 });
  user.token = await page.evaluate(() => localStorage.getItem('transportseva.access_token') ?? '');
}

async function api(page: Page, user: Actor, method: string, path: string, data?: unknown, expected = 200): Promise<any> {
  const base = await page.evaluate(() => window.TRANSPORTSEVA_CONFIG?.apiBaseUrl ?? 'http://localhost:8080/api');
  const result = await page.request.fetch(`${base}/${path}`, {
    method, headers: { Authorization: `Bearer ${user.token}`, Accept: 'application/json' },
    ...(data === undefined ? {} : { data }), timeout: 90_000,
  });
  expect(result.status(), `${method} ${path}: ${await result.text()}`).toBe(expected);
  return result.json();
}

async function bell(page: Page, title: string, key: string, id: string, expectedPath: string): Promise<void> {
  // Use the normal notification page to refresh the bell and make old, unseen
  // notifications discoverable even after repeated logins in one browser.
  const notices = response(page, 'GET', 'notifications');
  await page.reload();
  const payload = await (await notices).json();
  const list = Array.isArray(payload.data) ? payload.data : payload.data?.data ?? [];
  const notification = list.find((n: any) => n.title === title && n.data?.[key] === id);
  expect(notification, `Bell notification: ${title}`).toBeTruthy();
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  await page.locator(`[data-notification-id="${notification.id}"]`).click();
  await expect(page).toHaveURL(expectedPath, { timeout: 90_000 });
}

async function bookingCard(page: Page, user: Actor, booking: { uuid: string; booking_reference: string }): Promise<Locator> {
  await page.goto(`/${user.role}/bookings?booking=${booking.uuid}`);
  const card = page.locator('.card').filter({ hasText: booking.booking_reference }).first();
  await expect(card).toBeVisible({ timeout: 90_000 });
  if (await card.getByRole('button', { name: /view details/i }).count()) await card.getByRole('button', { name: /view details/i }).click();
  return card;
}

async function submitKyc(page: Page, user: Actor, expectedStatus: number): Promise<string> {
  await page.goto(`/${user.role}/kyc`);
  await expect(page.locator('#kyc-business-name')).toBeVisible({ timeout: 90_000 });
  await page.locator('#kyc-business-name').fill(`Verification Business ${user.role} ${run}`);
  await page.locator('#kyc-business-type').selectOption('company');
  await page.locator('#kyc-pan').fill('ABCDE1234F');
  await page.locator('#kyc-gstin').fill('27ABCDE1234F1Z5');
  await page.locator('#kyc-document').setInputFiles({ name: 'test-business-document.png', mimeType: 'image/png', buffer: png });
  const saved = response(page, 'POST', 'marketplace-kyc');
  await page.getByRole('button', { name: /submit for verification/i }).click();
  const result = await saved;
  expect(result.status()).toBe(expectedStatus);
  const profile = (await result.json()).data;
  expect(profile).not.toHaveProperty('document_path');
  expect(profile).not.toHaveProperty('pan_number');
  expect(profile.pan_last_four).toBe('******234F');
  await expect(page.getByText('Awaiting verification', { exact: true })).toBeVisible({ timeout: 90_000 });
  return profile.uuid;
}

async function createBooking(page: Page): Promise<any> {
  const load = (await api(page, shipper, 'POST', 'loads', {
    pickup_city: 'Delhi', drop_city: 'Jaipur', material: `Verification goods ${run}`, weight_tons: 12,
    vehicle_type: '32ft Trailer', budget: 20000,
  }, 201)).data;
  const application = (await api(page, owner, 'POST', `loads/${load.uuid}/applications`, {
    applicant_role: 'truck-owner', applicant_name: owner.name, vehicle_reg_number: registration,
    vehicle_type: '32ft Trailer', availability: 'Today', quoted_amount: 18000,
  }, 201)).data;
  await api(page, shipper, 'POST', `loads/${load.uuid}/applications/${application.uuid}/accept`, {});
  const booking = (await api(page, shipper, 'POST', `loads/${load.uuid}/applications/${application.uuid}/booking`, {}, 201)).data;
  console.log(`Created test load ${load.load_id ?? load.uuid}; booking ${booking.booking_reference} (${booking.uuid})`);
  return { ...booking, testLoad: load, testApplication: application };
}

async function requestCancellation(page: Page, user: Actor, booking: any, reason: string): Promise<string> {
  const card = await bookingCard(page, user, booking);
  await card.getByRole('button', { name: /request cancellation/i }).click();
  await page.locator('#cancellation-reason').fill(reason);
  const requested = response(page, 'POST', `marketplace-bookings/${booking.uuid}/disputes/cancellation-request`);
  await page.getByRole('button', { name: /send to transportseva/i }).click();
  const result = await requested;
  expect(result.status()).toBe(201);
  await expect(card.getByText(reason, { exact: true })).toBeVisible({ timeout: 90_000 });
  await expect(card.getByRole('button', { name: /request cancellation/i })).toHaveCount(0);
  return (await result.json()).data.uuid;
}

async function recordDecision(page: Page, booking: any, decision: 'continue' | 'cancel'): Promise<void> {
  const card = await bookingCard(page, admin, booking);
  await card.getByRole('button', { name: /record decision after call/i }).click();
  await page.locator('#decision-booking').selectOption(decision);
  await page.locator('#decision-owner-token').selectOption(decision === 'cancel' ? 'refund' : 'no_action');
  await page.locator('#decision-provider-token').selectOption('no_action');
  await page.locator('#decision-commission').selectOption(decision === 'cancel' ? 'waive' : 'no_action');
  await page.locator('#decision-summary').fill(`E2E phone review: ${decision}. Decision recorded only; no funds transferred.`);
  const saved = page.waitForResponse((r) => r.request().method() === 'POST' && /\/api\/marketplace-disputes\/[^/]+\/resolve$/.test(new URL(r.url()).pathname), { timeout: 90_000 });
  await page.getByRole('dialog').getByRole('button', { name: /record decision after call/i }).click();
  const result = await saved;
  expect(result.status()).toBe(200);
  expect((await result.json()).message).toContain('No payment or refund was processed');
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 90_000 });
}

test.describe.serial('KYC cancellation and POD verification (no real payments or GPS)', () => {
  test.afterEach(async ({}, info) => {
    await info.attach('verification-records.json', { body: Buffer.from(JSON.stringify(evidence, null, 2)), contentType: 'application/json' });
  });

  test('KYC submission, correction, approval, document privacy and bell navigation', async ({ page }) => {
    test.setTimeout(1_080_000);
    await signup(page, shipper);
    const shipperKyc = await submitKyc(page, shipper, 201);
    await signup(page, owner);
    const ownerKyc = await submitKyc(page, owner, 201);
    evidence.kyc = { shipper: shipperKyc, owner: ownerKyc };
    await api(page, owner, 'GET', `marketplace-kyc/${shipperKyc}/document`, undefined, 403);
    await api(page, owner, 'GET', 'admin/marketplace-kyc', undefined, 403);

    await login(page, admin);
    await bell(page, 'KYC awaiting review', 'kyc_profile_uuid', shipperKyc, 'http://localhost:4300/admin/kyc');
    let card = page.locator('.kyc-card').filter({ hasText: shipper.name });
    await expect(card).toBeVisible({ timeout: 90_000 });
    const download = page.waitForEvent('download');
    await card.getByRole('button', { name: 'test-business-document.png', exact: true }).click();
    expect((await download).suggestedFilename()).toBe('test-business-document.png');
    await card.getByRole('button', { name: /request changes/i }).click();
    await page.locator('#kyc-rejection-note').fill('Please upload a clearer copy of the supporting document.');
    let moderated = response(page, 'PATCH', `admin/marketplace-kyc/${shipperKyc}`);
    await page.getByRole('button', { name: /send feedback/i }).click();
    expect((await moderated).status()).toBe(200);
    card = page.locator('.kyc-card').filter({ hasText: owner.name });
    moderated = response(page, 'PATCH', `admin/marketplace-kyc/${ownerKyc}`);
    await card.getByRole('button', { name: /approve kyc/i }).click();
    expect((await moderated).status()).toBe(200);

    await login(page, shipper);
    await bell(page, 'KYC needs changes', 'kyc_profile_uuid', shipperKyc, 'http://localhost:4300/shipper/kyc');
    await expect(page.getByText('Please upload a clearer copy of the supporting document.', { exact: false })).toBeVisible({ timeout: 90_000 });
    expect(await submitKyc(page, shipper, 200)).toBe(shipperKyc);
    await login(page, admin);
    await page.goto('/admin/kyc');
    card = page.locator('.kyc-card').filter({ hasText: shipper.name });
    await expect(card).toBeVisible({ timeout: 90_000 });
    moderated = response(page, 'PATCH', `admin/marketplace-kyc/${shipperKyc}`);
    await card.getByRole('button', { name: /approve kyc/i }).click();
    expect((await moderated).status()).toBe(200);
    await login(page, shipper);
    await bell(page, 'KYC approved', 'kyc_profile_uuid', shipperKyc, 'http://localhost:4300/shipper/kyc');
    await expect(page.getByText('KYC approved', { exact: true })).toBeVisible({ timeout: 90_000 });
    await expect(page.locator('#kyc-pan')).toHaveCount(0);
    await login(page, owner);
    await bell(page, 'KYC approved', 'kyc_profile_uuid', ownerKyc, 'http://localhost:4300/truck-owner/kyc');
    await expect(page.getByText('KYC approved', { exact: true })).toBeVisible({ timeout: 90_000 });
    await api(page, owner, 'POST', 'marketplace-vehicles', { registration_number: registration, vehicle_type: '32ft Trailer', make: 'Tata', model: 'Verification', capacity_tons: 20 }, 201);
    console.log(`KYC users: ${shipper.email}, ${owner.email}; password ${password}`);
  });

  test('cancellation pauses booking, admin continues or cancels, both parties receive linked decisions', async ({ page }) => {
    test.setTimeout(900_000);
    await login(page, shipper);
    await login(page, owner);
    const booking = await createBooking(page);
    evidence.cancellationBooking = booking;
    const reason = `Delivery appointment changed; please review cancellation ${run}.`;
    const dispute = await requestCancellation(page, owner, booking, reason);
    await api(page, owner, 'POST', `marketplace-bookings/${booking.uuid}/workflow`, { action: 'start_trip' }, 422);
    await api(page, shipper, 'POST', `marketplace-disputes/${dispute}/resolve`, {
      resolution: 'cancel', owner_token_decision: 'refund', provider_token_decision: 'no_action',
      commission_decision: 'waive', summary: 'A participant must not be allowed to make the admin decision.',
    }, 403);
    await login(page, shipper);
    await bell(page, 'Cancellation requested', 'booking_uuid', booking.uuid, `http://localhost:4300/shipper/bookings?booking=${booking.uuid}`);
    await login(page, admin);
    await bell(page, 'Cancellation decision required', 'booking_uuid', booking.uuid, `http://localhost:4300/admin/bookings?booking=${booking.uuid}`);
    await recordDecision(page, booking, 'continue');
    await login(page, shipper);
    await bell(page, 'Dispute resolved', 'booking_uuid', booking.uuid, `http://localhost:4300/shipper/bookings?booking=${booking.uuid}`);
    let card = await bookingCard(page, shipper, booking);
    await expect(card.getByRole('button', { name: /request cancellation/i })).toBeVisible();
    await requestCancellation(page, shipper, booking, `Second review: delivery remains unavailable ${run}.`);
    await login(page, admin);
    await recordDecision(page, booking, 'cancel');
    for (const participant of [owner, shipper]) {
      await login(page, participant);
      await bell(page, 'Dispute resolved', 'booking_uuid', booking.uuid, `http://localhost:4300/${participant.role}/bookings?booking=${booking.uuid}`);
      card = await bookingCard(page, participant, booking);
      await expect(card.getByText('Cancelled', { exact: true }).first()).toBeVisible({ timeout: 90_000 });
      await expect(card.getByText(/Decision recorded only; no funds transferred/i)).toBeVisible();
      await expect(card.getByRole('button', { name: /request cancellation|start trip|pay token/i })).toHaveCount(0);
    }
  });

  test('POD correction, private download, unrelated-user denial and approval lock', async ({ page }) => {
    test.setTimeout(1_080_000);
    await signup(page, outsider);
    await login(page, shipper);
    await login(page, owner);
    const booking = await createBooking(page);
    evidence.podBooking = booking;
    // Only the existing local mock provider is permitted for token fixtures.
    expect(await page.evaluate(() => window.TRANSPORTSEVA_CONFIG?.paymentProvider)).toBe('mock');
    for (const participant of [shipper, owner]) {
      const order = (await api(page, participant, 'POST', `marketplace-bookings/${booking.uuid}/token-orders`, {}, 201)).data;
      const checkout = (await api(page, participant, 'POST', `marketplace-bookings/${booking.uuid}/token-orders/${order.uuid}/checkout`, {})).data;
      expect(checkout.payment_session_id).toMatch(/^mock_session_/);
      await api(page, participant, 'GET', `marketplace-bookings/${booking.uuid}/token-orders/${order.uuid}/status`);
    }
    const driver = (await api(page, owner, 'POST', 'marketplace-drivers', { name: `POD Driver ${run}`, phone: `8${run.slice(-9)}`, license_number: `POD${run}`, experience_years: 5 }, 201)).data;
    const transition = (user: Actor, action: string, data: Record<string, unknown> = {}) => api(page, user, 'POST', `marketplace-bookings/${booking.uuid}/workflow`, { action, ...data });
    await transition(owner, 'assign_vehicle', { mode: 'Own Fleet', vehicle_reg_number: registration });
    await transition(owner, 'assign_driver', { driver_uuid: driver.uuid });
    await transition(owner, 'loading_completed');
    await transition(shipper, 'confirm_loading');
    let card = await bookingCard(page, owner, booking);
    await expect(card.getByRole('button', { name: /request cancellation/i })).toBeVisible();
    await transition(owner, 'start_trip');
    card = await bookingCard(page, owner, booking);
    await expect(card.getByRole('button', { name: /request cancellation/i })).toHaveCount(0);
    const completed = response(page, 'POST', `marketplace-bookings/${booking.uuid}/workflow`);
    await card.getByRole('button', { name: /mark trip completed/i }).click();
    expect((await completed).status()).toBe(200);
    const upload = async (corrected: boolean) => {
      await card.getByRole('button', { name: corrected ? /upload corrected pod/i : /^upload pod$/i }).click();
      await page.locator('#pod-number').fill(`POD-${run}${corrected ? '-CORRECTED' : ''}`);
      await page.locator('#pod-received-by').fill('Test Consignee');
      await page.locator('#pod-file').setInputFiles({ name: corrected ? 'corrected-pod.png' : 'initial-pod.png', mimeType: 'image/png', buffer: png });
      const submitted = response(page, 'POST', `marketplace-bookings/${booking.uuid}/pod`);
      await page.getByRole('button', { name: /submit pod/i }).click();
      const result = await submitted;
      expect(result.status()).toBe(201);
      expect((await result.json()).data.workflow.pod).not.toHaveProperty('file_path');
      await expect(card.getByText('Pending Approval', { exact: true })).toBeVisible({ timeout: 90_000 });
    };
    await upload(false);
    await api(page, outsider, 'GET', `marketplace-bookings/${booking.uuid}/pod/download`, undefined, 403);
    await api(page, outsider, 'POST', `marketplace-bookings/${booking.uuid}/pod/review`, { decision: 'approved' }, 403);
    await api(page, shipper, 'POST', `marketplace-bookings/${booking.uuid}/settle`, {}, 422);
    await login(page, shipper);
    await bell(page, 'Proof of delivery submitted', 'booking_uuid', booking.uuid, `http://localhost:4300/shipper/bookings?booking=${booking.uuid}`);
    card = await bookingCard(page, shipper, booking);
    const downloaded = page.waitForEvent('download');
    await card.getByRole('button', { name: /download signed pod/i }).click();
    expect((await downloaded).suggestedFilename()).toBe('initial-pod.png');
    await expect(card.getByRole('button', { name: /prepare settlement/i })).toBeDisabled();
    await card.getByRole('button', { name: /request correction/i }).click();
    await page.locator('#pod-review-note').fill('Please include the receiver signature clearly.');
    let reviewed = response(page, 'POST', `marketplace-bookings/${booking.uuid}/pod/review`);
    await page.getByRole('dialog').getByRole('button', { name: /request correction/i }).click();
    expect((await reviewed).status()).toBe(200);
    await login(page, owner);
    await bell(page, 'POD needs correction', 'booking_uuid', booking.uuid, `http://localhost:4300/truck-owner/bookings?booking=${booking.uuid}`);
    card = await bookingCard(page, owner, booking);
    await expect(card.getByText('Please include the receiver signature clearly.', { exact: true })).toBeVisible();
    await upload(true);
    await login(page, shipper);
    card = await bookingCard(page, shipper, booking);
    await card.getByRole('button', { name: /^approve pod$/i }).click();
    reviewed = response(page, 'POST', `marketplace-bookings/${booking.uuid}/pod/review`);
    await page.getByRole('dialog').getByRole('button', { name: /^approve pod$/i }).click();
    expect((await reviewed).status()).toBe(200);
    await expect(card.getByRole('button', { name: /prepare settlement/i })).toBeEnabled({ timeout: 90_000 });
    await api(page, shipper, 'POST', `marketplace-bookings/${booking.uuid}/pod/review`, { decision: 'rejected', review_note: 'Trying to reopen approved POD' }, 422);
    await login(page, owner);
    card = await bookingCard(page, owner, booking);
    await expect(card.getByRole('button', { name: /upload.*pod/i })).toHaveCount(0);
    await expect(card.getByText(/POD approved/)).toBeVisible({ timeout: 90_000 });
    const base = await page.evaluate(() => window.TRANSPORTSEVA_CONFIG?.apiBaseUrl ?? 'http://localhost:8080/api');
    const overwrite = await page.request.post(`${base}/marketplace-bookings/${booking.uuid}/pod`, {
      headers: { Authorization: `Bearer ${owner.token}`, Accept: 'application/json' },
      multipart: { pod_number: 'UNAUTHORISED-REPLACEMENT', received_by_name: 'Test Consignee', file: { name: 'replacement.png', mimeType: 'image/png', buffer: png } },
      timeout: 90_000,
    });
    expect(overwrite.status()).toBe(422);
    expect((await overwrite.json()).message).toContain('approved POD is locked');
  });
});
