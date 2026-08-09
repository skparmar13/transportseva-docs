import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { GpsMockService } from '../../../core/services/gps-mock.service';
import { LiveVehicle } from '../../../core/models/gps.model';

type DrawerTab = 'replay' | 'geofence';

const STATUS_DOT_CLASS: Record<LiveVehicle['status'], string> = {
  'On Trip': 'status-transit',
  Idle: 'status-pending',
  Maintenance: 'status-overdue',
  Offline: 'status-cancelled',
};

/**
 * Live Tracking — Module 6. Map placeholder plotting every vehicle
 * with an installed AIS-140 device, a vehicle list, and a right-side
 * drawer with Trip Replay + Geofence tabs for the selected vehicle.
 * Also surfaces the shared Alerts feed with acknowledge actions.
 */
@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-tracking.component.html',
})
export class LiveTrackingComponent {
  protected readonly gps = inject(GpsMockService);
  protected readonly statusDotClass = STATUS_DOT_CLASS;

  protected readonly liveVehicles = this.gps.liveVehicles;
  protected readonly selectedReg = signal<string | null>(null);

  protected readonly selectedVehicle = computed(() => this.liveVehicles().find((v) => v.regNumber === this.selectedReg()));
  protected readonly tripReplay = computed(() => (this.selectedReg() ? this.gps.getTripReplay(this.selectedReg()!)() : []));
  protected readonly vehicleGeofences = computed(() => {
    const reg = this.selectedReg();
    if (!reg) return [];
    return this.gps.geofences().filter((z) => z.assignedVehicles.includes(reg));
  });

  protected readonly drawerTab = signal<DrawerTab>('replay');

  protected selectVehicle(regNumber: string): void {
    this.selectedReg.set(regNumber);
    this.drawerTab.set('replay');
  }

  protected closeDrawer(): void {
    this.selectedReg.set(null);
  }

  protected setDrawerTab(tab: DrawerTab): void {
    this.drawerTab.set(tab);
  }

  // Alerts panel
  protected readonly showAlerts = signal(false);
  protected readonly alerts = this.gps.alerts;
  protected readonly unacknowledgedCount = this.gps.unacknowledgedAlertCount;

  protected toggleAlerts(): void {
    this.showAlerts.update((v) => !v);
  }

  protected acknowledge(id: string): void {
    this.gps.acknowledgeAlert(id);
  }

  protected acknowledgeAll(): void {
    this.gps.acknowledgeAllAlerts();
  }

  // Add Geofence modal
  protected readonly showAddGeofence = signal(false);
  protected readonly geofenceName = signal('');
  protected readonly geofenceCenter = signal('');
  protected readonly geofenceRadius = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected openAddGeofence(): void {
    this.showAddGeofence.set(true);
  }

  protected closeAddGeofence(): void {
    this.showAddGeofence.set(false);
    this.geofenceName.set('');
    this.geofenceCenter.set('');
    this.geofenceRadius.set(null);
  }

  protected submitGeofence(): void {
    const reg = this.selectedReg();
    if (!reg || !this.geofenceName() || !this.geofenceCenter()) return;
    this.saving.set(true);
    setTimeout(() => {
      this.gps.addGeofence({
        name: this.geofenceName(),
        type: 'Circle',
        centerLabel: this.geofenceCenter(),
        radiusKm: this.geofenceRadius() ?? undefined,
        assignedVehicles: [reg],
      });
      this.saving.set(false);
      this.closeAddGeofence();
    }, 400);
  }
}
