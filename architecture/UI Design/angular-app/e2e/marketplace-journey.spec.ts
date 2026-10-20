import { expect, test, type Page } from '@playwright/test';

const password = 'TransportSevaE2E@2026';
const runId = `${Date.now()}`.slice(-8);

function testUser(role: 'shipper' | 'truck-owner', sequence: number) {
  const mobileTail = String((Number(runId) + sequence) % 1_000_000_000).padStart(9, '0');
  return {
    role,
    name: `Marketplace ${role === 'shipper' ? 'Shipper' : 'Fleet Owner'} ${sequence}`,
    email: `e2e-${role}-${runId}-${sequence}@transportseva.test`,
    mobile: `6${mobileTail}`,
  };
}

async function signUpAndCompleteProfile(
  page: Page,
  user: ReturnType<typeof testUser>,
): Promise<void> {
  await page.goto('/auth/signup');
  // Role cards also contain their help-button labels, so match their visible
  // role text rather than treating the full card content as the exact label.
  await page.locator('.role-card').filter({
    hasText: user.role === 'shipper' ? /Shipper/i : /Truck\s*\/\s*Fleet Owner/i,
  }).click();
  await page.locator('input[name="fullName"]').fill(user.name);
  await page.locator('input[name="mobile"]').fill(user.mobile);
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.locator('input[name="agreeTerms"]').check();
  // Capture the real OTP API response as evidence. The local PHP dev server
  // can briefly queue requests while a visible browser session is polling;
  // navigation alone hid that distinction during failures.
  const otpRequested = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith('/api/auth/signup/request-otp'),
    { timeout: 45_000 },
  );
  await page.getByRole('button', { name: /create account/i }).click();

  expect((await otpRequested).status()).toBe(200);
  await expect(page).toHaveURL(/\/auth\/otp-verification\?next=signup/, { timeout: 45_000 });
  const otp = await page.locator('.otp-debug strong').innerText();
  expect(otp).toMatch(/^\d{6}$/);
  // The app advances focus after each keystroke. Click and press each digit
  // so the assertion verifies every reactive OTP box before submitting.
  const otpInputs = page.locator('.otp-box');
  for (const [index, digit] of [...otp].entries()) {
    const input = otpInputs.nth(index);
    await input.click();
    await input.press(digit);
    await expect(input).toHaveValue(digit);
  }
  await page.getByRole('button', { name: /verify otp/i }).click();

  await expect(page).toHaveURL(/\/auth\/profile-setup/);
  await page.locator('input[name="designation"]').fill('Marketplace test user');
  await page.getByRole('button', { name: /finish setup/i }).click();
  await expect(page).toHaveURL(new RegExp(`/${user.role === 'shipper' ? 'shipper' : 'truck-owner'}/dashboard`));
}

async function login(page: Page, user: ReturnType<typeof testUser>): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(user.email);
  await page.locator('input[name="password"]').fill(password);
  const loginResponse = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith('/api/auth/login'),
    { timeout: 45_000 },
  );
  await page.getByRole('button', { name: /^log in$/i }).click();
  expect((await loginResponse).status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`/${user.role === 'shipper' ? 'shipper' : 'truck-owner'}/dashboard`), { timeout: 45_000 });
}

async function postLoad(page: Page): Promise<string> {
  await page.goto('/shipper/post-load');
  await page.locator('input#pickup-city').fill('Delhi');
  await page.locator('input#drop-city').fill('Navi Mumbai');
  await page.locator('input[name="material"]').fill('E2E steel coils');
  await page.locator('input[name="weightTons"]').fill('16');
  await page.locator('select[name="vehicleType"]').selectOption({ label: '32ft Trailer' });
  await page.locator('input[name="budget"]').fill('20000');

  const response = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith('/api/loads'),
  );
  await page.getByRole('button', { name: /post load to marketplace/i }).click();
  const payload = await (await response).json() as { data: { uuid: string } };
  expect(payload.data.uuid).toBeTruthy();
  await expect(page.getByText(/load .* posted successfully/i)).toBeVisible();
  return payload.data.uuid;
}

async function registerVehicle(page: Page, registrationNumber: string): Promise<void> {
  await page.goto('/truck-owner/vehicles');
  await page.getByRole('button', { name: /add vehicle/i }).first().click();
  await page.locator('input[name="regNumber"]').fill(registrationNumber);
  await page.locator('input[name="make"]').fill('Tata');
  await page.locator('input[name="model"]').fill('Signa E2E');
  await page.locator('select[name="vehicleType"]').selectOption({ label: '32ft Trailer' });
  await page.locator('input[name="yearOfMake"]').fill('2024');
  await page.locator('input[name="capacityTons"]').fill('24');

  const response = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith('/api/marketplace-vehicles'),
  );
  await page.getByRole('button', { name: /^add vehicle$/i }).last().click();
  expect((await response).status()).toBe(201);
  await expect(page.getByText(registrationNumber, { exact: true })).toBeVisible();
}

async function applyForLoad(page: Page, loadUuid: string, registrationNumber: string, quote: string): Promise<void> {
  await page.goto(`/truck-owner/load-board/${loadUuid}`);
  await page.getByRole('button', { name: /apply for this load/i }).click();

  const vehicleSelect = page.locator('select[name="vehicleRegNumber"]');
  await expect(vehicleSelect.locator('option', { hasText: registrationNumber })).toHaveCount(1);
  await vehicleSelect.selectOption(registrationNumber);
  await expect(page.locator('select[name="vehicleType"]')).toHaveCount(0);

  await page.locator('input[name="availability"]').fill('Available today');
  await page.locator('input[name="quotedAmount"]').fill(quote);
  const response = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST' && /\/api\/loads\/[^/]+\/applications$/.test(new URL(candidate.url()).pathname),
  );
  await page.getByRole('button', { name: /submit application/i }).click();
  expect((await response).status()).toBe(201);
  await expect(page.getByText(/your application/i)).toBeVisible();
}

async function acceptApplicationAndCreateBooking(page: Page, quote: string): Promise<{ uuid: string; booking_reference: string }> {
  const formattedQuote = new Intl.NumberFormat('en-IN').format(Number(quote));
  const acceptButton = page.getByRole('button', {
    name: new RegExp(`accept\\s*₹${formattedQuote}`, 'i'),
  });
  await expect(acceptButton).toBeVisible({ timeout: 90_000 });
  await acceptButton.click({ timeout: 20_000 });
  const confirmation = page.getByRole('button', { name: /^confirm$/i });
  await expect(confirmation).toBeVisible({ timeout: 20_000 });
  const accepted = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST'
      && /\/api\/loads\/[^/]+\/applications\/[^/]+\/accept$/.test(new URL(candidate.url()).pathname),
    { timeout: 45_000 },
  );
  const booking = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST'
      && /\/api\/loads\/[^/]+\/applications\/[^/]+\/booking$/.test(new URL(candidate.url()).pathname),
    { timeout: 45_000 },
  );
  await confirmation.click({ timeout: 20_000 });
  expect((await accepted).status()).toBe(200);
  const bookingResponse = await booking;
  expect(bookingResponse.status()).toBe(201);
  const bookingData = (await bookingResponse.json() as { data: { uuid: string; booking_reference: string } }).data;
  expect(bookingData.uuid).toBeTruthy();
  expect(bookingData.booking_reference).toBeTruthy();
  await expect(page.getByText(new RegExp(`offer accepted at\\s*₹${formattedQuote}`, 'i'))).toBeVisible({ timeout: 45_000 });
  return bookingData;
}

async function assertBookingState(page: Page, portal: 'shipper' | 'truck-owner', bookingUuid: string, expectedStatus: string, ownerToken: string, providerToken?: string): Promise<void> {
  const response = page.waitForResponse((candidate) =>
    candidate.request().method() === 'GET'
      && new URL(candidate.url()).pathname.endsWith('/api/marketplace-bookings'),
    { timeout: 45_000 },
  );
  await page.goto(`/${portal}/bookings`);
  const bookingsResponse = await response;
  expect(bookingsResponse.status()).toBe(200);
  const payload = await bookingsResponse.json() as { data: Array<{ uuid: string; status: string; owner_token_status?: string; provider_token_status?: string }> };
  const booking = payload.data.find((item) => item.uuid === bookingUuid);
  expect(booking, `Booking ${bookingUuid} should be visible to ${portal}`).toBeTruthy();
  expect(booking?.status).toBe(expectedStatus);
  expect(booking?.owner_token_status).toBe(ownerToken);
  if (providerToken) expect(booking?.provider_token_status).toBe(providerToken);
  else expect(booking?.provider_token_status).not.toBe('paid');
}

async function payBookingToken(page: Page): Promise<void> {
  const created = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST'
      && /\/api\/marketplace-bookings\/[^/]+\/token-orders$/.test(new URL(candidate.url()).pathname),
  );
  const verified = page.waitForResponse((candidate) =>
    candidate.request().method() === 'GET'
      && /\/api\/marketplace-bookings\/[^/]+\/token-orders\/[^/]+\/status$/.test(new URL(candidate.url()).pathname),
  );
  await page.getByRole('button', { name: /^pay token$/i }).click();
  expect((await created).status()).toBe(201);
  expect((await verified).status()).toBe(200);
  await expect(page.getByText(/booking token paid successfully/i)).toBeVisible({ timeout: 45_000 });
}

test.describe('Marketplace browser journey', () => {
  test('the application entry point loads for a fleet owner', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /log in to your account/i })).toBeVisible();
  });

  test('signup, OTP verification, and profile completion redirect to the correct portal', async ({ page }) => {
    await signUpAndCompleteProfile(page, testUser('shipper', 1));
    await expect(page.getByText(/Marketplace Shipper 1/i)).toBeVisible();
  });

  test('two fleet owners apply, then the selected offer creates a booking and both parties pay tokens', async ({ page }) => {
    // The local PHP development server services requests serially; this
    // scenario deliberately creates three accounts and two applications.
    test.setTimeout(720_000);
    const shipper = testUser('shipper', 11);
    const firstOwner = testUser('truck-owner', 2);
    const secondOwner = testUser('truck-owner', 3);
    const firstVehicle = `TSE${runId}A`;
    const secondVehicle = `TSE${runId}B`;

    await signUpAndCompleteProfile(page, shipper);
    const loadUuid = await postLoad(page);

    await signUpAndCompleteProfile(page, firstOwner);
    await registerVehicle(page, firstVehicle);
    await applyForLoad(page, loadUuid, firstVehicle, '18500');

    await signUpAndCompleteProfile(page, secondOwner);
    await registerVehicle(page, secondVehicle);
    await applyForLoad(page, loadUuid, secondVehicle, '18000');

    await login(page, shipper);
    await page.goto(`/shipper/load-board/${loadUuid}`);
    // The page fetches the load first and then its applications so a clear
    // loader is shown instead of rendering stale data. Give the local API
    // enough time to complete that real round trip.
    await expect(page.getByText(/loading load details/i)).toBeHidden({ timeout: 45_000 });
    await expect(page.getByText(firstVehicle)).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(secondVehicle)).toBeVisible({ timeout: 45_000 });

    // The shipper accepts the first owner. The server must create a booking
    // and automatically close the competing application.
    const booking = await acceptApplicationAndCreateBooking(page, '18500');
    await test.info().attach('marketplace-test-data.json', {
      body: Buffer.from(JSON.stringify({ shipper, firstOwner, secondOwner, password, loadUuid, booking, firstVehicle, secondVehicle, paymentProvider: 'mock' }, null, 2)),
      contentType: 'application/json',
    });
    console.log(`Marketplace test data: load ${loadUuid}, booking ${booking.booking_reference} (${booking.uuid}), users ${shipper.email}, ${firstOwner.email}, ${secondOwner.email}`);
    // Owner-facing application cards expose the automatic outcome as the
    // concise `Rejected` status (the longer “Offer declined” copy belongs to
    // the applicant-facing view).
    await expect(page.getByText(/^rejected$/i)).toBeVisible({ timeout: 45_000 });
    await payBookingToken(page);
    await assertBookingState(page, 'shipper', booking.uuid, 'awaiting_tokens', 'paid');

    // The selected owner pays the second token. This is the point at which
    // the booking becomes confirmed and eligible for operational workflow.
    await login(page, firstOwner);
    await page.goto(`/truck-owner/load-board/${loadUuid}`);
    await expect(page.getByText(/offer accepted at/i)).toBeVisible({ timeout: 45_000 });
    await payBookingToken(page);
    await expect(page.getByRole('link', { name: /open booking workflow/i })).toBeVisible({ timeout: 45_000 });
    await assertBookingState(page, 'truck-owner', booking.uuid, 'confirmed', 'paid', 'paid');
  });

  test('an existing test booking can be assigned an owned registered vehicle', async ({ page }) => {
    const email = process.env.E2E_OWNER_EMAIL;
    const bookingReference = process.env.E2E_BOOKING_REFERENCE;
    const bookingUuid = process.env.E2E_BOOKING_UUID;
    const registration = process.env.E2E_VEHICLE_REGISTRATION;
    test.skip(!email || !bookingReference || !bookingUuid || !registration, 'Provide an existing test booking and its owner and vehicle.');
    test.setTimeout(180_000);
    await login(page, { role: 'truck-owner', name: '', email: email!, mobile: '' });
    await page.goto('/truck-owner/bookings');
    const bookingCard = page.locator('.card').filter({ hasText: bookingReference! });
    await expect(bookingCard).toBeVisible({ timeout: 45_000 });
    await bookingCard.getByRole('button', { name: /view details/i }).click();
    await bookingCard.getByRole('button', { name: /assign vehicle/i }).click();
    const vehicles = page.locator('select[name="vehicleRegInput"]');
    await expect(vehicles.locator('option', { hasText: registration! })).toHaveCount(1, { timeout: 45_000 });
    await vehicles.selectOption(registration!);
    const assigned = page.waitForResponse((candidate) =>
      candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith(`/api/marketplace-bookings/${bookingUuid}/workflow`),
      { timeout: 45_000 },
    );
    await page.getByRole('button', { name: /^assign$/i }).click();
    const response = await assigned;
    expect(response.status()).toBe(200);
    const payload = await response.json() as { data: { workflow: { vehicle_assignment: { vehicle_reg_number: string } } } };
    expect(payload.data.workflow.vehicle_assignment.vehicle_reg_number).toBe(registration);
    await expect(bookingCard.getByText(new RegExp(`Own Fleet.*${registration}`, 'i'))).toBeVisible({ timeout: 45_000 });
    await page.reload();
    await expect(bookingCard).toBeVisible({ timeout: 45_000 });
    await bookingCard.getByRole('button', { name: /view details/i }).click();
    await expect(bookingCard.getByText(new RegExp(`Own Fleet.*${registration}`, 'i'))).toBeVisible();
  });

  test('an existing test booking can be assigned a registered driver', async ({ page }) => {
    const email = process.env.E2E_OWNER_EMAIL;
    const bookingReference = process.env.E2E_BOOKING_REFERENCE;
    const bookingUuid = process.env.E2E_BOOKING_UUID;
    test.skip(!email || !bookingReference || !bookingUuid, 'Provide an existing test booking and fleet owner.');
    test.setTimeout(180_000);
    const driverName = `Marketplace Driver ${runId}`;
    const driverPhone = `8${String(Number(runId)).padStart(9, '0')}`;
    await login(page, { role: 'truck-owner', name: '', email: email!, mobile: '' });
    await page.goto('/truck-owner/drivers');
    await page.getByRole('button', { name: /add driver/i }).first().click();
    await page.locator('input[name="name"]').fill(driverName);
    await page.locator('input[name="phone"]').fill(driverPhone);
    await page.locator('input[name="licenseNumber"]').fill(`TSE-${runId}`);
    const registered = page.waitForResponse((candidate) =>
      candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith('/api/marketplace-drivers'),
      { timeout: 45_000 },
    );
    await page.getByRole('button', { name: /add driver/i }).last().click();
    const registeredResponse = await registered;
    expect(registeredResponse.status()).toBe(201);
    const driver = (await registeredResponse.json() as { data: { uuid: string } }).data;
    await expect(page.getByText(driverName, { exact: true })).toBeVisible({ timeout: 45_000 });
    await page.reload();
    await expect(page.getByText(driverName, { exact: true })).toBeVisible({ timeout: 45_000 });
    await page.goto('/truck-owner/bookings');
    const bookingCard = page.locator('.card').filter({ hasText: bookingReference! });
    await expect(bookingCard).toBeVisible({ timeout: 45_000 });
    await bookingCard.getByRole('button', { name: /view details/i }).click();
    await bookingCard.getByRole('button', { name: /assign driver/i }).click();
    const drivers = page.locator('select[name="driverIdInput"]');
    await expect(drivers.locator('option', { hasText: driverName })).toHaveCount(1, { timeout: 45_000 });
    await drivers.selectOption(driver.uuid);
    const assigned = page.waitForResponse((candidate) =>
      candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith(`/api/marketplace-bookings/${bookingUuid}/workflow`),
      { timeout: 45_000 },
    );
    await page.getByRole('button', { name: /^assign$/i }).click();
    const assignment = await assigned;
    expect(assignment.status()).toBe(200);
    expect((await assignment.json() as { data: { workflow: { driver_assignment: { driver_uuid: string } } } }).data.workflow.driver_assignment.driver_uuid).toBe(driver.uuid);
    await expect(bookingCard.getByText(new RegExp(driverName))).toBeVisible({ timeout: 45_000 });
    await page.reload();
    await expect(bookingCard).toBeVisible({ timeout: 45_000 });
    await bookingCard.getByRole('button', { name: /view details/i }).click();
    await expect(bookingCard.getByText(new RegExp(driverName))).toBeVisible();
    console.log(`Registered and assigned test driver: ${driverName}, ${driverPhone}, ${driver.uuid}`);
  });

  test('an assigned driver is shown only in the owning fleet directory', async ({ page }) => {
    const ownerEmail = process.env.E2E_OWNER_EMAIL;
    const otherEmail = process.env.E2E_OTHER_OWNER_EMAIL;
    const driverName = process.env.E2E_DRIVER_NAME;
    test.skip(!ownerEmail || !otherEmail || !driverName, 'Provide the two test owners and an assigned test driver.');
    test.setTimeout(180_000);
    await login(page, { role: 'truck-owner', name: '', email: ownerEmail!, mobile: '' });
    await page.goto('/truck-owner/drivers');
    const row = page.getByRole('row').filter({ hasText: driverName! });
    await expect(row).toBeVisible({ timeout: 45_000 });
    await expect(row.getByText('Assigned', { exact: true })).toBeVisible();
    if (process.env.E2E_VEHICLE_REGISTRATION) {
      await expect(row.getByText(process.env.E2E_VEHICLE_REGISTRATION, { exact: true })).toBeVisible();
    }
    await login(page, { role: 'truck-owner', name: '', email: otherEmail!, mobile: '' });
    const listed = page.waitForResponse((candidate) => candidate.request().method() === 'GET'
      && new URL(candidate.url()).pathname.endsWith('/api/marketplace-drivers'), { timeout: 45_000 });
    await page.goto('/truck-owner/drivers');
    expect((await listed).status()).toBe(200);
    await expect(page.getByText(driverName!, { exact: true })).toHaveCount(0);
  });

  test('existing test booking advances through loading, recorded advance and trip start', async ({ page }) => {
    const ownerEmail = process.env.E2E_OWNER_EMAIL;
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const bookingReference = process.env.E2E_BOOKING_REFERENCE;
    const bookingUuid = process.env.E2E_BOOKING_UUID;
    test.skip(!ownerEmail || !shipperEmail || !bookingReference || !bookingUuid, 'Provide both test users and an existing booking.');
    test.setTimeout(240_000);
    const openBooking = async (portal: 'truck-owner' | 'shipper') => {
      await page.goto(`/${portal}/bookings`);
      const card = page.locator('.card').filter({ hasText: bookingReference! });
      await expect(card).toBeVisible({ timeout: 45_000 });
      await card.getByRole('button', { name: /view details/i }).click();
      return card;
    };
    const workflowResponse = () => page.waitForResponse((candidate) =>
      candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith(`/api/marketplace-bookings/${bookingUuid}/workflow`),
      { timeout: 45_000 },
    );
    await login(page, { role: 'truck-owner', name: '', email: ownerEmail!, mobile: '' });
    expect(await page.evaluate(() => (window as Window & { TRANSPORTSEVA_CONFIG: { paymentProvider: string } }).TRANSPORTSEVA_CONFIG.paymentProvider)).toBe('mock');
    let card = await openBooking('truck-owner');
    const marked = workflowResponse();
    await card.getByRole('button', { name: /mark loading completed/i }).click();
    const markedResponse = await marked;
    expect(markedResponse.status()).toBe(200);
    expect((await markedResponse.json() as { data: { workflow: { loading_completed_at: string } } }).data.workflow.loading_completed_at).toBeTruthy();
    await expect(card.getByText(/provider marked loading complete/i)).toBeVisible({ timeout: 45_000 });

    await login(page, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
    card = await openBooking('shipper');
    await expect(card.getByText(/milestone release records a status only/i)).toBeVisible();
    await expect(card.getByText('₹7,400', { exact: true })).toBeVisible();
    const released = workflowResponse();
    await card.getByRole('button', { name: /^release$/i }).click();
    const releasedResponse = await released;
    expect(releasedResponse.status()).toBe(200);
    expect((await releasedResponse.json() as { data: { workflow: { released_milestones: Record<string, string> } } }).data.workflow.released_milestones['Loading Advance']).toBeTruthy();
    await expect(card.getByText(/^released/i).first()).toBeVisible({ timeout: 45_000 });

    await login(page, { role: 'truck-owner', name: '', email: ownerEmail!, mobile: '' });
    card = await openBooking('truck-owner');
    const started = workflowResponse();
    await card.getByRole('button', { name: /^start trip$/i }).click();
    const startedResponse = await started;
    expect(startedResponse.status()).toBe(200);
    expect((await startedResponse.json() as { data: { status: string } }).data.status).toBe('in_transit');
    await expect(card.getByText('Trip In Progress', { exact: true })).toBeVisible({ timeout: 45_000 });
    await page.reload();
    await expect(card).toBeVisible({ timeout: 45_000 });
    await card.getByRole('button', { name: /view details/i }).click();
    await expect(card.getByText('Trip In Progress', { exact: true })).toBeVisible();
  });

  test('in-transit test booking shows the payment-status limitation', async ({ page }) => {
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const bookingReference = process.env.E2E_BOOKING_REFERENCE;
    test.skip(!shipperEmail || !bookingReference, 'Provide the shipper and an in-transit test booking.');
    await login(page, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
    await page.goto('/shipper/bookings');
    const card = page.locator('.card').filter({ hasText: bookingReference! });
    await expect(card).toBeVisible({ timeout: 45_000 });
    await card.getByRole('button', { name: /view details/i }).click();
    await expect(card.getByText(/milestone release records a status only/i)).toBeVisible();
    await expect(card.getByText(/provider marks loading complete/i)).toBeVisible();
    await expect(card.getByText('Trip In Progress', { exact: true })).toBeVisible();
  });

  test('test booking tracking and mid-trip milestone status', async ({ page }) => {
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const bookingReference = process.env.E2E_BOOKING_REFERENCE;
    const bookingUuid = process.env.E2E_BOOKING_UUID;
    const registration = process.env.E2E_VEHICLE_REGISTRATION;
    test.skip(!shipperEmail || !bookingReference || !bookingUuid || !registration, 'Provide the existing test booking and assigned vehicle.');
    test.setTimeout(180_000);
    await login(page, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
    expect(await page.evaluate(() => (window as Window & { TRANSPORTSEVA_CONFIG: { paymentProvider: string } }).TRANSPORTSEVA_CONFIG.paymentProvider)).toBe('mock');
    const openBooking = async () => {
      await page.goto('/shipper/bookings');
      const card = page.locator('.card').filter({ hasText: bookingReference! });
      await expect(card).toBeVisible({ timeout: 45_000 });
      await card.getByRole('button', { name: /view details/i }).click();
      return card;
    };
    const workflowResponse = () => page.waitForResponse((candidate) =>
      candidate.request().method() === 'POST' && new URL(candidate.url()).pathname.endsWith(`/api/marketplace-bookings/${bookingUuid}/workflow`),
      { timeout: 45_000 },
    );
    let card = await openBooking();
    await card.getByRole('button', { name: /track assigned vehicle/i }).click();
    await expect(page).toHaveURL(new RegExp(`/shipper/tracking\\?.*vehicle=${registration}.*booking=${bookingUuid}`));
    await expect(page.getByText(/live gps is not connected/i)).toBeVisible();
    await expect(page.getByText(new RegExp(`Live GPS data for vehicle ${registration} is not available`, 'i'))).toBeVisible();

    card = await openBooking();
    await card.getByRole('button', { name: /mid-trip payment/i }).click();
    await page.locator('input[name="midTripAmount"]').fill('2000');
    await page.locator('input[name="midTripTrigger"]').fill('Test manual release');
    const created = workflowResponse();
    await page.getByRole('button', { name: /add milestone/i }).click();
    const createResponse = await created;
    expect(createResponse.status()).toBe(200);
    const milestones = (await createResponse.json() as { data: { workflow: { mid_trip_milestones: Array<{ id: string; amount: number }> } } }).data.workflow.mid_trip_milestones;
    expect(milestones.some((milestone) => Number(milestone.amount) === 2000)).toBe(true);
    const finalAllocation = card.getByText('Final settlement after planned milestones', { exact: true }).locator('..');
    const notReleased = card.getByText('Freight not recorded as released', { exact: true }).locator('..');
    await expect(finalAllocation.getByText('₹9,100', { exact: true })).toBeVisible();
    await expect(notReleased.getByText('₹11,100', { exact: true })).toBeVisible();
    const milestoneRow = card.getByText('Mid-Trip Payment', { exact: true }).locator('..').locator('..');
    const released = workflowResponse();
    await milestoneRow.getByRole('button', { name: /^release$/i }).click();
    const releaseResponse = await released;
    expect(releaseResponse.status()).toBe(200);
    expect((await releaseResponse.json() as { data: { workflow: { mid_trip_milestones: Array<{ amount: number; released_at?: string }> } } }).data.workflow.mid_trip_milestones.some((milestone) => Number(milestone.amount) === 2000 && !!milestone.released_at)).toBe(true);
    await expect(notReleased.getByText('₹9,100', { exact: true })).toBeVisible({ timeout: 45_000 });
    await page.reload();
    await expect(card).toBeVisible({ timeout: 45_000 });
    await card.getByRole('button', { name: /view details/i }).click();
    await expect(card.getByText('Mid-Trip Payment', { exact: true })).toBeVisible();
    await expect(card.getByText('Freight not recorded as released', { exact: true }).locator('..').getByText('₹9,100', { exact: true })).toBeVisible();
  });

  test('test booking completes trip and records final settlement status', async ({ page }) => {
    const ownerEmail = process.env.E2E_OWNER_EMAIL;
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const bookingReference = process.env.E2E_BOOKING_REFERENCE;
    const bookingUuid = process.env.E2E_BOOKING_UUID;
    test.skip(!ownerEmail || !shipperEmail || !bookingReference || !bookingUuid, 'Provide both test users and an in-transit booking.');
    test.setTimeout(240_000);
    const openBooking = async (portal: 'truck-owner' | 'shipper') => {
      await page.goto(`/${portal}/bookings`);
      const card = page.locator('.card').filter({ hasText: bookingReference! });
      await expect(card).toBeVisible({ timeout: 45_000 });
      await card.getByRole('button', { name: /view details/i }).click();
      return card;
    };
    const workflowResponse = () => page.waitForResponse((candidate) => candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith(`/api/marketplace-bookings/${bookingUuid}/workflow`), { timeout: 45_000 });
    await login(page, { role: 'truck-owner', name: '', email: ownerEmail!, mobile: '' });
    expect(await page.evaluate(() => (window as Window & { TRANSPORTSEVA_CONFIG: { paymentProvider: string } }).TRANSPORTSEVA_CONFIG.paymentProvider)).toBe('mock');
    let card = await openBooking('truck-owner');
    const completed = workflowResponse();
    await card.getByRole('button', { name: /mark trip completed/i }).click();
    const completedResponse = await completed;
    expect(completedResponse.status()).toBe(200);
    expect((await completedResponse.json() as { data: { status: string } }).data.status).toBe('completed');
    await login(page, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
    card = await openBooking('shipper');
    await expect(card.getByText(/trip completed · settlement pending/i)).toBeVisible();
    const prepared = page.waitForResponse((candidate) => candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith(`/api/marketplace-bookings/${bookingUuid}/settle`), { timeout: 45_000 });
    await card.getByRole('button', { name: /prepare settlement/i }).click();
    const prepareResponse = await prepared;
    expect(prepareResponse.status()).toBe(201);
    await expect(card.getByText('Final freight balance', { exact: true }).locator('..').getByText('₹9,100', { exact: true })).toBeVisible({ timeout: 45_000 });
    await expect(card.getByText(/settlement status does not verify/i)).toBeVisible();
    await card.getByRole('button', { name: /settle final payment/i }).click();
    await expect(page.getByText(/does not charge, transfer or verify receipt/i)).toBeVisible();
    await expect(page.locator('input[name="offlineAmount"]')).toHaveValue('10191.5');
    await page.locator('input[name="offlineReference"]').fill('E2E-TEST-ONLY-NO-PAYMENT');
    const recorded = workflowResponse();
    await page.getByRole('button', { name: /record payment status/i }).click();
    const recordedResponse = await recorded;
    expect(recordedResponse.status()).toBe(200);
    const recordedData = (await recordedResponse.json() as { data: { settlement: { status: string }; workflow: { final_payment: { reference: string } } } }).data;
    expect(recordedData.settlement.status).toBe('settled');
    expect(recordedData.workflow.final_payment.reference).toBe('E2E-TEST-ONLY-NO-PAYMENT');
    await expect(card.getByText('TransportSeva commission recorded', { exact: true })).toBeVisible({ timeout: 45_000 });
    await page.reload();
    await expect(card).toBeVisible({ timeout: 45_000 });
    await card.getByRole('button', { name: /view details/i }).click();
    await expect(card.getByText(/settlement status does not verify/i)).toBeVisible();
    await expect(card.getByText('TransportSeva commission recorded', { exact: true })).toBeVisible();
  });

  test('public load notes reject contact numbers before submission', async ({ page }) => {
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    test.skip(!shipperEmail, 'Provide a test shipper.');
    await login(page, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
    await page.goto('/shipper/post-load');
    await page.locator('input#pickup-city').fill('Delhi');
    await page.locator('input#drop-city').fill('Navi Mumbai');
    await page.locator('input[name="material"]').fill('E2E test goods');
    await page.locator('input[name="weightTons"]').fill('16');
    await page.locator('input[name="budget"]').fill('20000');
    let postRequests = 0;
    page.on('request', (request) => {
      if (request.method() === 'POST' && new URL(request.url()).pathname.endsWith('/api/loads')) postRequests++;
    });
    const notes = page.locator('textarea[name="notes"]');
    for (const value of ['Call 9876543210', 'Call +91 98765 43210', 'Call 98765-43210']) {
      await notes.fill(value);
      await expect(page.getByText('Contact numbers cannot be shared in public load notes.')).toBeVisible();
    }
    await page.getByRole('button', { name: /post load to marketplace/i }).click();
    expect(postRequests).toBe(0);
    await notes.fill('Deliver during business hours.');
    await expect(page.getByText('Contact numbers cannot be shared in public load notes.')).toHaveCount(0);
  });

  test('application vehicle dropdown excludes another fleet owner vehicle', async ({ page }) => {
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const ownerEmail = process.env.E2E_OWNER_EMAIL;
    const ownVehicle = process.env.E2E_VEHICLE_REGISTRATION;
    const foreignVehicle = process.env.E2E_FOREIGN_VEHICLE_REGISTRATION;
    test.skip(!shipperEmail || !ownerEmail || !ownVehicle || !foreignVehicle, 'Provide two test fleets and their vehicle registrations.');
    test.setTimeout(240_000);
    let loadUuid = process.env.E2E_LOAD_UUID;
    if (!loadUuid) {
      await login(page, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
      loadUuid = await postLoad(page);
      console.log(`Vehicle dropdown safeguard test load: ${loadUuid}`);
      await test.info().attach('vehicle-dropdown-load.json', {
        body: Buffer.from(JSON.stringify({ loadUuid, shipper: shipperEmail, owner: ownerEmail, ownVehicle, foreignVehicle }, null, 2)),
        contentType: 'application/json',
      });
    }
    await login(page, { role: 'truck-owner', name: '', email: ownerEmail!, mobile: '' });
    await page.goto(`/truck-owner/load-board/${loadUuid}`);
    await page.getByRole('button', { name: /apply for this load/i }).click({ timeout: 45_000 });
    const select = page.locator('select[name="vehicleRegNumber"]');
    await expect(select.locator('option', { hasText: ownVehicle! })).toHaveCount(1);
    await expect(select.locator('option', { hasText: foreignVehicle! })).toHaveCount(0);
    await expect(page.locator('select[name="vehicleType"]')).toHaveCount(0);
    await select.selectOption(ownVehicle!);
    await page.locator('input[name="availability"]').fill('Available today');
    await page.locator('input[name="quotedAmount"]').fill('18000');
    const submitted = page.waitForResponse((candidate) => candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith(`/api/loads/${loadUuid}/applications`), { timeout: 45_000 });
    await page.getByRole('button', { name: /submit application/i }).click();
    const response = await submitted;
    expect(response.status()).toBe(201);
    const application = (await response.json() as { data: { vehicle_reg_number: string; vehicle_type: string } }).data;
    expect(application.vehicle_reg_number).toBe(ownVehicle);
    expect(application.vehicle_type).toBe('32ft Trailer');
    await expect(page.getByText(/your application/i)).toBeVisible();
  });

  test('load details timeout offers a retry', async ({ page }) => {
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const loadUuid = process.env.E2E_LOAD_UUID;
    test.skip(!shipperEmail || !loadUuid, 'Provide a test shipper and an existing load.');
    test.setTimeout(180_000);
    await login(page, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
    let delayed = false;
    await page.route(`**/api/loads/${loadUuid}`, async (route) => {
      if (route.request().method() !== 'GET' || delayed) {
        await route.continue();
        return;
      }
      delayed = true;
      await new Promise((resolve) => setTimeout(resolve, 35_000));
      await route.abort().catch(() => undefined);
    });
    await page.goto(`/shipper/load-board/${loadUuid}`);
    await expect(page.getByRole('alert').getByText('Loading this shipment took too long. Please try again.')).toBeVisible({ timeout: 60_000 });
    await page.getByRole('button', { name: /^retry$/i }).click();
    await expect(page.getByRole('heading', { name: /Delhi.*Navi Mumbai/i })).toBeVisible({ timeout: 45_000 });
  });

  test('load applications timeout shows retry instead of a false empty state', async ({ page }) => {
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const loadUuid = process.env.E2E_LOAD_UUID;
    test.skip(!shipperEmail || !loadUuid, 'Provide a test shipper and an existing load with applications.');
    test.setTimeout(180_000);
    await login(page, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
    let delayed = false;
    await page.route('**/api/loads/*/applications**', async (route) => {
      if (route.request().method() !== 'GET' || delayed) {
        await route.continue();
        return;
      }
      delayed = true;
      // Simulate a stalled network response without modifying the database.
      await new Promise((resolve) => setTimeout(resolve, 35_000));
      await route.abort().catch(() => undefined);
    });
    await page.goto(`/shipper/load-board/${loadUuid}`);
    await expect(page.getByRole('alert').getByText('Loading applications took too long. Please retry.')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText('No applications yet')).toHaveCount(0);
    await page.getByRole('button', { name: /^retry$/i }).click();
    await expect(page.getByText('Loading applications took too long. Please retry.')).toHaveCount(0);
    await expect(page.getByText(/offer accepted at/i)).toBeVisible({ timeout: 45_000 });
  });

  test('shipper counter-offer is accepted by the fleet owner', async ({ page }) => {
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const ownerEmail = process.env.E2E_OWNER_EMAIL;
    const registration = process.env.E2E_VEHICLE_REGISTRATION;
    test.skip(!shipperEmail || !ownerEmail || !registration, 'Provide existing test users and an owned test vehicle.');
    test.setTimeout(480_000);
    const shipper = { role: 'shipper' as const, name: '', email: shipperEmail!, mobile: '' };
    const owner = { role: 'truck-owner' as const, name: '', email: ownerEmail!, mobile: '' };
    let loadUuid = process.env.E2E_LOAD_UUID;
    if (!loadUuid) {
      await login(page, shipper);
      loadUuid = await postLoad(page);
      console.log(`Counter-offer test load: ${loadUuid}; users: ${shipper.email}, ${owner.email}; vehicle: ${registration}`);
      await test.info().attach('counter-offer-load.json', {
        body: Buffer.from(JSON.stringify({ loadUuid, shipper: shipper.email, owner: owner.email, registration }, null, 2)),
        contentType: 'application/json',
      });
      await login(page, owner);
      await applyForLoad(page, loadUuid, registration!, '18000');
      await login(page, shipper);
      await page.goto(`/shipper/load-board/${loadUuid}`);
      await page.getByRole('button', { name: /view offers/i }).click({ timeout: 90_000 });
      await page.locator('input[name="counterAmount"]').fill('17000');
      const counterResponse = page.waitForResponse((candidate) => candidate.request().method() === 'POST'
        && /\/api\/applications\/[^/]+\/offers$/.test(new URL(candidate.url()).pathname), { timeout: 45_000 });
      await page.getByRole('button', { name: /send counter-offer/i }).click();
      expect((await counterResponse).status()).toBe(201);
    }
    await login(page, owner);
    await page.goto(`/truck-owner/load-board/${loadUuid}`);
    const booking = await acceptApplicationAndCreateBooking(page, '17000');
    console.log(`Counter-offer booking: ${booking.booking_reference} (${booking.uuid}), load: ${loadUuid}`);
    await test.info().attach('counter-offer-booking.json', {
      body: Buffer.from(JSON.stringify({ loadUuid, booking, shipper: shipper.email, owner: owner.email, agreedFreight: 17000 }, null, 2)),
      contentType: 'application/json',
    });
    await login(page, shipper);
    await page.goto(`/shipper/load-board/${loadUuid}`);
    await expect(page.getByText(/offer accepted at\s*₹17,000/i)).toBeVisible({ timeout: 90_000 });
  });

  test('booking chat updates the other participant and creates a bell notification', async ({ browser }) => {
    const ownerEmail = process.env.E2E_OWNER_EMAIL;
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const loadUuid = process.env.E2E_LOAD_UUID;
    const bookingReference = process.env.E2E_BOOKING_REFERENCE;
    test.skip(!ownerEmail || !shipperEmail || !loadUuid || !bookingReference, 'Provide test participants, load and booking.');
    test.setTimeout(240_000);
    const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4300';
    const shipperContext = await browser.newContext({ baseURL });
    const ownerContext = await browser.newContext({ baseURL });
    try {
      const shipperPage = await shipperContext.newPage();
      const ownerPage = await ownerContext.newPage();
      await login(shipperPage, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
      await login(ownerPage, { role: 'truck-owner', name: '', email: ownerEmail!, mobile: '' });
      await shipperPage.goto(`/shipper/load-board/${loadUuid}`);
      await shipperPage.getByRole('button', { name: /^chat$/i }).click({ timeout: 90_000 });
      await ownerPage.goto(`/truck-owner/load-board/${loadUuid}`);
      await ownerPage.getByRole('button', { name: /chat with owner/i }).click({ timeout: 90_000 });
      await expect(ownerPage.getByPlaceholder(/type a message/i)).toBeVisible();
      const message = `E2E chat test ${runId}`;
      const posted = shipperPage.waitForResponse((candidate) => candidate.request().method() === 'POST'
        && /\/api\/marketplace-bookings\/[^/]+\/messages$/.test(new URL(candidate.url()).pathname), { timeout: 45_000 });
      await shipperPage.getByPlaceholder(/type a message/i).fill(message);
      await shipperPage.getByPlaceholder(/type a message/i).press('Enter');
      expect((await posted).status()).toBe(201);
      await expect(ownerPage.getByText(message, { exact: true })).toBeVisible({ timeout: 60_000 });
      await expect(ownerPage.locator('.chat-bubble').filter({ hasText: message })).toContainText(/Marketplace Shipper 11.*Load Owner/i);
      await ownerPage.getByRole('button', { name: 'Notifications', exact: true }).click();
      await expect(ownerPage.locator('.notif-dropdown').getByText('New booking message', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
      await expect(ownerPage.locator('.notif-dropdown').getByText(new RegExp(bookingReference!)).first()).toBeVisible();
    } finally {
      await shipperContext.close();
      await ownerContext.close();
    }
  });
});
