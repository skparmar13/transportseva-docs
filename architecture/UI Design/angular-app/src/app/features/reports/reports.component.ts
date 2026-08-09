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
}
