import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperReportService, REPORT_LOAD_STATUSES, ReportBookingRow, ReportLoadRow, ReportRequest, ReportTable, ShipperReportPage } from '../../../core/api/api-shipper-report.service';
import { SHIPPER_TRIP_STAGES } from '../../../core/api/api-shipper-trip.service';
import { LanguageService } from '../../../core/i18n';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';
import { REPORT_COPY } from './report-copy';

@Component({
  selector: 'app-shipper-reports', standalone: true, imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './shipper-reports.component.html', styleUrl: './shipper-reports.scss',
})
export class ShipperReportsComponent {
  private readonly api = inject(ApiShipperReportService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => REPORT_COPY[this.language.lang()]);
  protected readonly date = formatDate; protected readonly dateTime = formatDateTime;
  protected readonly data = signal<ShipperReportPage | null>(null);
  protected readonly table = signal<ReportTable>('loads');
  protected readonly from = signal(''); protected readonly to = signal(''); protected readonly search = signal('');
  protected readonly page = signal(1); protected readonly loading = signal(false); protected readonly exporting = signal(false);
  protected readonly busy = computed(() => this.loading() || this.exporting());
  protected readonly error = signal(''); protected readonly exportError = signal('');
  protected readonly loadRows = computed(() => this.data()?.table === 'loads' ? this.data()!.rows as ReportLoadRow[] : []);
  protected readonly bookingRows = computed(() => this.data()?.table === 'bookings' ? this.data()!.rows as ReportBookingRow[] : []);
  protected readonly loadStatuses = REPORT_LOAD_STATUSES; protected readonly stages = SHIPPER_TRIP_STAGES;
  private lastRequested: ReportRequest = { table: 'loads', from: null, to: null, q: '' };
  constructor() { this.load(); }
  protected selectTable(table: ReportTable): void { if (this.busy()) return; this.table.set(table); this.load(1, true); }
  protected load(page = 1, useApplied = false): void {
    if (this.busy()) return;
    const view = this.data();
    const request: ReportRequest = useApplied
      ? { ...(view ? view.filters : this.lastRequested), table: this.table() }
      : { table: this.table(), from: this.from(), to: this.to(), q: this.search().trim() };
    const from = request.from || ''; const to = request.to || '';
    this.page.set(page); this.error.set(''); this.exportError.set(''); this.data.set(null);
    if ([from, to].some((date) => date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < '1900-01-01' || date > '2100-12-31'))
      || (from && to && from > to)) { this.error.set(this.copy().datesInvalid); return; }
    if (!API_CONFIG.useBackend) { this.error.set(this.copy().offline); return; }
    this.lastRequested = request;
    this.loading.set(true);
    this.api.list(request, page)
      .pipe(timeout(30_000), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (data) => { this.data.set(data); this.loading.set(false); },
        error: (e) => { this.loading.set(false); this.error.set(e?.status === 422 ? this.copy().datesInvalid : this.copy().failed); },
      });
  }
  protected export(): void {
    const view = this.data(); if (!view || !view.matching || this.busy()) return;
    this.exporting.set(true); this.exportError.set('');
    // Export the displayed/applied filters, never an unapplied form draft or only the current page.
    this.api.export({ table: view.table, from: view.filters.from, to: view.filters.to, q: view.filters.q })
      .pipe(timeout(60_000), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob); const link = this.document.createElement('a');
          link.href = url; link.download = 'transportseva-shipper-' + view.table + '-report.csv'; link.click();
          URL.revokeObjectURL(url); this.exporting.set(false);
        },
        error: () => { this.exporting.set(false); this.exportError.set(this.copy().exportFailed); },
      });
  }
}
