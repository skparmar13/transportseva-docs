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
  /** Translation dictionary key (e.g. 'nav.dashboard') for the sidebar label. */
  labelKey: string;
  icon: string;
  /** Route path relative to the portal's root, e.g. 'bookings'. */
  path: string;
  /** Optional badge count (e.g. pending tickets, unread notifications). */
  badge?: number;
  /** Marks a navigation destination that is intentionally represented by a roadmap screen. */
  planned?: boolean;
}

export interface NavSection {
  /** Optional section title, e.g. "Operations". Omit for top-level items. */
  title?: string;
  /** Translation dictionary key (e.g. 'nav.operations') for the section title. */
  titleKey?: string;
  items: NavItem[];
}

export interface PortalConfig {
  role: PortalRole;
  roleTag: string;
  /** Translation dictionary key for the roleTag shown in the sidebar. */
  roleTagKey: string;
  basePath: string;
  nav: NavSection[];
}
