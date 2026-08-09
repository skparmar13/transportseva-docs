import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { DashboardMockService } from '../../../core/services/dashboard-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { LoadStatus } from '../../../core/models/dashboard.model';

const STATUS_CLASS: Record<LoadStatus, string> = {
  Open: 'status-pending',
  Applications: 'status-progress',
  Booked: 'status-approved',
  'In Transit': 'status-transit',
  Delivered: 'status-delivered',
};

@Component({
  selector: 'app-shipper-dashboard',
  standalone: true,
  imports: [IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shipper-dashboard.component.html',
})
export class ShipperDashboardComponent {
  private readonly mock = inject(DashboardMockService);
  protected readonly session = inject(SessionService);

  protected readonly kpis = toSignal(this.mock.getShipperKpis(), { initialValue: [] });
  protected readonly loads = toSignal(this.mock.getShipperRecentLoads(), { initialValue: [] });
  protected readonly quickActions = toSignal(this.mock.getShipperQuickActions(), { initialValue: [] });

  protected statusClass(status: LoadStatus): string {
    return STATUS_CLASS[status];
  }
}
