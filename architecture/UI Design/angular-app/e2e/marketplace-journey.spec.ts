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

async function login(page: Page, user: ReturnType<typeof testUser> | { role: 'admin'; name: string; email: string; mobile: string }, userPassword = password): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(user.email);
  await page.locator('input[name="password"]').fill(userPassword);
  const loginResponse = page.waitForResponse((candidate) =>
    candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith('/api/auth/login'),
    { timeout: 45_000 },
  );
  await page.getByRole('button', { name: /^log in$/i }).click();
  expect((await loginResponse).status()).toBe(200);
  const portal = user.role === 'shipper' ? 'shipper' : user.role === 'truck-owner' ? 'truck-owner' : 'admin';
  await expect(page).toHaveURL(new RegExp(`/${portal}/dashboard`), { timeout: 45_000 });
}

async function waitForLoadNotification(page: Page, title: string, loadUuid: string): Promise<string> {
  const response = await page.waitForResponse(async (candidate) => {
    if (candidate.request().method() !== 'GET' || !new URL(candidate.url()).pathname.endsWith('/api/notifications') || !candidate.ok()) return false;
    const payload = await candidate.json().catch(() => null) as { data?: { id: string; title: string; data?: { load_uuid?: string } }[] } | null;
    return !!payload?.data?.some((item) => item.title === title && item.data?.load_uuid === loadUuid);
  }, { timeout: 90_000 });
  const payload = await response.json() as { data: { id: string; title: string; data?: { load_uuid?: string } }[] };
  return payload.data.find((item) => item.title === title && item.data?.load_uuid === loadUuid)!.id;
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

async function acceptApplicationAndCreateBooking(page: Page, quote: string, waitForAcceptedDisplay = true): Promise<{ uuid: string; booking_reference: string }> {
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
  if (waitForAcceptedDisplay) await expect(page.getByText(new RegExp(`offer accepted at\\s*₹${formattedQuote}`, 'i'))).toBeVisible({ timeout: 45_000 });
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

  test('a repeated successful signup OTP verification returns to profile setup instead of reporting an invalid OTP', async ({ page }) => {
    test.setTimeout(180_000);
    const user = testUser('shipper', 81);
    await page.goto('/auth/signup');
    await page.locator('.role-card').filter({ hasText: /Shipper/i }).click();
    await page.locator('input[name="fullName"]').fill(user.name);
    await page.locator('input[name="mobile"]').fill(user.mobile);
    await page.locator('input[name="email"]').fill(user.email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.locator('input[name="agreeTerms"]').check();
    const requested = page.waitForResponse((response) => response.request().method() === 'POST'
      && new URL(response.url()).pathname.endsWith('/api/auth/signup/request-otp'), { timeout: 45_000 });
    await page.getByRole('button', { name: /create account/i }).click();
    expect((await requested).status()).toBe(200);
    await expect(page).toHaveURL(/\/auth\/otp-verification\?next=signup/, { timeout: 45_000 });
    const otp = await page.locator('.otp-debug strong').innerText();
    expect(otp).toMatch(/^\d{6}$/);

    const enterOtp = async () => {
      const inputs = page.locator('.otp-box');
      for (const [index, digit] of [...otp].entries()) {
        await inputs.nth(index).click();
        await inputs.nth(index).press(digit);
      }
    };
    await enterOtp();
    const firstVerification = page.waitForResponse((response) => response.request().method() === 'POST'
      && new URL(response.url()).pathname.endsWith('/api/auth/signup/verify-otp'), { timeout: 45_000 });
    await page.getByRole('button', { name: /verify otp/i }).click();
    expect((await firstVerification).status()).toBe(200);
    await expect(page).toHaveURL(/\/auth\/profile-setup/, { timeout: 45_000 });

    await page.goBack();
    await expect(page).toHaveURL(/\/auth\/otp-verification\?next=signup/, { timeout: 45_000 });
    await enterOtp();
    const retriedVerification = page.waitForResponse((response) => response.request().method() === 'POST'
      && new URL(response.url()).pathname.endsWith('/api/auth/signup/verify-otp'), { timeout: 45_000 });
    await page.getByRole('button', { name: /verify otp/i }).click();
    expect((await retriedVerification).status()).toBe(200);
    await expect(page).toHaveURL(/\/auth\/profile-setup/, { timeout: 45_000 });
    await expect(page.getByText(/invalid or expired otp/i)).toHaveCount(0);

    await page.locator('input[name="designation"]').fill('Repeated OTP E2E tester');
    await page.getByRole('button', { name: /finish setup/i }).click();
    await expect(page).toHaveURL(/\/shipper\/dashboard/, { timeout: 45_000 });
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

  test('duplicate vehicle registration shows an inline error', async ({ page }) => {
    const ownerEmail = process.env.E2E_OWNER_EMAIL;
    const registration = process.env.E2E_VEHICLE_REGISTRATION;
    test.skip(!ownerEmail || !registration, 'Provide an existing test fleet owner and vehicle.');
    test.setTimeout(180_000);
    await login(page, { role: 'truck-owner', name: '', email: ownerEmail!, mobile: '' });
    await page.goto('/truck-owner/vehicles');
    await expect(page.getByText(registration!, { exact: true })).toBeVisible({ timeout: 45_000 });
    await page.getByRole('button', { name: /add vehicle/i }).first().click();
    const input = page.locator('input[name="regNumber"]');
    const variant = `${registration!.slice(0, 3).toLowerCase()} - ${registration!.slice(3).toLowerCase()}`;
    await input.fill(variant);
    await page.locator('input[name="make"]').fill('Tata');
    await page.locator('input[name="model"]').fill('E2E duplicate test');
    await page.locator('input[name="capacityTons"]').fill('24');
    const submitted = page.waitForResponse((candidate) => candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith('/api/marketplace-vehicles'), { timeout: 45_000 });
    await page.getByRole('button', { name: /^add vehicle$/i }).last().click();
    expect((await submitted).status()).toBe(422);
    await expect(page.getByRole('alert').getByText('This registration number is already registered.')).toBeVisible();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await input.fill('TESTNEWVEHICLE');
    await expect(page.getByText('This registration number is already registered.')).toHaveCount(0);
    await page.getByRole('button', { name: /^cancel$/i }).click();
    await expect(page.getByText(registration!, { exact: true })).toHaveCount(1);
  });

  test('duplicate application shows an error and booked load hides apply', async ({ page }) => {
    const ownerEmail = process.env.E2E_OWNER_EMAIL;
    const appliedLoad = process.env.E2E_APPLIED_LOAD_UUID;
    const bookedLoad = process.env.E2E_BOOKED_LOAD_UUID;
    const vehicle = process.env.E2E_VEHICLE_REGISTRATION;
    test.skip(!ownerEmail || !appliedLoad || !bookedLoad || !vehicle, 'Provide an owner, owned vehicle, applied load and booked load.');
    test.setTimeout(240_000);
    await login(page, { role: 'truck-owner', name: '', email: ownerEmail!, mobile: '' });
    // Simulate a stale client which has not yet learned about an existing application.
    const appsRoute = `**/api/loads/${appliedLoad}/applications**`;
    await page.route(appsRoute, async (route) => {
      if (route.request().method() === 'GET') await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { total: 0 } }) });
      else await route.continue();
    });
    await page.goto(`/truck-owner/load-board/${appliedLoad}`);
    await page.getByRole('button', { name: /apply for this load/i }).click({ timeout: 45_000 });
    await page.locator('select[name="vehicleRegNumber"]').selectOption(vehicle!);
    await page.locator('input[name="availability"]').fill('Available today');
    await page.locator('input[name="quotedAmount"]').fill('18000');
    const submitted = page.waitForResponse((candidate) => candidate.request().method() === 'POST'
      && new URL(candidate.url()).pathname.endsWith(`/api/loads/${appliedLoad}/applications`), { timeout: 45_000 });
    await page.getByRole('button', { name: /submit application/i }).click();
    expect((await submitted).status()).toBe(422);
    await expect(page.getByRole('alert').getByText('You have already applied to this load.')).toBeVisible();
    await page.unroute(appsRoute);
    await page.goto(`/truck-owner/load-board/${bookedLoad}`);
    await expect(page.getByText('This load is no longer accepting applications.')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByRole('button', { name: /apply for this load/i })).toHaveCount(0);
    await expect(page.getByText('Booked', { exact: true })).toBeVisible();
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
      await ownerPage.goto(`/truck-owner/load-board/${loadUuid}`);
      await ownerPage.getByRole('button', { name: /chat with owner/i }).click({ timeout: 90_000 });
      await shipperPage.getByRole('button', { name: /^chat$/i }).click({ timeout: 90_000 });
      await expect(ownerPage.getByPlaceholder(/type a message/i)).toBeVisible();
      const message = `E2E chat test ${runId}`;
      const posted = shipperPage.waitForResponse((candidate) => candidate.request().method() === 'POST'
        && /\/api\/marketplace-bookings\/[^/]+\/messages$/.test(new URL(candidate.url()).pathname), { timeout: 45_000 });
      await shipperPage.getByPlaceholder(/type a message/i).fill(message);
      await shipperPage.getByPlaceholder(/type a message/i).press('Enter');
      const messageResponse = await posted;
      expect(messageResponse.status()).toBe(201);
      const messageUuid = (await messageResponse.json() as { data: { uuid: string } }).data.uuid;
      await expect(ownerPage.getByText(message, { exact: true })).toBeVisible({ timeout: 60_000 });
      await expect(ownerPage.locator('.chat-bubble').filter({ hasText: message })).toContainText(/Marketplace Shipper 11.*Load Owner/i);
      await ownerPage.getByRole('button', { name: 'Notifications', exact: true }).click();
      await expect(ownerPage.locator('.notif-dropdown').getByText('New booking message', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
      await expect(ownerPage.locator('.notif-dropdown').getByText(new RegExp(bookingReference!)).first()).toBeVisible();
      const notificationResponse = await ownerPage.waitForResponse(async (candidate) => {
        if (candidate.request().method() !== 'GET' || !new URL(candidate.url()).pathname.endsWith('/api/notifications') || !candidate.ok()) return false;
        const body = await candidate.json().catch(() => null) as { data?: { data?: { message_uuid?: string } }[] } | null;
        return !!body?.data?.some((item) => item.data?.message_uuid === messageUuid);
      }, { timeout: 90_000 });
      const notificationBody = await notificationResponse.json() as { data: { id: string; data?: { message_uuid?: string } }[] };
      const notificationId = notificationBody.data.find((item) => item.data?.message_uuid === messageUuid)!.id;
      const notification = ownerPage.locator(`[data-notification-id="${notificationId}"]`);
      const readResponse = ownerPage.waitForResponse((candidate) => candidate.request().method() === 'PATCH'
        && /\/api\/notifications\/[^/]+\/read$/.test(new URL(candidate.url()).pathname), { timeout: 45_000 });
      await notification.click();
      expect((await readResponse).status()).toBe(200);
      await expect(ownerPage).toHaveURL(new RegExp(`/truck-owner/load-board/${loadUuid}\\?chat=`), { timeout: 45_000 });
      await expect(ownerPage.getByPlaceholder(/type a message/i)).toBeVisible({ timeout: 60_000 });
      await expect(ownerPage.getByText(message, { exact: true })).toBeVisible({ timeout: 60_000 });
    } finally {
      await shipperContext.close();
      await ownerContext.close();
    }
  });

  test('bell notifications follow application and competing acceptance events', async ({ browser }) => {
    const shipperEmail = process.env.E2E_SHIPPER_EMAIL;
    const firstEmail = process.env.E2E_OWNER_EMAIL;
    const secondEmail = process.env.E2E_SECOND_OWNER_EMAIL;
    const firstVehicle = process.env.E2E_OWNER_VEHICLE;
    const secondVehicle = process.env.E2E_SECOND_OWNER_VEHICLE;
    test.skip(!shipperEmail || !firstEmail || !secondEmail || !firstVehicle || !secondVehicle, 'Provide existing marketplace test participants and vehicles.');
    test.setTimeout(600_000);
    const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4300';
    const contexts = await Promise.all([browser.newContext({ baseURL }), browser.newContext({ baseURL }), browser.newContext({ baseURL })]);
    try {
      const [shipper, first, second] = await Promise.all(contexts.map((context) => context.newPage()));
      await login(shipper, { role: 'shipper', name: '', email: shipperEmail!, mobile: '' });
      const loadUuid = await postLoad(shipper);
      console.log(`Notification test load: ${loadUuid}; shipper: ${shipperEmail}; owners: ${firstEmail}, ${secondEmail}`);
      await login(first, { role: 'truck-owner', name: '', email: firstEmail!, mobile: '' });
      await applyForLoad(first, loadUuid, firstVehicle!, '18500');
      const applicationNoticeId = await waitForLoadNotification(shipper, 'New application received', loadUuid);
      await shipper.getByRole('button', { name: 'Notifications', exact: true }).click();
      const applicationNotice = shipper.locator(`[data-notification-id="${applicationNoticeId}"]`);
      await expect(applicationNotice).toBeVisible({ timeout: 60_000 });
      await applicationNotice.click();
      await expect(shipper).toHaveURL(new RegExp(`/shipper/load-board/${loadUuid}`), { timeout: 45_000 });
      await expect(shipper.getByText(firstVehicle!)).toBeVisible({ timeout: 60_000 });
      await login(second, { role: 'truck-owner', name: '', email: secondEmail!, mobile: '' });
      await applyForLoad(second, loadUuid, secondVehicle!, '18000');
      await shipper.goto(`/shipper/load-board/${loadUuid}`);
      await expect(shipper.getByText(secondVehicle!)).toBeVisible({ timeout: 60_000 });
      const booking = await acceptApplicationAndCreateBooking(shipper, '18500');
      console.log(`Notification test booking: ${booking.booking_reference} (${booking.uuid})`);
      const acceptedId = await waitForLoadNotification(first, 'Offer accepted', loadUuid);
      await first.getByRole('button', { name: 'Notifications', exact: true }).click();
      const accepted = first.locator(`[data-notification-id="${acceptedId}"]`);
      await expect(accepted).toBeVisible({ timeout: 60_000 });
      await accepted.click();
      await expect(first).toHaveURL(new RegExp(`/truck-owner/load-board/${loadUuid}`), { timeout: 45_000 });
      const declinedId = await waitForLoadNotification(second, 'Application declined', loadUuid);
      await second.getByRole('button', { name: 'Notifications', exact: true }).click();
      const declined = second.locator(`[data-notification-id="${declinedId}"]`);
      await expect(declined).toBeVisible({ timeout: 60_000 });
      await declined.click();
      await expect(second).toHaveURL(new RegExp(`/truck-owner/load-board/${loadUuid}`), { timeout: 45_000 });
      await expect(second.getByText(/rejected|declined/i).first()).toBeVisible({ timeout: 60_000 });
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  });

  test('existing acceptance notifications open the selected and declined application', async ({ page }) => {
    const firstEmail = process.env.E2E_OWNER_EMAIL;
    const secondEmail = process.env.E2E_SECOND_OWNER_EMAIL;
    const loadUuid = process.env.E2E_NOTIFICATION_LOAD_UUID;
    test.skip(!firstEmail || !secondEmail || !loadUuid, 'Provide both owners and a load with a selected and a declined application.');
    test.setTimeout(300_000);
    for (const [email, title] of [[firstEmail!, 'Offer accepted'], [secondEmail!, 'Application declined']]) {
      await login(page, { role: 'truck-owner', name: '', email, mobile: '' });
      const id = await waitForLoadNotification(page, title, loadUuid!);
      await page.getByRole('button', { name: 'Notifications', exact: true }).click();
      const item = page.locator(`[data-notification-id="${id}"]`);
      await expect(item).toBeVisible({ timeout: 60_000 });
      const markedRead = page.waitForResponse((response) => response.request().method() === 'PATCH'
        && new URL(response.url()).pathname.endsWith(`/api/notifications/${id}/read`), { timeout: 45_000 });
      await item.click();
      expect((await markedRead).status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`/truck-owner/load-board/${loadUuid}`), { timeout: 45_000 });
      console.log(`Verified ${title} notification ${id} for ${email}, load ${loadUuid}`);
    }
  });

  test('booking workflow notification opens its specific booking', async ({ page }) => {
    const email = process.env.E2E_SHIPPER_EMAIL;
    const bookingUuid = process.env.E2E_BOOKING_UUID;
    const reference = process.env.E2E_BOOKING_REFERENCE;
    test.skip(!email || !bookingUuid || !reference, 'Provide a shipper and an existing booking with workflow notifications.');
    test.setTimeout(180_000);
    await login(page, { role: 'shipper', name: '', email: email!, mobile: '' });
    const response = await page.waitForResponse(async (candidate) => {
      if (candidate.request().method() !== 'GET' || !new URL(candidate.url()).pathname.endsWith('/api/notifications') || !candidate.ok()) return false;
      const body = await candidate.json().catch(() => null) as { data?: { title: string; data?: { booking_uuid?: string } }[] } | null;
      return !!body?.data?.some((item) => item.title === 'Trip started' && item.data?.booking_uuid === bookingUuid);
    }, { timeout: 90_000 });
    const body = await response.json() as { data: { id: string; title: string; data?: { booking_uuid?: string } }[] };
    const notification = body.data.find((item) => item.title === 'Trip started' && item.data?.booking_uuid === bookingUuid)!;
    await page.goto('/shipper/notifications');
    const row = page.locator(`.notif-row[data-notification-id="${notification.id}"]`);
    await expect(row).toBeVisible({ timeout: 45_000 });
    await row.getByRole('button', { name: 'Open', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/shipper/bookings\\?booking=${bookingUuid}`), { timeout: 45_000 });
    const card = page.locator('.card').filter({ hasText: reference! }).first();
    await expect(card).toBeVisible({ timeout: 60_000 });
    await expect(card.getByRole('button', { name: /hide details/i })).toBeVisible();
    console.log(`Verified booking notification ${notification.id}, booking ${reference} (${bookingUuid})`);
  });

  test('chat notification opens the specific conversation', async ({ page }) => {
    const shipper = process.env.E2E_SHIPPER_EMAIL;
    const owner = process.env.E2E_OWNER_EMAIL;
    const loadUuid = process.env.E2E_NOTIFICATION_LOAD_UUID;
    test.skip(!shipper || !owner || !loadUuid, 'Provide test participants and an accepted load.');
    test.setTimeout(300_000);
    await login(page, { role: 'shipper', name: '', email: shipper!, mobile: '' });
    await page.goto(`/shipper/load-board/${loadUuid}`);
    await page.getByRole('button', { name: /^chat$/i }).click({ timeout: 90_000 });
    const message = `Notification chat check ${runId}`;
    await expect(page.getByPlaceholder(/type a message/i)).toBeEnabled({ timeout: 90_000 });
    await page.getByPlaceholder(/type a message/i).fill(message);
    await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled({ timeout: 90_000 });
    const sent = page.waitForResponse((candidate) => candidate.request().method() === 'POST'
      && /\/api\/marketplace-bookings\/[^/]+\/messages$/.test(new URL(candidate.url()).pathname), { timeout: 45_000 });
    await page.getByRole('button', { name: 'Send message' }).click();
    const sentResponse = await sent;
    expect(sentResponse.status()).toBe(201);
    const messageUuid = (await sentResponse.json() as { data: { uuid: string } }).data.uuid;
    await login(page, { role: 'truck-owner', name: '', email: owner!, mobile: '' });
    const notificationResponse = await page.waitForResponse(async (candidate) => {
      if (candidate.request().method() !== 'GET' || !new URL(candidate.url()).pathname.endsWith('/api/notifications') || !candidate.ok()) return false;
      const body = await candidate.json().catch(() => null) as { data?: { data?: { message_uuid?: string } }[] } | null;
      return !!body?.data?.some((item) => item.data?.message_uuid === messageUuid);
    }, { timeout: 90_000 });
    const body = await notificationResponse.json() as { data: { id: string; data?: { message_uuid?: string } }[] };
    const id = body.data.find((item) => item.data?.message_uuid === messageUuid)!.id;
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    await page.locator(`[data-notification-id="${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/truck-owner/load-board/${loadUuid}\\?chat=`), { timeout: 45_000 });
    await expect(page.getByPlaceholder(/type a message/i)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(message, { exact: true })).toBeVisible({ timeout: 60_000 });
    console.log(`Verified chat notification ${id}, load ${loadUuid}`);
  });

  test('dispute notification opens its specific booking and dispute', async ({ page }) => {
    const shipper = process.env.E2E_SHIPPER_EMAIL;
    const owner = process.env.E2E_OWNER_EMAIL;
    const vehicle = process.env.E2E_OWNER_VEHICLE;
    test.skip(!shipper || !owner || !vehicle, 'Provide test participants and an owned test vehicle.');
    test.setTimeout(600_000);
    const shipperUser = { role: 'shipper' as const, name: '', email: shipper!, mobile: '' };
    const ownerUser = { role: 'truck-owner' as const, name: '', email: owner!, mobile: '' };
    await login(page, shipperUser);
    const loadUuid = await postLoad(page);
    console.log(`Dispute test load: ${loadUuid}; shipper ${shipper}; owner ${owner}`);
    await login(page, ownerUser);
    await applyForLoad(page, loadUuid, vehicle!, '18500');
    await login(page, shipperUser);
    await page.goto(`/shipper/load-board/${loadUuid}`);
    const booking = await acceptApplicationAndCreateBooking(page, '18500', false);
    console.log(`Dispute test booking: ${booking.booking_reference} (${booking.uuid})`);
    await page.goto(`/shipper/bookings?booking=${booking.uuid}`);
    const card = page.locator('.card').filter({ hasText: booking.booking_reference }).first();
    await expect(card).toBeVisible({ timeout: 90_000 });
    await card.getByRole('button', { name: /raise a dispute/i }).click({ timeout: 90_000 });
    const reason = `Notification test dispute ${runId}`;
    await page.locator('#dispute-reason').fill(reason);
    const submitted = page.waitForResponse((response) => response.request().method() === 'POST'
      && new URL(response.url()).pathname.endsWith(`/api/marketplace-bookings/${booking.uuid}/disputes`), { timeout: 45_000 });
    await page.getByRole('button', { name: /submit to support/i }).click();
    const submittedResponse = await submitted;
    expect(submittedResponse.status()).toBe(201);
    const disputeUuid = (await submittedResponse.json() as { data: { uuid: string } }).data.uuid;
    console.log(`Open test dispute: ${disputeUuid}, booking ${booking.booking_reference}`);
    await expect(card.getByText(reason, { exact: true })).toBeVisible({ timeout: 90_000 });
    await login(page, ownerUser);
    const notificationResponse = await page.waitForResponse(async (response) => {
      if (response.request().method() !== 'GET' || !new URL(response.url()).pathname.endsWith('/api/notifications') || !response.ok()) return false;
      const body = await response.json().catch(() => null) as { data?: { title: string; data?: { booking_uuid?: string; dispute_uuid?: string } }[] } | null;
      return !!body?.data?.some((item) => item.title === 'Dispute raised' && item.data?.booking_uuid === booking.uuid && item.data?.dispute_uuid === disputeUuid);
    }, { timeout: 90_000 });
    const body = await notificationResponse.json() as { data: { id: string; title: string; data?: { booking_uuid?: string; dispute_uuid?: string } }[] };
    const id = body.data.find((item) => item.title === 'Dispute raised' && item.data?.booking_uuid === booking.uuid && item.data?.dispute_uuid === disputeUuid)!.id;
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    const markedRead = page.waitForResponse((response) => response.request().method() === 'PATCH'
      && new URL(response.url()).pathname.endsWith(`/api/notifications/${id}/read`), { timeout: 45_000 });
    await page.locator(`[data-notification-id="${id}"]`).click();
    expect((await markedRead).status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/truck-owner/bookings\\?booking=${booking.uuid}`), { timeout: 45_000 });
    const ownerCard = page.locator('.card').filter({ hasText: booking.booking_reference }).first();
    await expect(ownerCard.getByText(reason, { exact: true })).toBeVisible({ timeout: 90_000 });
    await expect(ownerCard.getByText('Open', { exact: true })).toBeVisible();
    console.log(`Verified dispute notification ${id}; load ${loadUuid}; booking ${booking.booking_reference} (${booking.uuid}); dispute ${disputeUuid}`);
  });

  test('open dispute hides the token payment action', async ({ page }) => {
    const owner = process.env.E2E_OWNER_EMAIL;
    const bookingUuid = process.env.E2E_DISPUTE_BOOKING_UUID;
    const reference = process.env.E2E_DISPUTE_BOOKING_REFERENCE;
    test.skip(!owner || !bookingUuid || !reference, 'Provide a test owner and existing disputed booking.');
    test.setTimeout(180_000);
    await login(page, { role: 'truck-owner', name: '', email: owner!, mobile: '' });
    await page.goto(`/truck-owner/bookings?booking=${bookingUuid}`);
    const card = page.locator('.card').filter({ hasText: reference! }).first();
    await expect(card.getByText('Open', { exact: true })).toBeVisible({ timeout: 90_000 });
    await expect(card.getByRole('button', { name: /pay booking token/i })).toHaveCount(0);
  });

  test('resolved dispute shows the recorded outcome without claiming a payment occurred', async ({ page }) => {
    const shipper = process.env.E2E_SHIPPER_EMAIL;
    const bookingUuid = process.env.E2E_DISPUTE_BOOKING_UUID;
    const reference = process.env.E2E_DISPUTE_BOOKING_REFERENCE;
    test.skip(!shipper || !bookingUuid || !reference, 'Provide a test shipper and existing disputed booking.');
    test.setTimeout(180_000);
    // Optional test-only proxy for a second local frontend port. No server CORS
    // configuration is changed; application requests still reach the local API.
    const proxyOrigin = process.env.E2E_TEST_CORS_PROXY === 'true' ? process.env.E2E_BASE_URL : undefined;
    if (proxyOrigin) {
      await page.route('http://localhost:8080/api/**', async (route) => {
        if (route.request().method() === 'OPTIONS') {
          await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': proxyOrigin, 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS', 'access-control-allow-headers': 'authorization, content-type, accept' } });
          return;
        }
        const response = await route.fetch({ headers: { ...route.request().headers(), origin: 'http://localhost:4300' } });
        await route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': proxyOrigin, 'access-control-allow-credentials': 'true' } });
      });
    }
    await login(page, { role: 'shipper', name: '', email: shipper!, mobile: '' });
    // Simulate only the read response: the actual test dispute remains open in the database.
    await page.route(/\/api\/marketplace-bookings(?:\?.*)?$/, async (route) => {
      if (route.request().method() !== 'GET') { await route.fallback(); return; }
      const response = await route.fetch(proxyOrigin ? { headers: { ...route.request().headers(), origin: 'http://localhost:4300' } } : {});
      const body = await response.json() as { data: Array<{ uuid: string; dispute?: { status: string; resolution?: string } }> };
      const booking = body.data.find((item) => item.uuid === bookingUuid);
      if (booking?.dispute) booking.dispute = { ...booking.dispute, status: 'resolved', resolution: 'refunded' };
      await route.fulfill({ response, json: body, ...(proxyOrigin ? { headers: { ...response.headers(), 'access-control-allow-origin': proxyOrigin, 'access-control-allow-credentials': 'true' } } : {}) });
    });
    await page.goto(`/shipper/bookings?booking=${bookingUuid}`);
    const card = page.locator('.card').filter({ hasText: reference! }).first();
    await expect(card.getByText('Resolved', { exact: true })).toBeVisible({ timeout: 90_000 });
    await expect(card.getByText(/refund requested; payment-provider processing may still be pending/i)).toBeVisible();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('admin phone-call decision notifies both parties and records no payment', async ({ page }) => {
    const shipper = process.env.E2E_SHIPPER_EMAIL;
    const owner = process.env.E2E_OWNER_EMAIL;
    const bookingUuid = process.env.E2E_DISPUTE_BOOKING_UUID;
    const reference = process.env.E2E_DISPUTE_BOOKING_REFERENCE;
    test.skip(!shipper || !owner || !bookingUuid || !reference, 'Provide existing open-dispute test data.');
    test.setTimeout(300_000);
    await login(page, { role: 'admin', name: 'Admin', email: 'admin@test.local', mobile: '' }, 'password123');
    await page.goto(`/admin/bookings?booking=${bookingUuid}`);
    const adminCard = page.locator('.card').filter({ hasText: reference! }).first();
    await expect(adminCard.getByRole('button', { name: /record decision after call/i })).toBeVisible({ timeout: 90_000 });
    await adminCard.getByRole('button', { name: /record decision after call/i }).click();
    await page.locator('#decision-booking').selectOption('cancel');
    await page.locator('#decision-owner-token').selectOption('no_action');
    await page.locator('#decision-provider-token').selectOption('no_action');
    await page.locator('#decision-commission').selectOption('no_action');
    const summary = `Browser phone-call decision ${runId}: cancel without payment action.`;
    await page.locator('#decision-summary').fill(summary);
    const resolved = page.waitForResponse((response) => response.request().method() === 'POST'
      && /\/api\/marketplace-disputes\/[^/]+\/resolve$/.test(new URL(response.url()).pathname), { timeout: 45_000 });
    await page.getByRole('button', { name: /record decision after call/i }).last().click();
    expect((await resolved).status()).toBe(200);
    await expect(adminCard.getByText(/cancel booking/i)).toBeVisible({ timeout: 90_000 });
    await expect(adminCard.getByText(summary)).toBeVisible();
    for (const participant of [
      { role: 'shipper' as const, name: '', email: shipper!, mobile: '' },
      { role: 'truck-owner' as const, name: '', email: owner!, mobile: '' },
    ]) {
      await login(page, participant);
      const notificationResponse = await page.waitForResponse(async (response) => {
        if (response.request().method() !== 'GET' || !new URL(response.url()).pathname.endsWith('/api/notifications') || !response.ok()) return false;
        const body = await response.json().catch(() => null) as { data?: { title: string; data?: { booking_uuid?: string } }[] } | null;
        return !!body?.data?.some((item) => item.title === 'Dispute resolved' && item.data?.booking_uuid === bookingUuid);
      }, { timeout: 90_000 });
      const body = await notificationResponse.json() as { data: { id: string; title: string; data?: { booking_uuid?: string } }[] };
      const id = body.data.find((item) => item.title === 'Dispute resolved' && item.data?.booking_uuid === bookingUuid)!.id;
      await page.getByRole('button', { name: 'Notifications', exact: true }).click();
      await page.locator(`[data-notification-id="${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/${participant.role}/bookings\\?booking=${bookingUuid}`), { timeout: 45_000 });
      const participantCard = page.locator('.card').filter({ hasText: reference! }).first();
      await expect(participantCard.getByText(/cancel booking/i)).toBeVisible({ timeout: 90_000 });
      await expect(participantCard.getByText(summary)).toBeVisible();
    }
  });

  test('recorded phone-call decision notification opens the cancelled booking for both parties', async ({ page }) => {
    const shipper = process.env.E2E_SHIPPER_EMAIL;
    const owner = process.env.E2E_OWNER_EMAIL;
    const bookingUuid = process.env.E2E_DISPUTE_BOOKING_UUID;
    const reference = process.env.E2E_DISPUTE_BOOKING_REFERENCE;
    const summary = process.env.E2E_DISPUTE_DECISION_SUMMARY;
    test.skip(!shipper || !owner || !bookingUuid || !reference || !summary, 'Provide the recorded decision test data.');
    test.setTimeout(240_000);
    for (const participant of [
      { role: 'shipper' as const, name: '', email: shipper!, mobile: '' },
      { role: 'truck-owner' as const, name: '', email: owner!, mobile: '' },
    ]) {
      await login(page, participant);
      const notificationResponse = await page.waitForResponse(async (response) => {
        if (response.request().method() !== 'GET' || !new URL(response.url()).pathname.endsWith('/api/notifications') || !response.ok()) return false;
        const body = await response.json().catch(() => null) as { data?: { title: string; data?: { booking_uuid?: string } }[] } | null;
        return !!body?.data?.some((item) => item.title === 'Dispute resolved' && item.data?.booking_uuid === bookingUuid);
      }, { timeout: 90_000 });
      const body = await notificationResponse.json() as { data: { id: string; title: string; data?: { booking_uuid?: string } }[] };
      const id = body.data.find((item) => item.title === 'Dispute resolved' && item.data?.booking_uuid === bookingUuid)!.id;
      await page.getByRole('button', { name: 'Notifications', exact: true }).click();
      await page.locator(`[data-notification-id="${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/${participant.role}/bookings\\?booking=${bookingUuid}`), { timeout: 45_000 });
      const participantCard = page.locator('.card').filter({ hasText: reference! }).first();
      await expect(participantCard.getByText(/cancel booking/i)).toBeVisible({ timeout: 90_000 });
      await expect(participantCard.getByText(summary!)).toBeVisible();
      await expect(participantCard.getByText(/no action/i)).toHaveCount(3);
    }
  });

  test('admin phone-call continue decision restores the awaiting-token booking and notifies both parties', async ({ page }) => {
    const shipper = process.env.E2E_SHIPPER_EMAIL;
    const owner = process.env.E2E_OWNER_EMAIL;
    const vehicle = process.env.E2E_OWNER_VEHICLE;
    test.skip(!shipper || !owner || !vehicle, 'Provide test participants and an owned test vehicle.');
    test.setTimeout(600_000);
    const shipperUser = { role: 'shipper' as const, name: '', email: shipper!, mobile: '' };
    const ownerUser = { role: 'truck-owner' as const, name: '', email: owner!, mobile: '' };
    await login(page, shipperUser);
    const loadUuid = await postLoad(page);
    await login(page, ownerUser);
    await applyForLoad(page, loadUuid, vehicle!, '18500');
    await login(page, shipperUser);
    await page.goto(`/shipper/load-board/${loadUuid}`);
    const booking = await acceptApplicationAndCreateBooking(page, '18500', false);
    console.log(`Continue-decision test load ${loadUuid}; booking ${booking.booking_reference} (${booking.uuid})`);
    await page.goto(`/shipper/bookings?booking=${booking.uuid}`);
    const shipperCard = page.locator('.card').filter({ hasText: booking.booking_reference }).first();
    await shipperCard.getByRole('button', { name: /raise a dispute/i }).click({ timeout: 90_000 });
    await page.locator('#dispute-reason').fill(`Continue test dispute ${runId}`);
    const raised = page.waitForResponse((response) => response.request().method() === 'POST'
      && new URL(response.url()).pathname.endsWith(`/api/marketplace-bookings/${booking.uuid}/disputes`), { timeout: 45_000 });
    await page.getByRole('button', { name: /submit to support/i }).click();
    expect((await raised).status()).toBe(201);
    await login(page, { role: 'admin', name: 'Admin', email: 'admin@test.local', mobile: '' }, 'password123');
    await page.goto(`/admin/bookings?booking=${booking.uuid}`);
    const adminCard = page.locator('.card').filter({ hasText: booking.booking_reference }).first();
    await adminCard.getByRole('button', { name: /record decision after call/i }).click({ timeout: 90_000 });
    await page.locator('#decision-booking').selectOption('continue');
    await page.locator('#decision-owner-token').selectOption('no_action');
    await page.locator('#decision-provider-token').selectOption('no_action');
    await page.locator('#decision-commission').selectOption('no_action');
    const summary = `Browser phone-call decision ${runId}: continue without payment action.`;
    await page.locator('#decision-summary').fill(summary);
    const resolved = page.waitForResponse((response) => response.request().method() === 'POST'
      && /\/api\/marketplace-disputes\/[^/]+\/resolve$/.test(new URL(response.url()).pathname), { timeout: 45_000 });
    await page.getByRole('button', { name: /record decision after call/i }).last().click();
    expect((await resolved).status()).toBe(200);
    await expect(adminCard.getByText(/continue booking/i)).toBeVisible({ timeout: 90_000 });
    await expect(adminCard.getByText(summary)).toBeVisible();
    for (const participant of [shipperUser, ownerUser]) {
      await login(page, participant);
      const notificationResponse = await page.waitForResponse(async (response) => {
        if (response.request().method() !== 'GET' || !new URL(response.url()).pathname.endsWith('/api/notifications') || !response.ok()) return false;
        const body = await response.json().catch(() => null) as { data?: { title: string; data?: { booking_uuid?: string } }[] } | null;
        return !!body?.data?.some((item) => item.title === 'Dispute resolved' && item.data?.booking_uuid === booking.uuid);
      }, { timeout: 90_000 });
      const body = await notificationResponse.json() as { data: { id: string; title: string; data?: { booking_uuid?: string } }[] };
      const id = body.data.find((item) => item.title === 'Dispute resolved' && item.data?.booking_uuid === booking.uuid)!.id;
      await page.getByRole('button', { name: 'Notifications', exact: true }).click();
      await page.locator(`[data-notification-id="${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/${participant.role}/bookings\\?booking=${booking.uuid}`), { timeout: 45_000 });
      const participantCard = page.locator('.card').filter({ hasText: booking.booking_reference }).first();
      await expect(participantCard.getByText(/continue booking/i)).toBeVisible({ timeout: 90_000 });
      await expect(participantCard.getByText(summary)).toBeVisible();
      await expect(participantCard.getByText(/awaiting deposit/i).first()).toBeVisible();
    }
  });

  test('counter-offer and explicit rejection notifications open the right load and offers', async ({ page }) => {
    const shipper = process.env.E2E_SHIPPER_EMAIL;
    const owner = process.env.E2E_OWNER_EMAIL;
    const vehicle = process.env.E2E_OWNER_VEHICLE;
    test.skip(!shipper || !owner || !vehicle, 'Provide test participants and an owned test vehicle.');
    test.setTimeout(600_000);
    const shipperUser = { role: 'shipper' as const, name: '', email: shipper!, mobile: '' };
    const ownerUser = { role: 'truck-owner' as const, name: '', email: owner!, mobile: '' };
    await login(page, shipperUser);
    const loadUuid = await postLoad(page);
    console.log(`Counter-offer notification test load: ${loadUuid}; shipper ${shipper}; owner ${owner}`);
    await login(page, ownerUser);
    await applyForLoad(page, loadUuid, vehicle!, '18500');
    await login(page, shipperUser);
    await page.goto(`/shipper/load-board/${loadUuid}`);
    await page.getByRole('button', { name: /view offers/i }).click({ timeout: 90_000 });
    await page.locator('input[name="counterAmount"]').fill('17000');
    const ownerOffer = page.waitForResponse((response) => response.request().method() === 'POST'
      && /\/api\/applications\/[^/]+\/offers$/.test(new URL(response.url()).pathname), { timeout: 45_000 });
    await page.getByRole('button', { name: /send counter-offer/i }).click();
    expect((await ownerOffer).status()).toBe(201);
    await login(page, ownerUser);
    const providerNotice = await waitForLoadNotification(page, 'New counter-offer received', loadUuid);
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    await page.locator(`[data-notification-id="${providerNotice}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/truck-owner/load-board/${loadUuid}\\?offers=`), { timeout: 45_000 });
    const providerCounter = page.locator('input[name="counterAmount"]');
    await expect(providerCounter).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/17,000/).first()).toBeVisible({ timeout: 60_000 });
    await providerCounter.fill('18000');
    const providerOffer = page.waitForResponse((response) => response.request().method() === 'POST'
      && /\/api\/applications\/[^/]+\/offers$/.test(new URL(response.url()).pathname), { timeout: 45_000 });
    await page.getByRole('button', { name: /send counter-offer/i }).click();
    expect((await providerOffer).status()).toBe(201);
    await login(page, shipperUser);
    const shipperNotice = await waitForLoadNotification(page, 'New counter-offer received', loadUuid);
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    await page.locator(`[data-notification-id="${shipperNotice}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/shipper/load-board/${loadUuid}\\?offers=`), { timeout: 45_000 });
    await expect(page.locator('input[name="counterAmount"]')).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/18,000/).first()).toBeVisible({ timeout: 60_000 });
    await page.getByRole('button', { name: /^reject$/i }).click();
    const rejected = page.waitForResponse((response) => response.request().method() === 'POST'
      && /\/api\/loads\/[^/]+\/applications\/[^/]+\/reject$/.test(new URL(response.url()).pathname), { timeout: 45_000 });
    await page.getByRole('button', { name: /^confirm$/i }).click();
    expect((await rejected).status()).toBe(200);
    await login(page, ownerUser);
    const rejectedNotice = await waitForLoadNotification(page, 'Application declined', loadUuid);
    await page.getByRole('button', { name: 'Notifications', exact: true }).click();
    await page.locator(`[data-notification-id="${rejectedNotice}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/truck-owner/load-board/${loadUuid}`), { timeout: 45_000 });
    await expect(page.getByText(/offer declined/i)).toBeVisible({ timeout: 90_000 });
    console.log(`Verified counter-offers and explicit decline for load ${loadUuid}`);
  });
});
