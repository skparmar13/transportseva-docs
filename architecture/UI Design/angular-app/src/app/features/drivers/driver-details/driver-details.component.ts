import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { DriverMockService } from '../../../core/services/driver-mock.service';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { DriverDocStatus, DriverStatus } from '../../../core/models/driver.model';
import { DriverDocument } from '../../../core/models/driver.model';

type TabId = 'profile' | 'documents' | 'assignment' | 'timeline';

const STATUS_CLASS: Record<DriverStatus, string> = {
  'On Trip': 'status-transit',
  Available: 'status-delivered',
  'Off Duty': 'status-pending',
  Suspended: 'status-cancelled',
};

const DOC_STATUS_CLASS: Record<DriverDocStatus, string> = {
  Valid: 'status-delivered',
  'Expiring Soon': 'status-transit',
  Expired: 'status-cancelled',
  'Not Uploaded': 'status-pending',
};

/**
 * Driver Profile — single screen with tabbed sections: Profile,
 * Documents, Vehicle Assignment, Timeline. Reused by Truck Owner
 * ("My Drivers") and Transporter/Company ("Fleet & Drivers").
 */
@Component({
  selector: 'app-driver-details',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './driver-details.component.html',
})
export class DriverDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly driverSvc = inject(DriverMockService);
  private readonly fleet = inject(FleetMockService);
  protected readonly session = inject(SessionService);

  private readonly driverId = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly driver = this.driverSvc.getDriverById(this.driverId);
  protected readonly statusClass = STATUS_CLASS;
  protected readonly docStatusClass = DOC_STATUS_CLASS;

  protected readonly listPath = computed(() =>
    this.session.role() === 'truck-owner'
      ? [this.session.portal().basePath, 'drivers']
      : [this.session.portal().basePath, 'fleet', 'drivers'],
  );

  /** Vehicles owned by the same employer with no driver currently behind the wheel. */
  protected readonly assignableVehicles = computed(() =>
    this.fleet.getVehiclesByOwner(this.session.role())().filter((v) => !v.driver || v.regNumber === this.driver()?.assignedVehicleRegNumber),
  );

  protected readonly activeTab = signal<TabId>('profile');

  protected setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  protected attachDriverDocument(event: Event, type: DriverDocument['type']): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const driver = this.driver();
    if (file && driver) this.driverSvc.attachDocument(driver.name, type, file.name);
    input.value = '';
  }

  // Vehicle assignment
  protected readonly showAssignModal = signal(false);
  protected readonly selectedRegNumber = signal('');

  protected openAssign(): void {
    this.selectedRegNumber.set(this.assignableVehicles()[0]?.regNumber ?? '');
    this.showAssignModal.set(true);
  }

  protected confirmAssign(): void {
    if (!this.selectedRegNumber()) return;
    this.driverSvc.assignVehicle(this.driverId, this.selectedRegNumber());
    this.showAssignModal.set(false);
  }

  protected unassign(): void {
    this.driverSvc.unassignVehicle(this.driverId);
  }
}
