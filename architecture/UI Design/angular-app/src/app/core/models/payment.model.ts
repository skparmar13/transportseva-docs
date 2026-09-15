/** TransportSeva V1 financial records. No stored-value wallet is represented here. */
export type LedgerEntryType = 'Booking Token' | 'Payment' | 'Refund' | 'Settlement' | 'Commission' | 'Payout';

export interface LedgerEntry {
  id: string;
  reference: string;
  bookingId: string;
  date: string;
  type: LedgerEntryType;
  direction: 'Receivable' | 'Payable' | 'Refund';
  amount: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  description: string;
}

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
