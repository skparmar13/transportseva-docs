import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

interface AdminCompany { name: string; type: string; users: number; plan: string; status: 'Active' | 'Review' | 'Suspended'; joined: string; }

@Component({
  selector: 'app-company-management',
  standalone: true, imports: [FormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './company-management.component.html',
})
export class CompanyManagementComponent {
  protected readonly companies = signal<AdminCompany[]>([
    { name: 'Mehta Industries', type: 'Shipper', users: 18, plan: 'Growth', status: 'Active', joined: '12 Aug 2026' },
    { name: 'Verma Logistics', type: 'Transporter', users: 24, plan: 'Professional', status: 'Active', joined: '10 Aug 2026' },
    { name: 'Sanjay Yadav Transport', type: 'Truck Owner', users: 4, plan: 'Starter', status: 'Review', joined: '8 Aug 2026' },
    { name: 'Bansal Steel Traders', type: 'Shipper', users: 11, plan: 'Growth', status: 'Active', joined: '4 Aug 2026' },
    { name: 'Om Logistics Pvt Ltd', type: 'Transporter', users: 31, plan: 'Professional', status: 'Suspended', joined: '29 Jul 2026' },
  ]);
  protected readonly filter = signal<'All' | AdminCompany['status']>('All');
  protected readonly filteredCompanies = computed(() => this.filter() === 'All' ? this.companies() : this.companies().filter((company) => company.status === this.filter()));
  protected readonly activeCount = computed(() => this.companies().filter((company) => company.status === 'Active').length);
  protected readonly reviewCount = computed(() => this.companies().filter((company) => company.status === 'Review').length);
  protected readonly userCount = computed(() => this.companies().reduce((total, company) => total + company.users, 0));
  protected readonly editing = signal<AdminCompany | null>(null);
  protected readonly form = signal({ name: '', type: 'Shipper', plan: 'Starter' });

  protected openCreate(): void { this.form.set({ name: '', type: 'Shipper', plan: 'Starter' }); this.editing.set({ name: '', type: 'Shipper', users: 0, plan: 'Starter', status: 'Active', joined: 'Just now' }); }
  protected openEdit(company: AdminCompany): void { this.form.set({ name: company.name, type: company.type, plan: company.plan }); this.editing.set(company); }
  protected updateName(name: string): void { this.form.update((value) => ({ ...value, name })); }
  protected updateType(type: string): void { this.form.update((value) => ({ ...value, type })); }
  protected updatePlan(plan: string): void { this.form.update((value) => ({ ...value, plan })); }
  protected save(): void {
    const current = this.editing(); const data = this.form(); if (!current || !data.name.trim()) return;
    this.companies.update((items) => current.name && items.some((item) => item.name === current.name)
      ? items.map((item) => item.name === current.name ? { ...item, name: data.name.trim(), type: data.type, plan: data.plan } : item)
      : [{ name: data.name.trim(), type: data.type, users: 0, plan: data.plan, status: 'Active', joined: 'Just now' }, ...items]);
    this.editing.set(null);
  }
  protected toggleStatus(company: AdminCompany): void { this.companies.update((items) => items.map((item) => item.name === company.name ? { ...item, status: item.status === 'Suspended' ? 'Active' : 'Suspended' } : item)); }
  protected remove(company: AdminCompany): void { this.companies.update((items) => items.filter((item) => item.name !== company.name)); }
}
