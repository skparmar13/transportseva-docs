import { Injectable, computed, signal } from '@angular/core';
import {
  CommissionRecord,
  FreightPayment,
  GstInvoice,
  LedgerEntry,
  Payout,
} from '../models/payment.model';
import { BookingCommissionComponent } from '../models/marketplace.model';

/**
 * Shared mock financial records for V1. The provider handles money movement;
 * TransportSeva records payment orders, refunds, settlements and commission.
 */
@Injectable({ providedIn: 'root' })
export class PaymentMockService {
  private readonly processedWebhookIds = new Set<string>();
  private readonly ledgerEntriesSignal = signal<LedgerEntry[]>([
    { id: 'le1', reference: 'PAY-10001', bookingId: 'TS-48230', date: '9 Aug 2026, 10:15 AM', type: 'Booking Token', direction: 'Receivable', amount: '₹1,000', status: 'Completed', description: 'Customer booking token received through payment provider' },
    { id: 'le2', reference: 'REF-10002', bookingId: 'TS-48198', date: '8 Aug 2026, 4:20 PM', type: 'Refund', direction: 'Refund', amount: '₹1,000', status: 'Processing', description: 'Booking token refund after transporter rejection' },
    { id: 'le3', reference: 'SET-10003', bookingId: 'TS-48176', date: '7 Aug 2026, 6:40 PM', type: 'Settlement', direction: 'Payable', amount: '₹22,300', status: 'Completed', description: 'Final transporter settlement after POD approval' },
    { id: 'le4', reference: 'COM-10004', bookingId: 'TS-48176', date: '7 Aug 2026, 6:40 PM', type: 'Commission', direction: 'Receivable', amount: '₹300', status: 'Completed', description: 'TransportSeva commission recorded against settlement' },
  ]);

  readonly ledgerEntries = this.ledgerEntriesSignal.asReadonly();
  private readonly freightPaymentsSignal = signal<FreightPayment[]>([
    {
      id: 'fp1',
      invoiceRef: 'INV-FP-2201',
      tripId: 't4',
      bookingId: 'b1',
      counterpartyName: 'Bansal Steel Traders',
      route: 'Jaipur \u2192 Ahmedabad',
      amount: '\u20b942,000',
      dueDate: '20 Aug 2026',
      status: 'Paid',
    },
    {
      id: 'fp2',
      invoiceRef: 'INV-FP-2202',
      tripId: 't3',
      counterpartyName: 'Vishal Cement Works',
      route: 'Jaipur \u2192 Ahmedabad',
      amount: '\u20b938,500',
      dueDate: '25 Aug 2026',
      status: 'Pending',
    },
    {
      id: 'fp3',
      invoiceRef: 'INV-FP-2196',
      counterpartyName: 'Om Logistics Pvt Ltd',
      route: 'Delhi \u2192 Lucknow',
      amount: '\u20b921,750',
      dueDate: '10 Aug 2026',
      status: 'Overdue',
    },
    {
      id: 'fp4',
      invoiceRef: 'INV-FP-2189',
      counterpartyName: 'Shree Cement Ltd',
      route: 'Kota \u2192 Indore',
      amount: '\u20b929,900',
      dueDate: '2 Aug 2026',
      status: 'Paid',
    },
  ]);

  private readonly commissionsSignal = signal<CommissionRecord[]>([
    {
      id: 'cm1',
      tripId: 't4',
      route: 'Jaipur \u2192 Ahmedabad',
      freightAmount: '\u20b942,000',
      commissionRate: '5%',
      commissionAmount: '\u20b92,100',
      date: '18 Aug 2026',
      status: 'Paid',
    },
    {
      id: 'cm2',
      tripId: 't3',
      route: 'Jaipur \u2192 Ahmedabad',
      freightAmount: '\u20b938,500',
      commissionRate: '5%',
      commissionAmount: '\u20b91,925',
      date: '24 Aug 2026',
      status: 'Pending',
    },
    {
      id: 'cm3',
      tripId: 't1',
      route: 'Mumbai \u2192 Pune',
      freightAmount: '\u20b918,200',
      commissionRate: '4%',
      commissionAmount: '\u20b9728',
      date: '15 Aug 2026',
      status: 'Pending',
    },
  ]);

  private readonly gstInvoicesSignal = signal<GstInvoice[]>([
    {
      id: 'gi1',
      invoiceNumber: 'GST-INV-3341',
      date: '18 Aug 2026',
      billedTo: 'Bansal Steel Traders',
      taxableAmount: '\u20b942,000',
      gstAmount: '\u20b97,560',
      totalAmount: '\u20b949,560',
      status: 'Paid',
    },
    {
      id: 'gi2',
      invoiceNumber: 'GST-INV-3342',
      date: '24 Aug 2026',
      billedTo: 'Vishal Cement Works',
      taxableAmount: '\u20b938,500',
      gstAmount: '\u20b96,930',
      totalAmount: '\u20b945,430',
      status: 'Unpaid',
    },
    {
      id: 'gi3',
      invoiceNumber: 'GST-INV-3298',
      date: '10 Aug 2026',
      billedTo: 'Om Logistics Pvt Ltd',
      taxableAmount: '\u20b921,750',
      gstAmount: '\u20b93,915',
      totalAmount: '\u20b925,665',
      status: 'Unpaid',
    },
    {
      id: 'gi4',
      invoiceNumber: 'GST-INV-3251',
      date: '2 Aug 2026',
      billedTo: 'Shree Cement Ltd',
      taxableAmount: '\u20b929,900',
      gstAmount: '\u20b95,382',
      totalAmount: '\u20b935,282',
      status: 'Paid',
    },
  ]);

  private readonly payoutsSignal = signal<Payout[]>([
    {
      id: 'po1',
      payoutRef: 'PO-77210',
      payeeName: 'Sanjay Yadav',
      payeeRole: 'Truck Owner',
      bankAccountMasked: 'HDFC \u2022\u2022\u20224821',
      amount: '\u20b939,900',
      initiatedOn: '19 Aug 2026',
      status: 'Processed',
    },
    {
      id: 'po2',
      payoutRef: 'PO-77235',
      payeeName: 'Mahesh Patel',
      payeeRole: 'Driver',
      bankAccountMasked: 'SBI \u2022\u2022\u20226610',
      amount: '\u20b96,000',
      initiatedOn: '19 Aug 2026',
      status: 'Processed',
    },
    {
      id: 'po3',
      payoutRef: 'PO-77298',
      payeeName: 'Om Logistics Pvt Ltd',
      payeeRole: 'Transporter',
      bankAccountMasked: 'ICICI \u2022\u2022\u20223390',
      amount: '\u20b920,662',
      initiatedOn: '26 Aug 2026',
      status: 'Pending',
    },
  ]);

  readonly freightPayments = this.freightPaymentsSignal.asReadonly();
  readonly commissions = this.commissionsSignal.asReadonly();
  readonly gstInvoices = this.gstInvoicesSignal.asReadonly();
  readonly payouts = this.payoutsSignal.asReadonly();

  recordCommissionInvoice(input: { bookingId: string; route: string; component: BookingCommissionComponent; reason?: 'completion' | 'cancellation' }): void {
    const { bookingId, route, component } = input;
    const invoiceNumber = `INV-CM-${bookingId.replace(/\D/g, '')}-${component.side === 'shipper' ? 'S' : 'P'}${input.reason === 'cancellation' ? '-C' : ''}`;
    if (this.gstInvoicesSignal().some((invoice) => invoice.invoiceNumber === invoiceNumber)) return;
    const amount = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    this.gstInvoicesSignal.update((invoices) => [{
      id: invoiceNumber,
      invoiceNumber,
      date: 'Just now',
      billedTo: component.billedToName,
      taxableAmount: amount(component.feePaise),
      gstAmount: amount(component.taxPaise),
      totalAmount: amount(component.totalPaise),
      status: 'Unpaid',
      bookingId,
      type: input.reason === 'cancellation' ? 'TransportSeva Cancellation Fee' : 'TransportSeva Commission',
    }, ...invoices]);
    this.commissionsSignal.update((commissions) => [{
      id: invoiceNumber,
      bookingId,
      route,
      freightAmount: amount(component.basisFreightPaise),
      commissionRate: component.rule === 'fixed' ? amount(component.feePaise) : `${component.rateBps / 100}%`,
      commissionAmount: amount(component.feePaise),
      taxAmount: amount(component.taxPaise),
      billedToName: component.billedToName,
      commissionSide: component.side,
      invoiceRef: invoiceNumber,
      date: 'Just now',
      status: 'Pending',
    }, ...commissions]);
    this.recordLedgerEntry({
      reference: invoiceNumber,
      bookingId,
      date: 'Just now',
      type: 'Commission',
      direction: 'Receivable',
      amount: amount(component.totalPaise),
      status: 'Pending',
      description: `${input.reason === 'cancellation' ? 'Cancellation fee' : component.side === 'shipper' ? 'Shipper-side commission' : 'Provider-side commission'} billed to ${component.billedToName}; includes configured tax`,
    });
  }

  /** Records commission as collected at source from the freight settlement. */
  recordCommissionDeduction(input: { bookingId: string; route: string; component: BookingCommissionComponent }): void {
    const { bookingId, route, component } = input;
    const reference = 'COM-SET-' + bookingId.replace(/\D/g, '') + '-' + (component.side === 'shipper' ? 'S' : 'P');
    if (this.ledgerEntriesSignal().some((entry) => entry.reference === reference)) return;
    const amount = (paise: number) => '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    this.gstInvoicesSignal.update((invoices) => [{ id: reference, invoiceNumber: reference, date: 'Just now', billedTo: component.billedToName, taxableAmount: amount(component.feePaise), gstAmount: amount(component.taxPaise), totalAmount: amount(component.totalPaise), status: 'Paid', bookingId, type: 'TransportSeva Commission' }, ...invoices]);
    this.commissionsSignal.update((commissions) => [{ id: reference, bookingId, route, freightAmount: amount(component.basisFreightPaise), commissionRate: component.rule === 'fixed' ? amount(component.feePaise) : (component.rateBps / 100) + '%', commissionAmount: amount(component.feePaise), taxAmount: amount(component.taxPaise), billedToName: component.billedToName, commissionSide: component.side, invoiceRef: reference, date: 'Just now', status: 'Paid' }, ...commissions]);
    this.recordLedgerEntry({ reference, bookingId, date: 'Just now', type: 'Commission', direction: 'Receivable', amount: amount(component.totalPaise), status: 'Completed', description: (component.side === 'shipper' ? 'Shipper-side' : 'Provider-side') + ' commission withheld from freight settlement for ' + component.billedToName + '; includes configured tax' });
  }

  recordLedgerEntry(entry: Omit<LedgerEntry, 'id'>): void {
    if (this.ledgerEntriesSignal().some((existing) => existing.reference === entry.reference)) return;
    this.ledgerEntriesSignal.update((entries) => [
      { id: `le-${entries.length + 1}`, ...entry },
      ...entries,
    ]);
  }

  recordOfflinePayment(bookingId: string, amount: string, reference: string): void {
    if (!/^\d+(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) return;
    this.recordLedgerEntry({
      reference: reference.trim() || `COD-${Date.now()}`,
      bookingId,
      date: 'Just now',
      type: 'Payment',
      direction: 'Receivable',
        amount: `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      status: 'Completed',
      description: 'Offline/COD balance recorded by portal operator',
    });
  }

  recordTokenForfeiture(bookingId: string, token: { partyName: string; amount: string }, reason: string): void {
    const reference = 'FORFEIT-' + bookingId.replace(/\D/g, '') + '-' + token.partyName.replace(/\W/g, '').slice(0, 8);
    this.recordLedgerEntry({
      reference, bookingId, date: 'Just now', type: 'Token Forfeiture', direction: 'Receivable',
      amount: token.amount, status: 'Completed',
      description: 'Booking token retained after adverse dispute decision for ' + token.partyName + ': ' + reason,
    });
  }

  markLedgerEntryCompleted(id: string): void {
    this.ledgerEntriesSignal.update((entries) => entries.map((entry) =>
      entry.id === id ? { ...entry, status: 'Completed' as const } : entry,
    ));
  }

  processProviderWebhook(eventId: string, entry: Omit<LedgerEntry, 'id'>): boolean {
    if (this.processedWebhookIds.has(eventId)) return false;
    this.processedWebhookIds.add(eventId);
    this.recordLedgerEntry(entry);
    return true;
  }

  readonly totalFreightDue = computed(() =>
    this.freightPaymentsSignal()
      .filter((p) => p.status !== 'Paid')
      .reduce((sum, p) => sum + this.parseAmount(p.amount), 0),
  );

  readonly totalCommissionEarned = computed(() =>
    this.commissionsSignal()
      .filter((c) => c.status === 'Paid')
      .reduce((sum, c) => sum + this.parseAmount(c.commissionAmount), 0),
  );

  readonly totalGstCollected = computed(() =>
    this.gstInvoicesSignal().reduce(
      (sum, g) => sum + this.parseAmount(g.gstAmount),
      0,
    ),
  );

  readonly totalPayoutsProcessed = computed(() =>
    this.payoutsSignal()
      .filter((p) => p.status === 'Processed')
      .reduce((sum, p) => sum + this.parseAmount(p.amount), 0),
  );

  markFreightPaymentPaid(id: string): void {
    this.freightPaymentsSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, status: 'Paid' } : p)),
    );
  }

  markGstInvoicePaid(id: string): void {
    this.gstInvoicesSignal.update((list) =>
      list.map((g) => (g.id === id ? { ...g, status: 'Paid' } : g)),
    );
  }

  private parseAmount(value: string): number {
    return Number(value.replace(/[^0-9.]/g, '')) || 0;
  }
}
