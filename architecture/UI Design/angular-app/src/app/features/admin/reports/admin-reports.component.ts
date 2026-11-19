import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ADMIN_REPORT_STATES, AdminReportFilter, AdminReportPage, AdminReportTable, ApiAdminReportService } from '../../../core/api/api-admin-report.service';
import { LanguageService } from '../../../core/i18n';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';
import { adminReportCopy, adminReportStatus } from './admin-reports.copy';

@Component({ selector: 'app-admin-reports', standalone: true, imports: [FormsModule], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-reports.component.html', styleUrl: './admin-reports.component.scss' })
export class AdminReportsComponent {
  private readonly api = inject(ApiAdminReportService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => adminReportCopy(this.language.lang()));
  protected readonly data = signal<AdminReportPage | null>(null);
  protected readonly table = signal<AdminReportTable>('loads');
  protected readonly from = signal(''); protected readonly to = signal(''); protected readonly status = signal('all');
  protected readonly loading = signal(false); protected readonly exporting = signal(false);
  protected readonly busy = computed(() => this.loading() || this.exporting());
  protected readonly error = signal<'failed' | 'denied' | 'invalid' | ''>(''); protected readonly exportError = signal(false);
  protected readonly tables: AdminReportTable[] = ['loads', 'applications', 'bookings'];
  protected readonly states = computed(() => ADMIN_REPORT_STATES[this.table()]);
  protected readonly date = formatDate; protected readonly dateTime = formatDateTime;
  private applied: AdminReportFilter = { table: 'loads', from: null, to: null, status: 'all' };
  private requestedPage = 1;
  constructor() { this.load(); }
  protected apply(): void {
    if (this.busy()) return;
    const from = this.from(); const to = this.to();
    if ([from, to].some(d => d && (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d < '1900-01-01' || d > '2100-12-31')) || from && to && from > to) { this.error.set('invalid'); this.data.set(null); return; }
    this.applied = { table: this.table(), from: from || null, to: to || null, status: this.status() }; this.load();
  }
  protected changeTable(table: AdminReportTable): void {
    if (this.busy() || table === this.table()) return;
    this.table.set(table); this.status.set('all'); this.applied = { ...this.applied, table, status: 'all' }; this.load();
  }
  protected clear(): void { if (!this.busy()) { this.from.set(''); this.to.set(''); this.status.set('all'); this.apply(); } }
  protected load(page = 1): void {
    if (this.busy()) return;
    this.data.set(null); this.error.set(''); this.exportError.set(false); this.requestedPage = page;
    if (!API_CONFIG.useBackend) { this.error.set('denied'); return; }
    this.loading.set(true);
    this.api.list({ ...this.applied }, page).pipe(timeout({ first: 30_000 }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.data.set(data); this.loading.set(false); },
      error: e => { this.loading.set(false); this.error.set(e instanceof HttpErrorResponse && e.status === 403 ? 'denied' : e instanceof HttpErrorResponse && e.status === 422 ? 'invalid' : 'failed'); },
    });
  }
  protected retry(): void { this.load(this.requestedPage); }
  protected statusLabel(status: string): string { return adminReportStatus(status, this.language.lang()); }
  protected export(): void {
    const view = this.data(); if (this.busy() || !view || !view.matching) return;
    this.exporting.set(true); this.exportError.set(false);
    const filters: AdminReportFilter = { table: view.table, from: view.filters.from, to: view.filters.to, status: view.filters.status };
    this.api.export(filters).pipe(timeout({ first: 60_000 }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob); const link = this.document.createElement('a'); link.href = url;
        link.download = 'transportseva-admin-'+view.table+'-report.csv'; link.click(); URL.revokeObjectURL(url); this.exporting.set(false);
      },
      error: e => { this.exporting.set(false); if (e instanceof HttpErrorResponse && e.status === 403) { this.data.set(null); this.error.set('denied'); } else this.exportError.set(true); },
    });
  }
}
