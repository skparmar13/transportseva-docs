import { defineConfig } from '@playwright/test';

/**
 * Browser regression suite for the marketplace.
 *
 * The default is deliberately headed: marketplace actions are commercial
 * actions and must be observable while a tester runs the journey. Set
 * PW_HEADLESS=true only in CI.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4300',
    browserName: 'chromium',
    channel: 'chrome',
    headless: process.env.PW_HEADLESS === 'true',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { slowMo: 180 },
  },
});
