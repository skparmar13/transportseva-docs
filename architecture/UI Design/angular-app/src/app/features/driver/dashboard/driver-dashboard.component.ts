import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n';
import { DashboardMockService } from '../../../core/services/dashboard-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { TripStatus } from '../../../core/models/dashboard.model';

const STATUS_CLASS: Record<TripStatus, string> = {
  Assigned: 'status-pending',
  'In Progress': 'status-transit',
  Completed: 'status-delivered',
};

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [IconComponent, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './driver-dashboard.component.html',
})
export class DriverDashboardComponent {
  private readonly mock = inject(DashboardMockService);
  protected readonly session = inject(SessionService);

  protected readonly kpis = toSignal(this.mock.getDriverKpis(), { initialValue: [] });
  protected readonly trips = toSignal(this.mock.getDriverTrips(), { initialValue: [] });
  protected readonly quickActions = toSignal(this.mock.getDriverQuickActions(), { initialValue: [] });

  protected statusClass(status: TripStatus): string {
    return STATUS_CLASS[status];
  }
}
