import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { ApplicationStatus, Load, LoadApplication, VehicleType } from '../../../core/models/marketplace.model';
import { TranslatePipe } from '../../../core/i18n';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiApplication, ApiLoad, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';
import { formatCurrencyAmount } from '../../../core/utils/currency-format';

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  Pending: 'status-pending', Negotiating: 'status-transit', Accepted: 'status-delivered',
  Rejected: 'status-cancelled', Withdrawn: 'status-cancelled',
};

interface ApplicationRow { app: LoadApplication; load?: Load; }

/** Applications received for owned loads, or the current user's applications. */
@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './applications.component.html',
})
export class ApplicationsComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly apiMarketplace = inject(ApiMarketplaceService);

  protected readonly statusClass = STATUS_CLASS;
  protected readonly loading = signal(API_CONFIG.useBackend);
  protected readonly loadError = signal('');
  private readonly backendRows = signal<ApplicationRow[]>([]);

  private readonly myLoads = computed(() => this.marketplace.getLoadsPostedBy(this.session.role())());
  private readonly backendOwnerMode = computed(() => ['shipper', 'transporter', 'company'].includes(this.session.role()));
  protected readonly isOwnerMode = computed(() => API_CONFIG.useBackend ? this.backendOwnerMode() : this.myLoads().length > 0);

  constructor() { this.reloadBackendData(); }

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  protected readonly receivedApplications = computed(() => {
    if (API_CONFIG.useBackend) return this.backendRows();
    const myLoadIds = new Set(this.myLoads().map((l) => l.id));
    return this.marketplace.applications().filter((app) => myLoadIds.has(app.loadId))
      .map((app) => ({ app, load: this.marketplace.loads().find((l) => l.id === app.loadId) }));
  });

  protected readonly myApplications = computed(() => {
    if (API_CONFIG.useBackend) return this.backendRows();
    const apps = this.marketplace.getApplicationsBy(this.session.role())();
    return apps.map((app) => ({ app, load: this.marketplace.loads().find((l) => l.id === app.loadId) }));
  });

  protected viewLoad(loadId: string): void {
    this.router.navigate([this.session.portal().basePath, 'load-board', loadId]);
  }

  private reloadBackendData(): void {
    if (!API_CONFIG.useBackend) return;
    this.loading.set(true);
    this.loadError.set('');
    if (this.backendOwnerMode()) {
      this.apiMarketplace.listLoads({ mine: true, per_page: 100 }).subscribe({
        next: (loads) => {
          if (!loads.length) { this.backendRows.set([]); this.loading.set(false); return; }
          forkJoin(loads.map((load) => this.apiMarketplace.listApplications(load.uuid).pipe(
            map((applications) => applications.map((application) => ({ app: this.mapApplication(application), load: this.mapLoad(load) }))),
            catchError(() => of([] as ApplicationRow[])),
          ))).subscribe((rows) => { this.backendRows.set(rows.flat()); this.loading.set(false); });
        },
        error: (error) => this.fail(error, 'We could not load applications. Please try again.'),
      });
      return;
    }
    this.apiMarketplace.listMyApplications().subscribe({
      next: (applications) => {
        this.backendRows.set(applications.map((application) => ({
          app: this.mapApplication(application),
          load: application.load ? this.mapLoad(application.load) : undefined,
        })));
        this.loading.set(false);
      },
      error: (error) => this.fail(error, 'We could not load your applications. Please try again.'),
    });
  }

  private fail(error: unknown, fallback: string): void {
    this.backendRows.set([]);
    this.loading.set(false);
    this.loadError.set(apiErrorMessage(error, fallback));
  }

  private mapApplication(application: ApiApplication): LoadApplication {
    const role = String(application.applicant_role).toLowerCase().replace(/[_\s]/g, '-');
    return {
      id: application.uuid, loadId: application.load_uuid,
      applicantRole: role.includes('truck') || role.includes('fleet') ? 'truck-owner' : 'transporter',
      applicantName: application.applicant_name, vehicleRegNumber: application.vehicle_reg_number,
      vehicleType: (application.vehicle_type || 'Open Body Truck') as VehicleType,
      availability: application.availability,
      quotedAmount: formatCurrencyAmount(application.accepted_amount ?? application.current_offer_amount ?? application.quoted_amount),
      status: this.mapApplicationStatus(application.status),
      appliedAgo: application.created_at ? formatDateTime(application.created_at) : 'Recently',
    };
  }

  private mapApplicationStatus(status: string): ApplicationStatus {
    const normalized = String(status).toLowerCase().replace(/[_\s]/g, '');
    if (normalized === 'accepted') return 'Accepted';
    if (normalized === 'rejected') return 'Rejected';
    if (normalized === 'withdrawn') return 'Withdrawn';
    if (normalized === 'negotiating') return 'Negotiating';
    return 'Pending';
  }

  private mapLoad(load: ApiLoad): Load {
    const normalized = String(load.status).toLowerCase();
    const status: Load['status'] = normalized.includes('booked') ? 'Booked' : normalized.includes('transit') ? 'In Transit'
      : normalized.includes('delivered') ? 'Delivered' : normalized.includes('cancel') ? 'Cancelled'
        : normalized.includes('application') ? 'Applications Received' : 'Open';
    return {
      id: load.uuid, loadId: load.load_id ? `#${load.load_id.replace(/^#/, '')}` : `#${load.uuid.slice(0, 8).toUpperCase()}`,
      postedBy: this.session.role(), postedByName: load.posted_by_name ?? 'TransportSeva customer',
      pickupCity: load.pickup_city, dropCity: load.drop_city, material: load.material ?? 'General Cargo',
      weightTons: load.weight_tons ?? 0, vehicleType: (load.vehicle_type ?? 'Open Body Truck') as VehicleType,
      pickupDate: formatDate(load.pickup_date), budget: formatCurrencyAmount(load.budget), status,
      applicationsCount: load.applications_count ?? 0,
      postedAgo: load.created_at ? formatDateTime(load.created_at) : 'Recently posted',
    };
  }
}
