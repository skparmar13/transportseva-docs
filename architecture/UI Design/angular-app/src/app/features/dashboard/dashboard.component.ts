import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../core/i18n';
import { DashboardMockService } from '../../core/services/dashboard-mock.service';
import { SessionService } from '../../core/services/session.service';
import { BookingStatus } from '../../core/models/dashboard.model';

const STATUS_CLASS: Record<BookingStatus, string> = {
  Delivered: 'status-delivered',
  'In Transit': 'status-transit',
  Pending: 'status-pending',
  Cancelled: 'status-cancelled',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly mock = inject(DashboardMockService);
  protected readonly session = inject(SessionService);

  protected readonly kpis = toSignal(this.mock.getKpis(), { initialValue: [] });
  protected readonly bookings = toSignal(this.mock.getRecentBookings(), { initialValue: [] });
  protected readonly quickActions = toSignal(this.mock.getQuickActions(), { initialValue: [] });

  protected statusClass(status: BookingStatus): string {
    return STATUS_CLASS[status];
  }
}
