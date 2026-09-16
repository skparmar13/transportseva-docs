import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/i18n';

interface AdminUser { name: string; email: string; role: string; company: string; scope: 'Platform Staff' | 'Workspace User'; status: 'Active' | 'Invited' | 'Suspended'; lastSeen: string; }

@Component({ selector: 'app-user-management', standalone: true, imports: [FormsModule, ModalComponent, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './user-management.component.html' })
export class UserManagementComponent {
  protected readonly users = signal<AdminUser[]>([
    { name: 'Priya Nair', email: 'priya.nair@transportseva.in', role: 'Operations Manager', company: 'TransportSeva', scope: 'Platform Staff', status: 'Active', lastSeen: 'Today, 11:20 AM' },
    { name: 'Arjun Rao', email: 'arjun.rao@transportseva.in', role: 'KYC Officer', company: 'TransportSeva', scope: 'Platform Staff', status: 'Active', lastSeen: 'Today, 10:55 AM' },
    { name: 'Anita Mehta', email: 'anita@mehtaindustries.in', role: 'Company Admin', company: 'Mehta Industries', scope: 'Workspace User', status: 'Active', lastSeen: 'Today, 10:42 AM' },
    { name: 'Ravi Verma', email: 'ravi@vermalogistics.in', role: 'Transporter Admin', company: 'Verma Logistics', scope: 'Workspace User', status: 'Active', lastSeen: 'Today, 9:18 AM' },
    { name: 'Sanjay Yadav', email: 'sanjay@yadavtransport.in', role: 'Truck Owner', company: 'Sanjay Yadav Transport', scope: 'Workspace User', status: 'Invited', lastSeen: 'Not yet' },
    { name: 'Mahesh Patel', email: 'mahesh@pateltransport.in', role: 'Driver', company: 'Patel Transport', scope: 'Workspace User', status: 'Active', lastSeen: 'Yesterday' },
    { name: 'Om Sharma', email: 'om@omlogistics.in', role: 'Company Admin', company: 'Om Logistics Pvt Ltd', scope: 'Workspace User', status: 'Suspended', lastSeen: '29 Jul 2026' },
  ]);
  protected readonly filter = signal<'All' | AdminUser['status']>('All');
  protected readonly scope = signal<'Platform Staff' | 'Workspace Users'>('Platform Staff');
  protected readonly scopedUsers = computed(() => this.users().filter((user) => user.scope === (this.scope() === 'Platform Staff' ? 'Platform Staff' : 'Workspace User')));
  protected readonly filteredUsers = computed(() => this.filter() === 'All' ? this.scopedUsers() : this.scopedUsers().filter((user) => user.status === this.filter()));
  protected readonly activeCount = computed(() => this.scopedUsers().filter((user) => user.status === 'Active').length);
  protected readonly invitedCount = computed(() => this.scopedUsers().filter((user) => user.status === 'Invited').length);
  protected readonly editing = signal<AdminUser | null>(null);
  protected readonly form = signal({ name: '', email: '', role: 'Company Admin', company: '' });
  protected openCreate(): void { this.form.set({ name: '', email: '', role: 'Operations Staff', company: 'TransportSeva' }); this.editing.set({ name: '', email: '', role: 'Operations Staff', company: 'TransportSeva', scope: 'Platform Staff', status: 'Invited', lastSeen: 'Not yet' }); }
  protected openEdit(user: AdminUser): void { this.form.set({ name: user.name, email: user.email, role: user.role, company: user.company }); this.editing.set(user); }
  protected update(field: 'name' | 'email' | 'role' | 'company', value: string): void { this.form.update((current) => ({ ...current, [field]: value })); }
  protected save(): void { const current = this.editing(); const data = this.form(); if (!current || !data.name.trim() || !data.email.trim()) return; this.users.update((items) => current.email && items.some((item) => item.email === current.email) ? items.map((item) => item.email === current.email ? { ...item, ...data, name: data.name.trim(), email: data.email.trim() } : item) : [{ ...data, name: data.name.trim(), email: data.email.trim(), scope: 'Platform Staff', status: 'Invited', lastSeen: 'Not yet' }, ...items]); this.editing.set(null); }
  protected toggleStatus(user: AdminUser): void { this.users.update((items) => items.map((item) => item.email === user.email ? { ...item, status: item.status === 'Suspended' ? 'Active' : 'Suspended' } : item)); }
  protected remove(user: AdminUser): void { this.users.update((items) => items.filter((item) => item.email !== user.email)); }
}
