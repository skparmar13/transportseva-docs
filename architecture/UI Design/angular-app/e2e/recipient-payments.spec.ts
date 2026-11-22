import { expect, test, BrowserContext, Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test.use({ trace: 'off', video: 'off', screenshot: 'off' });
test.setTimeout(300_000);
const booking = '563a6729-7d04-4a41-9043-74f64af1ae4c';
const reference = 'TS-ZQXTRJ91OQ';
const pass = 'MatrixQA@2026!20';
async function guard(c: BrowserContext) {
  await c.addInitScript(() => localStorage.setItem('ts_lang', 'en'));
  await c.route('**/*', r => {
    const q = r.request(); const u = new URL(q.url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname)) return r.abort();
    if (q.method() === 'PATCH' && /^\/api\/notifications\/[a-f0-9-]{36}\/read$/.test(u.pathname)) return r.continue();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(q.method()) && !/^\/api\/(auth\/(login|refresh|logout)|account\/recipient-bank|admin\/recipient-bank-accounts\/[a-f0-9-]+\/(review|reveal)|marketplace-bookings\/[a-f0-9-]+\/(bank-instructions(?:\/reveal)?|direct-payments(?:\/[a-f0-9-]+\/decision)?))$/.test(u.pathname)) return r.abort();
    return r.continue();
  });
}
async function login(p: Page, email: string, password: string, role: string) {
  await p.goto(role === 'admin' ? '/auth/staff/login' : '/auth/login');
  await p.locator(role === 'admin' ? 'input[name=email]' : 'input[name=identifier]').fill(email); await p.locator('input[name=password]').fill(password);
  await p.locator('form button[type=submit]').click();
  await expect(p).toHaveURL(new RegExp(`/${role}/`), { timeout: 60_000 });
}
async function json(p: Page, path: string) {
  const token = await p.evaluate(() => localStorage.getItem('transportseva.access_token'));
  const r = await p.request.get('http://localhost:8080/api' + path, { headers: { Accept: 'application/json', Authorization: 'Bearer ' + token } });
  expect(r.status()).toBe(200); return (await r.json()).data;
}
test('visible bank setup, documented admin review, direct receipt confirmation and dispute', async ({ browser }, info) => {
  const contexts: BrowserContext[] = [];
  async function page() { const c = await browser.newContext({ baseURL: 'http://localhost:4300', viewport: { width: 1440, height: 960 } }); contexts.push(c); await guard(c); return c.newPage(); }
  try {
    const provider = await page();
    await login(provider, 'qa-matrix-20261120-01-oa@transportseva.test', pass, 'truck-owner');
    await provider.goto('/truck-owner/profile');
    const setup = provider.locator('[data-recipient-bank-setup]');
    await expect(setup).toBeVisible({ timeout: 60_000 });
    await setup.getByRole('button', { name: /Add bank account|Submit new bank details/ }).click();
    await setup.locator('#bank-holder').fill('QA Matrix Synthetic Recipient');
    await setup.locator('#bank-name').fill('QA Synthetic Bank');
    await setup.locator('#bank-number').fill('0000123456789012');
    await setup.locator('#bank-repeat').fill('0000123456789012');
    await setup.locator('#bank-ifsc').fill('TEST0000001');
    await setup.locator('#bank-password').fill(pass);
    await setup.locator('input[name=sharing_consent]').check();
    const [saved] = await Promise.all([provider.waitForResponse(r => r.request().method() === 'PUT' && r.url().endsWith('/account/recipient-bank')), setup.getByRole('button', { name: 'Submit for review', exact: true }).click()]);
    expect(saved.status()).toBe(200);
    const bank = (await saved.json()).data.account;
    await expect(setup.locator('[data-bank-review-status]')).toHaveText('Pending admin review');
    expect(await setup.textContent()).not.toContain('0000123456789012');

    const payer = await page();
    await login(payer, 'qa-matrix-20261120-01-s@transportseva.test', pass, 'shipper');
    await payer.goto(`/shipper/bookings?booking=${booking}`);
    const panel = payer.locator('[data-direct-payments]'); await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(panel.locator('[data-booking-bank-status]')).toContainText('Pending admin review');
    await expect(panel.getByRole('button', { name: /Reveal account/ })).toHaveCount(0);
    const initial = await json(payer, `/marketplace-bookings/${booking}/direct-payments`);
    expect(initial.allocation).toBe('gross'); expect(initial.amounts.recipient_basis).toBe(17000);

    const admin = await page(); await login(admin, 'admin@test.local', 'password123', 'admin');
    expect(JSON.stringify(await json(admin, '/notifications'))).toContain('Recipient bank review requested');
    await admin.goto('/admin/bank-reviews');
    const row = admin.locator('[data-bank-review-queue] article').filter({ hasText: 'qa-matrix-20261120-01-oa@transportseva.test' });
    await row.getByRole('button', { name: 'Review submission' }).click();
    const review = admin.locator('[data-selected-bank]');
    await review.locator('#bank-review-password').fill('password123');
    await review.locator('#bank-reveal-reason').fill('QA synthetic account review for visible browser test');
    await review.getByRole('button', { name: 'Reveal account for 60 seconds' }).click();
    await expect(review.locator('[data-full-bank]')).toContainText('0000123456789012');
    await review.getByRole('button', { name: 'Hide account', exact: true }).click();
    await review.locator('#bank-review-password').fill('password123');
    await review.locator('#bank-review-evidence').fill('QA synthetic evidence only; no real bank or external verification');
    await review.locator('#bank-review-note').fill('Synthetic QA account only. Do not transfer real money to these instructions.');
    await review.locator('input[name=attested]').check();
    const [approved] = await Promise.all([admin.waitForResponse(r => r.request().method() === 'POST' && r.url().endsWith('/review')), review.getByRole('button', { name: 'Record manual approval' }).click()]); expect(approved.status()).toBe(200);
    await expect(review).toContainText('manually_reviewed');

    await panel.getByRole('button', { name: 'Refresh payments' }).click();
    await expect(panel.locator('[data-booking-bank-status]')).toContainText('Manually reviewed');
    await panel.locator('input[type=password]').fill(pass);
    await panel.getByRole('button', { name: 'Acknowledge bank instructions' }).click();
    await expect(panel).toContainText('Current bank instructions acknowledged.');
    await panel.locator('input[type=password]').fill(pass);
    await panel.getByRole('button', { name: 'Reveal account for 60 seconds' }).click();
    await expect(panel.locator('[data-full-bank]')).toContainText('0000123456789012');
    await panel.getByRole('button', { name: 'Hide account', exact: true }).click();

    async function report(amount: string, suffix: string) {
      await panel.locator('#receipt-amount').fill(amount); await panel.locator('#receipt-reference').fill('QA' + Date.now() + suffix);
      const [r] = await Promise.all([payer.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/direct-payments')), panel.getByRole('button', { name: 'Report transfer', exact: true }).click()]);
      expect(r.status()).toBe(201); return (await r.json()).data;
    }
    const claim = await report('1000', 'CONFIRM'); const receipt = claim.receipts[0].uuid;
    expect(claim.amounts.confirmed_received).toBe(initial.amounts.confirmed_received);
    expect(claim.amounts.awaiting_or_disputed).toBe(initial.amounts.awaiting_or_disputed + 1000);
    await provider.goto(`/truck-owner/bookings?booking=${booking}`);
    const recipientPanel = provider.locator('[data-direct-payments]');
    const claimCard = recipientPanel.locator(`[data-receipt="${receipt}"]`);
    await claimCard.getByRole('button', { name: 'Confirm money received' }).click();
    await expect(claimCard).toContainText('Receipt confirmed');
    await panel.getByRole('button', { name: 'Refresh payments' }).click();
    await expect(panel.locator('[data-confirmed-received]')).toContainText(new Intl.NumberFormat('en-IN').format(initial.amounts.confirmed_received + 1000));

    const second = await report('500', 'DISPUTE'); const disputedId = second.receipts[0].uuid;
    await recipientPanel.getByRole('button', { name: 'Refresh payments' }).click();
    const disputed = recipientPanel.locator(`[data-receipt="${disputedId}"]`);
    await disputed.locator('textarea').fill('QA disputed synthetic transfer: no money received.');
    await disputed.getByRole('button', { name: 'Dispute receipt', exact: true }).click();
    await expect(disputed).toContainText('Disputed — amount reserved');
    await payer.reload(); await expect(panel).toBeVisible({ timeout: 60_000 });
    const final = await json(payer, `/marketplace-bookings/${booking}/direct-payments`);
    expect(final.amounts.confirmed_received).toBe(initial.amounts.confirmed_received + 1000);
    expect(final.amounts.confirmed_unpaid).toBe(initial.amounts.confirmed_unpaid - 1000);
    expect(final.amounts.awaiting_or_disputed).toBe(initial.amounts.awaiting_or_disputed + 500);
    expect(final.instruction.bank_version).toBe(bank.version);
    expect(await panel.locator('[data-full-bank]').count()).toBe(0);
    const notifications = await json(payer, '/notifications');
    expect(JSON.stringify(notifications)).toContain('Direct payment receipt');
    const summary = JSON.stringify({ booking, reference, bankVersion: bank.version, accountMask: bank.account_mask, policy: 'gross freight; each party pays its own fee', syntheticOnly: true, receipt, disputedReceipt: disputedId, before: initial.amounts, after: final.amounts }, null, 2);
    await writeFile(info.outputPath('recipient-flow-summary.json'), summary);
    await writeFile('.local-runtime/recipient-payments/visible-summary.json', summary);
  } finally { for (const context of contexts) await context.close(); }
});

test('bell links open the exact direct-payment booking and bank-review queue', async ({ browser }) => {
  const c = await browser.newContext({ baseURL: 'http://localhost:4300' }); await guard(c);
  try {
    const p = await c.newPage(); await login(p, 'qa-matrix-20261120-01-s@transportseva.test', pass, 'shipper');
    await p.getByRole('button', { name: 'Notifications', exact: true }).click();
    await p.locator('.notif-dropdown-item').filter({ hasText: 'Direct payment receipt disputed' }).first().click();
    await expect(p).toHaveURL(`/shipper/bookings?booking=${booking}`);
    await expect(p.locator('[data-direct-payments]')).toBeVisible({ timeout: 60_000 });
    await p.evaluate(() => { localStorage.removeItem('transportseva.access_token'); localStorage.removeItem('transportseva.refresh_token'); });
    await login(p, 'admin@test.local', 'password123', 'admin');
    await p.getByRole('button', { name: 'Notifications', exact: true }).click();
    await p.locator('.notif-dropdown-item').filter({ hasText: 'Recipient bank review requested' }).first().click();
    await expect(p).toHaveURL('/admin/bank-reviews');
    await expect(p.locator('[data-bank-review-queue]')).toBeVisible();
  } finally { await c.close(); }
});
