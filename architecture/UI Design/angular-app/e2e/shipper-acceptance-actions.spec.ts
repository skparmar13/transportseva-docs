import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// Explicitly local QA writes. No checkout, payment, settlement, GPS, OTP/email
// delivery, grants, public moderation, or mutation of an existing booking.
test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
test.setTimeout(180_000);
const shipper = { role: 'shipper', email: 'verify-shipper-1793028294862-61@transportseva.test', password: 'TransportSevaE2E@2026' };
const secondary = { role: 'shipper', email: 'qa-recovery-1793377725393@transportseva.test', password: 'RecoveryFinal@2026!' };
const provider = { role: 'truck-owner', email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026' };
const run = Date.now().toString(36);
const evidenceFile = 'test-results/shipper-actions-records-2026-11-03.json';
function record(kind: string, data: object) {
  const records = existsSync(evidenceFile) ? JSON.parse(readFileSync(evidenceFile, 'utf8')) : [];
  records.push({ kind, at: new Date().toISOString(), ...data });
  writeFileSync(evidenceFile, JSON.stringify(records, null, 2));
}
async function scope(context: BrowserContext) {
  const blocked: string[] = [];
  const loads = new Set<string>(); const applications = new Set<string>(); const bookings = new Set<string>(); const tickets = new Set<string>();
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await context.route('**/*', (route) => {
    const r = route.request(); const u = new URL(r.url()); const p = u.pathname;
    if (!['localhost', '127.0.0.1'].includes(u.hostname)) return route.abort();
    const safe = ['GET', 'HEAD', 'OPTIONS'].includes(r.method())
      || (r.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(p))
      || (r.method() === 'PUT' && ['/api/account/profile', '/api/account/business-profile'].includes(p))
      || (r.method() === 'POST' && ['/api/loads', '/api/reviews', '/api/marketplace-kyc', '/api/support-tickets'].includes(p))
      || (r.method() === 'PATCH' && /^\/api\/notifications\/([a-f0-9-]{36}\/read|read-all)$/.test(p))
      || (r.method() === 'POST' && [...loads].some((id) => p === '/api/loads/' + id + '/applications'))
      || (r.method() === 'POST' && [...applications].some((id) => p === '/api/applications/' + id + '/offers'))
      || (r.method() === 'POST' && [...loads].some((id) => [...applications].some((app) => ['/accept', '/booking'].some((suffix) => p === '/api/loads/' + id + '/applications/' + app + suffix))))
      || (r.method() === 'POST' && [...bookings].some((id) => p === '/api/marketplace-bookings/' + id + '/messages'))
      || (r.method() === 'POST' && [...tickets].some((id) => p === '/api/support-tickets/' + id + '/replies'));
    if (!safe) { blocked.push(r.method() + ' ' + p); return route.abort(); }
    return route.continue();
  });
  return { blocked, loads, applications, bookings, tickets };
}
async function login(page: Page, actor = shipper) {
  await page.goto('/auth/login'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill(actor.email); await page.locator('input[name=password]').fill(actor.password);
  const [r] = await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'), page.getByRole('button', { name: /^log in$/i }).click()]);
  expect(r.status()).toBe(200); await expect(page).toHaveURL('/' + actor.role + '/dashboard', { timeout: 60_000 });
}
async function api(page: Page, path: string, data?: object) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const options = { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } };
  return data === undefined ? page.request.get('http://localhost:8080/api/' + path, options)
    : page.request.put('http://localhost:8080/api/' + path, { ...options, data });
}
async function get(page: Page, path: string) { const r = await api(page, path); expect(r.status()).toBe(200); return (await r.json()).data; }
async function submit(page: Page, path: string | RegExp, click: () => Promise<unknown>, status = 201) {
  const [r] = await Promise.all([page.waitForResponse((r) => r.request().method() === 'POST'
    && (typeof path === 'string' ? new URL(r.url()).pathname === '/api/' + path : path.test(new URL(r.url()).pathname))), click()]);
  expect(r.status(), await r.text()).toBe(status); return (await r.json()).data;
}
test.beforeEach(async ({}, info) => expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/));

test('new QA load, registered fleet application, counter-offer, booking and concurrent chat/bell link', async ({ browser }, info) => {
  test.setTimeout(300_000);
  const baseURL = info.project.use.baseURL;
  const sc = await browser.newContext({ baseURL }); const pc = await browser.newContext({ baseURL });
  const s = await sc.newPage(); const p = await pc.newPage();
  const ss = await scope(sc); const ps = await scope(pc);
  try {
    await login(s); await login(p, provider);
    const before = await get(s, 'account/reports');
    const vehicles = await get(p, 'marketplace-vehicles');
    const vehicle = vehicles.find((v: any) => (v.availability_status ?? v.status) === 'available' && !v.is_busy);
    expect(vehicle, 'Existing available QA registered vehicle required; never reserve a real fleet vehicle implicitly').toBeTruthy();
    await s.goto('/shipper/post-load');
    await s.locator('input#pickup-city').fill('Delhi'); await s.locator('input#drop-city').fill('Jaipur');
    const material = 'QA acceptance ' + run + ' DO NOT TRANSPORT';
    await s.locator('input[name=material]').fill(material); await s.locator('input[name=weightTons]').fill('12');
    await s.locator('select[name=vehicleType]').selectOption(vehicle.vehicle_type);
    await s.locator('input[name=budget]').fill('20000');
    await s.locator('textarea[name=notes]').fill('QA only contact 9876543210');
    await s.getByRole('button', { name: /post load to marketplace/i }).click();
    await expect(s.locator('app-post-load')).toContainText('Contact numbers cannot be shared');
    await s.locator('textarea[name=notes]').fill('QA only. Do not transport. Acceptance test ' + run);
    const load = await submit(s, 'loads', () => s.getByRole('button', { name: /post load to marketplace/i }).click());
    ss.loads.add(load.uuid); ps.loads.add(load.uuid);
    record('load', { uuid: load.uuid, reference: load.load_reference ?? load.load_number, material, owner: shipper.email });
    await expect(s.getByText(/load .* posted successfully/i)).toBeVisible();
    await s.goto('/shipper/my-loads'); await expect(s.locator('app-my-loads')).toContainText(material); await s.reload(); await expect(s.locator('app-my-loads')).toContainText(material);
    expect((await get(s, 'account/reports')).summary.loads.total).toBe(before.summary.loads.total + 1);
    await p.goto('/truck-owner/load-board/' + load.uuid); await p.getByRole('button', { name: /apply for this load/i }).click();
    const select = p.locator('select[name=vehicleRegNumber]');
    await expect(select.locator('option', { hasText: vehicle.registration_number })).toHaveCount(1);
    await expect(select.locator('option', { hasText: vehicle.registration_number })).toContainText(vehicle.vehicle_type);
    await select.selectOption(vehicle.registration_number); await expect(p.locator('select[name=vehicleType]')).toHaveCount(0);
    await p.locator('input[name=availability]').fill('QA only - available today'); await p.locator('input[name=quotedAmount]').fill('18000');
    const app = await submit(p, 'loads/' + load.uuid + '/applications', () => p.getByRole('button', { name: /submit application/i }).click());
    ss.applications.add(app.uuid); ps.applications.add(app.uuid);
    record('application', { uuid: app.uuid, load_uuid: load.uuid, provider: provider.email, vehicle: vehicle.registration_number });
    await s.goto('/shipper/applications'); await expect(s.locator('app-applications')).toContainText(vehicle.registration_number);
    await s.goto('/shipper/load-board/' + load.uuid); await s.getByRole('button', { name: /view offers/i }).click();
    await s.locator('input[name=counterAmount]').fill('17000');
    await submit(s, 'applications/' + app.uuid + '/offers', () => s.getByRole('button', { name: /send counter-offer/i }).click());
    await p.reload(); await p.getByRole('button', { name: /accept.*17,000/i }).click();
    const accepted = p.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/' + app.uuid + '/accept'));
    const booking = await submit(p, 'loads/' + load.uuid + '/applications/' + app.uuid + '/booking', () => p.getByRole('button', { name: /^confirm$/i }).click());
    expect((await accepted).status()).toBe(200); ss.bookings.add(booking.uuid); ps.bookings.add(booking.uuid);
    record('booking', { uuid: booking.uuid, reference: booking.booking_reference, load_uuid: load.uuid, application_uuid: app.uuid, status: booking.status, gross_freight: booking.gross_freight, token_payment: 'NOT ATTEMPTED' });
    expect(booking.status).toBe('awaiting_tokens'); expect(Number(booking.gross_freight)).toBe(17000);
    for (const [page, role] of [[s, 'shipper'], [p, 'truck-owner']] as const) {
      await page.goto('/' + role + '/bookings'); await expect(page.locator('app-bookings')).toContainText(booking.booking_reference);
      await page.reload(); await expect(page.locator('app-bookings')).toContainText(booking.booking_reference);
    }
    await s.goto('/shipper/load-board/' + load.uuid); await p.goto('/truck-owner/load-board/' + load.uuid);
    await s.getByRole('button', { name: /^chat$/i }).click(); await p.getByRole('button', { name: /chat with owner/i }).click();
    const message = 'QA acceptance chat ' + run;
    await s.getByPlaceholder(/type a message/i).fill(message);
    const posted = await submit(s, 'marketplace-bookings/' + booking.uuid + '/messages', () => s.getByPlaceholder(/type a message/i).press('Enter'));
    await expect(p.getByText(message, { exact: true })).toBeVisible({ timeout: 40_000 });
    const notes = await get(p, 'notifications?per_page=100');
    const notice = notes.find((n: any) => n.data?.message_uuid === posted.uuid);
    expect(notice).toBeTruthy(); expect(notice.data.load_uuid).toBe(load.uuid);
    expect(notice.data.application_uuid).toBe(app.uuid);
    await p.goto('/truck-owner/dashboard'); await p.getByRole('button', { name: 'Notifications', exact: true }).click();
    await p.locator('.notif-dropdown').getByRole('button', { name: 'Refresh', exact: true }).click();
    const readAck = p.waitForResponse((r) => r.request().method() === 'PATCH' && new URL(r.url()).pathname === '/api/notifications/' + notice.id + '/read');
    await p.locator('.notif-dropdown [data-notification-id="' + notice.id + '"]').click();
    await expect(p).toHaveURL(new RegExp('/truck-owner/load-board/' + load.uuid));
    await expect(p.getByText(message, { exact: true })).toBeVisible({ timeout: 30_000 });
    expect((await readAck).status()).toBe(200);
    expect((await get(p, 'notifications?per_page=100')).find((n: any) => n.id === notice.id).read_at).toBeTruthy();
    await info.attach('new-booking.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ load: load.uuid, application: app.uuid, booking: booking.uuid, reference: booking.booking_reference, vehicle: vehicle.registration_number, notification: notice.id })) });
    expect(ss.blocked).toEqual([]); expect(ps.blocked).toEqual([]);
  } finally { await sc.close(); await pc.close(); }
});

test('review submits to pending moderation, survives reload and stays out of public reviews', async ({ page, context }) => {
  const guard = await scope(context); await login(page); await page.goto('/shipper/reviews');
  let review = await get(page, 'reviews/mine');
  if (!review) {
    await page.getByRole('radio', { name: '4 stars', exact: true }).click();
    const comment = 'QA acceptance ' + run + '. This is a test review; do not approve or publish.';
    await page.locator('#review-comment').fill(comment);
    review = await submit(page, 'reviews', () => page.getByRole('button', { name: 'Submit for moderation', exact: true }).click());
    record('review', { uuid: review.uuid, owner: shipper.email, status: review.status, comment });
  }
  expect(review.comment).toContain('QA acceptance'); expect(review.status).toBe('pending');
  await page.reload(); await expect(page.locator('app-my-review')).toContainText('Awaiting admin moderation');
  await expect(page.locator('#review-comment')).toBeDisabled();
  const response = await page.request.get('http://localhost:8080/api/public/reviews?limit=12'); expect(response.status()).toBe(200);
  expect(JSON.stringify(await response.json())).not.toContain(review.uuid);
  expect(guard.blocked).toEqual([]);
});

test('secondary QA KYC pending submission, original-byte download and scoped Documents hub', async ({ page, context }) => {
  const guard = await scope(context); await login(page, secondary); await page.goto('/shipper/kyc');
  let kyc = await get(page, 'marketplace-kyc');
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6KZ8AAAAASUVORK5CYII=', 'base64');
  if (!kyc) {
    await page.locator('#kyc-business-name').fill('QA acceptance ' + run + ' DO NOT APPROVE');
    await page.locator('#kyc-business-type').selectOption('individual'); await page.locator('#kyc-pan').fill('ABCDE1234F');
    await page.locator('#kyc-document').setInputFiles({ name: 'QA-acceptance-do-not-approve.png', mimeType: 'image/png', buffer: bytes });
    kyc = await submit(page, 'marketplace-kyc', () => page.getByRole('button', { name: 'Submit for verification', exact: true }).click());
    record('kyc', { uuid: kyc.uuid, owner: secondary.email, status: kyc.status, filename: kyc.document_name, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  expect(kyc.business_name).toContain('QA acceptance'); expect(kyc.status).toBe('pending');
  await page.reload(); await expect(page.locator('app-my-kyc')).toContainText('Awaiting verification');
  await expect(page.locator('#kyc-business-name')).toHaveCount(0);
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: kyc.document_name, exact: true }).click();
  const download = await downloaded; const stream = await download.createReadStream(); const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(createHash('sha256').update(Buffer.concat(chunks)).digest('hex')).toBe(createHash('sha256').update(bytes).digest('hex'));
  await page.goto('/shipper/documents?tab=kyc'); await expect(page.locator('app-shipper-documents')).toContainText(kyc.document_name);
  expect(guard.blocked).toEqual([]);
});

test('new private support ticket validates, saves one reply and reloads its exact history', async ({ page, context }) => {
  const guard = await scope(context); await login(page, secondary); await page.goto('/shipper/support');
  await page.getByRole('button', { name: 'New ticket', exact: true }).click();
  await page.getByRole('button', { name: 'Create ticket', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Enter a subject');
  await page.locator('#support-subject').fill('QA acceptance ' + run + ' no action needed');
  await page.locator('#support-category').selectOption('account'); await page.locator('#support-priority').selectOption('low');
  await page.locator('#support-message').fill('QA acceptance test only. No staff action needed. Do not contact anyone.');
  const detail = await submit(page, 'support-tickets', () => page.getByRole('button', { name: 'Create ticket', exact: true }).click());
  const ticket = detail.ticket; guard.tickets.add(ticket.uuid);
  record('support', { uuid: ticket.uuid, reference: ticket.reference, owner: secondary.email });
  await expect(page.locator('[data-ticket-reference]')).toContainText(ticket.reference);
  const message = 'QA acceptance reply ' + run;
  await page.locator('#support-reply').fill(message);
  await submit(page, 'support-tickets/' + ticket.uuid + '/replies', () => page.getByRole('button', { name: 'Send reply', exact: true }).click(), 200);
  await expect(page.locator('[data-ticket-history]')).toContainText(message);
  await page.reload(); await expect(page.locator('[data-ticket-reference]')).toContainText(ticket.reference);
  await expect(page.locator('[data-event-type=reply]').filter({ hasText: message })).toHaveCount(1);
  // Owners may reopen resolved tickets; resolving an open ticket is a staff
  // action. Do not impersonate staff to manufacture a status transition.
  await expect(page.locator('#support-next-status')).toHaveCount(0);
  expect(guard.blocked).toEqual([]);
});

test('personal optional fields and preferences save visibly and original values are restored', async ({ page, context }) => {
  const guard = await scope(context); await login(page, secondary); const original = await get(page, 'account/profile');
  const fields = ['designation', 'address', 'city', 'pincode', 'notify_email', 'notify_sms'];
  const content = (p: any) => Object.fromEntries(fields.map((key) => [key, p[key]]));
  try {
    await page.goto('/shipper/profile'); await page.locator('#personal-designation').fill('QA acceptance ' + run);
    await page.locator('#personal-city').fill('Jaipur'); await page.locator('#personal-pincode').fill('302022');
    await page.locator('input[name=notify_email]').setChecked(!original.profile.notify_email);
    await page.locator('input[name=notify_sms]').setChecked(!original.profile.notify_sms);
    const [saved] = await Promise.all([page.waitForResponse((r) => r.request().method() === 'PUT' && new URL(r.url()).pathname === '/api/account/profile'),
      page.locator('.personal-profile form').first().getByRole('button', { name: 'Save profile', exact: true }).click()]);
    expect(saved.status()).toBe(200); await page.reload();
    await expect(page.locator('#personal-designation')).toHaveValue('QA acceptance ' + run);
    await expect(page.locator('input[name=notify_email]')).toBeChecked({ checked: !original.profile.notify_email });
    expect((await get(page, 'account/profile')).account).toEqual(original.account);
  } finally {
    const latest = await get(page, 'account/profile');
    if (JSON.stringify(content(latest.profile)) !== JSON.stringify(content(original.profile))) {
      const restored = await api(page, 'account/profile', { first_name: original.account.first_name, last_name: original.account.last_name, email: original.account.email, ...content(original.profile), version: latest.profile.version });
      expect(restored.status(), 'Restore original QA profile fields').toBe(200);
    }
    expect(content((await get(page, 'account/profile')).profile)).toEqual(content(original.profile));
    record('personal-profile', { owner: secondary.email, original_fields_restored: true, login_identity_unchanged: true });
  }
  expect(guard.blocked).toEqual([]);
});

test('notification mark-all is server acknowledged, survives reload and totals are not page-limited', async ({ page, context }) => {
  const guard = await scope(context); await login(page, secondary);
  const before = await get(page, 'notifications?per_page=100');
  expect(Array.isArray(before)).toBe(true);
  await page.goto('/shipper/notifications'); const view = page.locator('app-notifications');
  const all = view.getByRole('button', { name: /mark all (?:as )?read/i });
  await expect(all).toHaveCount(1);
  const metadata = await api(page, 'notifications?per_page=1');
  if ((await metadata.json()).meta.unread_total > 0) {
    await expect(all).toBeEnabled();
    const [r] = await Promise.all([page.waitForResponse((r) => r.request().method() === 'PATCH' && new URL(r.url()).pathname === '/api/notifications/read-all'), all.click()]);
    expect(r.status()).toBe(200); expect((await r.json()).success).toBe(true);
  }
  await page.reload(); const response = await api(page, 'notifications?per_page=1');
  expect((await response.json()).meta.unread_total).toBe(0);
  await view.getByRole('button', { name: /^unread/i }).click();
  await expect(view.locator('[data-notification-id]')).toHaveCount(0);
  record('notification-mark-all', { owner: secondary.email, remaining_unread: 0 });
  expect(guard.blocked).toEqual([]);
});
