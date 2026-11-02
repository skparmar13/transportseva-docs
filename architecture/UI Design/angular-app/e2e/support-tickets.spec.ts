import { expect, test, type BrowserContext, type Page } from '@playwright/test';
test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(240_000);
const apiBase = 'http://localhost:8080/api/';
const run = Date.now().toString();
const ui = (page: Page) => page.locator('app-support');
const accounts = {
  shipper: { email: 'qa-recovery-1793377725393@transportseva.test', password: 'RecoveryFinal@2026!', portal: 'shipper' },
  owner: { email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026', portal: 'truck-owner' },
  transporter: { email: 'qa-onboarding-1793463324476-transporter@transportseva.test', password: 'OnboardingQA@2026!', portal: 'transporter' },
  driver: { email: 'driver1@test.local', password: 'password123', portal: 'driver' },
  admin: { email: 'admin@test.local', password: 'password123', portal: 'admin' },
  support: { email: 'qa-staff-20261029-support@transportseva.test', password: 'StaffQA@2026!', portal: 'admin' },
  kyc: { email: 'qa-staff-20261029-kyc@transportseva.test', password: 'StaffQA@2026!', portal: 'admin' },
};
const agentUuid = 'b291dac9-abac-421e-ad76-3855a36a374e';
async function scoped(context: BrowserContext) {
  const blocked: string[] = [];
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', (route) => {
    const r = route.request(); const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    const allowed = ['GET', 'HEAD', 'OPTIONS'].includes(r.method())
      || (r.method() === 'POST' && (/^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname) || /^\/api\/support-tickets(?:\/[a-f0-9-]{36}\/(?:replies|assignment))?$/.test(url.pathname)))
      || (r.method() === 'PATCH' && (/^\/api\/support-tickets\/[a-f0-9-]{36}\/status$/.test(url.pathname) || /^\/api\/notifications\/[a-f0-9-]{36}\/read$/.test(url.pathname)));
    if (!allowed) { blocked.push(r.method() + ' ' + url.pathname); return route.abort(); }
    return route.continue();
  });
  return blocked;
}
async function login(page: Page, account: typeof accounts.shipper) {
  await page.goto('/auth/login'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill(account.email); await page.locator('input[name=password]').fill(account.password);
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'), page.getByRole('button', { name: /^log in$/i }).click()]);
  expect(r.status()).toBe(200); await expect(page).toHaveURL(new RegExp('/' + account.portal + '/' + (account.portal === 'admin' ? 'access' : 'dashboard') + '$'), { timeout: 60_000 });
}
async function api(page: Page, path: string, body?: unknown) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const headers = { Accept: 'application/json', Authorization: 'Bearer ' + token };
  return body ? page.request.post(apiBase + path, { headers, data: body }) : page.request.get(apiBase + path, { headers });
}
async function newDraft(page: Page, portal: string, label: string) {
  await page.goto('/' + portal + '/support'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await ui(page).getByRole('button', { name: 'New ticket', exact: true }).click();
  await ui(page).locator('#support-subject').fill('QA SUPPORT ' + label + ' ' + run);
  await ui(page).locator('#support-category').selectOption('account');
  await ui(page).locator('#support-priority').selectOption('medium');
  await ui(page).locator('#support-message').fill('QA SUPPORT TEST ONLY. No real call, email, payment or GPS action requested. ' + label + ' ' + run + ' <b>plain text</b>');
}
async function create(page: Page, portal: string, label: string) {
  await newDraft(page, portal, label);
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/support-tickets') && r.request().method() === 'POST'), ui(page).getByRole('button', { name: 'Create ticket', exact: true }).click()]);
  expect(r.status()).toBe(201); const d = (await r.json()).data;
  await expect(page).toHaveURL('/' + portal + '/support?ticket=' + d.ticket.uuid);
  await expect(ui(page).locator('[data-ticket-reference]')).toContainText(d.ticket.reference); return d;
}
async function action(page: Page, kind: 'replies' | 'assignment' | 'status', text: string, value?: string, expected = 200) {
  if (kind === 'assignment') { await ui(page).locator('#support-agent').selectOption(value ?? ''); await ui(page).locator('#support-assignment-note').fill(text); }
  else if (kind === 'status') { await ui(page).locator('#support-next-status').selectOption(value!); await ui(page).locator('#support-status-note').fill(text); }
  else await ui(page).locator('#support-reply').fill(text);
  const button = kind === 'assignment' ? 'Save assignment' : kind === 'status' ? 'Update status' : 'Send reply';
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/' + kind) && r.url().includes('/api/support-tickets/') && r.request().method() !== 'OPTIONS'), ui(page).getByRole('button', { name: button, exact: true }).click()]);
  expect(r.status()).toBe(expected); if (expected === 200) await expect(ui(page)).toContainText('Action saved.'); return (await r.json()).data;
}
async function bell(page: Page, reference: string, uuid: string, portal: string) {
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  const item = page.locator('.notif-dropdown-item').filter({ hasText: reference }).first();
  await expect(item).toBeVisible({ timeout: 30_000 }); await item.click();
  await expect(page).toHaveURL('/' + portal + '/support?ticket=' + uuid); await expect(ui(page).locator('[data-ticket-reference]')).toContainText(reference);
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));

test('visible owner → admin assignment → Support replies → resolution/reopening → revocation, with exact bell links and foreign-user checks', async ({ page, context, browser }, info) => {
  const blocked = await scoped(context); await login(page, accounts.shipper); const created = await create(page, 'shipper', 'full-flow');
  const { uuid, reference } = created.ticket;
  await expect(ui(page).locator('[data-ticket-history]')).toContainText('<b>plain text</b>'); await expect(ui(page).locator('[data-ticket-history] b').filter({ hasText: 'plain text' })).toHaveCount(0);
  const contexts = await Promise.all([browser.newContext({ baseURL: info.project.use.baseURL }), browser.newContext({ baseURL: info.project.use.baseURL }), browser.newContext({ baseURL: info.project.use.baseURL }), browser.newContext({ baseURL: info.project.use.baseURL })]);
  const guards = await Promise.all(contexts.map(scoped));
  try {
    const [admin, support, foreign, denied] = await Promise.all(contexts.map((c) => c.newPage()));
    await login(support, accounts.support); await support.goto('/admin/support'); await expect(ui(support).locator('[data-support-scope]')).toContainText('currently assigned');
    expect((await api(support, 'support-tickets/' + uuid)).status()).toBe(404);
    expect((await api(support, 'support-tickets')).ok()).toBe(true);
    await login(admin, accounts.admin); await bell(admin, reference, uuid, 'admin');
    await admin.route('**/api/support-tickets/' + uuid + '/assignment', async (route) => { await new Promise((r) => setTimeout(r, 800)); return route.continue(); }, { times: 1 });
    const assigned = action(admin, 'assignment', 'QA assigned for visible test. No actual contact requested.', agentUuid);
    await expect(ui(admin).locator('.support-spinner').first()).toBeVisible(); await assigned;
    await bell(support, reference, uuid, 'admin'); await expect(ui(support).locator('#support-agent')).toHaveCount(0);
    await action(support, 'replies', 'QA Support reply appears automatically for the owner.');
    await expect(ui(page).locator('[data-ticket-history]')).toContainText('QA Support reply appears automatically', { timeout: 20_000 });
    await action(page, 'replies', 'QA owner reply appears automatically for assigned Support.');
    await expect(ui(support).locator('[data-ticket-history]')).toContainText('QA owner reply appears automatically', { timeout: 20_000 });
    await action(support, 'status', 'QA support investigation in progress.', 'in_progress');
    await action(support, 'status', 'QA resolution recorded. No money or external service was used.', 'resolved');
    await expect(ui(page).locator('[data-ticket-status]')).toHaveText('Resolved', { timeout: 20_000 });
    await expect(ui(page).locator('#support-reply')).toHaveCount(0);
    await action(page, 'status', 'QA owner confirms resolution.', 'closed');
    await action(page, 'status', 'QA reopen check: further assistance is needed.', 'open');
    await expect(ui(support).locator('[data-ticket-status]')).toHaveText('Open', { timeout: 20_000 });
    // Refresh only the admin's read model before testing current-assignment revocation.
    await admin.reload(); await expect(ui(admin).locator('[data-ticket-status]')).toHaveText('Open');
    await action(admin, 'assignment', 'QA unassignment revokes the old agent immediately.', '');
    await expect(ui(support)).toContainText('no longer have access', { timeout: 20_000 });
    expect((await api(support, 'support-tickets/' + uuid)).status()).toBe(404);
    expect((await api(support, 'admin/audit-events?target_uuid=' + uuid)).ok()).toBe(true);
    expect((await (await api(support, 'admin/audit-events?target_uuid=' + uuid)).json()).data).toHaveLength(0);
    await action(admin, 'assignment', 'QA assignment restored for final resolution.', agentUuid);
    await support.reload(); await expect(ui(support).locator('[data-ticket-reference]')).toContainText(reference);
    await action(support, 'status', 'QA full workflow complete.', 'resolved');
    await expect(ui(page).locator('[data-ticket-status]')).toHaveText('Resolved', { timeout: 20_000 });
    const final = await action(page, 'status', 'QA test owner closes the completed ticket.', 'closed');
    await page.reload(); await expect(ui(page).locator('[data-ticket-status]')).toHaveText('Closed');
    await login(foreign, accounts.owner); await foreign.goto('/truck-owner/support?ticket=' + uuid);
    await expect(ui(foreign)).toContainText('no longer have access'); expect((await api(foreign, 'support-tickets/' + uuid)).status()).toBe(404);
    expect((await api(foreign, 'support-tickets/' + uuid + '/replies', { operation_id: crypto.randomUUID(), version: final.ticket.version, message: 'QA foreign write must be denied' })).status()).toBe(404);
    await login(denied, accounts.kyc); await denied.goto('/admin/support?ticket=' + uuid); await expect(denied).toHaveURL(/\/admin\/access$/); expect((await api(denied, 'support-tickets/' + uuid)).status()).toBe(403);
    await test.info().attach('support-flow-record.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ database: 'transportseva', uuid, reference, status: final.ticket.status, version: final.ticket.version, events: final.events.length, owner: accounts.shipper.email, admin: accounts.admin.email, support: accounts.support.email, deniedUsers: [accounts.owner.email, accounts.kyc.email], externalDelivery: false }, null, 2)) });
    await ui(page).locator('[data-ticket-reference]').scrollIntoViewIfNeeded(); await test.info().attach('completed-support-ticket.png', { contentType: 'image/png', body: await page.screenshot({ animations: 'disabled' }) });
    for (const guard of guards) expect(guard).toEqual([]);
  } finally { await Promise.all(contexts.map((c) => c.close())); }
  expect(blocked).toEqual([]);
});

for (const role of ['owner', 'transporter', 'driver'] as const) {
  test(role + ' can create, reload and open the exact own-ticket bell without seeing another account’s tickets', async ({ page, context }, info) => {
    const blocked = await scoped(context); const account = accounts[role]; await login(page, account); const d = await create(page, account.portal, role);
    await page.reload(); await expect(ui(page).locator('[data-ticket-reference]')).toContainText(d.ticket.reference);
    await page.goto('/' + account.portal + '/dashboard'); await bell(page, d.ticket.reference, d.ticket.uuid, account.portal);
    const listed = await api(page, 'support-tickets?reference=' + d.ticket.reference); expect(listed.status()).toBe(200); expect((await listed.json()).data).toHaveLength(1);
    expect((await api(page, 'support-tickets/assignees')).status()).toBe(403);
    await info.attach('support-' + role + '-record.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ uuid: d.ticket.uuid, reference: d.ticket.reference, user: account.email, portal: account.portal })) });
    expect(blocked).toEqual([]);
  });
}

test('lost create/reply responses retain drafts, retry identical IDs, animate and persist only once', async ({ page, context }, info) => {
  const blocked = await scoped(context); await login(page, accounts.shipper); await newDraft(page, 'shipper', 'lost-response'); let saved: any; let submission: string;
  await page.route('**/api/support-tickets', async (route) => { if (route.request().method() !== 'POST') return route.continue(); submission = route.request().postDataJSON().submission_id; const r = await route.fetch(); expect(r.status()).toBe(201); saved = (await r.json()).data; return route.fulfill({ status: 503, json: { success: false } }); }, { times: 1 });
  await ui(page).getByRole('button', { name: 'Create ticket', exact: true }).click(); await expect(ui(page)).toContainText('draft is retained');
  await expect(ui(page).locator('#support-message')).toHaveValue(/No real call/); await expect(ui(page).locator('#support-message')).toBeDisabled();
  let writes = 0; await page.route('**/api/support-tickets', async (route) => { if (route.request().method() !== 'POST') return route.continue(); writes++; expect(route.request().postDataJSON().submission_id).toBe(submission); await new Promise((r) => setTimeout(r, 700)); return route.continue(); });
  await ui(page).getByRole('button', { name: 'Retry ticket submission', exact: true }).click(); await expect(ui(page).locator('.support-spinner').first()).toBeVisible();
  await expect(ui(page).locator('[data-ticket-reference]')).toContainText(saved.ticket.reference); expect(writes).toBe(1);
  let operation: string; await page.route('**/api/support-tickets/' + saved.ticket.uuid + '/replies', async (route) => { operation = route.request().postDataJSON().operation_id; const r = await route.fetch(); expect(r.status()).toBe(200); return route.fulfill({ status: 503, json: { success: false } }); }, { times: 1 });
  await action(page, 'replies', 'QA lost response reply must appear exactly once.', undefined, 503);
  await expect(ui(page).locator('#support-reply')).toHaveValue('QA lost response reply must appear exactly once.');
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/' + saved.ticket.uuid + '/replies') && r.request().method() === 'POST'), ui(page).getByRole('button', { name: 'Retry saved action', exact: true }).click()]);
  expect(r.status()).toBe(200); expect(r.request().postDataJSON().operation_id).toBe(operation!); const final = (await r.json()).data; expect(final.ticket.version).toBe(2); expect(final.events).toHaveLength(2);
  await expect(ui(page).locator('[data-ticket-history] [data-event-type=reply]')).toHaveCount(1);
  await info.attach('support-idempotent-record.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ uuid: saved.ticket.uuid, reference: saved.ticket.reference, version: final.ticket.version, eventCount: final.events.length })) }); expect(blocked).toEqual([]);
});

test('two sessions competing to reply receive one winner and a retained stale draft, not a silent overwrite', async ({ page, context }, info) => {
  const blocked = await scoped(context); await login(page, accounts.shipper); const d = await create(page, 'shipper', 'concurrency');
  const stale = await context.newPage();
  try {
    await stale.goto('/shipper/support?ticket=' + d.ticket.uuid); await expect(ui(stale).locator('[data-ticket-reference]')).toContainText(d.ticket.reference);
    await ui(stale).locator('#support-reply').fill('QA stale reply retained for review.');
    await action(page, 'replies', 'QA winning reply is persisted first.');
    // Send the stale version before the five-second read poll can disable the draft.
    await action(stale, 'replies', 'QA stale reply retained for review.', undefined, 409);
    await expect(ui(stale).locator('#support-reply')).toHaveValue('QA stale reply retained for review.');
    await ui(stale).getByRole('button', { name: 'Reload latest', exact: true }).click(); await expect(ui(stale).locator('[data-ticket-history]')).toContainText('QA winning reply');
    await expect(ui(stale).locator('#support-reply')).toHaveValue('QA stale reply retained for review.');
    const current = (await (await api(page, 'support-tickets/' + d.ticket.uuid)).json()).data; expect(current.ticket.version).toBe(2); expect(current.events).toHaveLength(2);
    await info.attach('support-concurrency-record.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ uuid: d.ticket.uuid, reference: d.ticket.reference, version: current.ticket.version, staleResponse: 409, noSilentOverwrite: true })) });
  } finally { await stale.close(); } expect(blocked).toEqual([]);
});
