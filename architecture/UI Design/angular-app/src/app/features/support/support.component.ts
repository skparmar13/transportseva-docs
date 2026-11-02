import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, timer } from 'rxjs';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { API_CONFIG } from '../../core/api/api-config';
import { ApiSupportTicketService, SupportAction, SupportActionKind, SupportCategory, SupportDetail, SupportDraft, SupportPriority, SupportRow, SupportStatus } from '../../core/api/api-support-ticket.service';
import { SessionService } from '../../core/services/session.service';
import { LanguageService } from '../../core/i18n';
import { formatDateTime } from '../../core/utils/date-format';
import { SUPPORT_COPY } from './support-copy';

@Component({
  selector: 'app-support', standalone: true, imports: [FormsModule, IconComponent],
  templateUrl: './support.component.html', styleUrl: './support.component.scss', changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent {
  private readonly api = inject(ApiSupportTicketService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => SUPPORT_COPY[this.language.lang()]);
  protected readonly dateTime = formatDateTime;
  protected readonly backend = API_CONFIG.useBackend;
  protected readonly statuses: SupportStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
  protected readonly categories: SupportCategory[] = ['account', 'fleet', 'marketplace', 'payments', 'tracking', 'other'];
  protected readonly priorities: SupportPriority[] = ['low', 'medium', 'high'];
  protected readonly staff = computed(() => this.session.role() === 'admin');
  protected readonly rows = signal<SupportRow[]>([]);
  protected readonly scope = signal('own');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly total = signal(0);
  protected readonly filter = signal<SupportStatus | 'all'>('all');
  protected readonly reference = signal('');
  protected readonly selected = signal<string | null>(null);
  protected readonly detail = signal<SupportDetail | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly pollFailed = signal(false);
  protected readonly external = signal(false);
  protected readonly saving = signal(false);
  protected readonly olderLoading = signal(false);
  protected readonly actionError = signal('');
  protected readonly success = signal('');
  protected readonly conflict = signal(false);
  protected readonly replyText = signal('');
  protected readonly note = signal('');
  protected readonly assignmentNote = signal('');
  protected readonly status = signal<SupportStatus>('open');
  protected readonly assignee = signal('');
  protected readonly agents = signal<{ uuid: string; name: string }[]>([]);
  protected readonly agentsLoading = signal(false);
  protected readonly agentsError = signal('');
  protected readonly pending = signal<{ kind: SupportActionKind; payload: SupportAction } | null>(null);
  protected readonly active = computed(() => ['open', 'in_progress'].includes(this.detail()?.ticket.status ?? ''));
  protected readonly statusOptions = computed<SupportStatus[]>(() => {
    const d = this.detail(); if (!d) return [];
    const options: Record<SupportStatus, SupportStatus[]> = { open: ['in_progress', 'resolved'], in_progress: ['open', 'resolved'], resolved: ['open', 'closed'], closed: ['open'] };
    return this.staff() ? d.capabilities.manage ? options[d.ticket.status] : [] : d.ticket.status === 'resolved' ? ['open', 'closed'] : d.ticket.status === 'closed' ? ['open'] : [];
  });
  protected readonly showNew = signal(false);
  protected readonly subject = signal('');
  protected readonly category = signal<SupportCategory>('account');
  protected readonly priority = signal<SupportPriority>('medium');
  protected readonly message = signal('');
  protected readonly creating = signal(false);
  protected readonly createError = signal('');
  protected readonly createConflict = signal(false);
  protected readonly pendingCreate = signal<SupportDraft | null>(null);
  private submissionId = '';
  private listRequest?: Subscription;
  private detailRequest?: Subscription;
  private agentRequest?: Subscription;
  private epoch = 0;
  private polling = false;
  private readonly newDialog = viewChild<ElementRef<HTMLElement>>('newDialog');

  constructor() {
    effect(() => this.newDialog()?.nativeElement.focus());
    this.load();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.epoch++; this.detailRequest?.unsubscribe(); this.agentRequest?.unsubscribe(); this.olderLoading.set(false); this.polling = false;
      this.selected.set(params.get('ticket')); this.detail.set(null); this.detailError.set(''); this.detailLoading.set(false);
      this.replyText.set(''); this.note.set(''); this.assignmentNote.set(''); this.pending.set(null);
      this.saving.set(false); this.conflict.set(false); this.external.set(false); this.success.set(''); this.actionError.set('');
      this.agents.set([]); this.agentsError.set(''); this.agentsLoading.set(false);
      if (this.selected()) this.loadDetail();
    });
    timer(5000, 5000).pipe(takeUntilDestroyed()).subscribe(() => {
      if (!this.polling && !this.saving() && !this.creating() && !this.olderLoading() && !this.detailLoading() && this.detail()) this.loadDetail(true);
    });
  }

  protected load(page = 1): void {
    this.listRequest?.unsubscribe(); this.error.set(''); this.loading.set(true);
    if (!API_CONFIG.useBackend) { this.loading.set(false); this.rows.set([]); this.error.set(this.copy().unavailable); return; }
    this.listRequest = this.api.list(page, this.filter(), this.reference().trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r) => { this.rows.set(r.rows); this.scope.set(r.scope); this.page.set(r.page); this.lastPage.set(r.lastPage); this.total.set(r.total); this.loading.set(false); },
      error: () => { this.rows.set([]); this.loading.set(false); this.error.set(this.copy().failed); },
    });
  }
  protected open(uuid: string | null): void {
    if (this.saving()) return;
    void this.router.navigate([], { relativeTo: this.route, queryParams: { ticket: uuid }, queryParamsHandling: 'merge' });
  }
  protected loadDetail(poll = false): void {
    const uuid = this.selected(); if (!uuid || this.saving()) return;
    this.detailRequest?.unsubscribe();
    this.polling = poll;
    if (!poll) { this.detailLoading.set(true); this.detailError.set(''); this.success.set(''); }
    if (!API_CONFIG.useBackend || !/^[a-f0-9-]{36}$/i.test(uuid)) {
      this.polling = false; this.detailLoading.set(false); this.detail.set(null); this.detailError.set(this.copy().detailFailed); return;
    }
    this.detailRequest = this.api.get(uuid).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (d) => {
        this.polling = false; this.detailLoading.set(false); this.pollFailed.set(false);
        if (poll && d.ticket.version === this.detail()?.ticket.version) { this.detail.update((current) => current ? { ...current, capabilities: d.capabilities } : d); return; }
        // An uncertain write must retain its operation ID. Its retry will either
        // acknowledge the saved event or receive a real stale-version conflict.
        if (poll && this.pending()) return;
        if (poll && (this.replyText().trim() || this.note().trim() || this.assignmentNote().trim() || this.conflict())) { this.external.set(true); return; }
        const uncertain = !!this.pending() && !this.conflict();
        this.setDetail(d); this.conflict.set(false); this.external.set(false);
        if (!uncertain) { this.pending.set(null); this.actionError.set(''); }
        if (poll) this.load(this.page());
        if (!poll && d.capabilities.assign) this.loadAgents();
      },
      error: (e) => {
        this.polling = false; this.detailLoading.set(false);
        if (e instanceof HttpErrorResponse && [403, 404].includes(e.status)) { this.detail.set(null); this.detailError.set(this.copy().detailFailed); return; }
        if (poll) this.pollFailed.set(true); else { this.detail.set(null); this.detailError.set(this.copy().detailFailed); }
      },
    });
  }
  private setDetail(d: SupportDetail): void {
    this.detail.set(d); this.assignee.set(d.ticket.assigned_to_uuid ?? '');
    const options = this.statusOptions(); this.status.set(options[0] ?? 'open');
  }
  protected loadAgents(): void {
    this.agentRequest?.unsubscribe(); this.agentsLoading.set(true); this.agentsError.set('');
    this.agentRequest = this.api.assignees().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (a) => { this.agents.set(a); this.agentsLoading.set(false); }, error: () => { this.agentsLoading.set(false); this.agentsError.set(this.copy().agentsFailed); } });
  }
  protected older(): void {
    const d = this.detail(); if (!d?.history.before || this.olderLoading() || this.saving()) return;
    const epoch = this.epoch; this.olderLoading.set(true);
    this.api.get(d.ticket.uuid, d.history.before).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r) => { if (epoch !== this.epoch) return; this.olderLoading.set(false); if (r.ticket.version !== d.ticket.version) { this.external.set(true); return; } this.detail.set({ ...d, events: [...r.events, ...d.events], history: r.history }); },
      error: () => { if (epoch === this.epoch) { this.olderLoading.set(false); this.actionError.set(this.copy().detailFailed); } },
    });
  }
  protected act(kind: SupportActionKind): void {
    const d = this.detail(); if (!d || this.saving() || this.conflict() || this.external()) return;
    if (kind === 'assignment' && (!d.capabilities.assign || this.agentsLoading() || this.agentsError())) return;
    if (kind === 'replies' && (!d.capabilities.reply || !this.active())) return;
    if (kind === 'status' && !this.statusOptions().length) return;
    if (this.pending() && this.pending()!.kind !== kind) return;
    const text = (kind === 'replies' ? this.replyText() : kind === 'status' ? this.note() : this.assignmentNote()).trim();
    if (!this.pending() && (text.length < 3 || text.length > (kind === 'replies' ? 5000 : 1000))) { this.actionError.set(this.copy().actionInvalid); return; }
    const pending = this.pending() ?? { kind, payload: { operation_id: crypto.randomUUID(), version: d.ticket.version, message: text,
      ...(kind === 'status' ? { status: this.status() } : kind === 'assignment' ? { assigned_to_uuid: this.assignee() || null } : {}) } };
    this.pending.set(pending); this.saving.set(true); this.success.set(''); this.actionError.set(''); this.detailRequest?.unsubscribe(); this.polling = false;
    const epoch = this.epoch;
    this.api.action(d.ticket.uuid, kind, pending.payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (r) => {
        if (epoch !== this.epoch) return;
        this.saving.set(false); this.pending.set(null); this.setDetail(r); this.success.set(this.copy().changed);
        if (kind === 'replies') this.replyText.set(''); else if (kind === 'status') this.note.set(''); else this.assignmentNote.set('');
        this.load(this.page());
      },
      error: (e) => {
        if (epoch !== this.epoch) return;
        this.saving.set(false);
        const status = e instanceof HttpErrorResponse ? e.status : 0;
        this.conflict.set(status === 409);
        this.actionError.set(status === 409 ? this.copy().conflict : this.copy().saveFailed);
        if ([403, 404].includes(status)) { this.detail.set(null); this.detailError.set(this.copy().detailFailed); this.pending.set(null); }
        else if (status === 422) { this.pending.set(null); this.actionError.set(this.validationMessage(e)); }
      },
    });
  }
  protected openNew(): void {
    if (!this.submissionId) this.submissionId = crypto.randomUUID();
    this.showNew.set(true);
  }
  protected closeNew(): void { if (!this.creating()) this.showNew.set(false); }
  @HostListener('document:keydown.escape')
  protected escape(): void { if (this.showNew()) this.closeNew(); }
  protected newSubmission(): void { this.submissionId = crypto.randomUUID(); this.pendingCreate.set(null); this.createConflict.set(false); this.createError.set(''); }
  protected create(): void {
    if (this.creating() || this.staff() || this.createConflict() || !API_CONFIG.useBackend) return;
    this.createError.set('');
    const draft = this.pendingCreate() ?? { submission_id: this.submissionId, subject: this.subject().trim(), category: this.category(), priority: this.priority(), message: this.message().trim() };
    if (draft.subject.length < 3 || draft.subject.length > 160 || draft.message.length < 10 || draft.message.length > 5000) { this.createError.set(this.copy().createInvalid); return; }
    this.pendingCreate.set(draft); this.creating.set(true);
    this.api.create(draft).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (d) => {
        this.creating.set(false); this.pendingCreate.set(null); this.showNew.set(false); this.submissionId = '';
        this.subject.set(''); this.message.set(''); this.category.set('account'); this.priority.set('medium'); this.load(); this.open(d.ticket.uuid);
      },
      error: (e) => {
        this.creating.set(false); const status = e instanceof HttpErrorResponse ? e.status : 0; this.createConflict.set(status === 409);
        if (status === 422) this.pendingCreate.set(null);
        this.createError.set(status === 409 ? this.copy().differentSubmission : status === 422 ? this.validationMessage(e) : this.copy().saveFailed);
      },
    });
  }
  private validationMessage(e: unknown): string {
    if (e instanceof HttpErrorResponse && e.error?.message) return e.error.message;
    return this.copy().actionInvalid;
  }
}
