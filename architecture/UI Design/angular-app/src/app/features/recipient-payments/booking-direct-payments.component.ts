import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { ApiRecipientPaymentService, DirectPaymentView, FullRecipientBank, ReceiptMilestone } from '../../core/api/api-recipient-payment.service';
import { apiErrorMessage } from '../../core/api/api-error';
import { LanguageService } from '../../core/i18n';
import { SessionService } from '../../core/services/session.service';
import { formatDate, formatDateTime } from '../../core/utils/date-format';

@Component({ selector: 'app-booking-direct-payments', standalone: true, imports: [FormsModule, RouterLink], templateUrl: './booking-direct-payments.component.html', styleUrl: './payment-panel.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class BookingDirectPaymentsComponent implements OnInit {
  readonly bookingUuid = input.required<string>();
  readonly revision = input('');
  readonly managed = output<boolean>();
  readonly lifecycleChange = output<import('../../core/models/booking-lifecycle.model').BookingLifecycle>();
  private readonly api = inject(ApiRecipientPaymentService);
  private readonly destroy = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly session = inject(SessionService);
  protected readonly view = signal<DirectPaymentView | null>(null);
  protected readonly full = signal<FullRecipientBank | null>(null);
  protected readonly busy = signal(false);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');
  protected password = '';
  protected amount = '';
  protected reference = '';
  protected transferDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  protected milestone: ReceiptMilestone = 'loading_advance';
  protected milestoneUuid = '';
  protected notes: Record<string, string> = {};
  private requestUuid = crypto.randomUUID();
  private revealTimer?: ReturnType<typeof setTimeout>;
  private refreshQueued = false;
  protected readonly dateTime = formatDateTime;
  protected readonly date = formatDate;
  protected money(v: number | string) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(v)); }
  protected tr(en: string, hi: string) { return this.language.lang() === 'hi' ? hi : en; }
  constructor() {
    effect(() => { this.bookingUuid(); this.revision(); untracked(() => this.load()); });
  }
  ngOnInit() { this.destroy.onDestroy(() => { this.hide(); this.password = ''; this.reference = ''; }); }
  protected hide() { this.full.set(null); if (this.revealTimer) clearTimeout(this.revealTimer); }
  protected load(page = 1) {
    if (this.busy()) { this.refreshQueued = true; return; }
    this.act(this.api.view(this.bookingUuid(), page), '', true);
  }
  private finish() {
    this.busy.set(false); this.password = '';
    if (this.refreshQueued && !this.destroy.destroyed) { this.refreshQueued = false; this.load(); }
  }
  private accept(v: DirectPaymentView) {
    this.hide(); this.view.set(v); this.loaded.set(true); this.managed.emit(!!v.instruction);
    if (v.lifecycle) this.lifecycleChange.emit(v.lifecycle);
    if (!v.allowed_milestones.includes(this.milestone)) this.milestone = v.allowed_milestones[0] ?? 'final';
  }
  private act(call: Observable<DirectPaymentView>, message: string, loading = false) {
    if (this.busy()) return;
    this.busy.set(true); this.error.set(''); this.message.set(''); this.hide();
    call.pipe(finalize(() => this.finish()), takeUntilDestroyed(this.destroy)).subscribe({ next: v => { this.accept(v); this.message.set(message); }, error: e => { if (loading) this.loaded.set(false); this.error.set(apiErrorMessage(e)); } });
  }
  protected acknowledge() {
    const v = this.view(); if (!v?.bank || !this.password || this.busy()) return;
    this.act(this.api.acknowledge(this.bookingUuid(), v.bank.uuid, v.instruction?.version ?? 0, this.password), this.tr('Current bank instructions acknowledged.', 'वर्तमान बैंक निर्देश स्वीकार हुए।'));
  }
  protected reveal() {
    const v = this.view(); if (!v?.instruction?.current || !v.bank || !this.password || this.busy()) return;
    this.busy.set(true); this.error.set(''); this.hide();
    this.api.reveal(this.bookingUuid(), v.bank.uuid, v.instruction.version, this.password).pipe(finalize(() => this.finish()), takeUntilDestroyed(this.destroy)).subscribe({ next: b => { this.full.set(b); this.revealTimer = setTimeout(() => this.hide(), 60_000); }, error: e => this.error.set(apiErrorMessage(e)) });
  }
  protected report() {
    const v = this.view(); if (!v?.instruction?.current || this.busy()) return;
    this.busy.set(true); this.error.set(''); this.message.set(''); this.hide();
    this.api.report(this.bookingUuid(), { amount: this.amount, reference: this.reference, transfer_date: this.transferDate, milestone: this.milestone,
      ...(this.milestone === 'mid_trip' ? { milestone_uuid: this.milestoneUuid } : {}), instruction_version: v.instruction.version, request_uuid: this.requestUuid })
      .pipe(finalize(() => this.finish()), takeUntilDestroyed(this.destroy)).subscribe({ next: next => { this.accept(next); this.requestUuid = crypto.randomUUID(); this.reference = ''; this.amount = ''; this.message.set(this.tr('Transfer reported. Awaiting recipient confirmation.', 'ट्रांसफर रिपोर्ट हुआ। प्राप्तकर्ता की पुष्टि लंबित है।')); }, error: e => this.error.set(apiErrorMessage(e)) });
  }
  protected newReport() { if (this.busy()) return; this.requestUuid = crypto.randomUUID(); this.message.set(this.tr('New report started. Check the receipt list before reporting another transfer.', 'नई रिपोर्ट शुरू हुई। अगला ट्रांसफर दर्ज करने से पहले रसीद सूची जाँचें।')); }
  protected decision(uuid: string, decision: 'confirmed_received' | 'disputed') {
    const note = this.notes[uuid] ?? '';
    if (decision === 'disputed' && note.trim().length < 3) { this.error.set(this.tr('Explain why this payment is disputed.', 'भुगतान विवाद का कारण दें।')); return; }
    this.act(this.api.decide(this.bookingUuid(), uuid, decision, note), this.tr('Recipient decision saved.', 'प्राप्तकर्ता का निर्णय सहेजा गया।'));
  }
  protected receiptStatus(status: string) { return status === 'confirmed_received' ? this.tr('Receipt confirmed', 'प्राप्ति पुष्ट') : status === 'disputed' ? this.tr('Disputed — amount reserved', 'विवादित — राशि आरक्षित') : this.tr('Awaiting recipient confirmation', 'प्राप्तकर्ता की पुष्टि लंबित'); }
}
