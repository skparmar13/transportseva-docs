import { expect, test, type Page, type BrowserContext } from '@playwright/test';

test.use({ trace: 'off', video: 'off', actionTimeout: 20_000, navigationTimeout: 45_000 });
type Actor = { role: 'shipper' | 'truck-owner'; email: string; password: string };
const actors: Actor[] = [
  { role: 'shipper', email: 'qa-recovery-1793377725393@transportseva.test', password: 'RecoveryFinal@2026!' },
  { role: 'truck-owner', email: 'verify-truck-owner-1793028294862-62@transportseva.test', password: 'TransportSevaE2E@2026' },
];
const endpoint = 'http://localhost:8080/api/account/business-profile';
const fields = ['business_name', 'business_type', 'contact_email', 'contact_phone', 'address', 'city', 'state', 'pincode'];
const content = (profile: any) => Object.fromEntries(fields.map((field) => [field, profile[field] ?? null]));
const view = (page: Page) => page.locator('app-account-business-profile');

async function scoped(context: BrowserContext) {
  const blocked: string[] = [];
  await context.route('**/*', async (route) => {
    const request = route.request(); const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort();
    const allowed = ['GET', 'HEAD', 'OPTIONS'].includes(request.method())
      || (request.method() === 'POST' && /^\/api\/auth\/(login|refresh|logout)$/.test(url.pathname))
      || (request.method() === 'PUT' && url.pathname === '/api/account/business-profile')
      || (request.method() === 'PATCH' && /^\/api\/notifications\/[a-f0-9-]{36}\/read$/.test(url.pathname));
    if (!allowed) { blocked.push(request.method() + ' ' + url.pathname); return route.abort(); }
    return route.continue();
  });
  return blocked;
}
async function login(page: Page, actor: Actor) {
  await page.goto('/auth/login'); await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await page.locator('input[name=identifier]').fill(actor.email); await page.locator('input[name=password]').fill(actor.password);
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST'),
    page.getByRole('button', { name: /^log in$/i }).click(),
  ]);
  expect(response.status()).toBe(200); await expect(page).toHaveURL(new RegExp('/' + actor.role + '/dashboard$'), { timeout: 60_000 });
}
async function api(page: Page, path = 'account/business-profile', payload?: object) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const options = { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } };
  return payload ? page.request.put('http://localhost:8080/api/' + path, { ...options, data: payload }) : page.request.get('http://localhost:8080/api/' + path, options);
}
async function current(page: Page) {
  const response = await api(page); expect(response.status()).toBe(200); return (await response.json()).data;
}
async function openProfile(page: Page, actor: Actor) {
  await page.goto('/' + actor.role + '/profile');
  await expect(view(page).getByRole('heading', { name: 'Business profile', exact: true })).toBeVisible();
  await expect(view(page).locator('[data-account-email]')).toHaveText(actor.email);
  await expect(view(page)).not.toContainText('Yadav Road Carriers');
}
async function edit(page: Page) {
  await view(page).getByRole('button', { name: /^(Add|Edit) business profile$/ }).click();
  await expect(view(page).locator('form')).toBeVisible();
}
async function save(page: Page, expectedStatus = 200) {
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url() === endpoint && r.request().method() === 'PUT'),
    view(page).getByRole('button', { name: 'Save changes', exact: true }).click(),
  ]);
  expect(response.status()).toBe(expectedStatus); return response.json();
}
async function restore(page: Page, baseline: any) {
  // Never delete a profile. Preserve an existing profile's field values when
  // rerunning. A first profile is retained with an unmistakable QA name.
  if (!baseline.persisted) return;
  const latest = await current(page);
  if (JSON.stringify(content(latest.profile)) === JSON.stringify(content(baseline.profile))) return;
  const response = await api(page, 'account/business-profile', { ...content(baseline.profile), version: latest.profile.version });
  expect(response.status(), 'Restore original QA business field values').toBe(200);
}
async function evidence(name: string, details: object) {
  await test.info().attach(name + '.json', { contentType: 'application/json', body: Buffer.from(JSON.stringify({ database: 'transportseva', ...details }, null, 2)) });
}
test.beforeEach(async ({ context }, info) => {
  expect(new URL(info.project.use.baseURL as string).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  await context.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
});

for (const actor of actors) {
  test(actor.role + ' real business save, reload, unchanged credentials and bell routing', async ({ page, context }) => {
    test.setTimeout(180_000); const blocked = await scoped(context); await login(page, actor); const baseline = await current(page);
    try {
      await openProfile(page, actor); await edit(page);
      const name = 'QA Business Profile - ' + actor.role + ' - 31/10/2026';
      await page.locator('#business-business_name').fill(name); await page.locator('#business-business_type').selectOption('other');
      await page.locator('#business-contact_email').fill(actor.role + '-business-profile@transportseva.test');
      await page.locator('#business-contact_phone').fill('+91 90000 11223');
      await page.locator('#business-address').fill('QA only - Business profile persistence test ' + Date.now());
      await page.locator('#business-city').fill('Jaipur'); await page.locator('#business-state').fill('Rajasthan'); await page.locator('#business-pincode').fill('302022');
      const result = (await save(page)).data;
      expect(result.persisted).toBe(true); expect(result.changed).toBe(true); expect(result.account).toEqual(baseline.account); expect(result.kyc).toEqual(baseline.kyc);
      expect(result.profile.contact_phone).toBe('+919000011223');
      await expect(view(page).locator('[data-profile-field=business_name]')).toHaveText(name);
      await page.reload(); await expect(view(page).locator('[data-profile-field=business_name]')).toHaveText(name);
      const reloaded = await current(page); expect(content(reloaded.profile)).toEqual(content(result.profile));
      await edit(page); const noOp = (await save(page)).data; expect(noOp.changed).toBe(false); expect(noOp.profile.version).toBe(result.profile.version);
      const screenshot = test.info().outputPath(actor.role + '-business-profile.png'); await page.screenshot({ path: screenshot, fullPage: true });
      await test.info().attach('saved-profile-screen', { path: screenshot, contentType: 'image/png' });
      // Wait for the normal bell polling stream, without injecting a notice or
      // manufacturing client-side success. The route must work off this page.
      if (result.changed) {
        const notices = page.waitForResponse(async (r) => {
          if (!new URL(r.url()).pathname.endsWith('/api/notifications') || r.request().method() !== 'GET' || !r.ok()) return false;
          const body = await r.json(); const list = Array.isArray(body.data) ? body.data : body.data?.data ?? [];
          return list.some((n: any) => n.title === 'Business profile updated' && n.data?.profile_version === result.profile.version);
        }, { timeout: 35_000 });
        await page.goto('/' + actor.role + '/dashboard'); const body = await (await notices).json(); const list = Array.isArray(body.data) ? body.data : body.data?.data ?? [];
        const notice = list.find((n: any) => n.title === 'Business profile updated' && n.data?.profile_version === result.profile.version);
        expect(notice.action_url).toBe('/' + actor.role + '/profile');
        await page.getByRole('button', { name: 'Notifications', exact: true }).click();
        await page.locator('[data-notification-id="' + notice.id + '"]').click();
        await expect(page).toHaveURL(new RegExp('/' + actor.role + '/profile$'));
        await expect(view(page).locator('[data-profile-field=business_name]')).toHaveText(name);
      }
      await evidence('saved-' + actor.role, { email: actor.email, uuid: result.account.uuid, created_new_profile: !baseline.persisted,
        business_name: name, saved_version: result.profile.version, identity_unchanged: true, kyc_unchanged: true, blocked_out_of_scope_requests: blocked });
    } finally { await restore(page, baseline); }
    expect(blocked).toEqual([]);
  });

  test(actor.role + ' field validation, failure draft retention, saving feedback and duplicate prevention', async ({ page, context }) => {
    test.setTimeout(180_000); const blocked = await scoped(context); await login(page, actor); const baseline = await current(page);
    try {
      await openProfile(page, actor); await edit(page); await page.locator('#business-pincode').fill('000001');
      let puts = 0; page.on('request', (r) => { if (r.url() === endpoint && r.method() === 'PUT') puts++; });
      await view(page).getByRole('button', { name: 'Save changes', exact: true }).click();
      await expect(page.locator('#business-pincode')).toHaveAttribute('aria-invalid', 'true'); expect(puts).toBe(0);
      await page.locator('#business-pincode').fill('302022'); await page.locator('#business-address').fill('QA draft retained after a failed save');
      await page.route('**/api/account/business-profile', (route) => route.request().method() === 'PUT'
        ? route.fulfill({ status: 503, json: { success: false, message: 'Injected local failure' } }) : route.continue());
      await save(page, 503); await expect(view(page).getByRole('alert')).toContainText('Your draft is still here.');
      await expect(page.locator('#business-address')).toHaveValue('QA draft retained after a failed save');
      expect(content((await current(page)).profile)).toEqual(content(baseline.profile)); await page.unroute('**/api/account/business-profile');
      let release!: () => void; const gate = new Promise<void>((resolve) => release = resolve);
      await page.route('**/api/account/business-profile', async (route) => { if (route.request().method() === 'PUT') await gate; await route.continue(); });
      const saving = page.waitForResponse((r) => r.url() === endpoint && r.request().method() === 'PUT');
      await view(page).getByRole('button', { name: 'Save changes', exact: true }).click();
      try {
        await expect(view(page).getByRole('button', { name: 'Saving…', exact: true })).toBeDisabled();
        await expect(view(page).getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
        await expect(view(page).locator('.profile-spinner')).toBeVisible(); expect(puts).toBe(2);
      } finally { release(); }
      expect((await saving).status()).toBe(200); await page.unroute('**/api/account/business-profile');
      await expect(view(page).locator('form')).toHaveCount(0); expect(puts).toBe(2);
      await evidence('feedback-' + actor.role, { email: actor.email, invalid_submit_requests: 0, injected_failure: true, real_save_requests: 1, duplicate_requests: 0 });
    } finally { await restore(page, baseline); }
    expect(blocked).toEqual([]);
  });
}

test('two visible tabs preserve the winner and require explicit stale-draft recovery', async ({ page, context }) => {
  test.setTimeout(180_000); const actor = actors[0]; const blocked = await scoped(context); await login(page, actor); const baseline = await current(page);
  const stale = await context.newPage();
  try {
    await openProfile(page, actor); await edit(page); await openProfile(stale, actor); await edit(stale);
    await page.bringToFront(); await page.locator('#business-city').fill('QA latest city'); const winner = (await save(page)).data;
    await stale.bringToFront(); await stale.locator('#business-city').fill('QA stale city'); await save(stale, 409);
    await expect(view(stale).getByRole('alert')).toContainText('Another session saved a newer profile.');
    await expect(stale.locator('#business-city')).toHaveValue('QA stale city');
    expect((await current(stale)).profile.city).toBe('QA latest city');
    await view(stale).getByRole('button', { name: 'Load latest (discard draft)', exact: true }).click();
    await expect(view(stale).locator('[data-profile-field=city]')).toHaveText('QA latest city');
    await evidence('stale-tabs', { email: actor.email, winner_version: winner.profile.version, rejected_status: 409, automatic_overwrite: false });
  } finally { await stale.close(); await restore(page, baseline); }
  expect(blocked).toEqual([]);
});

test('foreign profile and protected login/role fields are not writable through a forged payload', async ({ page, context }) => {
  test.setTimeout(180_000); const blocked = await scoped(context); await login(page, actors[0]); const shipper = await current(page);
  await page.evaluate(() => localStorage.clear()); await login(page, actors[1]); const owner = await current(page);
  const scopedRead = await api(page, 'account/business-profile?user_uuid=' + shipper.account.uuid); expect(scopedRead.status()).toBe(200);
  const scopedBody = (await scopedRead.json()).data; expect(scopedBody.account.uuid).toBe(owner.account.uuid);
  expect(scopedBody.profile.business_name).not.toBe(shipper.profile.business_name);
  const failed = await api(page, 'account/business-profile', { ...content(owner.profile), version: owner.profile.version,
    user_uuid: shipper.account.uuid, email: 'forged@example.test', role: 'admin', kyc_status: 'approved' });
  expect(failed.status()).toBe(422); const unchanged = await current(page); expect(unchanged).toEqual(owner);
  const missing = await api(page, 'account/business-profile/' + shipper.account.uuid); expect(missing.status()).toBe(404);
  expect(blocked).toEqual([]); await evidence('scope-negative', { actor: actors[1].email, own_uuid: owner.account.uuid, rejected_status: 422, identity_and_profile_unchanged: true });
});

test('client-only portal HTML contains no private or sample profile; real Hindi labels render after login', async ({ page, context, browser }, info) => {
  test.setTimeout(180_000); await scoped(context);
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  try {
    await scoped(noJs); const server = await noJs.newPage(); const response = await server.goto((info.project.use.baseURL as string) + '/shipper/profile');
    expect(response?.status()).toBe(200); await expect(server.locator('app-root')).toHaveCount(1);
    await expect(server.getByText('Yadav Road Carriers Pvt. Ltd.', { exact: true })).toHaveCount(0);
    // app.routes.server.ts deliberately selects RenderMode.Client for portals.
    await expect(server.locator('app-business-settings')).toHaveCount(0);
    await expect(server.locator('[data-profile-field]')).toHaveCount(0);
  } finally { await noJs.close(); }
  await login(page, actors[0]); await context.addInitScript(() => localStorage.setItem('ts_lang', 'hi'));
  await page.goto('/shipper/profile'); await expect(view(page).getByRole('heading', { name: 'व्यवसाय प्रोफ़ाइल', exact: true })).toBeVisible();
  await expect(view(page)).toContainText('व्यावसायिक संपर्क ईमेल');
});
