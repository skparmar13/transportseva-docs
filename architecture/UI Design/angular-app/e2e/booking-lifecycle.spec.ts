import { test, expect as baseExpect, type Page } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

test.use({ trace: 'off', video: 'off', screenshot: 'off', actionTimeout: 60000, navigationTimeout: 60000 });
test.setTimeout(180000);
const expect = baseExpect.configure({ timeout: 60000 });
const run = '.local-runtime/booking-status-20261128';
let source: any;
const results: any[] = [];
test.beforeAll(async () => { source = JSON.parse(await readFile('.local-runtime/booking-full-20261122/20261122-01.json', 'utf8')); await mkdir(`${run}/screenshots`, { recursive: true }); });
async function api(page: Page, path: string) {
  const token = await page.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const r = await page.request.get(`http://localhost:8080/api/${path}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
  expect(r.status()).toBe(200); return (await r.json()).data;
}
for (const code of ['s', 'oa', 'ta', 'tb']) test(`visible independent booking statuses: ${code}`, async ({ page }) => {
  const actor = source.actors.find((a: any) => a.code === code); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/auth/login'); await page.locator('input[name=identifier]').fill(actor.email); await page.locator('input[name=password]').fill(source.password);
  await page.getByRole('button', { name: /^log in$/i }).click(); await expect(page).toHaveURL(`/${actor.role}/dashboard`);
  const rows = await api(page, 'marketplace-bookings?per_page=100');
  expect(rows.length).toBeGreaterThan(0); expect(rows.every((b: any) => b.lifecycle)).toBe(true);
  const completed = rows.find((b: any) => b.uuid === 'd6f8701d-b9e7-494a-afa7-980b7e5e946d') ?? rows.find((b: any) => b.status === 'completed') ?? rows[0];
  const candidates = [completed, rows.find((b: any) => b.status === 'cancelled'), rows.find((b: any) => b.lifecycle.freight.status !== 'fully_confirmed')].filter(Boolean);
  const selected = candidates.filter((b: any, i: number) => candidates.findIndex((x: any) => x.uuid === b.uuid) === i);
  const checked: any[] = [];
  for (const b of selected) {
    await page.goto(`/${actor.role}/${actor.role === 'transporter' ? 'requests' : 'bookings'}?booking=${b.uuid}`);
    const card = page.locator('.card').filter({ hasText: b.booking_reference }); const summary = card.locator('[data-booking-lifecycle]');
    await expect(summary.locator('[data-life-group]')).toHaveCount(5);
    await expect(summary).not.toContainText('Status not verified');
    if (b.status === 'completed') await expect(summary.locator('[data-life-group=trip]')).toContainText('Delivered');
    if (b.status === 'cancelled') await expect(summary.locator('[data-life-group=trip]')).toContainText('Cancelled');
    if (b.lifecycle.platform_fees.owner.amount > 0) await expect(summary.locator('[data-life-group=fees]')).toContainText('Collection not recorded');
    if (b.lifecycle.freight.status === 'fully_confirmed') await expect(summary.locator('[data-life-group=freight]')).toContainText('Freight fully confirmed');
    if (b.uuid === 'd6f8701d-b9e7-494a-afa7-980b7e5e946d') {
      await expect(summary.locator('[data-life-group=freight]')).toContainText('₹17,000.00');
      await expect(summary.locator('[data-owner-token-status]')).toContainText('Paid');
      await expect(summary.locator('[data-provider-token-status]')).toContainText('Paid');
      await expect(summary.locator('[data-life-group=pod]')).toContainText('Approved');
      const payments = card.locator('[data-direct-payments]'); await expect(payments.locator('[data-confirmed-unpaid]')).toContainText('₹0');
      await expect(card.getByText('Calculated provider net amount', { exact: false })).toHaveCount(0);
      await expect(card.getByRole('button', { name: /^Settle Final Payment|Prepare Settlement$/i })).toHaveCount(0);
      const legacyBody = await summary.locator('[data-legacy-settlement]').count();
      if (legacyBody) { await summary.locator('summary').click(); await expect(summary.locator('[data-legacy-settlement]')).toContainText('does not establish freight received'); }
      await payments.getByRole('button', { name: 'Refresh payments' }).click(); await expect(payments.locator('[data-confirmed-unpaid]')).toContainText('₹0');
      await expect(summary.locator('[data-life-group=fees]')).toContainText('Collection not recorded');
      // Safe crop: no login fields, transfer references, or bank account details.
      await summary.screenshot({ path: `${run}/screenshots/${code}-completed-summary.png` });
    }
    checked.push({ booking: b.booking_reference, uuid: b.uuid, side: b.viewer_side, trip: b.lifecycle.trip.status, freight: b.lifecycle.freight.status, tokens: b.lifecycle.tokens });
  }
  expect(errors).toEqual([]); results.push({ code, role: actor.role, email: actor.email, checked, errors });
  await writeFile(`${run}/browser-results.json`, JSON.stringify(results, null, 2));
});
