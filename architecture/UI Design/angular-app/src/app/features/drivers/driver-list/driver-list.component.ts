import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { DriverMockService } from '../../../core/services/driver-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { DriverStatus } from '../../../core/models/driver.model';
import { TranslatePipe } from '../../../core/i18n';

const STATUS_CLASS: Record<DriverStatus, string> = {
  'On Trip': 'status-transit',
  Available: 'status-delivered',
  'Off Duty': 'status-pending',
  Suspended: 'status-cancelled',
};

/** Driver Directory — list of drivers employed by the current portal role, with Add Driver. */
@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './driver-list.component.html',
})
export class DriverListComponent {
  private readonly driverSvc = inject(DriverMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly statusClass = STATUS_CLASS;

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  /** Transporter/Company share a single "Fleet & Drivers" nav item, so this page shows in-page tabs; Truck Owner has separate nav items already. */
  protected readonly showFleetTabs = computed(() => this.session.role() === 'transporter' || this.session.role() === 'company');
  protected readonly vehiclesPath = computed(() => (this.session.role() === 'truck-owner' ? 'vehicles' : 'fleet'));

  protected readonly search = signal('');
  protected readonly statusFilter = signal('');

  private readonly myDrivers = computed(() => this.driverSvc.getDriversByEmployer(this.session.role())());

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
    if (!this.name() || !this.phone() || !this.licenseNumber()) return;
    this.saving.set(true);
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
