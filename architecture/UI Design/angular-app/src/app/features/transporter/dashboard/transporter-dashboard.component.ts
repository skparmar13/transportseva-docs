import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n';
import { ApiDashboardService } from '../../../core/api/api-dashboard.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { dashboardFeed } from '../../marketplace/dashboard/dashboard-feed';
import { dashboardCopy, dashboardStatusClass } from '../../marketplace/dashboard/dashboard-copy';
import { formatDateTime } from '../../../core/utils/date-format';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-transporter-dashboard',
  standalone: true,
  imports: [IconComponent, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transporter-dashboard.component.html',
  styleUrl: '../../marketplace/dashboard/dashboard.scss',
})
export class TransporterDashboardComponent {
  private readonly api = inject(ApiDashboardService);
  private readonly language = inject(LanguageService);
  protected readonly session = inject(SessionService);
  protected readonly feed = dashboardFeed(() => this.api.provider());
  protected readonly data = computed(() => this.feed.state().data);
  protected readonly copy = computed(() => dashboardCopy(this.language.lang()));
  protected readonly kpis = computed(() => {
    const totals = this.data()?.totals; const c = this.copy();
    return totals ? [
      { key: 'vehicles_total', icon: 'i-car', value: totals.vehicles_total, label: c.vehicles, path: 'fleet' },
      { key: 'vehicles_on_trip', icon: 'i-truck', value: totals.vehicles_on_trip, label: c.onTrip, path: 'fleet' },
      { key: 'vehicles_available', icon: 'i-check', value: totals.vehicles_available, label: c.available, path: 'fleet' },
      { key: 'pending_applications', icon: 'i-doc', value: totals.pending_applications, label: c.pending, path: 'sent-applications' },
    ] : [];
  });
  protected readonly quickActions = computed(() => [
    { label: this.copy().loadBoard, path: 'load-board', icon: 'i-search' },
    { label: this.copy().myVehicles, path: 'fleet', icon: 'i-car' },
    { label: this.copy().myDrivers, path: 'fleet/drivers', icon: 'i-user' },
    { label: this.copy().bookings, path: 'requests', icon: 'i-check' },
  ]);
  protected readonly dateTime = formatDateTime;
  protected readonly statusClass = dashboardStatusClass;
}
