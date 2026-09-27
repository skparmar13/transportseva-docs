import { TestBed } from '@angular/core/testing';
import { MarketplaceMockService } from './marketplace-mock.service';
import { PaymentMockService } from './payment-mock.service';
import { CommissionRulesService } from './commission-rules.service';

describe('Payment lifecycle prototype', () => {
  let marketplace: MarketplaceMockService;
  let payments: PaymentMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    marketplace = TestBed.inject(MarketplaceMockService);
    payments = TestBed.inject(PaymentMockService);
  });

  it('records settlement and commission exactly once', () => {
    marketplace.settleBooking('b1');
    const first = payments.ledgerEntries().filter((e) => e.bookingId === '#TS-48230');
    expect(first.some((e) => e.type === 'Settlement')).toBeTrue();
    expect(first.some((e) => e.type === 'Commission')).toBeTrue();
    expect(first.filter((e) => e.type === 'Commission').length).toBe(2);
    expect(first.find((e) => e.type === 'Settlement')?.amount).toContain('22,000');
    marketplace.settleBooking('b1');
    expect(payments.ledgerEntries().filter((e) => e.bookingId === '#TS-48230' && e.type === 'Settlement').length).toBe(1);
  });

  it('applies the configured cancellation fee to each snapshotted side component', () => {
    const rules = TestBed.inject(CommissionRulesService);
    rules.updateRules({ ...rules.rules(), cancellationRateBps: 5_000 });
    const booking = marketplace.acceptApplication('a1')!;
    marketplace.rejectBooking(booking.id);

    const invoices = payments.gstInvoices().filter((invoice) => invoice.bookingId === booking.bookingId);
    expect(invoices.length).toBe(2);
    expect(invoices.every((invoice) => invoice.type === 'TransportSeva Cancellation Fee' && Number(invoice.totalAmount.replace(/[^0-9.]/g, '')) > 0)).toBeTrue();
    expect(marketplace.bookings().find((item) => item.id === booking.id)?.commissionSnapshot?.status).toBe('Invoiced');
  });

  it('records valid offline payments and rejects malformed amounts', () => {
    payments.recordOfflinePayment('#TS-48230', '2500', 'RCPT-1');
    payments.recordOfflinePayment('#TS-48230', 'not-money', 'RCPT-2');
    payments.recordOfflinePayment('#TS-48230', '0', 'RCPT-3');
    payments.recordOfflinePayment('#TS-48230', '12.345', 'RCPT-4');
    const entries = payments.ledgerEntries().filter((e) => e.reference.startsWith('RCPT-'));
    expect(entries.length).toBe(1);
    expect(entries[0].type).toBe('Payment');
    expect(entries[0].amount).toContain('2,500');
  });

  it('moves a processing refund to completed', () => {
    const refund = payments.ledgerEntries().find((entry) => entry.type === 'Refund' && entry.status === 'Processing');
    expect(refund).toBeTruthy();
    payments.markLedgerEntryCompleted(refund!.id);
    expect(payments.ledgerEntries().find((entry) => entry.id === refund!.id)?.status).toBe('Completed');
  });

  it('ignores duplicate ledger references', () => {
    const before = payments.ledgerEntries().length;
    const entry = { reference: 'IDEMPOTENT-1', bookingId: '#TS-48230', date: 'Just now', type: 'Payment' as const, direction: 'Receivable' as const, amount: '₹100', status: 'Completed' as const, description: 'Test' };
    payments.recordLedgerEntry(entry);
    payments.recordLedgerEntry(entry);
    expect(payments.ledgerEntries().length).toBe(before + 1);
  });

  it('deduplicates provider webhook events', () => {
    const entry = { reference: 'WEBHOOK-1', bookingId: '#TS-48230', date: 'Just now', type: 'Payment' as const, direction: 'Receivable' as const, amount: '₹500', status: 'Completed' as const, description: 'Provider callback' };
    expect(payments.processProviderWebhook('evt-1', entry)).toBeTrue();
    expect(payments.processProviderWebhook('evt-1', entry)).toBeFalse();
  });

  it('records token forfeiture after an adverse dispute decision', () => {
    const booking = marketplace.acceptApplication('a1')!;
    marketplace.payDeposit(booking.id, 'owner');
    marketplace.payDeposit(booking.id, 'counterparty');
    marketplace.raiseDispute(booking.id, 'Invalid cancellation', 'Admin');
    marketplace.resolveDispute(booking.id, true);
    const forfeitures = payments.ledgerEntries().filter((entry) => entry.bookingId === booking.bookingId && entry.type === 'Token Forfeiture');
    expect(forfeitures.length).toBe(2);
    expect(marketplace.bookings().find((item) => item.id === booking.id)?.dispute?.outcome).toBe('Forfeited');
  });
});
