import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { VehicleCategory, VehicleLiveStatus } from '../../../core/models/fleet.model';

const VEHICLE_TYPES: VehicleCategory[] = ['Open Body Truck', '20ft Container', '32ft Trailer', 'Mini Truck', 'Tanker', 'Trailer (Flatbed)'];

const STATUS_CLASS: Record<VehicleLiveStatus, string> = {
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
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly vehicleTypes = VEHICLE_TYPES;
  protected readonly statusClass = STATUS_CLASS;

  /** Transporter/Company share a single "Fleet & Drivers" nav item, so this page shows in-page tabs; Truck Owner has separate nav items already. */
  protected readonly showFleetTabs = computed(() => this.session.role() === 'transporter' || this.session.role() === 'company');

  protected readonly search = signal('');
  protected readonly statusFilter = signal('');

  private readonly myVehicles = computed(() => this.fleet.getVehiclesByOwner(this.session.role())());

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

  protected openAdd(): void {
    this.showAddModal.set(true);
  }

  protected closeAdd(): void {
    this.showAddModal.set(false);
    this.regNumber.set('');
    this.make.set('');
    this.model.set('');
    this.yearOfMake.set('');
    this.capacityTons.set(null);
    this.driver.set('');
  }

  protected submitAdd(): void {
    if (!this.regNumber() || !this.make() || !this.model()) return;
    this.saving.set(true);
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
}
