import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n';

interface Customer { name: string; owner: string; segment: string; plan: string; status: 'Active' | 'Pending Review' | 'Suspended'; joined: string; }

@Component({ selector: 'app-customer-management', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './customer-management.component.html' })
export class CustomerManagementComponent {
  protected readonly customers = signal<Customer[]>([
    { name: 'Mehta Industries', owner: 'Anita Mehta', segment: 'Manufacturing', plan: 'Growth', status: 'Active', joined: '12 Aug 2026' },
    { name: 'Bansal Steel Traders', owner: 'Raj Bansal', segment: 'Steel & Metals', plan: 'Growth', status: 'Active', joined: '4 Aug 2026' },
    { name: 'Shree Balaji Traders', owner: 'Vikram Sharma', segment: 'Agriculture', plan: 'Starter', status: 'Pending Review', joined: 'Today' },
    { name: 'Om Logistics Pvt Ltd', owner: 'Om Sharma', segment: 'Logistics', plan: 'Professional', status: 'Suspended', joined: '29 Jul 2026' },
  ]);
  protected readonly filter = signal<'All' | Customer['status']>('All');
  protected readonly filtered = computed(() => this.filter() === 'All' ? this.customers() : this.customers().filter((customer) => customer.status === this.filter()));
  protected readonly pending = computed(() => this.customers().filter((customer) => customer.status === 'Pending Review').length);
  protected readonly activeCount = computed(() => this.customers().filter((customer) => customer.status === 'Active').length);
  protected approve(customer: Customer): void { this.customers.update((items) => items.map((item) => item.name === customer.name ? { ...item, status: 'Active' } : item)); }
  protected toggleSuspend(customer: Customer): void { this.customers.update((items) => items.map((item) => item.name === customer.name ? { ...item, status: item.status === 'Suspended' ? 'Active' : 'Suspended' } : item)); }
  protected remove(customer: Customer): void { this.customers.update((items) => items.filter((item) => item.name !== customer.name)); }
}
