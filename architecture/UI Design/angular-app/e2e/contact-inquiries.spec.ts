import { expect, test, type BrowserContext, type Page } from '@playwright/test';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(150_000);
const apiBase = 'http://localhost:8080/api/';
const run = Date.now().toString();
const contact = (p: Page) => p.locator('app-contact');
const queue = (p: Page) => p.locator('app-contact-inquiries');
async function scoped(context: BrowserContext) {
  const blocked: string[] = [];
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', (route) => {
    const r = route.request(); const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    const allowed = ['GET', 'HEAD', 'OPTIONS'].includes(r.method())
      || (r.method() === 'POST' && (url.pathname === '/api/public/contact-inquiries' || /^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname)))
      || (r.method() === 'PATCH' && /^\/api\/(admin\/contact-inquiries\/[a-f0-9-]{36}|notifications\/[a-f0-9-]{36}\/read)$/.test(url.pathname));
    if (!allowed) { blocked.push(r.method() + ' ' + url.pathname); return route.abort(); }
    return route.continue();
  });
  return blocked;
}
async function fill(page: Page, suffix: string) {
  await page.goto('/contact'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await contact(page).locator('#contact-full_name').fill('QA Contact ' + suffix + ' ' + run);
  await contact(page).locator('#contact-phone').fill('+919000011223');
  await contact(page).locator('#contact-email').fill('qa-contact-' + run + '-' + suffix + '@transportseva.test');
  await contact(page).locator('#contact-subject').selectOption('general');
  await contact(page).locator('#contact-message').fill('QA CONTACT TEST ONLY. No call or email requested. ' + suffix + ' ' + run + ' <b>plain text only</b>');
}
async function submit(page: Page, status = 201) {
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/public/contact-inquiries') && r.request().method() === 'POST'), contact(page).getByRole('button', { name: 'Submit enquiry', exact: true }).click()]);
  expect(r.status()).toBe(status); return r;
}
async function login(page: Page, email = 'admin@test.local', password = 'password123') {
  await page.goto('/auth/login'); await page.locator('input[name=identifier]').fill(email); await page.locator('input[name=password]').fill(password);
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'), page.getByRole('button', { name: /^log in$/i }).click()]);
  expect(r.status()).toBe(200); await expect(page).toHaveURL(/\/admin\/access$/, { timeout: 60_000 });
}
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  return page.request.get(apiBase + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
}
async function followUp(page: Page, status: string, note: string, expected = 200) {
  await queue(page).locator('#follow-up-status').selectOption(status); await queue(page).locator('#follow-up-note').fill(note);
  const [r] = await Promise.all([page.waitForResponse((r) => /\/api\/admin\/contact-inquiries\/[a-f0-9-]{36}$/.test(r.url()) && r.request().method() === 'PATCH'), queue(page).getByRole('button', { name: 'Save follow-up', exact: true }).click()]);
  expect(r.status()).toBe(expected); return (await r.json()).data;
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));

test('anonymous validation, honest channels and Hindi form never fabricate a saved enquiry', async ({ page, context }) => {
  const blocked = await scoped(context); let writes = 0; page.on('request', (r) => { if (r.method() === 'POST' && r.url().endsWith('/api/public/contact-inquiries')) writes++; });
  await page.goto('/contact'); await expect(page.locator('vite-error-overlay')).toHaveCount(0); await contact(page).getByRole('button', { name: 'Submit enquiry', exact: true }).click();
  await expect(contact(page).locator('[role=alert]')).toHaveCount(4); expect(writes).toBe(0);
  await expect(contact(page).locator('[data-contact-receipt]')).toHaveCount(0); await expect(contact(page).locator('iframe')).toHaveCount(0);
  await expect(contact(page)).not.toContainText('12345 67890'); await expect(contact(page)).toContainText('once confirmed');
  await page.getByRole('button', { name: 'Change language', exact: true }).click(); await expect(contact(page)).toContainText('पूछताछ भेजें');
  expect((await page.request.get(apiBase + 'admin/contact-inquiries', { headers: { Accept: 'application/json' } })).status()).toBe(401);
  expect(blocked).toEqual([]);
});

test('real anonymous submission → exact bell item → admin/support follow-up → stale edit and unauthorized staff checks', async ({ page, context, browser }, info) => {
  const blocked = await scoped(context); await fill(page, 'flow');
  const created = await submit(page); const receipt = (await created.json()).data;
  await expect(contact(page).locator('[data-contact-receipt]')).toContainText(receipt.reference);
  const baseURL = info.project.use.baseURL as string;
  const adminContext = await browser.newContext({ baseURL }); const supportContext = await browser.newContext({ baseURL }); const deniedContext = await browser.newContext({ baseURL });
  const adminBlocked = await scoped(adminContext); const supportBlocked = await scoped(supportContext); const deniedBlocked = await scoped(deniedContext);
  try {
    const admin = await adminContext.newPage(); await login(admin);
    await admin.getByRole('button', { name: 'Notifications', exact: true }).click();
    const bell = admin.locator('.notif-dropdown-item').filter({ hasText: receipt.reference }); await expect(bell).toHaveCount(1, { timeout: 25_000 });
    await bell.click(); await expect(admin).toHaveURL(/\/admin\/contact-inquiries\?inquiry=[a-f0-9-]{36}$/);
    const uuid = new URL(admin.url()).searchParams.get('inquiry')!;
    await expect(queue(admin).locator('[data-inquiry-reference]')).toHaveText(receipt.reference);
    await expect(queue(admin).locator('[data-inquiry-message]')).toContainText('<b>plain text only</b>'); await expect(queue(admin).locator('[data-inquiry-message] b')).toHaveCount(0);
    const stale = await adminContext.newPage(); await stale.goto('/admin/contact-inquiries?inquiry=' + uuid); await expect(queue(stale).locator('[data-inquiry-reference]')).toHaveText(receipt.reference);
    await followUp(admin, 'in_progress', 'QA synthetic follow-up record. No phone call or email was made.'); await expect(queue(admin)).toContainText('Follow-up saved.');
    await followUp(stale, 'resolved', 'QA stale note must not overwrite the winner.', 409); await expect(queue(stale).locator('#follow-up-note')).toHaveValue('QA stale note must not overwrite the winner.');
    await queue(stale).getByRole('button', { name: /Reload latest/ }).click(); await expect(queue(stale).locator('[data-inquiry-status]')).toHaveText('In progress'); await stale.close();
    const support = await supportContext.newPage(); await login(support, 'qa-staff-20261029-support@transportseva.test', 'StaffQA@2026!');
    await support.goto('/admin/contact-inquiries?inquiry=' + uuid); await expect(queue(support).locator('[data-inquiry-status]')).toHaveText('In progress');
    const final = await followUp(support, 'resolved', 'QA workflow verification complete. No real contact was requested or made.'); expect(final.updates).toHaveLength(2);
    await support.reload(); await expect(queue(support).locator('[data-inquiry-status]')).toHaveText('Resolved'); await expect(queue(support).locator('[data-inquiry-history]')).toContainText('QA workflow verification complete');
    const denied = await deniedContext.newPage(); await login(denied, 'qa-staff-20261029-kyc@transportseva.test', 'StaffQA@2026!');
    await denied.goto('/admin/contact-inquiries?inquiry=' + uuid); await expect(denied).toHaveURL(/\/admin\/access$/);
    expect((await api(denied, 'admin/contact-inquiries/' + uuid)).status()).toBe(403);
    await test.info().attach('contact-flow-record.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ database: 'transportseva', uuid, receipt, status: final.inquiry.status, version: final.inquiry.version, staff: ['admin@test.local', 'qa-staff-20261029-support@transportseva.test'], denied: 'qa-staff-20261029-kyc@transportseva.test', outboundDelivery: false }, null, 2)) });
    await support.evaluate(() => window.scrollTo(0, 0)); await test.info().attach('staff-contact-enquiry.png', { contentType: 'image/png', body: await support.screenshot({ animations: 'disabled' }) });
    expect([...adminBlocked, ...supportBlocked, ...deniedBlocked]).toEqual([]);
  } finally { await adminContext.close(); await supportContext.close(); await deniedContext.close(); }
  expect(blocked).toEqual([]);
});

test('failed save retains the draft; delayed retry animates and duplicate clicks create one enquiry', async ({ page, context }) => {
  const blocked = await scoped(context); await fill(page, 'retry');
  await page.route('**/api/public/contact-inquiries', (route) => route.fulfill({ status: 503, json: { success: false } }), { times: 1 });
  await submit(page, 503); await expect(contact(page)).toContainText('details are retained'); await expect(contact(page).locator('#contact-full_name')).toHaveValue('QA Contact retry ' + run);
  let writes = 0; await page.route('**/api/public/contact-inquiries', async (route) => { writes++; await new Promise((resolve) => setTimeout(resolve, 700)); return route.continue(); });
  const response = page.waitForResponse((r) => r.url().endsWith('/api/public/contact-inquiries') && r.request().method() === 'POST');
  await contact(page).getByRole('button', { name: 'Submit enquiry', exact: true }).click(); await expect(contact(page).locator('.contact-spinner')).toBeVisible();
  await contact(page).locator('button[type=submit]').evaluate((button: HTMLButtonElement) => button.click());
  const r = await response; expect(r.status()).toBe(201); expect(writes).toBe(1); const receipt = (await r.json()).data;
  await expect(contact(page).locator('[data-contact-receipt]')).toContainText(receipt.reference);
  await test.info().attach('contact-retry-receipt.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify(receipt)) }); expect(blocked).toEqual([]);
});

test('a lost response after database save can be retried with the same receipt', async ({ page, context }) => {
  const blocked = await scoped(context); await fill(page, 'lost-response'); let saved: any; let id: string | null = null;
  await page.route('**/api/public/contact-inquiries', async (route) => { id = route.request().postDataJSON().submission_id; const r = await route.fetch(); expect(r.status()).toBe(201); saved = (await r.json()).data; return route.fulfill({ status: 503, json: { success: false } }); }, { times: 1 });
  await submit(page, 503); await expect(contact(page).locator('[data-contact-receipt]')).toHaveCount(0);
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/public/contact-inquiries') && r.request().method() === 'POST'), contact(page).getByRole('button', { name: 'Submit enquiry', exact: true }).click()]);
  expect(r.status()).toBe(201); expect(r.request().postDataJSON().submission_id).toBe(id); expect((await r.json()).data).toEqual(saved);
  await expect(contact(page).locator('[data-contact-receipt]')).toContainText(saved.reference);
  await test.info().attach('contact-lost-response-receipt.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify(saved)) }); expect(blocked).toEqual([]);
});

test('read-only saved enquiry opens above the queue and remains visible on reload', async ({ page, context }) => {
  const blocked = await scoped(context); await login(page);
  const response = await api(page, 'admin/contact-inquiries?per_page=50'); expect(response.status()).toBe(200);
  const row = (await response.json()).data.find((item: any) => item.full_name.startsWith('QA Contact flow ')); expect(row, 'A saved QA flow enquiry must exist').toBeTruthy();
  await page.goto('/admin/contact-inquiries?inquiry=' + row.uuid);
  await expect(queue(page).locator('[data-inquiry-reference]')).toHaveText(row.reference); await expect(queue(page).locator('[data-inquiry-reference]')).toBeInViewport();
  expect(await queue(page).evaluate((element) => !!(element.querySelector('.contact-detail')!.compareDocumentPosition(element.querySelector('.contact-table')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await page.reload(); await expect(queue(page).locator('[data-inquiry-reference]')).toHaveText(row.reference); await expect(queue(page).locator('[data-inquiry-reference]')).toBeInViewport();
  await test.info().attach('detail-first-contact.png', { contentType: 'image/png', body: await page.screenshot({ animations: 'disabled' }) }); expect(blocked).toEqual([]);
});
