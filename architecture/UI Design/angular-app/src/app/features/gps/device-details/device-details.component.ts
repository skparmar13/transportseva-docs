import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n';
import { GpsMockService } from '../../../core/services/gps-mock.service';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { ConnectivityTestResult, DeviceHealthStatus } from '../../../core/models/gps.model';
import { DeviceStatus } from '../../../core/models/fleet.model';

type TabId = 'overview' | 'health' | 'connectivity' | 'alerts';

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

/**
 * Device Details — Module 6. Tabbed profile for a single AIS-140
 * device: Overview (OEM integration + assignment), Health (battery
 * / signal), Connectivity Test (run test + history), Alerts (device-
 * specific alert feed).
 */
@Component({
  selector: 'app-device-details',
  standalone: true,
  imports: [IconComponent, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './device-details.component.html',
})
export class DeviceDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly gps = inject(GpsMockService);
  private readonly fleet = inject(FleetMockService);
  protected readonly session = inject(SessionService);

  private readonly imei = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly device = this.gps.getDeviceByImei(this.imei);
  protected readonly statusClass = STATUS_CLASS;
  protected readonly statusKey = STATUS_KEY;
  protected readonly healthClass = HEALTH_CLASS;
  protected readonly healthKey = HEALTH_KEY;

  protected readonly assignedVehicle = computed(() => {
    const regNumber = this.device()?.assignedVehicleRegNumber;
    return regNumber ? this.fleet.vehicles().find((v) => v.regNumber === regNumber) : undefined;
  });

  protected readonly deviceAlerts = computed(() => {
    const regNumber = this.device()?.assignedVehicleRegNumber;
    return this.gps.alerts().filter((a) => a.imei === this.imei || (regNumber && a.vehicleRegNumber === regNumber));
  });

  protected readonly activeTab = signal<TabId>('overview');

  protected setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  // Connectivity test
  protected readonly testing = signal(false);
  protected readonly lastResult = signal<ConnectivityTestResult | null>(null);

  protected runTest(): void {
    this.testing.set(true);
    setTimeout(() => {
      const result = this.gps.runConnectivityTest(this.imei);
      this.lastResult.set(result);
      this.testing.set(false);
    }, 700);
  }

  protected acknowledge(id: string): void {
    this.gps.acknowledgeAlert(id);
  }
}
