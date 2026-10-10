import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { LoadStatus } from '../../../core/models/marketplace.model';
import { TranslatePipe } from '../../../core/i18n';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiLoad, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { Load, VehicleType } from '../../../core/models/marketplace.model';
import { formatLoadReference } from '../../../core/utils/load-reference';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';
import { apiErrorMessage } from '../../../core/api/api-error';

const STATUS_CLASS: Record<LoadStatus, string> = {
  Open: 'status-pending',
  'Applications Received': 'status-transit',
  Booked: 'status-delivered',
  'In Transit': 'status-transit',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
};

/** "My Loads" — loads posted by the current role (Shipper, or Transporter on behalf of customers). */
@Component({
  selector: 'app-my-loads',
  standalone: true,
  imports: [IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-loads.component.html',
})
export class MyLoadsComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly apiMarketplace = inject(ApiMarketplaceService);
  protected readonly loading = API_CONFIG.useBackend ? signal(true) : signal(false);
  protected readonly loadError = signal('');

  private readonly backendLoads = toSignal(
    API_CONFIG.useBackend
      ? this.apiMarketplace.listLoads({ mine: true, per_page: 100 }).pipe(catchError((error) => { this.loadError.set(apiErrorMessage(error, 'We could not load your loads.')); return of([] as ApiLoad[]); }), finalize(() => this.loading.set(false)))
      : of([] as ApiLoad[]),
    { initialValue: [] as ApiLoad[] },
  );

  protected readonly loads = computed(() => API_CONFIG.useBackend
    ? this.backendLoads().map((load) => this.mapLoad(load))
    : this.marketplace.getLoadsPostedBy(this.session.role())());
  protected readonly statusClass = STATUS_CLASS;

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  protected viewLoad(loadId: string): void {
    this.router.navigate([this.session.portal().basePath, 'load-board', loadId]);
  }

  protected postLoad(): void {
    this.router.navigate([this.session.portal().basePath, 'post-load']);
  }

  private mapLoad(load: ApiLoad): Load {
    const status = String(load.status).toLowerCase();
    const normalizedStatus = status.includes('book') ? 'Booked' : status.includes('cancel') ? 'Cancelled' : status.includes('deliver') ? 'Delivered' : status.includes('transit') ? 'In Transit' : status.includes('application') ? 'Applications Received' : 'Open';
    const vehicleTypes: VehicleType[] = ['Open Body Truck', '20ft Container', '32ft Trailer', 'Mini Truck', 'Tanker', 'Trailer (Flatbed)'];
    return {
      id: load.uuid,
      loadId: formatLoadReference(load),
      postedBy: this.session.role(),
      postedByName: this.session.user().company ?? this.session.user().name,
      pickupCity: load.pickup_city,
      dropCity: load.drop_city,
      material: load.material ?? 'General Cargo',
      weightTons: load.weight_tons ?? 0,
      vehicleType: vehicleTypes.includes(load.vehicle_type as VehicleType) ? load.vehicle_type as VehicleType : 'Open Body Truck',
      pickupDate: load.pickup_date ? formatDate(load.pickup_date) : 'To be confirmed',
      budget: `₹${(load.budget ?? 0).toLocaleString('en-IN')}`,
      status: normalizedStatus,
      applicationsCount: load.applications_count ?? 0,
      postedAgo: load.created_at ? formatDateTime(load.created_at) : 'Recently posted',
    };
  }
}
