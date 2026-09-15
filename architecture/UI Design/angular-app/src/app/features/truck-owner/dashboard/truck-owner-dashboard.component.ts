import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n';
import { DashboardMockService } from '../../../core/services/dashboard-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { VehicleLiveStatus } from '../../../core/models/dashboard.model';

const STATUS_CLASS: Record<VehicleLiveStatus, string> = {
  'On Trip': 'status-transit',
  Idle: 'status-pending',
  Maintenance: 'status-overdue',
  Offline: 'status-cancelled',
};

@Component({
  selector: 'app-truck-owner-dashboard',
  standalone: true,
  imports: [IconComponent, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './truck-owner-dashboard.component.html',
})
export class TruckOwnerDashboardComponent {
  private readonly mock = inject(DashboardMockService);
  protected readonly session = inject(SessionService);

  protected readonly kpis = toSignal(this.mock.getTruckOwnerKpis(), { initialValue: [] });
  protected readonly vehicles = toSignal(this.mock.getTruckOwnerVehicles(), { initialValue: [] });
  protected readonly quickActions = toSignal(this.mock.getTruckOwnerQuickActions(), { initialValue: [] });

  protected statusClass(status: VehicleLiveStatus): string {
    return STATUS_CLASS[status];
  }
}
