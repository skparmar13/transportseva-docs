import { Injectable, computed, signal } from '@angular/core';
import { PortalRole } from '../models/nav.model';
import { PORTAL_CONFIGS } from '../data/nav-config';
import type { MockPlatformStaff } from './auth-mock.service';
import { StaffAccess, staffRouteAllowed } from '../models/staff-access.model';

interface BackendSessionUser { full_name?: string; email?: string; phone?: string; role?: string; roles?: string[]; staff_access?: StaffAccess | null; profile_completion_required?: boolean; email_verification_required?: boolean; portal_access_ready?: boolean; }

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
  private readonly activeBackendUser = signal<BackendSessionUser | null>(null);

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
  readonly onboardingRequired = computed(() => {
    const user = this.activeBackendUser();
    return !!user && (user.profile_completion_required === true || user.email_verification_required === true || user.portal_access_ready === false);
  });
  readonly platformStaff = computed(() => this.activePlatformStaff());
  readonly user = computed<MockUser>(() => {
    const staff = this.activePlatformStaff();
    if (this.activeRole() === 'admin' && staff) {
      const initials = staff.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
      return { name: staff.name, role: 'admin', roleTag: staff.role, avatarInitials: initials };
    }
    const backend = this.activeBackendUser();
    if (backend) {
      const roleTag = this.activeRole() === 'admin' ? backend.staff_access?.role_name ?? 'Administrator' : this.roleLabel(this.activeRole());
      const name = backend.full_name?.trim() || roleTag;
      return { name, role: this.activeRole(), roleTag, avatarInitials: name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() };
    }
    return MOCK_USERS[this.activeRole()];
  });
  readonly portal = computed(() => {
    const portal = PORTAL_CONFIGS[this.activeRole()];
    const backend = this.activeBackendUser();
    if (this.onboardingRequired() && this.activeRole() !== 'admin') return { ...portal, nav: [{ title: 'Account', items: [{ label: 'Profile', labelKey: 'nav.profile', icon: 'i-user', path: 'profile' }] }] };
    if (this.activeRole() !== 'admin' || !backend) return portal;
    return { ...portal, roleTag: 'Platform Staff Portal', roleTagKey: 'nav.roleTag.platformStaff',
      nav: portal.nav.map((section) => ({ ...section, items: section.items.filter((item) => staffRouteAllowed(backend.staff_access, item.path)) }))
        .filter((section) => section.items.length > 0),
    };
  });

  setRole(role: PortalRole): void {
    this.activeRole.set(role);
    if (role !== 'admin') this.activePlatformStaff.set(null);
  }

  setBackendUser(user: BackendSessionUser): void { this.activeBackendUser.set(user); }
  clearBackendUser(): void { this.activeBackendUser.set(null); }

  canStaffAction(permission: string): boolean {
    const access = this.activeBackendUser()?.staff_access;
    return !access?.enforced || (access.ready && access.permissions.includes(permission));
  }

  setPlatformStaff(staff: MockPlatformStaff): void {
    this.activePlatformStaff.set(staff);
    this.activeRole.set('admin');
  }

  clearPlatformStaff(): void {
    this.activePlatformStaff.set(null);
  }

  private roleLabel(role: PortalRole): string {
    return role === 'truck-owner' ? 'Truck Owner'
      : role === 'admin' ? 'Administrator'
        : role.charAt(0).toUpperCase() + role.slice(1);
  }
}
