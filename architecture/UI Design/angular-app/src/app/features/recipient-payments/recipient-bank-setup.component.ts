import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiRecipientPaymentService, BankSubmission, RecipientBank } from '../../core/api/api-recipient-payment.service';
import { apiErrorMessage, apiFieldErrors } from '../../core/api/api-error';
import { LanguageService } from '../../core/i18n';
import { formatDateTime } from '../../core/utils/date-format';

const blank = (): BankSubmission => ({ version: 0, holder_name: '', account_number: '', account_number_confirmation: '', ifsc: '', bank_name: '', sharing_consent: false, current_password: '' });
@Component({ selector: 'app-recipient-bank-setup', standalone: true, imports: [FormsModule], templateUrl: './recipient-bank-setup.component.html', styleUrl: './payment-panel.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class RecipientBankSetupComponent {
  private readonly api = inject(ApiRecipientPaymentService);
  private readonly destroy = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly bank = signal<RecipientBank | null>(null);
  protected readonly busy = signal(false);
  protected readonly loaded = signal(false);
  protected readonly editing = signal(false);
  protected readonly error = signal('');
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly message = signal('');
  protected draft = blank();
  protected readonly dateTime = formatDateTime;
  protected tr(en: string, hi: string) { return this.language.lang() === 'hi' ? hi : en; }
  constructor() { this.load(); this.destroy.onDestroy(() => { this.draft = blank(); }); }
  protected load() {
    if (this.busy()) return;
    this.busy.set(true); this.error.set(''); this.editing.set(false); this.draft = blank();
    this.api.bank().pipe(finalize(() => this.busy.set(false)), takeUntilDestroyed(this.destroy)).subscribe({ next: b => { this.bank.set(b); this.loaded.set(true); }, error: e => { this.loaded.set(false); this.error.set(apiErrorMessage(e)); } });
  }
  protected edit() { this.draft = { ...blank(), version: this.bank()?.version ?? 0 }; this.errors.set({}); this.error.set(''); this.message.set(''); this.editing.set(true); }
  protected cancel() { this.draft = blank(); this.editing.set(false); this.errors.set({}); }
  protected save() {
    if (this.busy() || !this.loaded()) return;
    this.errors.set({}); this.error.set(''); this.busy.set(true);
    this.api.saveBank({ ...this.draft }).pipe(finalize(() => { this.busy.set(false); this.draft.current_password = ''; }), takeUntilDestroyed(this.destroy)).subscribe({ next: b => { this.bank.set(b); this.cancel(); this.message.set(this.tr('Bank details submitted for documented manual review.', 'बैंक विवरण दस्तावेज़ आधारित मैनुअल समीक्षा के लिए जमा हुए।')); }, error: e => { this.error.set(apiErrorMessage(e)); this.errors.set(apiFieldErrors(e)); } });
  }
}
