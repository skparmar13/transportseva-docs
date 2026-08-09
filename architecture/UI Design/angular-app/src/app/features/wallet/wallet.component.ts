import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { WalletMockService } from '../../core/services/wallet-mock.service';
import { WalletTransactionCategory } from '../../core/models/wallet.model';

type WalletTab = 'transactions' | 'deposits' | 'refunds' | 'settlements';

const CATEGORY_CLASS: Record<WalletTransactionCategory, string> = {
  'Booking Deposit': 'status-pending',
  'Freight Settlement': 'status-delivered',
  Refund: 'status-transit',
  'Top-up': 'status-delivered',
  Withdrawal: 'status-cancelled',
  Commission: 'status-cancelled',
};

/**
 * Wallet — Module 8. Balance + on-hold amount, filterable
 * transaction ledger (All / Deposits / Refunds / Settlements), and
 * Add Money / Withdraw actions that mutate the shared wallet ledger.
 */
@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet.component.html',
})
export class WalletComponent {
  protected readonly wallet = inject(WalletMockService);

  protected readonly categoryClass = CATEGORY_CLASS;
  protected readonly activeTab = signal<WalletTab>('transactions');

  protected readonly filteredTransactions = computed(() => {
    switch (this.activeTab()) {
      case 'deposits':
        return this.wallet.depositTransactions();
      case 'refunds':
        return this.wallet.refundTransactions();
      case 'settlements':
        return this.wallet.settlementTransactions();
      default:
        return this.wallet.transactions();
    }
  });

  protected setTab(tab: WalletTab): void {
    this.activeTab.set(tab);
  }

  // Add Money modal
  protected readonly showAddMoney = signal(false);
  protected readonly addAmount = signal<number | null>(null);
  protected readonly savingAdd = signal(false);

  protected openAddMoney(): void {
    this.showAddMoney.set(true);
  }

  protected closeAddMoney(): void {
    this.showAddMoney.set(false);
    this.addAmount.set(null);
  }

  protected submitAddMoney(): void {
    const amount = this.addAmount();
    if (!amount || amount <= 0) return;
    this.savingAdd.set(true);
    setTimeout(() => {
      this.wallet.addMoney(amount);
      this.savingAdd.set(false);
      this.closeAddMoney();
    }, 400);
  }

  // Withdraw modal
  protected readonly showWithdraw = signal(false);
  protected readonly withdrawAmount = signal<number | null>(null);
  protected readonly savingWithdraw = signal(false);

  protected openWithdraw(): void {
    this.showWithdraw.set(true);
  }

  protected closeWithdraw(): void {
    this.showWithdraw.set(false);
    this.withdrawAmount.set(null);
  }

  protected submitWithdraw(): void {
    const amount = this.withdrawAmount();
    if (!amount || amount <= 0 || amount > this.wallet.availableBalance()) return;
    this.savingWithdraw.set(true);
    setTimeout(() => {
      this.wallet.withdraw(amount);
      this.savingWithdraw.set(false);
      this.closeWithdraw();
    }, 400);
  }
}
