import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n';

interface Transporter { name: string; owner: string; vehicles: number; activeTrips: number; status: 'Active' | 'Pending Review' | 'Suspended'; }

@Component({ selector: 'app-transporter-management', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './transporter-management.component.html' })
export class TransporterManagementComponent {
  protected readonly transporters = signal<Transporter[]>([
    { name: 'Verma Logistics', owner: 'Ravi Verma', vehicles: 42, activeTrips: 8, status: 'Active' },
    { name: 'Patel Transport', owner: 'Mahesh Patel', vehicles: 18, activeTrips: 3, status: 'Active' },
    { name: 'Jaipur Freight Network', owner: 'Karan Singh', vehicles: 7, activeTrips: 0, status: 'Pending Review' },
    { name: 'Om Logistics Pvt Ltd', owner: 'Om Sharma', vehicles: 31, activeTrips: 0, status: 'Suspended' },
  ]);
  protected readonly filter = signal<'All' | Transporter['status']>('All');
  protected readonly filtered = computed(() => this.filter() === 'All' ? this.transporters() : this.transporters().filter((transporter) => transporter.status === this.filter()));
  protected readonly pending = computed(() => this.transporters().filter((transporter) => transporter.status === 'Pending Review').length);
  protected readonly fleet = computed(() => this.transporters().reduce((total, transporter) => total + transporter.vehicles, 0));
  protected approve(item: Transporter): void { this.transporters.update((items) => items.map((value) => value.name === item.name ? { ...value, status: 'Active' } : value)); }
  protected toggleSuspend(item: Transporter): void { this.transporters.update((items) => items.map((value) => value.name === item.name ? { ...value, status: value.status === 'Suspended' ? 'Active' : 'Suspended' } : value)); }
  protected remove(item: Transporter): void { this.transporters.update((items) => items.filter((value) => value.name !== item.name)); }
}
