import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const password = 'TransportSevaE2E@2026';
// Resume only pristine, confirmed fixtures from a stopped setup run; never
// rewrite existing assignments or reset a booking to make a rerun pass.
const previousReport = process.env.E2E_ALLOCATION_SETUP_REPORT
  ? JSON.parse(readFileSync(process.env.E2E_ALLOCATION_SETUP_REPORT, 'utf8')) : null;
const previousAttachment = previousReport?.suites[0]?.specs[0]?.tests[0]?.results[0]?.attachments
  .find((item: { name: string }) => item.name === 'fleet-allocation-records.json');
const previous = previousAttachment ? JSON.parse(Buffer.from(previousAttachment.body, 'base64').toString()) : null;
const run = previous?.run ?? String(Date.now());
type Actor = { role: 'shipper' | 'truck-owner' | 'admin'; email: string; token?: string };
type Booking = { uuid: string; booking_reference: string; load: { uuid: string; load_id: string } };
const shipper: Actor = { role: 'shipper', email: process.env.E2E_SHIPPER_EMAIL ?? 'verify-shipper-1793028294862-61@transportseva.test' };
const owner: Actor = { role: 'truck-owner', email: process.env.E2E_OWNER_EMAIL ?? 'verify-truck-owner-1793028294862-62@transportseva.test' };
const admin: Actor = { role: 'admin', email: 'admin@test.local' };
const registrations: string[] = previous?.vehicles ?? [`ALLOC${run.slice(-9)}A`, `ALLOC${run.slice(-9)}B`];
let base = 'http://localhost:8080/api';
const evidence: Record<string, unknown> = {
  ...previous,
  run, database: 'transportseva', existingUsers: [shipper.email, owner.email], password,
  vehicles: registrations, bookings: previous?.bookings ?? [], realPayments: 'skipped', gps: 'skipped',
};

const response = (page: Page, method: string, path: string) => page.waitForResponse(
  (result) => result.request().method() === method && new URL(result.url()).pathname.endsWith(`/api/${path}`),
  { timeout: 90_000 },
);

async function login(page: Page, actor: Actor): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(actor.email);
  await page.locator('input[name="password"]').fill(actor.role === 'admin' ? 'password123' : password);
  const loggedIn = response(page, 'POST', 'auth/login');
  await page.getByRole('button', { name: /^log in$/i }).click();
  expect((await loggedIn).status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`/${actor.role}/dashboard`), { timeout: 90_000 });
  actor.token = await page.evaluate(() => localStorage.getItem('transportseva.access_token') ?? '');
  base = await page.evaluate(() => window.TRANSPORTSEVA_CONFIG?.apiBaseUrl ?? 'http://localhost:8080/api');
}

async function api(page: Page, actor: Actor, method: string, path: string, data?: unknown, expected = 200): Promise<any> {
  const result = await page.request.fetch(`${base}/${path}`, {
    method, headers: { Authorization: `Bearer ${actor.token}`, Accept: 'application/json' },
    ...(data === undefined ? {} : { data }), timeout: 90_000,
  });
  expect(result.status(), `${method} ${path}: ${await result.text()}`).toBe(expected);
  return result.json();
}

async function createBooking(page: Page): Promise<Booking> {
  const load = (await api(page, shipper, 'POST', 'loads', {
    posted_by_role: 'shipper', posted_by_name: 'Allocation Test Shipper', pickup_city: 'Delhi', drop_city: 'Jaipur',
    material: 'Allocation test goods', weight_tons: 12, vehicle_type: '32ft Trailer', budget: 20000,
  }, 201)).data;
  const application = (await api(page, owner, 'POST', `loads/${load.uuid}/applications`, {
    applicant_role: 'truck-owner', applicant_name: 'Allocation Test Fleet Owner', vehicle_reg_number: registrations[0],
    vehicle_type: '32ft Trailer', availability: 'Today', quoted_amount: 18000,
  }, 201)).data;
  await api(page, shipper, 'POST', `loads/${load.uuid}/applications/${application.uuid}/accept`, {});
  const booking = (await api(page, shipper, 'POST', `loads/${load.uuid}/applications/${application.uuid}/booking`, {}, 201)).data;
  const record = { uuid: booking.uuid, booking_reference: booking.booking_reference, load };
  (evidence['bookings'] as Booking[]).push(record);
  console.log(`Allocation test: ${load.load_id}; ${booking.booking_reference} (${booking.uuid})`);
  for (const actor of [shipper, owner]) {
    const order = (await api(page, actor, 'POST', `marketplace-bookings/${booking.uuid}/token-orders`, {}, 201)).data;
    const checkout = (await api(page, actor, 'POST', `marketplace-bookings/${booking.uuid}/token-orders/${order.uuid}/checkout`, {})).data;
    expect(checkout.payment_session_id).toMatch(/^mock_session_/);
    await api(page, actor, 'GET', `marketplace-bookings/${booking.uuid}/token-orders/${order.uuid}/status`);
  }
  return record;
}

async function openBooking(page: Page, actor: Actor, booking: Booking): Promise<Locator> {
  await page.goto(`/${actor.role}/bookings?booking=${booking.uuid}`);
  const card = page.locator('.card').filter({ hasText: booking.booking_reference }).first();
  const timeout = page.getByRole('alert').filter({ hasText: 'Loading bookings took too long. Please retry.' });
  // Exercise the visible recovery path on the single-process local server;
  // do not reload the browser or change a booking to bypass a failed request.
  for (let attempt = 0; attempt < 2; attempt++) {
    await expect(card.or(timeout)).toBeVisible({ timeout: 45_000 });
    if (await card.isVisible()) break;
    evidence['bookingListTimeoutRetries'] = Number(evidence['bookingListTimeoutRetries'] ?? 0) + 1;
    console.log(`Retrying timed-out list for ${booking.booking_reference}`);
    await timeout.getByRole('button', { name: /^retry$/i }).click();
  }
  await expect(card).toBeVisible({ timeout: 90_000 });
  if (await card.getByRole('button', { name: /view details/i }).count()) await card.getByRole('button', { name: /view details/i }).click();
  return card;
}

async function assign(page: Page, booking: Booking): Promise<number> {
  const assigned = response(page, 'POST', `marketplace-bookings/${booking.uuid}/workflow`);
  await page.getByRole('dialog').getByRole('button', { name: /^assign$/i }).click();
  return (await assigned).status();
}

async function workflowClick(page: Page, card: Locator, booking: Booking, label: RegExp): Promise<void> {
  const changed = response(page, 'POST', `marketplace-bookings/${booking.uuid}/workflow`);
  await card.getByRole('button', { name: label }).click();
  expect((await changed).status()).toBe(200);
}

test('competing bookings reserve fleet once and release it after cancellation and delivery', async ({ page, context }) => {
  test.setTimeout(1_200_000);
  try {
    await login(page, shipper);
    await login(page, owner);
    expect(await page.evaluate(() => window.TRANSPORTSEVA_CONFIG?.paymentProvider)).toBe('mock');
    if (!previous) for (const registration of registrations) {
      await api(page, owner, 'POST', 'marketplace-vehicles', {
        registration_number: registration, vehicle_type: '32ft Trailer', make: 'Tata', model: 'Allocation test', capacity_tons: 20,
      }, 201);
    }
    const driver = previous?.driver ?? (await api(page, owner, 'POST', 'marketplace-drivers', {
      name: `Allocation Driver ${run}`, phone: `8${run.slice(-9)}`, license_number: `ALLOC${run}`, experience_years: 5,
    }, 201)).data;
    evidence['driver'] = { uuid: driver.uuid, name: driver.name };
    const first: Booking = previous?.bookings[0] ?? await createBooking(page);
    const second: Booking = previous?.bookings[1] ?? await createBooking(page);
    const third: Booking = previous?.bookings[2] ?? await createBooking(page);
    if (previous) for (const booking of [first, second, third]) {
      const saved = (await api(page, owner, 'GET', `marketplace-bookings/${booking.uuid}`)).data;
      expect(saved.status).toBe('confirmed');
      expect(saved.workflow?.vehicle_assignment).toBeFalsy();
      expect(saved.workflow?.driver_assignment).toBeFalsy();
    }

    // Two visible tabs deliberately load the same availability before either
    // assignment succeeds. Separate PHP-process tests cover real DB contention.
    const otherPage = await context.newPage();
    const pages = [page, otherPage];
    const bookings = [first, second];
    const cards = [await openBooking(page, owner, first), await openBooking(otherPage, owner, second)];
    for (const [index, tab] of pages.entries()) {
      await cards[index].getByRole('button', { name: /assign vehicle/i }).click();
      await expect(tab.locator('select[name="vehicleRegInput"] option').filter({ hasText: registrations[0] })).toBeEnabled({ timeout: 90_000 });
      await tab.locator('select[name="vehicleRegInput"]').selectOption(registrations[0]);
    }
    const vehicleResults = await Promise.all(pages.map((tab, index) => assign(tab, bookings[index])));
    expect([...vehicleResults].sort()).toEqual([200, 422]);
    evidence['vehicleRaceStatuses'] = vehicleResults;
    console.log(`Vehicle conflict: ${vehicleResults.join(', ')}`);
    const vehicleWinnerIndex = vehicleResults.indexOf(200);
    const vehicleLoserIndex = 1 - vehicleWinnerIndex;
    const loserPage = pages[vehicleLoserIndex];
    await expect(loserPage.getByRole('dialog').getByRole('alert')).toContainText('This vehicle is already assigned to an active booking.');
    await loserPage.getByRole('dialog').getByRole('button', { name: /^cancel$/i }).click();
    let card = await openBooking(loserPage, owner, bookings[vehicleLoserIndex]);
    await card.getByRole('button', { name: /assign vehicle/i }).click();
    await expect(loserPage.locator('select[name="vehicleRegInput"] option').filter({ hasText: registrations[0] })).toBeDisabled({ timeout: 90_000 });
    await loserPage.locator('select[name="vehicleRegInput"]').selectOption(registrations[1]);
    expect(await assign(loserPage, bookings[vehicleLoserIndex])).toBe(200);
    const registrationFor = (index: number) => registrations[index === vehicleWinnerIndex ? 0 : 1];

    for (const [index, tab] of pages.entries()) {
      const booking = await openBooking(tab, owner, bookings[index]);
      await booking.getByRole('button', { name: /assign driver/i }).click();
      const option = tab.locator('select[name="driverIdInput"] option').filter({ hasText: driver.name });
      await expect(option).toBeEnabled({ timeout: 90_000 });
      await tab.locator('select[name="driverIdInput"]').selectOption(driver.uuid);
    }
    const driverResults = await Promise.all(pages.map((tab, index) => assign(tab, bookings[index])));
    expect([...driverResults].sort()).toEqual([200, 422]);
    evidence['driverRaceStatuses'] = driverResults;
    console.log(`Driver conflict: ${driverResults.join(', ')}`);
    const driverWinnerIndex = driverResults.indexOf(200);
    const driverLoserIndex = 1 - driverWinnerIndex;
    await expect(pages[driverLoserIndex].getByRole('dialog').getByRole('alert')).toContainText('This driver is already assigned to an active booking.');
    await pages[driverLoserIndex].getByRole('dialog').getByRole('button', { name: /^cancel$/i }).click();
    const cancelled = bookings[driverWinnerIndex];
    const survivor = bookings[driverLoserIndex];
    const cancelledRegistration = registrationFor(driverWinnerIndex);
    const survivorRegistration = registrationFor(driverLoserIndex);
    await otherPage.close();
    evidence['cancelledBooking'] = cancelled.booking_reference;
    evidence['deliveredBooking'] = survivor.booking_reference;

    card = await openBooking(page, owner, cancelled);
    await card.getByRole('button', { name: /request cancellation/i }).click();
    await page.locator('#cancellation-reason').fill('Allocation test: appointment changed; review by operations.');
    const requested = response(page, 'POST', `marketplace-bookings/${cancelled.uuid}/disputes/cancellation-request`);
    await page.getByRole('button', { name: /send to transportseva/i }).click();
    expect((await requested).status()).toBe(201);
    // An open dispute must retain its reservations until the admin decides.
    let vehicles = (await api(page, owner, 'GET', 'marketplace-vehicles')).data;
    expect(vehicles.find((v: any) => v.registration_number === cancelledRegistration).is_busy).toBe(true);
    await login(page, admin);
    card = await openBooking(page, admin, cancelled);
    await card.getByRole('button', { name: /record decision after call/i }).click();
    await page.locator('#decision-booking').selectOption('cancel');
    for (const id of ['decision-owner-token', 'decision-provider-token', 'decision-commission']) await page.locator(`#${id}`).selectOption('no_action');
    await page.locator('#decision-summary').fill('Allocation test cancellation after simulated phone review. No funds moved.');
    const decided = page.waitForResponse((result) => result.request().method() === 'POST' && /\/api\/marketplace-disputes\/[^/]+\/resolve$/.test(new URL(result.url()).pathname), { timeout: 90_000 });
    await page.getByRole('dialog').getByRole('button', { name: /record decision after call/i }).click();
    expect((await decided).status()).toBe(200);
    console.log(`Admin cancelled ${cancelled.booking_reference}; checking resource reuse`);

    await login(page, owner);
    card = await openBooking(page, owner, third);
    await card.getByRole('button', { name: /assign vehicle/i }).click();
    await expect(page.locator('select[name="vehicleRegInput"] option').filter({ hasText: cancelledRegistration })).toBeEnabled({ timeout: 90_000 });
    await expect(page.locator('select[name="vehicleRegInput"] option').filter({ hasText: survivorRegistration })).toBeDisabled();
    await page.getByRole('dialog').getByRole('button', { name: /^cancel$/i }).click();
    card = await openBooking(page, owner, survivor);
    await card.getByRole('button', { name: /assign driver/i }).click();
    await expect(page.locator('select[name="driverIdInput"] option').filter({ hasText: driver.name })).toBeEnabled({ timeout: 90_000 });
    await page.locator('select[name="driverIdInput"]').selectOption(driver.uuid);
    expect(await assign(page, survivor)).toBe(200);
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 90_000 });
    await workflowClick(page, card, survivor, /mark loading completed/i);
    await login(page, shipper);
    card = await openBooking(page, shipper, survivor);
    await workflowClick(page, card, survivor, /confirm loading/i);
    await login(page, owner);
    card = await openBooking(page, owner, survivor);
    await workflowClick(page, card, survivor, /^start trip$/i);
    vehicles = (await api(page, owner, 'GET', 'marketplace-vehicles')).data;
    expect(vehicles.find((v: any) => v.registration_number === survivorRegistration).availability_status).toBe('on_trip');
    await expect(card.getByRole('button', { name: /mark trip completed/i })).toBeVisible({ timeout: 90_000 });
    await workflowClick(page, card, survivor, /mark trip completed/i);
    console.log(`Delivered ${survivor.booking_reference}; checking reuse before payment`);

    // Resources are reusable at delivery; settlement and real payment are not
    // part of this allocation test.
    card = await openBooking(page, owner, third);
    await card.getByRole('button', { name: /assign vehicle/i }).click();
    for (const registration of registrations) await expect(page.locator('select[name="vehicleRegInput"] option').filter({ hasText: registration })).toBeEnabled({ timeout: 90_000 });
    await page.locator('select[name="vehicleRegInput"]').selectOption(survivorRegistration);
    expect(await assign(page, third)).toBe(200);
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 90_000 });
    await card.getByRole('button', { name: /assign driver/i }).click();
    await expect(page.locator('select[name="driverIdInput"] option').filter({ hasText: driver.name })).toBeEnabled({ timeout: 90_000 });
    await page.locator('select[name="driverIdInput"]').selectOption(driver.uuid);
    expect(await assign(page, third)).toBe(200);
    for (const booking of [cancelled, survivor]) {
      await api(page, owner, 'POST', `marketplace-bookings/${booking.uuid}/workflow`, { action: 'assign_vehicle', mode: 'Own Fleet', vehicle_reg_number: cancelledRegistration }, 422);
      await api(page, owner, 'POST', `marketplace-bookings/${booking.uuid}/workflow`, { action: 'assign_driver', driver_uuid: driver.uuid }, 422);
      const saved = (await api(page, owner, 'GET', `marketplace-bookings/${booking.uuid}`)).data;
      expect(saved.workflow.vehicle_assignment).toBeTruthy();
      expect(saved.workflow.driver_assignment).toBeTruthy();
    }
    await page.goto('/truck-owner/vehicles');
    await expect(page.locator('tr').filter({ hasText: survivorRegistration }).getByText('Reserved', { exact: true })).toBeVisible({ timeout: 90_000 });
    await expect(page.locator('tr').filter({ hasText: cancelledRegistration }).getByText('Idle', { exact: true })).toBeVisible();
    evidence['finalResourceHolder'] = third.booking_reference;
  } finally {
    await test.info().attach('fleet-allocation-records.json', { body: Buffer.from(JSON.stringify(evidence, null, 2)), contentType: 'application/json' });
  }
});

test('stalled booking requests show a retryable error instead of spinning indefinitely', async ({ page }) => {
  test.setTimeout(180_000);
  await login(page, owner);
  let intercepted = false;
  const stalled = '**/api/marketplace-bookings?*';
  await page.route(stalled, () => { intercepted = true; });
  await page.goto('/truck-owner/bookings');
  await expect.poll(() => intercepted).toBe(true);
  await expect(page.getByRole('alert')).toContainText('Loading bookings took too long. Please retry.', { timeout: 40_000 });
  await expect(page.getByRole('button', { name: 'Refresh bookings' })).toBeEnabled();
  await page.unroute(stalled);
  const loaded = response(page, 'GET', 'marketplace-bookings');
  await page.getByRole('button', { name: /^retry$/i }).click();
  expect((await loaded).status()).toBe(200);
  await expect(page.getByText('Loading bookings took too long. Please retry.')).toHaveCount(0);
  await expect(page.locator('.card').filter({ hasText: 'TS-' }).first()).toBeVisible({ timeout: 90_000 });
});
