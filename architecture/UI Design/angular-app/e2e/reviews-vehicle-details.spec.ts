import { expect, test, type BrowserContext, type Page } from '@playwright/test';

// Read-only regression against the local transportseva application. Review
// failures are injected in this browser only; no reviews/vehicles are created.
test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
const apiBase = 'http://localhost:8080/api/';
const owner = { email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026' };
const other = { email: 'verify-truck-owner-1793028294862-63@transportseva.test', password: 'TransportSevaE2E@2026' };

async function readOnly(context: BrowserContext) {
  const blocked: string[] = [];
  await context.route('**/*', async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) && !/\/api\/auth\/(login|refresh|logout)$/.test(url.pathname)) {
      blocked.push(request.method() + ' ' + url.pathname); return route.abort();
    }
    return route.continue();
  });
  return blocked;
}
async function login(page: Page, actor = owner) {
  await page.goto('/auth/login');
  await page.locator('input[name="identifier"]').fill(actor.email);
  await page.locator('input[name="password"]').fill(actor.password);
  const loggedIn = page.waitForResponse((response) => response.url().endsWith('/api/auth/login') && response.request().method() === 'POST');
  await page.getByRole('button', { name: /^log in$/i }).click();
  expect((await loggedIn).status()).toBe(200);
  await expect(page).toHaveURL(/\/truck-owner\/dashboard$/, { timeout: 60_000 });
}
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  return page.request.get(apiBase + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
}
async function noSamples(page: Page) {
  const section = page.locator('.testimonials');
  for (const name of ['Rakesh Sharma', 'Vikram Singh', 'Neha Verma']) await expect(section).not.toContainText(name);
}
test.beforeEach(async ({ context }, info) => {
  expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
});

test('empty approved reviews never become sample testimonials, including server HTML', async ({ page, context, browser }, info) => {
  const blocked = await readOnly(context);
  await page.route('**/api/public/reviews?*', (route) => route.fulfill({ json: { success: true, data: [] } }));
  await page.goto('/');
  await expect(page.locator('.testimonials')).toContainText('No published customer reviews yet.');
  await expect(page.locator('.testi-card')).toHaveCount(0); await noSamples(page);
  // SSR must not briefly publish invented endorsements before hydration.
  const serverContext = await browser.newContext({ javaScriptEnabled: false });
  try {
    await readOnly(serverContext); const server = await serverContext.newPage();
    await server.goto(info.project.use.baseURL as string);
    await expect(server.locator('.testi-card')).toHaveCount(0);
    await noSamples(server);
  } finally { await serverContext.close(); }
  expect(blocked).toEqual([]);
});

test('failed reviews show retry and recover to the approved reviewer and actual stars', async ({ page, context }) => {
  await readOnly(context); let calls = 0;
  await page.route('**/api/public/reviews?*', (route) => {
    calls++;
    return calls === 1 ? route.fulfill({ status: 503, json: { success: false, data: [] } })
      : route.fulfill({ json: { success: true, data: [{ uuid: 'qa-published-browser-fixture', reviewer_name: 'Approved Browser Fixture',
        reviewer_role: 'shipper', rating: 3, comment: 'Browser-only approved review fixture.' }] } });
  });
  await page.goto('/');
  await expect(page.locator('.testimonials [role=alert]')).toContainText('Customer reviews could not be loaded.');
  await noSamples(page);
  await page.locator('.testimonials').getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.testi-card')).toHaveCount(1);
  await expect(page.locator('.testi-card')).toContainText('Approved Browser Fixture');
  await expect(page.locator('.testi-card .stars')).toHaveText('★★★☆☆');
  expect(calls).toBe(2); await noSamples(page);
});

test('loading reviews do not publish samples and Hindi empty state is translated', async ({ page, context }) => {
  await readOnly(context); let release!: () => void;
  const gate = new Promise<void>((resolve) => release = resolve);
  await page.route('**/api/public/reviews?*', async (route) => {
    await gate; await route.fulfill({ json: { success: true, data: [] } });
  });
  await page.goto('/');
  try {
    await expect(page.locator('.testimonials [aria-busy=true]')).toContainText('Loading customer reviews');
    await noSamples(page); await expect(page.locator('.testi-card')).toHaveCount(0);
  } finally { release(); }
  await expect(page.locator('.testimonials')).toContainText('No published customer reviews yet.');
  await page.evaluate(() => localStorage.setItem('ts_lang', 'hi'));
  // Override the beforeEach init script for the next document.
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'hi'));
  await page.reload();
  await expect(page.locator('.testimonials')).toContainText('अभी कोई ग्राहक समीक्षा प्रकाशित नहीं हुई है।');
  await noSamples(page);
});

test('registered vehicle View, reload and retry display the actual database record', async ({ page, context }) => {
  test.setTimeout(180_000); const blocked = await readOnly(context);
  await login(page); const response = await api(page, 'marketplace-vehicles');
  expect(response.status()).toBe(200); const vehicles = (await response.json()).data;
  expect(vehicles.length, 'Existing QA owner must have registered vehicles').toBeGreaterThan(0);
  const vehicle = vehicles[0]; const path = '/truck-owner/vehicles/' + vehicle.uuid;
  await page.goto('/truck-owner/vehicles');
  const row = page.locator('tr').filter({ hasText: vehicle.registration_number });
  await row.getByRole('button', { name: 'View', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(path + '$'));
  const view = page.locator('app-registered-vehicle-details');
  await expect(view.getByRole('heading', { name: vehicle.registration_number, exact: true })).toBeVisible();
  for (const value of [vehicle.make, vehicle.model, vehicle.vehicle_type, String(vehicle.capacity_tons)]) await expect(view).toContainText(value);
  await expect(view.getByRole('button', { name: /Assign Device|Log Maintenance|Log Fuel/ })).toHaveCount(0);
  await page.reload(); await expect(view.getByRole('heading', { name: vehicle.registration_number, exact: true })).toBeVisible();
  const failedPath = '**/api/marketplace-vehicles/' + vehicle.uuid;
  await page.route(failedPath, (route) => route.fulfill({ status: 503, json: { success: false, message: 'Injected local failure' } }));
  await view.getByRole('button', { name: 'Refresh details', exact: true }).click();
  await expect(view.getByRole('alert')).toContainText('Vehicle details could not be loaded');
  await expect(view.getByRole('heading', { name: vehicle.registration_number, exact: true })).toHaveCount(0);
  await page.unroute(failedPath);
  await view.getByRole('button', { name: 'Try again' }).click();
  await expect(view.getByRole('heading', { name: vehicle.registration_number, exact: true })).toBeVisible();
  await test.info().attach('registered-vehicle-read-evidence.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({
    database: 'transportseva', actor: owner.email, vehicle_uuid: vehicle.uuid, registration: vehicle.registration_number,
    make: vehicle.make, model: vehicle.model, route: path, business_write_attempts: blocked,
  }, null, 2)) });
  expect(blocked).toEqual([]);
});

test('another owner cannot retrieve or display this vehicle, and sample IDs are rejected', async ({ page, context }) => {
  test.setTimeout(180_000); const blocked = await readOnly(context);
  // Read the primary owner fleet through a separate authenticated browser,
  // then change identity through the real login flow, never a forged cache.
  await login(page); const owned = await api(page, 'marketplace-vehicles'); expect(owned.status()).toBe(200);
  const vehicle = (await owned.json()).data[0]; expect(vehicle?.uuid).toBeTruthy();
  await page.evaluate(() => localStorage.clear()); await login(page, other);
  const denied = await api(page, 'marketplace-vehicles/' + vehicle.uuid + '?owner_uuid=ignored');
  expect(denied.status()).toBe(404);
  expect(JSON.stringify(await denied.json())).not.toContain(vehicle.registration_number);
  await page.goto('/truck-owner/vehicles/' + vehicle.uuid);
  const view = page.locator('app-registered-vehicle-details');
  await expect(view.getByRole('heading', { name: 'Vehicle not found', exact: true })).toBeVisible();
  await expect(view).not.toContainText(vehicle.registration_number);
  await page.goto('/truck-owner/vehicles/v1');
  await expect(view.getByRole('heading', { name: 'Vehicle not found', exact: true })).toBeVisible();
  expect(blocked).toEqual([]);
});

test('live public review feed is rendered without local CMS fallback', async ({ page, context }) => {
  const blocked = await readOnly(context);
  const loaded = page.waitForResponse((response) => /\/api\/public\/reviews\?/.test(response.url()));
  await page.goto('/'); const response = await loaded; expect(response.status()).toBe(200);
  const reviews = (await response.json()).data;
  await expect(page.locator('.testi-card')).toHaveCount(reviews.length);
  for (const review of reviews) await expect(page.locator('.testimonials')).toContainText(review.reviewer_name);
  if (!reviews.length) await expect(page.locator('.testimonials')).toContainText('No published customer reviews yet.');
  await test.info().attach('public-review-feed-evidence.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({
    database: 'transportseva', approved_review_count: reviews.length, review_uuids: reviews.map((r: any) => r.uuid), business_write_attempts: blocked,
  }, null, 2)) });
  expect(blocked).toEqual([]);
});
