import { expect, test, type BrowserContext, type Page } from '@playwright/test';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000 }); test.setTimeout(150_000);
const apiBase = 'http://localhost:8080/api/';
const path = 'admin/newsletter/subscribers';
const queue = (page: Page) => page.locator('app-newsletter-management');
async function scoped(context: BrowserContext) {
  const blocked: string[] = []; await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', route => {
    const r = route.request(); const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())
      && !(r.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname))
      && !(r.method() === 'PATCH' && /^\/api\/notifications\/[a-f0-9-]{36}\/read$/.test(url.pathname))) {
      blocked.push(r.method()+' '+url.pathname); return route.abort();
    }
    return route.continue();
  }); return blocked;
}
async function login(page: Page, email = 'admin@test.local', password = 'password123') {
  await page.goto('/auth/login'); await expect(page.locator('vite-error-overlay')).toHaveCount(0); await page.locator('input[name=identifier]').fill(email);
  await page.locator('input[name=password]').fill(password);
  const [response] = await Promise.all([page.waitForResponse(r => new URL(r.url()).pathname === '/api/auth/login' && r.request().method() === 'POST'), page.getByRole('button', { name: /^Log In$/i }).click()]);
  expect(response.status()).toBe(200); await expect(page).toHaveURL(/\/admin\/(access|dashboard)$/);
}
async function api(page: Page, route: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  return page.request.get(apiBase+route, { headers: { Accept: 'application/json', Authorization: 'Bearer '+token } });
}

test('real Super Admin bell opens saved consent records, exact email lookup and reloadable history', async ({ page, context }, info) => {
  const blocked = await scoped(context); await login(page);
  const response = await api(page, path); expect(response.status()).toBe(200); expect(response.headers()['cache-control']).toContain('no-store');
  const body = await response.json(); expect(body.data.length).toBeGreaterThan(0);
  const subscriber = body.data.find((r: any) => r.status === 'unsubscribed') ?? body.data[0];
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  const bell = page.locator('.notif-dropdown-item').filter({ hasText: 'Newsletter access available' });
  await expect(bell).toHaveCount(1); await bell.click(); await expect(page).toHaveURL(/\/admin\/newsletter$/);
  await expect(queue(page).locator('.kpi-value').first()).toHaveText(String(body.meta.summary.total));
  await queue(page).getByLabel('Exact email address', { exact: true }).fill(' '+subscriber.email.toUpperCase()+' ');
  await queue(page).getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(queue(page).locator('tr[data-consent-id]')).toHaveCount(1);
  await queue(page).getByRole('link', { name: 'View history', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('subscriber='+subscriber.uuid+'$'));
  await expect(queue(page).locator('[data-consent-email]')).toHaveText(subscriber.email);
  await expect(queue(page).locator('[data-consent-status]')).toHaveText(subscriber.status === 'unsubscribed' ? 'Unsubscribed' : 'Pending confirmation');
  const details = await api(page, path+'/'+subscriber.uuid); expect(details.status()).toBe(200);
  const detail = (await details.json()).data; expect(detail.requests.length).toBeGreaterThan(0);
  await expect(queue(page).locator('.consent-detail')).toContainText('Local test link — no email sent');
  await expect(queue(page).getByRole('button', { name: /Resubscribe|Remove|Delete|Send campaign|Unsubscribe/i })).toHaveCount(0);
  await page.reload(); await expect(queue(page).locator('[data-consent-email]')).toHaveText(subscriber.email);
  await page.screenshot({ path: info.outputPath('real-newsletter-history.png'), fullPage: true });
  expect(blocked).toEqual([]);
  await info.attach('newsletter-read.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({
    database: 'transportseva', actor: 'admin@test.local', subscriber: { uuid: subscriber.uuid, email: subscriber.email, status: subscriber.status },
    summary: body.meta.summary, savedRequests: detail.history.total, blockedWrites: blocked,
  })) });
});

test('delayed failing read shows animation and retries into real data', async ({ page, context }) => {
  const blocked = await scoped(context); await login(page); let release!: () => void;
  const gate = new Promise<void>(resolve => release = resolve); let requests = 0;
  const match = '**/api/admin/newsletter/subscribers?*';
  await page.route(match, async route => { requests++; await gate; return route.fulfill({ status: 503, json: { success: false } }); });
  try {
    await page.goto('/admin/newsletter'); await expect(queue(page).locator('[aria-busy=true]')).toBeVisible();
    await expect(queue(page).getByRole('button', { name: 'Apply filters', exact: true })).toBeDisabled();
    await expect(queue(page).locator('.kpi-grid')).toHaveCount(0); expect(requests).toBe(1);
    release(); await expect(queue(page).getByRole('alert')).toContainText('could not be loaded');
    await page.unroute(match); await queue(page).getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(queue(page).locator('tr[data-consent-id]').first()).toBeVisible();
    await expect(queue(page).getByRole('alert')).toHaveCount(0); expect(blocked).toEqual([]);
  } finally { release(); }
});

test('Support and KYC staff cannot navigate to or retrieve newsletter data', async ({ page, context }) => {
  const blocked = await scoped(context);
  for (const suffix of ['support', 'kyc']) {
    await page.evaluate(() => localStorage.clear()).catch(() => undefined);
    await login(page, 'qa-staff-20261029-'+suffix+'@transportseva.test', 'StaffQA@2026!');
    await expect(page.locator('a[href="/admin/newsletter"]')).toHaveCount(0);
    expect((await api(page, path)).status()).toBe(403);
    expect((await api(page, path+'/12345678-1234-1234-1234-123456789012')).status()).toBe(403);
    await page.goto('/admin/newsletter'); await expect(page).toHaveURL(/\/admin\/access$/);
  }
  expect(blocked).toEqual([]);
});

test('controlled pagination and Hindi empty state never alter saved consent', async ({ page, context }) => {
  const blocked = await scoped(context); await login(page); const calls: string[] = [];
  const fixture = { uuid: '12345678-1234-1234-1234-123456789012', email: 'explicit-browser-fixture@example.test', status: 'pending',
    consent_version: null, created_at: '2026-11-18T12:00:00Z', confirmed_at: null, unsubscribed_at: null };
  await page.route('**/api/admin/newsletter/subscribers?*', route => {
    const url = new URL(route.request().url()); calls.push(url.search); const page = Number(url.searchParams.get('page'));
    return route.fulfill({ json: { success: true, data: page === 1 ? [fixture] : [], meta: { current_page: page, last_page: 2, total: 26, summary: { total: 26, pending: 26, subscribed: 0, unsubscribed: 0 } } } });
  });
  await page.goto('/admin/newsletter'); await expect(queue(page)).toContainText(fixture.email);
  await queue(page).getByRole('button', { name: 'Next', exact: true }).click();
  await expect(queue(page)).toContainText('Page 2 / 2'); await expect(queue(page)).toContainText('No consent records match');
  expect(calls.some(q => q.includes('page=2'))).toBe(true);
  await page.getByRole('button', { name: 'Change language', exact: true }).click();
  await expect(queue(page)).toContainText('सहमति रिकॉर्ड नहीं मिले'); expect(blocked).toEqual([]);
});
