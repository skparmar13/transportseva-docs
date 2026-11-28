import { expect, Page, Locator } from '@playwright/test';

/** Explicit synthetic fixture preparation for existing LOCAL booking suites, never a production bypass. */
export async function prepareReviewedDispatch(page: Page, bookingUuid: string, restoreProvider: () => Promise<void>) {
  if (!/^http:\/\/localhost:4300\//.test(page.url())) throw new Error('Synthetic dispatch evidence is local-only.');
  async function request(path: string, method = 'GET', data?: any, multipart?: any) {
    const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
    const r = await page.request.fetch('http://localhost:8080/api/' + path, { method, headers: { Accept: 'application/json', Authorization: 'Bearer ' + token }, ...(multipart ? { multipart } : data ? { data } : {}) });
    const b = await r.json(); expect(r.ok(), `${path}: ${JSON.stringify(b)}`).toBeTruthy(); return b.data;
  }
  const checks = await request(`marketplace-bookings/${bookingUuid}/dispatch-checks`);
  if (checks.ready) return;
  const me = await request('auth/me');
  if (!String(me.email ?? me.user?.email).startsWith('qa-full-')) throw new Error('Only labelled full-booking QA accounts may submit synthetic evidence.');
  const until = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(Date.now() + 365 * 86400000));
  const pending: any[] = [];
  for (const asset of [checks.vehicle, checks.driver]) {
    if (!asset.asset_uuid) throw new Error('Registered assignments are required before dispatch fixture preparation.');
    if (asset.ready) continue;
    const view = await request(`fleet-compliance/${asset.asset_type}/${asset.asset_uuid}`);
    const identity = String(view.subject.registration_number ?? view.subject.name ?? '');
    if (!/^QA|^Matrix QA/i.test(identity)) throw new Error('Refusing synthetic evidence on an unlabelled asset.');
    if (asset.asset_type === 'vehicle' && Number(view.subject.declared_capacity_tons) < 22) throw new Error('QA capacity must support the explicit 22t reviewed fixture.');
    const declarations: any = {}, multipart: any = { expected_version: String(view.current?.version ?? 0) };
    for (const key of view.keys) {
      declarations[key] = { valid_until: until, exception_requested: false };
      multipart[`files[${key}]`] = { name: `SYNTHETIC-QA-${key}.png`, mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') };
    }
    multipart.declarations = JSON.stringify(declarations);
    pending.push(await request(`fleet-compliance/${asset.asset_type}/${asset.asset_uuid}`, 'POST', undefined, multipart));
  }
  await page.goto('/auth/staff/login'); await page.locator('input[name=email]').fill('admin@test.local'); await page.locator('input[name=password]').fill('password123');
  await page.getByRole('button', { name: 'Sign in to staff console', exact: true }).click(); await expect(page).toHaveURL(/\/admin\//);
  for (const v of pending) {
    const documents = Object.fromEntries(Object.keys(v.documents).map(key => [key, { valid_until: until, exempt: false }]));
    await request(`admin/marketplace-kyc/assets/${v.uuid}/review`, 'POST', { version: v.version, fingerprint: v.fingerprint, decision: 'approved', documents,
      note: 'Synthetic local full-booking regression evidence only. No genuine government verification.', evidence_reference: 'LOCAL-SYNTHETIC-BOOKING-REGRESSION', attested: true,
      verified_payload_tons: 22, gvw_kg: 35000, unladen_kg: 12000, vehicle_type: v.subject.vehicle_type ?? '32ft Trailer', vehicle_types: ['32ft Trailer'] });
  }
  await restoreProvider(); expect((await request(`marketplace-bookings/${bookingUuid}/dispatch-checks`)).ready).toBe(true);
}

export async function attestDispatch(card: Locator) {
  const p = card.locator('app-booking-dispatch'); await expect(p.locator('[data-dispatch-ready]')).toContainText('checks passed');
  await p.locator('input[name=dispatch-operator-attested]').check();
  await p.locator('textarea[name=dispatch-route-note]').fill('Synthetic local QA route, load, driver and vehicle check.');
}
