import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { DriverMockService } from '../../../core/services/driver-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { Driver, DriverStatus } from '../../../core/models/driver.model';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceDriver, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { TranslatePipe } from '../../../core/i18n';
import { LocationPickerComponent } from '../../../shared/components/location-picker/location-picker.component';

const STATUS_CLASS: Record<DriverStatus, string> = {
  'On Trip': 'status-transit',
  Available: 'status-delivered',
  Assigned: 'status-transit',
  'Off Duty': 'status-pending',
  Suspended: 'status-cancelled',
};

/** Driver Directory — list of drivers employed by the current portal role, with Add Driver. */
@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, RouterLink, TranslatePipe, LocationPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './driver-list.component.html',
})
export class DriverListComponent {
  private readonly driverSvc = inject(DriverMockService);
  private readonly marketplaceApi = inject(ApiMarketplaceService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly statusClass = STATUS_CLASS;
  protected readonly backendEnabled = API_CONFIG.useBackend;
  protected readonly loadingDrivers = signal(API_CONFIG.useBackend);
  protected readonly driverLoadError = signal('');
  protected readonly driverSaveError = signal('');
  private readonly backendDrivers = signal<Driver[]>([]);

  constructor() { this.reloadDrivers(); }

  protected reloadDrivers(): void {
    if (!this.backendEnabled) return;
    this.loadingDrivers.set(true);
    this.driverLoadError.set('');
    this.marketplaceApi.listMarketplaceDrivers().subscribe({
      next: (drivers) => { this.backendDrivers.set(drivers.map((driver) => this.mapDriver(driver))); this.loadingDrivers.set(false); },
      error: (error) => { this.loadingDrivers.set(false); this.driverLoadError.set(apiErrorMessage(error, 'Drivers could not be loaded. Please retry.')); },
    });
  }

  private mapDriver(driver: ApiMarketplaceDriver): Driver {
    return {
      id: driver.uuid, name: driver.name, phone: driver.phone, employerRole: this.session.role(),
      licenseNumber: driver.license_number, licenseExpiry: driver.license_expiry ?? '—',
      experienceYears: driver.experience_years, address: driver.address ?? '—',
      status: driver.status !== 'available' ? 'Off Duty' : driver.is_busy ? 'Assigned' : 'Available',
      assignedVehicleRegNumber: driver.assigned_vehicle_reg_number || undefined,
      rating: 0, totalTrips: 0, joinedOn: '', documents: [], timeline: [],
    };
  }

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  /** Transporter/Company share a single "Fleet & Drivers" nav item, so this page shows in-page tabs; Truck Owner has separate nav items already. */
  protected readonly showFleetTabs = computed(() => this.session.role() === 'transporter' || this.session.role() === 'company');
  protected readonly vehiclesPath = computed(() => (this.session.role() === 'truck-owner' ? 'vehicles' : 'fleet'));

  protected readonly search = signal('');
  protected readonly statusFilter = signal('');

  private readonly myDrivers = computed(() => this.backendEnabled ? this.backendDrivers() : this.driverSvc.getDriversByEmployer(this.session.role())());

  protected readonly filteredDrivers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.myDrivers().filter((d) => {
      const matchesTerm = !term || d.name.toLowerCase().includes(term) || d.phone.includes(term) || (d.assignedVehicleRegNumber ?? '').toLowerCase().includes(term);
      const matchesStatus = !status || d.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  // Add Driver modal state
  protected readonly showAddModal = signal(false);
  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly licenseNumber = signal('');
  protected readonly licenseExpiry = signal('');
  protected readonly experienceYears = signal<number | null>(null);
  protected readonly address = signal('');
  protected readonly saving = signal(false);

  protected openAdd(): void {
    this.driverSaveError.set('');
    this.showAddModal.set(true);
  }

  protected closeAdd(): void {
    this.showAddModal.set(false);
    this.name.set('');
    this.phone.set('');
    this.licenseNumber.set('');
    this.licenseExpiry.set('');
    this.experienceYears.set(null);
    this.address.set('');
  }

  protected submitAdd(): void {
    const experience = this.experienceYears();
    if (!/^[6-9]\d{9}$/.test(this.phone().trim())) return;
    if (experience !== null && (!Number.isInteger(experience) || experience < 0 || experience > 60)) return;
    if (!this.name() || !this.phone() || !this.licenseNumber()) return;
    this.saving.set(true);
    this.driverSaveError.set('');
    if (this.backendEnabled) {
      this.marketplaceApi.createMarketplaceDriver({
        name: this.name().trim(), phone: this.phone().trim(), license_number: this.licenseNumber().trim(),
        license_expiry: this.licenseExpiry() || undefined, experience_years: experience ?? 0, address: this.address().trim() || undefined,
      }).subscribe({
        next: () => { this.saving.set(false); this.closeAdd(); this.reloadDrivers(); },
        error: (error) => { this.saving.set(false); this.driverSaveError.set(apiErrorMessage(error, 'Driver could not be registered. Please retry.')); },
      });
      return;
    }
    setTimeout(() => {
      const driver = this.driverSvc.addDriver({
        employerRole: this.session.role(),
        name: this.name(),
        phone: this.phone(),
        licenseNumber: this.licenseNumber(),
        licenseExpiry: this.licenseExpiry() || '—',
        experienceYears: this.experienceYears() ?? 0,
        address: this.address() || '—',
      });
      this.saving.set(false);
      this.closeAdd();
      this.viewDriver(driver.id);
    }, 500);
  }

  protected viewDriver(id: string): void {
    const segments = this.session.role() === 'truck-owner' ? ['drivers'] : ['fleet', 'drivers'];
    this.router.navigate([this.session.portal().basePath, ...segments, id]);
  }
}
