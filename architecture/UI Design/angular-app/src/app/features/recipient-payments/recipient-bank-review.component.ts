import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiRecipientPaymentService, BankReviewRow, FullRecipientBank } from '../../core/api/api-recipient-payment.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { LanguageService } from '../../core/i18n';
import { formatDateTime } from '../../core/utils/date-format';

@Component({ selector: 'app-recipient-bank-review', standalone: true, imports: [FormsModule], templateUrl: './recipient-bank-review.component.html', styleUrl: './payment-panel.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class RecipientBankReviewComponent {
  private readonly api = inject(ApiRecipientPaymentService);
  private readonly destroy = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly rows = signal<BankReviewRow[]>([]);
  protected readonly selected = signal<BankReviewRow | null>(null);
  protected readonly full = signal<FullRecipientBank | null>(null);
  protected readonly busy = signal(false);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');
  protected readonly page = signal(1);
  protected readonly last = signal(1);
  protected status = 'pending';
  protected password = '';
  protected reason = '';
  protected method = 'manual_document_review';
  protected evidence = '';
  protected note = '';
  protected attested = false;
  private revealTimer?: ReturnType<typeof setTimeout>;
  protected readonly dateTime = formatDateTime;
  protected tr(en: string, hi: string) { return this.language.lang() === 'hi' ? hi : en; }
  constructor() { this.load(); this.destroy.onDestroy(() => this.clear()); }
  protected hide() { this.full.set(null); if (this.revealTimer) clearTimeout(this.revealTimer); }
  private clear() { this.hide(); this.password = ''; this.reason = ''; this.evidence = ''; this.note = ''; this.attested = false; }
  protected select(r: BankReviewRow) { if (this.busy()) return; this.clear(); this.selected.set(r); this.error.set(''); this.message.set(''); }
  protected load(page = 1) {
    if (this.busy()) return;
    this.clear(); this.selected.set(null); this.busy.set(true); this.loaded.set(false); this.error.set('');
    this.api.queue(this.status, page).pipe(finalize(() => this.busy.set(false)), takeUntilDestroyed(this.destroy)).subscribe({ next: r => { this.rows.set(r.data); this.page.set(r.meta?.current_page ?? 1); this.last.set(r.meta?.last_page ?? 1); this.loaded.set(true); }, error: e => { this.rows.set([]); this.error.set(apiErrorMessage(e)); } });
  }
  protected reveal() {
    const row = this.selected(); if (!row || this.busy()) return;
    this.busy.set(true); this.error.set(''); this.hide();
    this.api.revealReview(row.account.uuid, this.password, this.reason).pipe(finalize(() => { this.busy.set(false); this.password = ''; }), takeUntilDestroyed(this.destroy)).subscribe({ next: b => { this.full.set(b); this.revealTimer = setTimeout(() => this.hide(), 60_000); }, error: e => this.error.set(apiErrorMessage(e)) });
  }
  protected review(decision: 'manually_reviewed' | 'rejected') {
    const row = this.selected(); if (!row || this.busy() || !this.attested) return;
    this.busy.set(true); this.error.set(''); this.message.set(''); this.hide();
    this.api.reviewBank(row.account.uuid, { version: row.account.version, decision, current_password: this.password, method: this.method, evidence_reference: this.evidence, note: this.note }).pipe(finalize(() => { this.busy.set(false); this.password = ''; }), takeUntilDestroyed(this.destroy)).subscribe({ next: r => { this.selected.set({ ...row, account: r.data.account }); this.rows.update(rows => rows.map(v => v.account.uuid === row.account.uuid ? { ...v, account: r.data.account } : v)); this.clear(); this.message.set(this.tr('Documented manual review saved.', 'दस्तावेज़ आधारित मैनुअल समीक्षा सहेजी गई।')); }, error: e => this.error.set(apiErrorMessage(e)) });
  }
}
