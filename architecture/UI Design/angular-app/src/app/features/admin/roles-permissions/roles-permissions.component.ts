import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n';

interface AdminRole { name: string; members: number; permissions: string[]; }

@Component({ selector: 'app-roles-permissions', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './roles-permissions.component.html' })
export class RolesPermissionsComponent {
  protected readonly roles = signal<AdminRole[]>([
    { name: 'Company Admin', members: 12, permissions: ['Manage users', 'Manage bookings', 'View payments', 'Manage vehicles'] },
    { name: 'Transporter Admin', members: 8, permissions: ['Manage bookings', 'View payments', 'Manage vehicles'] },
    { name: 'Dispatcher', members: 16, permissions: ['Manage bookings', 'View tracking'] },
    { name: 'Driver', members: 42, permissions: ['View assigned trips', 'Update trip status'] },
  ]);
  protected readonly allPermissions = ['Manage users', 'Manage bookings', 'View payments', 'Manage vehicles', 'View tracking', 'View assigned trips', 'Update trip status'];
  protected readonly saved = signal(false);
  protected toggle(role: AdminRole, permission: string): void { this.roles.update((items) => items.map((item) => item.name === role.name ? { ...item, permissions: item.permissions.includes(permission) ? item.permissions.filter((value) => value !== permission) : [...item.permissions, permission] } : item)); this.saved.set(false); }
  protected save(): void { this.saved.set(true); }
}
