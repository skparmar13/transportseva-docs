import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/i18n';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { DocumentStatus, VehicleLiveStatus } from '../../../core/models/fleet.model';
import { VehicleDocument } from '../../../core/models/fleet.model';

type TabId = 'overview' | 'device' | 'documents' | 'maintenance' | 'fuel';

const STATUS_CLASS: Record<VehicleLiveStatus, string> = {
  'On Trip': 'status-transit',
  Idle: 'status-pending',
  Maintenance: 'status-overdue',
  Offline: 'status-cancelled',
};

const STATUS_KEY: Record<VehicleLiveStatus, string> = {
  'On Trip': 'status.vehicleLive.onTrip',
  Idle: 'status.vehicleLive.idle',
  Maintenance: 'status.vehicleLive.maintenance',
  Offline: 'status.vehicleLive.offline',
};

const DOC_STATUS_CLASS: Record<DocumentStatus, string> = {
  Valid: 'status-delivered',
  'Expiring Soon': 'status-transit',
  Expired: 'status-cancelled',
  'Not Uploaded': 'status-pending',
};

const DOC_STATUS_KEY: Record<DocumentStatus, string> = {
  Valid: 'status.doc.valid',
  'Expiring Soon': 'status.doc.expiringSoon',
  Expired: 'status.doc.expired',
  'Not Uploaded': 'status.doc.notUploaded',
};

/**
 * Vehicle Details — single screen with tabbed sections: Overview
 * (+ live status), AIS-140 Device Assignment, Documents,
 * Maintenance log, Fuel log. Reused by Truck Owner ("My Vehicles")
 * and Transporter/Company ("Fleet & Drivers").
 */
@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-details.component.html',
})
export class VehicleDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fleet = inject(FleetMockService);
  protected readonly session = inject(SessionService);

  private readonly vehicleId = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly vehicle = this.fleet.getVehicleById(this.vehicleId);
  protected readonly availableDevices = this.fleet.availableDevices;
  protected readonly statusClass = STATUS_CLASS;
  protected readonly statusKey = STATUS_KEY;
  protected readonly docStatusClass = DOC_STATUS_CLASS;
  protected readonly docStatusKey = DOC_STATUS_KEY;

  protected readonly listPath = computed(() => (this.session.role() === 'truck-owner' ? 'vehicles' : 'fleet'));

  protected readonly activeTab = signal<TabId>('overview');

  protected setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  protected attachVehicleDocument(event: Event, type: VehicleDocument['type']): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const vehicle = this.vehicle();
    if (file && vehicle) this.fleet.attachDocument(vehicle.regNumber, type, file.name);
    input.value = '';
  }

  // Device assignment
  protected readonly showAssignModal = signal(false);
  protected readonly selectedImei = signal('');

  protected openAssign(): void {
    this.selectedImei.set(this.availableDevices()[0]?.imei ?? '');
    this.showAssignModal.set(true);
  }

  protected confirmAssign(): void {
    if (!this.selectedImei()) return;
    this.fleet.assignDevice(this.vehicleId, this.selectedImei());
    this.showAssignModal.set(false);
  }

  protected unassign(): void {
    this.fleet.unassignDevice(this.vehicleId);
  }

  // Maintenance
  protected readonly showMaintenanceModal = signal(false);
  protected readonly serviceType = signal('');
  protected readonly serviceDate = signal('');
  protected readonly odometer = signal('');
  protected readonly cost = signal('');
  protected readonly workshop = signal('');
  protected readonly notes = signal('');

  protected openAddMaintenance(): void {
    this.showMaintenanceModal.set(true);
  }

  protected closeMaintenance(): void {
    this.showMaintenanceModal.set(false);
    this.serviceType.set('');
    this.serviceDate.set('');
    this.odometer.set('');
    this.cost.set('');
    this.workshop.set('');
    this.notes.set('');
  }

  protected submitMaintenance(): void {
    if (!this.serviceType() || !this.workshop()) return;
    this.fleet.addMaintenanceRecord(this.vehicleId, {
      serviceType: this.serviceType(),
      date: this.serviceDate() || 'Just now',
      odometer: this.odometer() || '—',
      cost: this.cost() || '—',
      workshop: this.workshop(),
      notes: this.notes() || undefined,
    });
    this.closeMaintenance();
  }

  // Fuel
  protected readonly showFuelModal = signal(false);
  protected readonly fuelDate = signal('');
  protected readonly liters = signal<number | null>(null);
  protected readonly fuelCost = signal('');
  protected readonly fuelOdometer = signal('');
  protected readonly fuelStation = signal('');

  protected openAddFuel(): void {
    this.showFuelModal.set(true);
  }

  protected closeFuel(): void {
    this.showFuelModal.set(false);
    this.fuelDate.set('');
    this.liters.set(null);
    this.fuelCost.set('');
    this.fuelOdometer.set('');
    this.fuelStation.set('');
  }

  protected submitFuel(): void {
    if (!this.liters() || !this.fuelStation()) return;
    this.fleet.addFuelLog(this.vehicleId, {
      date: this.fuelDate() || 'Just now',
      liters: this.liters() ?? 0,
      cost: this.fuelCost() || '—',
      odometer: this.fuelOdometer() || '—',
      fuelStation: this.fuelStation(),
    });
    this.closeFuel();
  }
}
