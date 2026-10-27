import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { Vehicle, VehicleCategory, VehicleLiveStatus } from '../../../core/models/fleet.model';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceService, ApiMarketplaceVehicle } from '../../../core/api/api-marketplace.service';
import { apiErrorMessage, apiFieldErrors } from '../../../core/api/api-error';

const VEHICLE_TYPES: VehicleCategory[] = ['Open Body Truck', '20ft Container', '32ft Trailer', 'Mini Truck', 'Tanker', 'Trailer (Flatbed)'];

const STATUS_CLASS: Record<VehicleLiveStatus, string> = {
  Reserved: 'status-pending',
  'On Trip': 'status-transit',
  Idle: 'status-pending',
  Maintenance: 'status-overdue',
  Offline: 'status-cancelled',
};

/** Vehicles — list of vehicles owned by the current portal role, with Add Vehicle. */
@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-list.component.html',
})
export class VehicleListComponent {
  private readonly fleet = inject(FleetMockService);
  private readonly apiMarketplace = inject(ApiMarketplaceService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly vehicleTypes = VEHICLE_TYPES;
  protected readonly statusClass = STATUS_CLASS;

  /** Transporter/Company share a single "Fleet & Drivers" nav item, so this page shows in-page tabs; Truck Owner has separate nav items already. */
  protected readonly showFleetTabs = computed(() => this.session.role() === 'transporter' || this.session.role() === 'company');

  protected readonly search = signal('');
  protected readonly statusFilter = signal('');
  private readonly backendVehicles = signal<ApiMarketplaceVehicle[]>([]);
  protected readonly vehicleError = signal('');

  private readonly myVehicles = computed<Vehicle[]>(() => API_CONFIG.useBackend
    ? this.backendVehicles().map((vehicle) => this.mapBackendVehicle(vehicle))
    : this.fleet.getVehiclesByOwner(this.session.role())());

  constructor() {
    this.reloadBackendVehicles();
  }

  private reloadBackendVehicles(): void {
    if (!API_CONFIG.useBackend) return;
    this.apiMarketplace.listMarketplaceVehicles().subscribe({
      next: (vehicles) => {
        this.backendVehicles.set(vehicles);
        this.vehicleError.set('');
      },
      error: (error) => this.vehicleError.set(apiErrorMessage(error, 'Your registered vehicles could not be loaded.')),
    });
  }

  protected readonly filteredVehicles = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.myVehicles().filter((v) => {
      const matchesTerm = !term || v.regNumber.toLowerCase().includes(term) || v.make.toLowerCase().includes(term) || v.model.toLowerCase().includes(term);
      const matchesStatus = !status || v.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  // Add Vehicle modal state
  protected readonly showAddModal = signal(false);
  protected readonly regNumber = signal('');
  protected readonly vehicleType = signal<VehicleCategory>('Open Body Truck');
  protected readonly make = signal('');
  protected readonly model = signal('');
  protected readonly yearOfMake = signal('');
  protected readonly capacityTons = signal<number | null>(null);
  protected readonly driver = signal('');
  protected readonly saving = signal(false);
  protected readonly registrationError = signal('');
  protected readonly addError = signal('');

  protected openAdd(): void {
    this.registrationError.set('');
    this.addError.set('');
    this.showAddModal.set(true);
  }

  protected closeAdd(): void {
    this.registrationError.set('');
    this.addError.set('');
    this.showAddModal.set(false);
    this.regNumber.set('');
    this.make.set('');
    this.model.set('');
    this.yearOfMake.set('');
    this.capacityTons.set(null);
    this.driver.set('');
  }

  protected submitAdd(): void {
    const capacity = this.capacityTons();
    const year = Number(this.yearOfMake());
    if (capacity === null || !Number.isFinite(capacity) || capacity <= 0 || !Number.isInteger(capacity * 10)) return;
    if (this.yearOfMake() && (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear())) return;
    if (!this.regNumber() || !this.make() || !this.model()) return;
    this.registrationError.set('');
    this.addError.set('');
    this.saving.set(true);
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.createMarketplaceVehicle({
        registration_number: this.regNumber().trim().toUpperCase(),
        vehicle_type: this.vehicleType(),
        make: this.make().trim(),
        model: this.model().trim(),
        year_of_make: this.yearOfMake() ? year : undefined,
        capacity_tons: capacity,
      }).subscribe({
        next: (vehicle) => {
          this.backendVehicles.update((vehicles) => [vehicle, ...vehicles]);
          this.saving.set(false);
          this.closeAdd();
        },
        error: (error) => {
          this.saving.set(false);
          const fieldErrors = apiFieldErrors(error);
          if (fieldErrors['registration_number']) this.registrationError.set(fieldErrors['registration_number']);
          else this.addError.set(apiErrorMessage(error, 'Vehicle could not be registered. Please review the details and try again.'));
        },
      });
      return;
    }
    setTimeout(() => {
      const vehicle = this.fleet.addVehicle({
        ownerRole: this.session.role(),
        regNumber: this.regNumber().toUpperCase(),
        vehicleType: this.vehicleType(),
        make: this.make(),
        model: this.model(),
        yearOfMake: this.yearOfMake() || '—',
        capacityTons: this.capacityTons() ?? 0,
        driver: this.driver() || undefined,
      });
      this.saving.set(false);
      this.closeAdd();
      this.viewVehicle(vehicle.id);
    }, 500);
  }

  protected viewVehicle(id: string): void {
    const path = this.session.role() === 'truck-owner' ? 'vehicles' : 'fleet';
    this.router.navigate([this.session.portal().basePath, path, id]);
  }

  private mapBackendVehicle(vehicle: ApiMarketplaceVehicle): Vehicle {
    const statusByApi: Record<ApiMarketplaceVehicle['status'], VehicleLiveStatus> = {
      available: 'Idle', on_trip: 'On Trip', maintenance: 'Maintenance', inactive: 'Offline',
    };
    return {
      id: vehicle.uuid,
      regNumber: vehicle.registration_number,
      vehicleType: vehicle.vehicle_type as VehicleCategory,
      ownerRole: this.session.role(),
      make: vehicle.make,
      model: vehicle.model,
      yearOfMake: vehicle.year_of_make?.toString() ?? '—',
      capacityTons: Number(vehicle.capacity_tons),
      status: vehicle.is_busy ? (vehicle.availability_status === 'on_trip' ? 'On Trip' : 'Reserved') : statusByApi[vehicle.status],
      location: 'Not tracked yet',
      addedOn: vehicle.created_at ?? 'Recently',
      documents: [],
      maintenance: [],
      fuelLogs: [],
    };
  }
}
