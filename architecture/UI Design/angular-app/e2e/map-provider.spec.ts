import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ trace: 'off', video: 'off', screenshot: 'off' });
test.setTimeout(180_000);
const provider = process.env.E2E_MAP_PROVIDER;
test.skip(!['openstreetmap', 'google'].includes(provider ?? ''), 'Set E2E_MAP_PROVIDER to the current local backend MAP_PROVIDER.');

test('backend .env controls the booking map without rebuilding Angular', async ({ page, request }) => {
  const saved = JSON.parse(readFileSync('.local-runtime/booking-full-20261122/20261122-01.json', 'utf8'));
  const record = JSON.parse(readFileSync('.local-runtime/tracking-20261126/verified.json', 'utf8'));
  const configResponse = await request.get('http://localhost:8080/api/public/maps/config');
  expect(configResponse.status()).toBe(200);
  const config = (await configResponse.json()).data;
  expect(config.provider).toBe(provider);
  await page.context().route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return ['localhost', '127.0.0.1', 'www.openstreetmap.org', 'tile.openstreetmap.org'].includes(host) ? route.continue() : route.abort();
  });
  await page.goto('/auth/login'); await page.locator('input[name=identifier]').fill(record.shipper); await page.locator('input[name=password]').fill(saved.password);
  await page.getByRole('button', { name: /^log in$/i }).click(); await expect(page).toHaveURL('/shipper/dashboard', { timeout: 60_000 });
  await page.goto(`/shipper/tracking?booking=${record.booking_uuid}&vehicle=${record.vehicle}`);
  const panel = page.locator('[data-booking-tracking]');
  await expect(panel.locator('[data-tracking-coordinate]')).toHaveText('28.6300000, 77.2230000', { timeout: 60_000 });
  const frame = panel.locator('iframe');
  if (provider === 'google' && !config.embed_available) {
    await expect(panel).toContainText('Google Maps is unavailable'); await expect(frame).toHaveCount(0);
  } else {
    await expect(frame).toHaveAttribute('src', provider === 'google' ? /^https:\/\/www\.google\.com\/maps\/embed\/v1\/place\?/ : /^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?/);
    await expect(frame).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  }
});
