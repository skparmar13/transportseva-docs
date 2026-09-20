import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n';
import { DashboardMockService } from '../../../core/services/dashboard-mock.service';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-transporter-dashboard',
  standalone: true,
  imports: [IconComponent, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transporter-dashboard.component.html',
})
export class TransporterDashboardComponent {
  private readonly mock = inject(DashboardMockService);
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);

  private readonly transporterKpis = toSignal(this.mock.getTransporterKpis(), { initialValue: [] });
  protected readonly requests = computed(() => this.marketplace.bookings()
    .filter((booking) => booking.status === 'Offer Accepted')
    .map((booking) => ({ bookingId: booking.bookingId, customer: booking.ownerName, route: booking.route, amount: booking.amount })));
  protected readonly kpis = computed(() => this.transporterKpis().map((kpi) =>
    kpi.label === 'New Requests' ? { ...kpi, value: String(this.requests().length) } : kpi,
  ));
  protected readonly quickActions = toSignal(this.mock.getTransporterQuickActions(), { initialValue: [] });
  protected acceptRequest(bookingId: string): void {
    this.marketplace.acceptTransporterRequest(bookingId);
  }

  protected isAccepted(bookingId: string): boolean {
    return this.marketplace.bookings().some((booking) => booking.bookingId === bookingId && booking.status !== 'Offer Accepted');
  }
}
