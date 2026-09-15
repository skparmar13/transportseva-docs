import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/i18n';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { GpsMockService } from '../../../core/services/gps-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { DeviceHealthStatus, OemPartner } from '../../../core/models/gps.model';
import { DeviceStatus } from '../../../core/models/fleet.model';

const STATUS_CLASS: Record<DeviceStatus, string> = {
  Available: 'status-delivered',
  Installed: 'status-transit',
  Faulty: 'status-cancelled',
  Maintenance: 'status-pending',
};

const STATUS_KEY: Record<DeviceStatus, string> = {
  Available: 'status.device.available',
  Installed: 'status.device.installed',
  Faulty: 'status.device.faulty',
  Maintenance: 'status.device.maintenance',
};

const HEALTH_CLASS: Record<DeviceHealthStatus, string> = {
  Healthy: 'status-delivered',
  Warning: 'status-pending',
  Critical: 'status-cancelled',
  Offline: 'status-cancelled',
};

const HEALTH_KEY: Record<DeviceHealthStatus, string> = {
  Healthy: 'status.deviceHealth.healthy',
  Warning: 'status.deviceHealth.warning',
  Critical: 'status.deviceHealth.critical',
  Offline: 'status.deviceHealth.offline',
};

const OEM_OPTIONS: OemPartner[] = ['Teltonika', 'Concox', 'Ruptela', 'ATrack'];

/**
 * Device Inventory — Module 6. Lists every AIS-140 GPS device in the
 * shared pool (owned by FleetMockService) enriched with OEM/health
 * metadata from GpsMockService. Search, status filter, Add Device.
 */
@Component({
  selector: 'app-device-inventory',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './device-inventory.component.html',
})
export class DeviceInventoryComponent {
  private readonly fleet = inject(FleetMockService);
  protected readonly gps = inject(GpsMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly statusClass = STATUS_CLASS;
  protected readonly statusKey = STATUS_KEY;
  protected readonly healthClass = HEALTH_CLASS;
  protected readonly healthKey = HEALTH_KEY;
  protected readonly oemOptions = OEM_OPTIONS;

  protected readonly search = signal('');
  protected readonly statusFilter = signal('');

  protected readonly filteredDevices = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.gps.devices().filter((d) => {
      const matchesTerm = !term || d.imei.includes(term) || (d.assignedVehicleRegNumber ?? '').toLowerCase().includes(term) || (d.health?.oem ?? '').toLowerCase().includes(term);
      const matchesStatus = !status || d.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  protected readonly kpis = computed(() => {
    const devices = this.gps.devices();
    return {
      total: devices.length,
      installed: devices.filter((d) => d.status === 'Installed').length,
      available: devices.filter((d) => d.status === 'Available').length,
      faulty: devices.filter((d) => d.status === 'Faulty' || d.health?.healthStatus === 'Critical' || d.health?.healthStatus === 'Offline').length,
    };
  });

  // Add Device modal
  protected readonly showAddModal = signal(false);
  protected readonly imei = signal('');
  protected readonly oem = signal<OemPartner>('Teltonika');
  protected readonly simNumber = signal('');
  protected readonly saving = signal(false);

  protected openAdd(): void {
    this.showAddModal.set(true);
  }

  protected closeAdd(): void {
    this.showAddModal.set(false);
    this.imei.set('');
    this.simNumber.set('');
  }

  protected submitAdd(): void {
    if (!this.imei() || !this.simNumber()) return;
    this.saving.set(true);
    setTimeout(() => {
      this.gps.addDevice(this.imei().trim(), this.oem(), this.simNumber());
      this.saving.set(false);
      this.closeAdd();
    }, 400);
  }

  protected viewDevice(imei: string): void {
    this.router.navigate([this.session.portal().basePath, 'devices', imei]);
  }
}
