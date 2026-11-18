import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, distinctUntilChanged, map, timeout } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiNewsletterAdminService, ConsentStatus, ConsentSummary, NewsletterDetail, NewsletterSubscriberRow } from '../../../core/api/api-newsletter-admin.service';
import { LanguageService } from '../../../core/i18n';
import { formatDateTime } from '../../../core/utils/date-format';
import { newsletterAdminCopy } from './newsletter-management.copy';

@Component({
  selector: 'app-newsletter-management',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './newsletter-management.component.html',
  styleUrl: './newsletter-management.component.scss',
})
export class NewsletterManagementComponent {
  private readonly api = inject(ApiNewsletterAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => newsletterAdminCopy(this.language.lang()));
  protected readonly rows = signal<NewsletterSubscriberRow[]>([]);
  protected readonly summary = signal<ConsentSummary | null>(null);
  protected readonly query = signal('');
  protected readonly statusFilter = signal<ConsentStatus | 'all'>('all');
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly error = signal<'failed' | 'denied' | 'invalidEmail' | ''>('');
  protected readonly selected = signal('');
  protected readonly detail = signal<NewsletterDetail | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal<'failed' | 'denied' | 'notFound' | ''>('');
  protected readonly dateTime = formatDateTime;
  protected readonly statuses: ConsentStatus[] = ['pending', 'subscribed', 'unsubscribed'];
  private detailRequest?: Subscription;
  private listRequest?: Subscription;
  private readonly appliedFilters = signal<{ status: ConsentStatus | 'all'; email: string }>({ status: 'all', email: '' });
  protected readonly filtersDirty = computed(() => this.query().trim().toLowerCase() !== this.appliedFilters().email || this.statusFilter() !== this.appliedFilters().status);
  private requestedPage = 1;
  private requestedHistoryPage = 1;

  constructor() {
    if (!API_CONFIG.useBackend) { this.error.set('denied'); return; }
    this.load();
    this.route.queryParamMap.pipe(map(p => p.get('subscriber') ?? ''), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(uuid => {
      this.detailRequest?.unsubscribe(); this.selected.set(uuid); this.detail.set(null);
      this.detailError.set(''); this.detailLoading.set(false);
      if (uuid) this.loadDetail();
    });
  }
  protected load(page = 1): void {
    if (this.loading() || !API_CONFIG.useBackend) return;
    const { email, status } = this.appliedFilters();
    this.requestedPage = page; this.loading.set(true); this.error.set(''); this.rows.set([]); this.summary.set(null);
    this.listRequest = this.api.list(page, status, email).pipe(timeout({ first: 30_000 }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: list => { this.rows.set(list.rows); this.summary.set(list.summary); this.page.set(list.page); this.lastPage.set(list.lastPage); this.total.set(list.total); this.loading.set(false); },
      error: e => { this.loading.set(false); if (e instanceof HttpErrorResponse && e.status === 403) this.deny(); else this.error.set('failed'); },
    });
  }
  protected retry(): void { this.load(this.requestedPage); }
  protected applyFilters(): void {
    if (this.loading() || !API_CONFIG.useBackend) return;
    const email = this.query().trim().toLowerCase();
    if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) { this.error.set('invalidEmail'); return; }
    this.appliedFilters.set({ email, status: this.statusFilter() }); this.load();
  }
  protected clear(): void { if (!this.loading()) { this.query.set(''); this.statusFilter.set('all'); this.applyFilters(); } }
  protected loadDetail(page = 1): void {
    const uuid = this.selected(); if (this.detailLoading() || !uuid || !API_CONFIG.useBackend) return;
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(uuid)) { this.detailError.set('notFound'); return; }
    this.requestedHistoryPage = page; this.detailRequest?.unsubscribe(); this.detail.set(null); this.detailError.set(''); this.detailLoading.set(true);
    this.detailRequest = this.api.detail(uuid, page).pipe(timeout({ first: 30_000 }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: detail => { this.detail.set(detail); this.detailLoading.set(false); },
      error: e => { this.detailLoading.set(false); if (e instanceof HttpErrorResponse && e.status === 403) this.deny(); else this.detailError.set(e instanceof HttpErrorResponse && e.status === 404 ? 'notFound' : 'failed'); },
    });
  }
  protected retryDetail(): void { this.loadDetail(this.requestedHistoryPage); }
  private deny(): void {
    this.listRequest?.unsubscribe(); this.detailRequest?.unsubscribe();
    this.loading.set(false); this.detailLoading.set(false); this.rows.set([]); this.summary.set(null); this.detail.set(null);
    this.error.set('denied'); if (this.selected()) this.detailError.set('denied');
  }
}
