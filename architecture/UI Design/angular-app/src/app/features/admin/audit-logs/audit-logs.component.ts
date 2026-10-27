import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout } from 'rxjs';
import { AdminActivityEvent, ApiAdminAccessService, AuditCategory } from '../../../core/api/api-admin-access.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDateTime } from '../../../core/utils/date-format';

@Component({ selector: 'app-audit-logs', standalone: true, imports: [FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './audit-logs.component.html' })
export class AuditLogsComponent implements OnInit {
  private readonly api = inject(ApiAdminAccessService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  protected readonly events = signal<AdminActivityEvent[]>([]);
  protected readonly filter = signal<'All' | AuditCategory>('All');
  protected readonly target = signal(this.route.snapshot.queryParamMap.get('target') ?? '');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly total = signal(0);
  protected readonly categories = ['All', 'Info', 'Review', 'Security'] as const;
  protected readonly displayDate = formatDateTime;
  ngOnInit(): void { this.load(); }
  protected setFilter(category: 'All' | AuditCategory): void { this.filter.set(category); this.page.set(1); this.load(); }
  protected applyTarget(): void { this.page.set(1); this.load(); }
  protected changePage(page: number): void { this.page.set(page); this.load(); }
  protected load(): void {
    if (!API_CONFIG.useBackend) { this.error.set('Connect the backend to view recorded administrative activity.'); return; }
    this.loading.set(true); this.error.set('');
    const category = this.filter();
    this.api.activity(this.page(), category === 'All' ? undefined : category, this.target().trim() || undefined)
      .pipe(timeout(15_000), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: ({ data, meta }) => { this.events.set(data); this.page.set(meta.current_page); this.lastPage.set(meta.last_page); this.total.set(meta.total); this.loading.set(false); },
        error: (error) => { this.loading.set(false); this.events.set([]); this.error.set(apiErrorMessage(error, 'Activity could not be loaded. Please retry.')); },
      });
  }
  protected actionLabel(action: string): string {
    return ({
      'kyc.approved': 'KYC approved', 'kyc.rejected': 'KYC changes requested',
      'review.approved': 'Review published', 'review.rejected': 'Review changes requested',
      'booking.cancelled': 'Booking cancelled after review', 'booking.continued': 'Booking continued after review',
      'user.created': 'User created', 'user.updated': 'User updated', 'user.deleted': 'User deleted', 'user.password_changed': 'User password changed',
      'role.created': 'Role created', 'role.updated': 'Role updated', 'role.deleted': 'Role deleted', 'role.permissions_changed': 'Role permissions changed',
      'permission.created': 'Permission created', 'permission.updated': 'Permission updated', 'permission.deleted': 'Permission deleted',
    } as Record<string, string>)[action] ?? action;
  }
}
