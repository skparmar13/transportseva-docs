import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface AdminDriver { name: string; phone: string; transporter: string; trips: number; documents: 'Verified' | 'Review'; status: 'Active' | 'Off Duty' | 'Suspended'; }

@Component({ selector: 'app-driver-management', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './driver-management.component.html' })
export class DriverManagementComponent {
  protected readonly drivers = signal<AdminDriver[]>([
    { name: 'Ramesh Kumar', phone: '+91 98765 43210', transporter: 'Verma Logistics', trips: 26, documents: 'Verified', status: 'Active' },
    { name: 'Mahesh Patel', phone: '+91 98250 11223', transporter: 'Patel Transport', trips: 18, documents: 'Verified', status: 'Active' },
    { name: 'Karan Singh', phone: '+91 99100 88221', transporter: 'Jaipur Freight Network', trips: 0, documents: 'Review', status: 'Off Duty' },
    { name: 'Vijay Sharma', phone: '+91 98990 77441', transporter: 'Om Logistics Pvt Ltd', trips: 11, documents: 'Review', status: 'Suspended' },
  ]);
  protected readonly filter = signal<'All' | AdminDriver['status']>('All');
  protected readonly filtered = computed(() => this.filter() === 'All' ? this.drivers() : this.drivers().filter((driver) => driver.status === this.filter()));
  protected readonly active = computed(() => this.drivers().filter((driver) => driver.status === 'Active').length);
  protected readonly review = computed(() => this.drivers().filter((driver) => driver.documents === 'Review').length);
  protected toggle(driver: AdminDriver): void { this.drivers.update((items) => items.map((item) => item.name === driver.name ? { ...item, status: item.status === 'Suspended' ? 'Active' : 'Suspended' } : item)); }
  protected remove(driver: AdminDriver): void { this.drivers.update((items) => items.filter((item) => item.name !== driver.name)); }
}
