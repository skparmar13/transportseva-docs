import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ReportMockService } from '../../core/services/report-mock.service';

type ReportsTab = 'fleet' | 'driver' | 'revenue' | 'gps' | 'marketplace' | 'trips';

/**
 * Reports — Module 10. Six report views (Fleet / Driver / Revenue /
 * GPS / Marketplace / Trips), each a KPI-driven summary table
 * backed by ReportMockService — a lightweight analytics prototype,
 * not a real BI/reporting engine.
 */
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  protected readonly reports = inject(ReportMockService);
  protected readonly activeTab = signal<ReportsTab>('fleet');

  protected setTab(tab: ReportsTab): void {
    this.activeTab.set(tab);
  }

  protected exportCurrentReport(): void {
    const datasets: Record<ReportsTab, { name: string; rows: object[] }> = {
      fleet: { name: 'fleet', rows: this.reports.fleetRows() },
      driver: { name: 'drivers', rows: this.reports.driverRows() },
      revenue: { name: 'revenue', rows: this.reports.revenueRows() },
      gps: { name: 'gps', rows: this.reports.gpsRows() },
      marketplace: { name: 'marketplace', rows: this.reports.marketplaceRows() },
      trips: { name: 'trips', rows: this.reports.tripsRows() },
    };
    const { name, rows } = datasets[this.activeTab()];
    if (!rows.length) return;
    const columns = Object.keys(rows[0]);
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [columns.map(escape).join(','), ...rows.map((row) => columns.map((key) => escape((row as Record<string, unknown>)[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `transportseva-${name}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
