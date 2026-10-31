import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { distinctUntilChanged, map, Subscription } from 'rxjs';
import { ApiContactInquiryService, InquiryDetail, InquiryRow, InquiryStatus } from '../../../core/api/api-contact-inquiry.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { API_CONFIG } from '../../../core/api/api-config';
import { SessionService } from '../../../core/services/session.service';
import { LanguageService } from '../../../core/i18n';
import { formatDateTime } from '../../../core/utils/date-format';
import { contactCopy } from '../../public/contact/contact-copy';

@Component({ selector: 'app-contact-inquiries', standalone: true, imports: [FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './contact-inquiries.component.html', styleUrl: './contact-inquiries.component.scss' })
export class ContactInquiriesComponent {
  private readonly api = inject(ApiContactInquiryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly session = inject(SessionService);
  protected readonly copy = computed(() => contactCopy(this.language.lang()));
  protected readonly rows = signal<InquiryRow[]>([]);
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly total = signal(0);
  protected readonly filter = signal<InquiryStatus | 'all'>('all');
  protected readonly reference = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly detail = signal<InquiryDetail | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly selected = signal('');
  protected readonly status = signal<InquiryStatus>('new');
  protected readonly note = signal('');
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly conflict = signal(false);
  protected readonly actionError = signal('');
  protected readonly statuses: InquiryStatus[] = ['new', 'in_progress', 'resolved', 'spam'];
  protected readonly dateTime = formatDateTime;
  private detailsRequest?: Subscription;
  constructor() {
    if (!API_CONFIG.useBackend) { this.error.set(this.copy().denied); return; }
    this.load();
    this.route.queryParamMap.pipe(map((params) => params.get('inquiry') ?? ''), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe((uuid) => {
      this.selected.set(uuid); this.detail.set(null); this.note.set(''); this.saved.set(false); this.conflict.set(false); this.actionError.set(''); this.detailError.set(''); this.detailsRequest?.unsubscribe();
      if (uuid) this.loadDetail(); else this.detailLoading.set(false);
    });
  }
  protected load(page = 1): void {
    if (this.loading() || this.saving() || !API_CONFIG.useBackend) return;
    if (this.reference() && !/^[a-zA-Z0-9-]{1,32}$/.test(this.reference().trim())) { this.error.set(this.copy().search); return; }
    this.loading.set(true); this.error.set(''); this.rows.set([]);
    this.api.list(page, this.filter(), this.reference().trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (list) => { this.rows.set(list.rows); this.page.set(list.page); this.lastPage.set(list.lastPage); this.total.set(list.total); this.loading.set(false); }, error: () => { this.loading.set(false); this.error.set(this.copy().loadFailed); } });
  }
  protected open(row: InquiryRow): void { if (!this.saving()) void this.router.navigate([], { relativeTo: this.route, queryParams: { inquiry: row.uuid } }); }
  protected close(): void { if (!this.saving()) void this.router.navigate([], { relativeTo: this.route, queryParams: { inquiry: null } }); }
  protected loadDetail(): void {
    const uuid = this.selected(); if (this.saving() || !uuid) return;
    if (!/^[0-9a-f-]{36}$/i.test(uuid)) { this.detailLoading.set(false); this.detailError.set(this.copy().detailFailed); return; }
    this.detailsRequest?.unsubscribe(); this.detailLoading.set(true); this.detailError.set(''); this.actionError.set(''); this.conflict.set(false); this.note.set('');
    this.detailsRequest = this.api.get(uuid).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (detail) => { this.detail.set(detail); this.status.set(detail.inquiry.status); this.detailLoading.set(false); }, error: () => { this.detailLoading.set(false); this.detailError.set(this.copy().detailFailed); } });
  }
  protected save(): void {
    const detail = this.detail(); if (!detail || this.saving() || this.conflict() || !this.session.canStaffAction('contact.inquiries.update')) return;
    this.saved.set(false); this.actionError.set('');
    if (this.note().trim().length < 3 || this.note().length > 1000) { this.actionError.set(this.copy().noteRequired); return; }
    this.saving.set(true);
    this.api.update(detail.inquiry.uuid, detail.inquiry.version, this.status(), this.note().trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (updated) => { this.detail.set(updated); this.status.set(updated.inquiry.status); this.note.set(''); this.saved.set(true); this.saving.set(false); this.load(this.page()); }, error: (e) => { this.saving.set(false); this.conflict.set(e instanceof HttpErrorResponse && e.status === 409); this.actionError.set(apiErrorMessage(e, this.copy().detailFailed)); } });
  }
}
