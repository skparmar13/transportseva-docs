/**
 * TransportSeva Wallet — Module 8 domain model. Every business
 * persona (Shipper, Transporter, Truck Owner, Company, Driver) has
 * one wallet used for booking deposits, freight settlements and
 * refunds. Admin sees an aggregate ledger across all wallets.
 */
export type WalletTransactionType = 'Credit' | 'Debit';

export type WalletTransactionCategory = 'Booking Deposit' | 'Freight Settlement' | 'Refund' | 'Top-up' | 'Withdrawal' | 'Commission';

export interface WalletTransaction {
  id: string;
  txnId: string;
  date: string;
  category: WalletTransactionCategory;
  type: WalletTransactionType;
  amount: string;
  referenceId?: string;
  description: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface WalletSummary {
  availableBalance: string;
  onHoldAmount: string;
  totalCredited: string;
  totalDebited: string;
}
