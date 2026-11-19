import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { ApiAdminDashboardService, AdminDashboard, AdminMetric, AdminSection } from '../../../core/api/api-admin-dashboard.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { LanguageService } from '../../../core/i18n';
import { formatDateTime } from '../../../core/utils/date-format';
import { adminActivityLabel, adminDashboardCopy } from './admin-dashboard.copy';

@Component({ selector: 'app-admin-dashboard', standalone: true, imports: [RouterLink], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html', styleUrl: './admin-dashboard.component.scss' })
export class AdminDashboardComponent {
  private readonly api = inject(ApiAdminDashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => adminDashboardCopy(this.language.lang()));
  protected readonly data = signal<AdminDashboard | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<'failed' | 'denied' | ''>('');
  protected readonly dateTime = formatDateTime;
  protected readonly metrics: AdminMetric[] = ['loads_total', 'open_loads', 'pending_applications', 'bookings_total', 'bookings_in_transit', 'bookings_delivered'];
  protected readonly queues = computed(() => {
    const d = this.data();
    const options: { section: AdminSection; key: AdminMetric; path: string }[] = [
      { section: 'disputes', key: 'open_disputes', path: 'bookings' }, { section: 'reviews', key: 'pending_reviews', path: 'reviews' },
      { section: 'kyc', key: 'pending_kyc', path: 'kyc' }, { section: 'support', key: 'open_support_tickets', path: 'support' },
      { section: 'contact', key: 'new_contact_inquiries', path: 'contact-inquiries' }, { section: 'newsletter', key: 'pending_newsletter', path: 'newsletter' },
    ];
    return options.filter(q => d?.sections.includes(q.section));
  });
  constructor() { this.load(); }
  protected load(): void {
    if (this.loading()) return;
    this.data.set(null); this.error.set('');
    if (!API_CONFIG.useBackend) { this.error.set('denied'); return; }
    this.loading.set(true);
    this.api.get().pipe(timeout({ first: 30_000 }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.data.set(data); this.loading.set(false); },
      error: e => { this.data.set(null); this.loading.set(false); this.error.set(e instanceof HttpErrorResponse && e.status === 403 ? 'denied' : 'failed'); },
    });
  }
  protected actionLabel(action: string): string { return adminActivityLabel(action, this.language.lang()); }
}
