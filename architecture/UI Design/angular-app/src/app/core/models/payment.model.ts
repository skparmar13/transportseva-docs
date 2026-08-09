/**
 * TransportSeva Payments — Module 9 domain model. Distinct from
 * Wallet (Module 8): Wallet is the running ledger/balance; Payments
 * is the commercial/finance view — freight payments owed, platform
 * commission, GST invoices and payouts to truck owners/drivers.
 */
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';

export interface FreightPayment {
  id: string;
  invoiceRef: string;
  tripId?: string;
  bookingId?: string;
  counterpartyName: string;
  route: string;
  amount: string;
  dueDate: string;
  status: PaymentStatus;
}

export interface CommissionRecord {
  id: string;
  tripId: string;
  route: string;
  freightAmount: string;
  commissionRate: string;
  commissionAmount: string;
  date: string;
  status: PaymentStatus;
}

export type GstInvoiceStatus = 'Paid' | 'Unpaid';

export interface GstInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  billedTo: string;
  taxableAmount: string;
  gstAmount: string;
  totalAmount: string;
  status: GstInvoiceStatus;
}

export type PayoutStatus = 'Processed' | 'Pending' | 'Failed';

export interface Payout {
  id: string;
  payoutRef: string;
  payeeName: string;
  payeeRole: 'Truck Owner' | 'Transporter' | 'Driver';
  bankAccountMasked: string;
  amount: string;
  initiatedOn: string;
  status: PayoutStatus;
}
