import { expect, test, type Page } from '@playwright/test';

const email = process.env.E2E_OWNER_EMAIL ?? 'verify-truck-owner-1793028294862-62@transportseva.test';

test('booking lists remain responsive in two visible tabs with bell polling enabled', async ({ page, context }) => {
  test.setTimeout(180_000);
  const samples: { tab: number; round: number; status: number; elapsedMs: number }[] = [];
  const listResponse = (tab: Page) => tab.waitForResponse((response) =>
    response.request().method() === 'GET' && new URL(response.url()).pathname.endsWith('/api/marketplace-bookings'),
  );
  try {
    await page.goto('/auth/login');
    await page.locator('input[name="identifier"]').fill(email);
    await page.locator('input[name="password"]').fill('TransportSevaE2E@2026');
    const login = page.waitForResponse((response) => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/api/auth/login'));
    await page.getByRole('button', { name: /^log in$/i }).click();
    expect((await login).status()).toBe(200);
    await expect(page).toHaveURL(/\/truck-owner\/dashboard/);
    const other = await context.newPage();
    const tabs = [page, other];
    for (const tab of tabs) {
      const loaded = listResponse(tab);
      await tab.goto('/truck-owner/bookings');
      expect((await loaded).status()).toBe(200);
      await expect(tab.locator('.card').filter({ hasText: 'TS-' }).first()).toBeVisible();
    }
    for (let round = 1; round <= 3; round++) {
      await Promise.all(tabs.map(async (tab, index) => {
        const loaded = listResponse(tab);
        const started = Date.now();
        await tab.getByRole('button', { name: 'Refresh bookings' }).click();
        const result = await loaded;
        await expect(tab.getByRole('button', { name: 'Refresh bookings' })).toBeEnabled();
        const elapsedMs = Date.now() - started;
        samples.push({ tab: index + 1, round, status: result.status(), elapsedMs });
        expect(result.status()).toBe(200);
        expect(elapsedMs, `tab ${index + 1}, round ${round}`).toBeLessThan(15_000);
        await expect(tab.getByText('Loading bookings took too long. Please retry.')).toHaveCount(0);
      }));
    }
    console.log(`Two-tab booking refreshes (ms): ${samples.map((sample) => sample.elapsedMs).join(', ')}`);
  } finally {
    await test.info().attach('booking-performance-results.json', {
      body: Buffer.from(JSON.stringify({ database: 'transportseva', existingUser: email, samples, businessWrites: 'none', realPayments: 'skipped', gps: 'skipped' }, null, 2)),
      contentType: 'application/json',
    });
  }
});
