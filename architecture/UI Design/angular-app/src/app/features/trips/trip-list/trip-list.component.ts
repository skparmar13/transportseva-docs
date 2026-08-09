import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TripMockService } from '../../../core/services/trip-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { Trip, TripStatus } from '../../../core/models/trip.model';

const STATUS_CLASS: Record<TripStatus, string> = {
  Planned: 'status-pending',
  'In Transit': 'status-transit',
  Delivered: 'status-delivered',
  Settled: 'status-delivered',
};

type TabFilter = 'all' | 'planned' | 'active' | 'completed';

/**
 * Trips — Module 7. One list, filterable by lifecycle stage
 * (Planned / Active / Completed) via tabs, covering the Shipper's
 * "Trip History", Driver's "Assigned Trips" / "Trip History" and
 * Transporter/Truck Owner/Company's "Trips" nav entries. The
 * default tab can be preset per-route via route `data.defaultTab`.
 */
@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [IconComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-list.component.html',
})
export class TripListComponent {
  private readonly trips = inject(TripMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly statusClass = STATUS_CLASS;

  protected readonly activeTab = signal<TabFilter>((this.route.snapshot.data['defaultTab'] as TabFilter) ?? 'all');
  protected readonly search = signal('');

  protected readonly kpis = computed(() => ({
    planned: this.trips.plannedTrips().length,
    active: this.trips.activeTrips().length,
    completed: this.trips.completedTrips().length,
    pendingPod: this.trips.pendingPodCount(),
  }));

  protected readonly filteredTrips = computed(() => {
    const tab = this.activeTab();
    const term = this.search().trim().toLowerCase();
    let list: Trip[];
    switch (tab) {
      case 'planned':
        list = this.trips.plannedTrips();
        break;
      case 'active':
        list = this.trips.activeTrips();
        break;
      case 'completed':
        list = this.trips.completedTrips();
        break;
      default:
        list = this.trips.trips();
    }
    if (!term) return list;
    return list.filter(
      (t) =>
        t.tripId.toLowerCase().includes(term) ||
        t.pickupCity.toLowerCase().includes(term) ||
        t.dropCity.toLowerCase().includes(term) ||
        t.vehicleRegNumber.toLowerCase().includes(term) ||
        t.driverName.toLowerCase().includes(term) ||
        t.customerName.toLowerCase().includes(term),
    );
  });

  protected setTab(tab: TabFilter): void {
    this.activeTab.set(tab);
  }

  protected viewTrip(id: string): void {
    this.router.navigate([this.session.portal().basePath, 'trips', id]);
  }
}
