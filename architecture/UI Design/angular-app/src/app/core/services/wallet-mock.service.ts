import { Injectable, computed, signal } from '@angular/core';
import { WalletTransaction } from '../models/wallet.model';

let idCounter = 400;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'w1', txnId: '#WTX-9001', date: '9 Aug 2026, 10:15 AM', category: 'Freight Settlement', type: 'Credit',
    amount: '₹22,300', referenceId: '#TS-48230', description: 'Settlement for booking #TS-48230 (Pune → Bengaluru)', status: 'Completed',
  },
  {
    id: 'w2', txnId: '#WTX-8988', date: '7 Aug 2026, 6:40 PM', category: 'Booking Deposit', type: 'Debit',
    amount: '₹2,000', referenceId: '#TS-48230', description: 'Security deposit held for booking #TS-48230', status: 'Completed',
  },
  {
    id: 'w3', txnId: '#WTX-8890', date: '4 Aug 2026, 4:05 PM', category: 'Freight Settlement', type: 'Credit',
    amount: '₹17,200', referenceId: 'TRIP-4102', description: 'Settlement for trip TRIP-4102 (Mumbai → Nagpur)', status: 'Pending',
  },
  {
    id: 'w4', txnId: '#WTX-8760', date: '31 Jul 2026, 11:00 AM', category: 'Freight Settlement', type: 'Credit',
    amount: '₹6,500', referenceId: 'TRIP-3877', description: 'Settlement for trip TRIP-3877 (Ahmedabad → Surat)', status: 'Completed',
  },
  {
    id: 'w5', txnId: '#WTX-8712', date: '29 Jul 2026, 9:20 AM', category: 'Commission', type: 'Debit',
    amount: '₹325', referenceId: 'TRIP-3877', description: 'Platform commission (5%) on trip TRIP-3877', status: 'Completed',
  },
  {
    id: 'w6', txnId: '#WTX-8654', date: '26 Jul 2026, 2:30 PM', category: 'Refund', type: 'Credit',
    amount: '₹1,500', referenceId: '#LD-3702', description: 'Refund for cancelled load #LD-3702 (shipper cancellation)', status: 'Completed',
  },
  {
    id: 'w7', txnId: '#WTX-8500', date: '20 Jul 2026, 5:50 PM', category: 'Withdrawal', type: 'Debit',
    amount: '₹15,000', description: 'Withdrawal to bank account ending 4521', status: 'Completed',
  },
  {
    id: 'w8', txnId: '#WTX-8420', date: '15 Jul 2026, 12:10 PM', category: 'Top-up', type: 'Credit',
    amount: '₹10,000', description: 'Wallet top-up via UPI', status: 'Completed',
  },
];

/**
 * In-memory Wallet store shared across the whole prototype — one
 * shared ledger reused by every portal (values are illustrative,
 * not persona-scoped, matching the mock-data philosophy used by
 * Trips/Bookings). Add Money / Withdraw actually mutate the ledger
 * so the flow feels real during the demo session.
 */
@Injectable({ providedIn: 'root' })
export class WalletMockService {
  private readonly transactionsState = signal<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  private readonly balanceState = signal(28450);
  private readonly onHoldState = signal(2000);

  readonly transactions = computed(() => this.transactionsState());
  readonly availableBalance = computed(() => this.balanceState());
  readonly onHoldAmount = computed(() => this.onHoldState());

  readonly totalCredited = computed(() =>
    this.transactionsState()
      .filter((t) => t.type === 'Credit' && t.status === 'Completed')
      .reduce((sum, t) => sum + this.parseAmount(t.amount), 0),
  );

  readonly totalDebited = computed(() =>
    this.transactionsState()
      .filter((t) => t.type === 'Debit' && t.status === 'Completed')
      .reduce((sum, t) => sum + this.parseAmount(t.amount), 0),
  );

  readonly depositTransactions = computed(() => this.transactionsState().filter((t) => t.category === 'Booking Deposit'));
  readonly refundTransactions = computed(() => this.transactionsState().filter((t) => t.category === 'Refund'));
  readonly settlementTransactions = computed(() => this.transactionsState().filter((t) => t.category === 'Freight Settlement'));

  private parseAmount(amount: string): number {
    return Number(amount.replace(/[^0-9.]/g, '')) || 0;
  }

  /** Adds money to the wallet (e.g. via UPI/card top-up). */
  addMoney(amount: number): void {
    if (amount <= 0) return;
    this.balanceState.update((b) => b + amount);
    this.transactionsState.update((txns) => [
      {
        id: nextId('w'), txnId: nextId('#WTX'), date: 'Just now', category: 'Top-up', type: 'Credit',
        amount: `₹${amount.toLocaleString('en-IN')}`, description: 'Wallet top-up via UPI', status: 'Completed',
      },
      ...txns,
    ]);
  }

  /** Withdraws money from the wallet to a linked bank account. */
  withdraw(amount: number): void {
    if (amount <= 0 || amount > this.balanceState()) return;
    this.balanceState.update((b) => b - amount);
    this.transactionsState.update((txns) => [
      {
        id: nextId('w'), txnId: nextId('#WTX'), date: 'Just now', category: 'Withdrawal', type: 'Debit',
        amount: `₹${amount.toLocaleString('en-IN')}`, description: 'Withdrawal to linked bank account', status: 'Pending',
      },
      ...txns,
    ]);
  }
}
