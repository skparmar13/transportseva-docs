import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { TranslatePipe } from '../../../core/i18n';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiLoad, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { ApplicationStatus, Load, VehicleType } from '../../../core/models/marketplace.model';
import { formatLoadReference } from '../../../core/utils/load-reference';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';
import { apiErrorMessage } from '../../../core/api/api-error';

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
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly search = signal('');
  protected readonly vehicleFilter = signal('');
  protected readonly loading = signal(API_CONFIG.useBackend);
  protected readonly loadError = signal('');

  private readonly backendLoads = signal<ApiLoad[]>([]);

  private readonly loads = computed<Load[]>(() =>
    API_CONFIG.useBackend
      ? this.backendLoads().map((load) => this.mapLoad(load))
      : this.marketplace.loads().map((load) => ({
        ...load,
        viewerApplicationStatus: this.marketplace.getApplicationsForLoad(load.id)().find((application) => application.applicantRole === this.session.role())?.status,
      })),
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

  constructor() {
    this.fetchLoads();
  }

  protected retry(): void {
    this.fetchLoads();
  }

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  protected cardStatus(load: Load): 'Open' | 'Applied' {
    return load.viewerApplicationStatus ? 'Applied' : 'Open';
  }

  protected cardActionKey(load: Load): string {
    return load.viewerApplicationStatus ? 'loadBoard.card.viewApplication' : 'loadBoard.card.viewApply';
  }

  protected viewLoad(loadId: string): void {
    this.router.navigate([this.session.portal().basePath, 'load-board', loadId]);
  }

  private fetchLoads(): void {
    if (!API_CONFIG.useBackend) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.loadError.set('');
    this.apiMarketplace.listLoads({ per_page: 100 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (loads) => this.backendLoads.set(loads),
      error: (error) => {
        this.backendLoads.set([]);
        this.loadError.set(apiErrorMessage(error, 'We could not load available shipments. Please try again.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private mapLoad(load: ApiLoad): Load {
    const status = String(load.status).toLowerCase();
    const normalizedStatus = status.includes('book') ? 'Booked' : status.includes('cancel') ? 'Cancelled' : 'Open';
    const applicationStatus = this.toApplicationStatus(load.viewer_application_status);
    const vehicle = this.vehicleTypes.includes(load.vehicle_type ?? '') ? load.vehicle_type as VehicleType : 'Open Body Truck';
    const budget = typeof load.budget === 'number' ? `₹${load.budget.toLocaleString('en-IN')}` : '₹0';
    return {
      id: load.uuid,
      loadId: formatLoadReference(load),
      postedBy: 'shipper',
      postedByName: 'TransportSeva customer',
      pickupCity: load.pickup_city,
      dropCity: load.drop_city,
      material: load.material ?? 'General Cargo',
      weightTons: load.weight_tons ?? 0,
      vehicleType: vehicle,
      pickupDate: formatDate(load.pickup_date),
      budget,
      status: normalizedStatus,
      viewerApplicationStatus: applicationStatus,
      applicationsCount: load.applications_count ?? 0,
      postedAgo: load.created_at ? formatDateTime(load.created_at) : 'Recently posted',
    };
  }

  private toApplicationStatus(status: string | undefined): ApplicationStatus | undefined {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized === 'pending') return 'Pending';
    if (normalized === 'negotiating') return 'Negotiating';
    if (normalized === 'accepted') return 'Accepted';
    if (normalized === 'rejected') return 'Rejected';
    if (normalized === 'withdrawn') return 'Withdrawn';
    return undefined;
  }
}
