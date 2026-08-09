import { Injectable, computed, signal } from '@angular/core';
import { PortalRole } from '../models/nav.model';
import { PORTAL_CONFIGS } from '../data/nav-config';

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

  readonly role = computed(() => this.activeRole());
  readonly user = computed<MockUser>(() => MOCK_USERS[this.activeRole()]);
  readonly portal = computed(() => PORTAL_CONFIGS[this.activeRole()]);

  setRole(role: PortalRole): void {
    this.activeRole.set(role);
  }
}
