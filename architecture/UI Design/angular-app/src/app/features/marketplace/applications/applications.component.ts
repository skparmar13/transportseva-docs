import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout } from 'rxjs';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private readonly destroyRef = inject(DestroyRef);
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly total = signal(0);

  protected readonly statusClass = STATUS_CLASS;
  protected readonly loading = signal(false);
  protected readonly backend = API_CONFIG.useBackend;
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
      .map((app) => ({ app: this.formatApplication(app), load: this.formatLoad(this.marketplace.loads().find((l) => l.id === app.loadId)) }));
  });

  protected readonly myApplications = computed(() => {
    if (API_CONFIG.useBackend) return this.backendRows();
    const apps = this.marketplace.getApplicationsBy(this.session.role())();
    return apps.map((app) => ({ app: this.formatApplication(app), load: this.formatLoad(this.marketplace.loads().find((l) => l.id === app.loadId)) }));
  });

  protected viewLoad(loadId: string): void {
    this.router.navigate([this.session.portal().basePath, 'load-board', loadId]);
  }

  protected reloadBackendData(page = 1): void {
    if (!API_CONFIG.useBackend || this.loading()) return;
    this.page.set(page);
    this.loading.set(true);
    this.loadError.set('');
    this.backendRows.set([]);
    if (this.session.role() === 'shipper') {
      this.apiMarketplace.listReceivedApplicationsPage(page).pipe(timeout(30_000), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (result) => {
          this.backendRows.set(result.rows.map((application) => ({ app: this.mapApplication(application), load: application.load ? this.mapLoad(application.load) : undefined })));
          this.page.set(result.page); this.lastPage.set(result.lastPage); this.total.set(result.total); this.loading.set(false);
        },
        error: (e) => this.fail(e, 'We could not load applications. Please retry.'),
      });
      return;
    }
    if (this.backendOwnerMode()) {
      this.apiMarketplace.listLoads({ mine: true, per_page: 100 }).subscribe({
        next: (loads) => {
          if (!loads.length) { this.backendRows.set([]); this.loading.set(false); return; }
          forkJoin(loads.map((load) => this.apiMarketplace.listApplications(load.uuid).pipe(
            map((applications) => applications.map((application) => ({ app: this.mapApplication(application), load: this.mapLoad(load) }))),
          ))).subscribe({ next: (rows) => { this.backendRows.set(rows.flat()); this.loading.set(false); },
            error: (e) => this.fail(e, 'We could not load applications. Please retry.') });
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

  private formatApplication(application: LoadApplication): LoadApplication {
    return { ...application, appliedAgo: formatDateTime(application.appliedAgo) };
  }

  private formatLoad(load: Load | undefined): Load | undefined {
    return load ? { ...load, pickupDate: formatDate(load.pickupDate), postedAgo: formatDateTime(load.postedAgo) } : undefined;
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
      postedBy: this.session.role(), postedByName: load.posted_by_name ?? 'Shipper',
      pickupCity: load.pickup_city, dropCity: load.drop_city, material: load.material ?? 'General Cargo',
      weightTons: load.weight_tons ?? 0, vehicleType: (load.vehicle_type ?? 'Open Body Truck') as VehicleType,
      pickupDate: formatDate(load.pickup_date), budget: formatCurrencyAmount(load.budget), status,
      applicationsCount: load.applications_count ?? 0,
      postedAgo: load.created_at ? formatDateTime(load.created_at) : 'Recently posted',
    };
  }
}
