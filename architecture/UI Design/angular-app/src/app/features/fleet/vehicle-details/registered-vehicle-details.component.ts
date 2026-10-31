import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { ApiMarketplaceService, ApiMarketplaceVehicle } from '../../../core/api/api-marketplace.service';
import { SessionService } from '../../../core/services/session.service';
import { TranslatePipe } from '../../../core/i18n';
import { formatDateTime } from '../../../core/utils/date-format';

type VehicleState = {
  status: 'loading' | 'ready' | 'not-found' | 'forbidden' | 'error';
  vehicle?: ApiMarketplaceVehicle;
};

/** Backend-only view: no prototype records or browser-only mutation actions. */
@Component({
  selector: 'app-registered-vehicle-details',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registered-vehicle-details.component.html',
})
export class RegisteredVehicleDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiMarketplaceService);
  protected readonly session = inject(SessionService);
  private readonly refresh = new Subject<void>();
  protected readonly listPath = computed(() => this.session.role() === 'truck-owner' ? 'vehicles' : 'fleet');
  protected readonly state = toSignal(combineLatest([
    this.route.paramMap, this.refresh.pipe(startWith(undefined)),
  ]).pipe(switchMap(([params]) => {
    const uuid = params.get('id') ?? '';
    // Reject prototype IDs/malformed links instead of looking them up in sample data.
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(uuid)) {
      return of<VehicleState>({ status: 'not-found' });
    }
    return this.api.getMarketplaceVehicle(uuid).pipe(
      map((vehicle): VehicleState => ({ status: 'ready', vehicle })),
      startWith<VehicleState>({ status: 'loading' }),
      catchError((error: HttpErrorResponse) => of<VehicleState>({
        status: error.status === 404 ? 'not-found' : error.status === 403 ? 'forbidden' : 'error',
      })),
    );
  })), { initialValue: { status: 'loading' } as VehicleState });

  protected readonly vehicle = computed(() => this.state().vehicle);
  protected readonly availabilityKey = computed(() => {
    const v = this.vehicle();
    const status = v?.availability_status ?? v?.status;
    return ({ available: 'status.vehicleLive.idle', reserved: 'status.vehicleLive.reserved',
      on_trip: 'status.vehicleLive.onTrip', maintenance: 'status.vehicleLive.maintenance',
      inactive: 'status.vehicleLive.offline' } as Record<string, string>)[status ?? ''] ?? 'common.dash';
  });
  protected readonly dateTime = formatDateTime;

  protected reload(): void {
    if (this.state().status !== 'loading') this.refresh.next();
  }
}
