/**
 * TransportSeva — Navigation / Information Architecture models.
 * Shared across every portal shell (Admin, Shipper, Transporter,
 * Truck Owner, Company, Driver) so the sidebar is 100% data-driven
 * instead of hardcoded per role.
 */
export type PortalRole =
  | 'admin'
  | 'shipper'
  | 'transporter'
  | 'truck-owner'
  | 'company'
  | 'driver';

export interface NavItem {
  label: string;
  icon: string;
  /** Route path relative to the portal's root, e.g. 'bookings'. */
  path: string;
  /** Optional badge count (e.g. pending tickets, unread notifications). */
  badge?: number;
}

export interface NavSection {
  /** Optional section title, e.g. "Operations". Omit for top-level items. */
  title?: string;
  items: NavItem[];
}

export interface PortalConfig {
  role: PortalRole;
  roleTag: string;
  basePath: string;
  nav: NavSection[];
}
