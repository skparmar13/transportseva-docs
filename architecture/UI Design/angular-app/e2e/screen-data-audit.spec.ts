import { expect, test, type Page, type BrowserContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Diagnostic collection, NOT a regression suite asserting prototypes are correct.
// A passing collection means inspection completed; findings may still block launch.
test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.beforeEach(async ({}, info) => {
  expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
});
const inventory = JSON.parse(readFileSync(resolve('test-results/screen-audit-2026-10-31/source-inventory.json'), 'utf8'));
type Actor = { role: string; email: string; password: string };
const actors: Actor[] = [
  { role: 'shipper', email: 'qa-recovery-1793377725393@transportseva.test', password: 'RecoveryFinal@2026!' },
  { role: 'truck-owner', email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026' },
  { role: 'driver', email: 'driver1@test.local', password: 'password123' },
];
const staff = [
  { code: 'SUPER_ADMIN', email: 'admin@test.local', password: 'password123' },
  ...['operations', 'kyc', 'finance', 'support'].map((role, index) => ({
    code: ['OPERATIONS_MANAGER', 'KYC_OFFICER', 'FINANCE_MANAGER', 'SUPPORT_AGENT'][index],
    email: 'qa-staff-20261029-' + role + '@transportseva.test', password: 'StaffQA@2026!',
  })),
];

async function readOnly(context: BrowserContext) {
  const blocked: string[] = [];
  await context.route('**/*', async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) { await route.abort(); return; }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())
      && !/\/api\/auth\/(login|refresh|logout)$/.test(url.pathname)) {
      blocked.push(request.method() + ' ' + url.pathname); await route.abort(); return;
    }
    await route.continue();
  });
  return blocked;
}
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const response = await page.request.get('http://localhost:8080/api/' + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
  return { status: response.status(), body: await response.json() };
}
async function login(page: Page, actor: Actor | typeof staff[number], isStaff = false) {
  await page.goto(isStaff ? '/auth/staff/login' : '/auth/login');
  await page.locator(isStaff ? '#staff-email' : 'input[name="identifier"]').fill(actor.email);
  await page.locator(isStaff ? '#staff-password' : 'input[name="password"]').fill(actor.password);
  const loggedIn = page.waitForResponse((response) => response.url().endsWith('/api/auth/login') && response.request().method() === 'POST');
  await page.getByRole('button', { name: isStaff ? 'Sign in to staff console' : /^log in$/i }).click();
  expect((await loggedIn).status()).toBe(200);
  await expect(page).toHaveURL(isStaff ? /\/admin\/access$/ : new RegExp('/' + (actor as Actor).role + '/dashboard$'), { timeout: 60_000 });
}
async function observe(page: Page, route: string) {
  const requests: { path: string; status: number }[] = [];
  const capture = (response: any) => {
    const url = new URL(response.url());
    if (url.pathname.startsWith('/api/') && response.request().method() === 'GET')
      requests.push({ path: url.pathname.replace(/[a-f0-9]{8}-[a-f0-9-]{27,}/gi, ':uuid'), status: response.status() });
  };
  page.on('response', capture);
  const response = await page.goto(route);
  if (await page.locator('app-root').count() === 0) {
    page.off('response', capture);
    return { requested: route, actual: new URL(page.url()).pathname, http: response?.status(), headings: [], apiGets: requests, renderIssue: 'No Angular root rendered' };
  }
  // Identity checks gate portal rendering. A login/error redirect is recorded,
  // never silently counted as the original screen passing.
  await page.waitForTimeout(500);
  if (!route.startsWith('/auth/') && !['/', '/about', '/pricing', '/contact', '/blog', '/blog-post', '/careers', '/help-center', '/privacy-policy', '/terms-conditions', '/refund-policy'].includes(route)) {
    await page.locator('h1, [role="alert"], .empty-state').first().waitFor({ state: 'visible', timeout: 25_000 }).catch(() => undefined);
  }
  const headings = (await page.locator('h1, .empty-state h3').allTextContents()).map((text) => text.trim());
  page.off('response', capture);
  return { requested: route, actual: new URL(page.url()).pathname, http: response?.status(), headings, apiGets: requests };
}
async function attach(name: string, evidence: object) {
  await test.info().attach(name + '.json', { body: Buffer.from(JSON.stringify({
    review_date: '31/10/2026', meaning: 'Diagnostic observations; not production sign-off',
    database: 'transportseva', business_writes: 'blocked', payment_gps_external_delivery: 'not exercised', ...evidence,
  }, null, 2)), contentType: 'application/json' });
}

test('collect public/auth screen and false-send observations without external messages', async ({ page, context }) => {
  test.setTimeout(240_000);
  const blocked = await readOnly(context); const rows = [];
  for (const row of inventory.records.filter((item: any) => ['public', 'auth'].includes(item.role) && item.kind === 'screen'))
    rows.push(await observe(page, row.route));
  await page.goto('/contact');
  await page.locator('input[name="fullName"]').fill('Local Audit Only');
  await page.locator('input[name="phone"]').fill('6000000000');
  await page.locator('input[name="email"]').fill('screen-audit@transportseva.test');
  await page.locator('textarea[name="message"]').fill('Browser-only diagnostic. No external inquiry is authorized.');
  await page.locator('.contact-form-card button[type="submit"]').click();
  const contactShowsSent = await page.locator('.contact-form-card .form-success').isVisible();
  await page.locator('input[name="newsletterEmail"]').fill('screen-audit@transportseva.test');
  await page.getByRole('button', { name: 'Subscribe', exact: true }).click();
  const newsletterStoredLocally = await page.evaluate(() => (localStorage.getItem('transportseva.newsletter.v1') ?? '').includes('screen-audit@transportseva.test'));
  await attach('public-auth-audit', { rows, contactShowsSent, newsletterStoredLocally, attemptedBlockedWrites: blocked });
});

test('collect homepage testimonial behavior for empty and failed approved-review API', async ({ page, context }) => {
  await readOnly(context);
  const observations = [];
  for (const status of [200, 503]) {
    await page.route('**/api/public/reviews?*', (route) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: status === 200, data: [] }) }));
    const reviewed = page.waitForResponse((response) => /\/api\/public\/reviews\?/.test(response.url()));
    await page.goto('/'); await reviewed;
    await page.waitForTimeout(300);
    observations.push({ approvedApiStatus: status, approvedApiCount: 0,
      sampleTestimonialVisible: await page.getByText('Rakesh Sharma', { exact: true }).isVisible() });
    await page.unroute('**/api/public/reviews?*');
  }
  await attach('homepage-publication-audit', { observations, api_failure: 'Injected locally; database and moderation records unchanged' });
});

for (const actor of actors) {
  test('collect ' + actor.role + ' routes and data-source gaps using existing identity', async ({ page, context }) => {
    test.setTimeout(360_000);
    const blocked = await readOnly(context); await login(page, actor); const rows = [];
    const self = await api(page, 'auth/me'); expect(self.status).toBe(200);
    const identity = { email: actor.email, uuid: self.body.data.uuid, role: self.body.data.role };
    for (const row of inventory.records.filter((item: any) => item.role === actor.role && item.kind === 'screen' && !item.route.includes(':') && !item.status.startsWith('deferred')))
      rows.push(await observe(page, row.route));
    const findings: any = {};
    await page.goto('/' + actor.role + '/dashboard');
    await page.locator('.kpi-value').first().waitFor();
    findings.dashboardKpis = await page.locator('.kpi-value').allTextContents();
    if (actor.role === 'shipper') {
      const owned = await api(page, 'loads?mine=true&per_page=100');
      findings.ownedLoadsApiStatus = owned.status; findings.ownedLoadsCount = owned.body.data?.length;
      findings.dashboardFirstKpi = (await page.locator('.kpi-value').first().innerText()).trim();
      await page.goto('/shipper/profile'); await page.getByText('Edit', { exact: true }).click();
      findings.profileSeedName = await page.locator('input[name="companyName"]').inputValue();
      await page.locator('input[name="companyName"]').fill('Audit local draft not saved');
      await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
      findings.profileDraftVisible = await page.getByText('Audit local draft not saved', { exact: true }).isVisible();
      await page.reload(); await page.getByText('Edit', { exact: true }).click();
      findings.profileNameAfterReload = await page.locator('input[name="companyName"]').inputValue();
      await page.goto('/shipper/support'); await page.getByRole('button', { name: 'New Ticket', exact: true }).click();
      await page.locator('input[name="subject"]').fill('Audit memory-only ticket');
      await page.locator('textarea[name="message"]').fill('Read-only diagnostic; no staff message may be sent.');
      await page.getByRole('button', { name: 'Submit Ticket', exact: true }).click();
      await page.getByText('Audit memory-only ticket', { exact: true }).first().waitFor();
      findings.ticketVisibleBeforeReload = true;
      await page.reload(); await page.getByRole('heading', { name: 'Support', exact: true }).waitFor();
      findings.ticketVisibleAfterReload = await page.getByText('Audit memory-only ticket', { exact: true }).count() > 0;
      const supportApi = await api(page, 'v1/support-tickets');
      findings.legacySupportApiStatus = supportApi.status;
      // Company portal cannot be granted by altering a cached display role.
      await page.evaluate(() => { const user = JSON.parse(localStorage.getItem('transportseva.api_user') ?? '{}'); user.role = 'company'; localStorage.setItem('transportseva.api_user', JSON.stringify(user)); });
      await page.goto('/company/dashboard'); await expect(page).toHaveURL(/\/shipper\/dashboard$/);
      findings.companyClaimRedirected = true;
    }
    if (actor.role === 'truck-owner') {
      const vehicles = await api(page, 'marketplace-vehicles'); expect(vehicles.status).toBe(200);
      findings.ownedVehiclesCount = vehicles.body.data?.length;
      await page.goto('/truck-owner/vehicles');
      if (vehicles.body.data?.length) {
        const uuid = vehicles.body.data[0].uuid;
        rows.push(await observe(page, '/truck-owner/vehicles/' + uuid));
        findings.realVehicleUuid = uuid;
        findings.realVehicleDetailsNotFound = await page.getByRole('heading', { name: 'Vehicle not found', exact: true }).isVisible();
      }
      const drivers = await api(page, 'marketplace-drivers');
      if (drivers.body.data?.length) rows.push(await observe(page, '/truck-owner/drivers/' + drivers.body.data[0].uuid));
    }
    await attach(actor.role + '-screen-audit', { identity, rows, findings, attemptedBlockedWrites: blocked });
  });
}

for (const actor of staff) {
  test('collect ' + actor.code + ' actual allowed and blocked screen boundaries', async ({ page, context }) => {
    test.setTimeout(360_000);
    const blocked = await readOnly(context); await login(page, actor, true);
    const self = await api(page, 'auth/me'); expect(self.status).toBe(200);
    const access = self.body.data.staff_access; expect(access.enforced).toBe(true); expect(access.role_code).toBe(actor.code);
    const rows = [];
    const candidates = inventory.records.filter((item: any) => item.role === 'admin' && item.kind === 'screen' && !item.route.includes(':') && !item.status.startsWith('deferred'));
    for (const row of candidates) {
      // Inspect every non-payment/non-GPS admin route for Super Admin; for
      // narrower roles inspect their capabilities plus representative denials.
      if (actor.code !== 'SUPER_ADMIN' && !access.routes.includes(row.route.split('/')[2]) && !['/admin/users', '/admin/dashboard', '/admin/support'].includes(row.route)) continue;
      const observation = await observe(page, row.route);
      if (!access.routes.includes(row.route.split('/')[2])) {
        await expect(page).toHaveURL(/\/admin\/access$/);
        observation.actual = new URL(page.url()).pathname;
      }
      rows.push(observation);
    }
    await attach(actor.code.toLowerCase() + '-screen-audit', { identity: { email: actor.email, uuid: self.body.data.uuid }, access, rows, attemptedBlockedWrites: blocked });
  });
}
