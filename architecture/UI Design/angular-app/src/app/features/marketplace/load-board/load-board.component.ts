import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { TranslatePipe } from '../../../core/i18n';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiLoad, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { Load, VehicleType } from '../../../core/models/marketplace.model';

/**
 * Load Board — the open marketplace where Transporters and Truck
 * Owners discover loads posted by Shippers (or by Transporters on
 * behalf of offline customers) and apply. Excludes the viewer's own
 * posted loads and anything already booked/closed.
 */
@Component({
  selector: 'app-load-board',
  standalone: true,
  imports: [IconComponent, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './load-board.component.html',
})
export class LoadBoardComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  private readonly apiMarketplace = inject(ApiMarketplaceService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly search = signal('');
  protected readonly vehicleFilter = signal('');

  private readonly backendLoads = toSignal(
    API_CONFIG.useBackend
      ? this.apiMarketplace.listLoads({ per_page: 100 }).pipe(catchError(() => of([] as ApiLoad[])))
      : of([] as ApiLoad[]),
    { initialValue: [] as ApiLoad[] },
  );

  private readonly loads = computed<Load[]>(() =>
    API_CONFIG.useBackend ? this.backendLoads().map((load) => this.mapLoad(load)) : this.marketplace.loads(),
  );

  protected readonly openLoads = computed(() =>
    this.loads().filter((load) => load.status === 'Open' || load.status === 'Applications Received'),
  );

  protected readonly filteredLoads = computed(() => {
    const term = this.search().trim().toLowerCase();
    const vehicle = this.vehicleFilter();
    return this.openLoads().filter((load) => {
      const matchesTerm =
        !term ||
        load.pickupCity.toLowerCase().includes(term) ||
        load.dropCity.toLowerCase().includes(term) ||
        load.material.toLowerCase().includes(term);
      const matchesVehicle = !vehicle || load.vehicleType === vehicle;
      return matchesTerm && matchesVehicle;
    });
  });

  protected readonly vehicleTypes = ['Open Body Truck', '20ft Container', '32ft Trailer', 'Mini Truck', 'Tanker', 'Trailer (Flatbed)'];

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  protected viewLoad(loadId: string): void {
    this.router.navigate([this.session.portal().basePath, 'load-board', loadId]);
  }

  private mapLoad(load: ApiLoad): Load {
    const status = String(load.status).toLowerCase();
    const normalizedStatus = status.includes('book') ? 'Booked' : status.includes('cancel') ? 'Cancelled' : status.includes('application') ? 'Applications Received' : 'Open';
    const vehicle = this.vehicleTypes.includes(load.vehicle_type ?? '') ? load.vehicle_type as VehicleType : 'Open Body Truck';
    const budget = typeof load.budget === 'number' ? `₹${load.budget.toLocaleString('en-IN')}` : '₹0';
    return {
      id: load.uuid,
      loadId: load.load_id ? `#${load.load_id.replace(/^#/, '')}` : `#${load.uuid.slice(0, 8).toUpperCase()}`,
      postedBy: 'shipper',
      postedByName: 'TransportSeva customer',
      pickupCity: load.pickup_city,
      dropCity: load.drop_city,
      material: load.material ?? 'General Cargo',
      weightTons: load.weight_tons ?? 0,
      vehicleType: vehicle,
      pickupDate: load.pickup_date ?? '',
      budget,
      status: normalizedStatus,
      applicationsCount: load.applications_count ?? 0,
      postedAgo: load.created_at ?? 'Recently posted',
    };
  }
}
