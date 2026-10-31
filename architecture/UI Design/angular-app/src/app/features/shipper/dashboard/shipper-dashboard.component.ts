import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n';
import { ApiDashboardService } from '../../../core/api/api-dashboard.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { dashboardFeed } from '../../marketplace/dashboard/dashboard-feed';
import { dashboardCopy, dashboardStatusClass } from '../../marketplace/dashboard/dashboard-copy';
import { formatDateTime } from '../../../core/utils/date-format';
import { formatLoadReference } from '../../../core/utils/load-reference';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-shipper-dashboard',
  standalone: true,
  imports: [IconComponent, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shipper-dashboard.component.html',
  styleUrl: '../../marketplace/dashboard/dashboard.scss',
})
export class ShipperDashboardComponent {
  private readonly api = inject(ApiDashboardService);
  private readonly language = inject(LanguageService);
  protected readonly session = inject(SessionService);
  protected readonly feed = dashboardFeed(() => this.api.shipper());
  protected readonly data = computed(() => this.feed.state().data);
  protected readonly copy = computed(() => dashboardCopy(this.language.lang()));
  protected readonly kpis = computed(() => {
    const totals = this.data()?.totals; const c = this.copy();
    return totals ? [
      { key: 'loads_posted', icon: 'i-box', value: totals.loads_posted, label: c.loads, path: 'my-loads' },
      { key: 'pending_applications', icon: 'i-doc', value: totals.pending_applications, label: c.pending, path: 'applications' },
      { key: 'in_transit_bookings', icon: 'i-truck', value: totals.in_transit_bookings, label: c.inTransit, path: 'bookings' },
      { key: 'delivered_bookings', icon: 'i-check', value: totals.delivered_bookings, label: c.delivered, path: 'bookings' },
    ] : [];
  });
  protected readonly quickActions = computed(() => [
    { label: this.copy().postLoad, path: 'post-load', icon: 'i-plus' },
    { label: this.copy().myLoads, path: 'my-loads', icon: 'i-box' },
    { label: this.copy().applications, path: 'applications', icon: 'i-doc' },
    { label: this.copy().bookings, path: 'bookings', icon: 'i-check' },
  ]);
  protected readonly statusClass = dashboardStatusClass;
  protected readonly dateTime = formatDateTime;
  protected readonly loadReference = formatLoadReference;
  protected budget(value: number | string | undefined): string {
    return value != null && Number.isFinite(Number(value)) ? '₹' + Number(value).toLocaleString('en-IN') : '—';
  }
}
