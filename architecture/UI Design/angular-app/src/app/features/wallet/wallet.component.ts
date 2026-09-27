import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PaymentMockService } from '../../core/services/payment-mock.service';
import { LedgerEntryType } from '../../core/models/payment.model';
import { SessionService } from '../../core/services/session.service';
import { CommissionRulesService } from '../../core/services/commission-rules.service';
import { TranslatePipe } from '../../core/i18n';

type LedgerTab = 'all' | 'tokens' | 'payments' | 'refunds' | 'settlements' | 'commission';

const TYPE_CLASS: Record<LedgerEntryType, string> = {
  'Booking Token': 'status-pending',
  Payment: 'status-transit',
  Refund: 'status-transit',
  'Token Forfeiture': 'status-transit',
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
  imports: [IconComponent, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet.component.html',
})
export class WalletComponent {
  protected readonly payments = inject(PaymentMockService);
  protected readonly session = inject(SessionService);
  protected readonly commissionRules = inject(CommissionRulesService);

  protected readonly typeClass = TYPE_CLASS;
  protected readonly activeTab = signal<LedgerTab>('all');
  protected readonly recordCount = computed(() => this.payments.ledgerEntries().length);
  protected readonly rulesSaved = signal(false);
  protected readonly ruleError = signal(false);
  protected readonly ruleDraft = signal({
    threshold: String(this.commissionRules.rules().thresholdPaise / 100),
    fixedFee: String(this.commissionRules.rules().fixedFeePaise / 100),
    shipperPercent: String(this.commissionRules.rules().shipperRateBps / 100),
    providerPercent: String(this.commissionRules.rules().providerRateBps / 100),
    minimumFee: String(this.commissionRules.rules().minimumFeePaise / 100),
    maximumFee: String(this.commissionRules.rules().maximumFeePaise / 100),
    taxPercent: String(this.commissionRules.rules().taxRateBps / 100),
    cancellationPercent: String(this.commissionRules.rules().cancellationRateBps / 100),
    cancellationRefundPercent: String(this.commissionRules.rules().cancellationRefundRateBps / 100),
  });

  protected updateRule(field: keyof ReturnType<typeof this.ruleDraft>, value: string | number): void {
    this.ruleDraft.update((draft) => ({ ...draft, [field]: String(value) }));
    this.rulesSaved.set(false);
  }

  protected saveCommissionRules(): void {
    const draft = this.ruleDraft();
    const values = Object.values(draft).map(Number);
    if (values.some((value) => !Number.isFinite(value) || value < 0)
      || Number(draft.threshold) <= 0 || Number(draft.fixedFee) <= 0
      || Number(draft.shipperPercent) > 100 || Number(draft.providerPercent) > 100
      || Number(draft.taxPercent) > 100 || Number(draft.cancellationPercent) > 100
      || Number(draft.cancellationRefundPercent) > 100
      || (Number(draft.maximumFee) > 0 && Number(draft.maximumFee) < Number(draft.minimumFee))) {
      this.ruleError.set(true);
      this.rulesSaved.set(false);
      return;
    }
    this.ruleError.set(false);
    this.commissionRules.updateRules({
      thresholdPaise: Math.round(Number(draft.threshold) * 100),
      fixedFeePaise: Math.round(Number(draft.fixedFee) * 100),
      shipperRateBps: Math.round(Number(draft.shipperPercent) * 100),
      providerRateBps: Math.round(Number(draft.providerPercent) * 100),
      minimumFeePaise: Math.round(Number(draft.minimumFee) * 100),
      maximumFeePaise: Math.round(Number(draft.maximumFee) * 100),
      taxRateBps: Math.round(Number(draft.taxPercent) * 100),
      cancellationRateBps: Math.round(Number(draft.cancellationPercent) * 100),
      cancellationRefundRateBps: Math.round(Number(draft.cancellationRefundPercent) * 100),
    });
    this.rulesSaved.set(true);
  }

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
