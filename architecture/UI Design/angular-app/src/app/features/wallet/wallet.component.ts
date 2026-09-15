import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PaymentMockService } from '../../core/services/payment-mock.service';
import { LedgerEntryType } from '../../core/models/payment.model';

type LedgerTab = 'all' | 'tokens' | 'payments' | 'refunds' | 'settlements' | 'commission';

const TYPE_CLASS: Record<LedgerEntryType, string> = {
  'Booking Token': 'status-pending',
  Payment: 'status-transit',
  Refund: 'status-transit',
  Settlement: 'status-delivered',
  Commission: 'status-delivered',
  Payout: 'status-delivered',
};

/**
 * Financial ledger — V1 payment records without stored-value balances.
 */
@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet.component.html',
})
export class WalletComponent {
  protected readonly payments = inject(PaymentMockService);

  protected readonly typeClass = TYPE_CLASS;
  protected readonly activeTab = signal<LedgerTab>('all');
  protected readonly recordCount = computed(() => this.payments.ledgerEntries().length);

  protected readonly filteredEntries = computed(() => {
    switch (this.activeTab()) {
      case 'tokens':
        return this.payments.ledgerEntries().filter((e) => e.type === 'Booking Token');
      case 'refunds':
        return this.payments.ledgerEntries().filter((e) => e.type === 'Refund');
      case 'payments':
        return this.payments.ledgerEntries().filter((e) => e.type === 'Payment');
      case 'settlements':
        return this.payments.ledgerEntries().filter((e) => e.type === 'Settlement');
      case 'commission':
        return this.payments.ledgerEntries().filter((e) => e.type === 'Commission');
      default:
        return this.payments.ledgerEntries();
    }
  });

  protected setTab(tab: LedgerTab): void {
    this.activeTab.set(tab);
  }

  protected completeRefund(id: string): void {
    this.payments.markLedgerEntryCompleted(id);
  }
}
