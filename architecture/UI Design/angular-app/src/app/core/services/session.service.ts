import { Injectable, computed, signal } from '@angular/core';
import { PortalRole } from '../models/nav.model';
import { PORTAL_CONFIGS } from '../data/nav-config';
import type { MockPlatformStaff } from './auth-mock.service';

export interface MockUser {
  name: string;
  role: PortalRole;
  roleTag: string;
  avatarInitials: string;
  company?: string;
}

const MOCK_USERS: Record<PortalRole, MockUser> = {
  admin: { name: 'Aarav Shah', role: 'admin', roleTag: 'Super Admin', avatarInitials: 'AS' },
  shipper: { name: 'Priya Mehta', role: 'shipper', roleTag: 'Shipper', avatarInitials: 'PM', company: 'Mehta Industries' },
  transporter: { name: 'Rohit Verma', role: 'transporter', roleTag: 'Transporter', avatarInitials: 'RV', company: 'Verma Logistics' },
  'truck-owner': { name: 'Sanjay Yadav', role: 'truck-owner', roleTag: 'Truck Owner', avatarInitials: 'SY' },
  company: { name: 'Neha Kapoor', role: 'company', roleTag: 'Company Admin', avatarInitials: 'NK', company: 'Kapoor Freight Pvt Ltd' },
  driver: { name: 'Suresh Kumar', role: 'driver', roleTag: 'Driver', avatarInitials: 'SK' },
};

/**
 * Mock "session" for the prototype — NO real authentication.
 * Holds the currently active portal role + user so the shared shell
 * can render the right sidebar/topbar without per-portal code.
 * Swap the active role via `setRole()` (e.g. from a role switcher in
 * dev tools, or by route data on app init).
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly activeRole = signal<PortalRole>('admin');
  private readonly activePlatformStaff = signal<MockPlatformStaff | null>(null);
  private readonly activeBackendUser = signal<{ full_name?: string; email?: string; phone?: string; role?: string; roles?: string[] } | null>(null);

  constructor() {
    if (typeof localStorage !== 'undefined') {
      try {
        // A cached API user without its access token is stale. Keeping it here
        // makes the shell look authenticated while every API request is rejected.
        if (!localStorage.getItem('transportseva.access_token')) {
          localStorage.removeItem('transportseva.api_user');
          return;
        }
        const stored = localStorage.getItem('transportseva.api_user');
        if (stored) {
          const user = JSON.parse(stored) as { role?: string; roles?: string[] };
          this.activeBackendUser.set(user);
          const rawRole = (user.role ?? user.roles?.[0] ?? '').toLowerCase().replace(/[_\s]/g, '-');
          const role = rawRole.includes('admin') || rawRole.includes('manager') || rawRole.includes('employee') ? 'admin'
            : rawRole.includes('transporter') ? 'transporter'
              : rawRole.includes('truck') || rawRole.includes('fleet') ? 'truck-owner'
                : rawRole.includes('driver') ? 'driver' : 'shipper';
          this.activeRole.set(role);
        }
      } catch { /* Ignore stale or malformed session data. */ }
    }
  }

  readonly role = computed(() => this.activeRole());
  readonly platformStaff = computed(() => this.activePlatformStaff());
  readonly user = computed<MockUser>(() => {
    const staff = this.activePlatformStaff();
    if (this.activeRole() === 'admin' && staff) {
      const initials = staff.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
      return { name: staff.name, role: 'admin', roleTag: staff.role, avatarInitials: initials };
    }
    const backend = this.activeBackendUser();
    if (backend) {
      const name = backend.full_name || backend.email || 'TransportSeva user';
      return { name, role: this.activeRole(), roleTag: this.activeRole(), avatarInitials: name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() };
    }
    return MOCK_USERS[this.activeRole()];
  });
  readonly portal = computed(() => PORTAL_CONFIGS[this.activeRole()]);

  setRole(role: PortalRole): void {
    this.activeRole.set(role);
    if (role !== 'admin') this.activePlatformStaff.set(null);
  }

  setBackendUser(user: { full_name?: string; email?: string; phone?: string; role?: string; roles?: string[] }): void { this.activeBackendUser.set(user); }
  clearBackendUser(): void { this.activeBackendUser.set(null); }

  setPlatformStaff(staff: MockPlatformStaff): void {
    this.activePlatformStaff.set(staff);
    this.activeRole.set('admin');
  }

  clearPlatformStaff(): void {
    this.activePlatformStaff.set(null);
  }
}
