import { PortalConfig, PortalRole } from '../models/nav.model';

/**
 * TransportSeva — Information Architecture (single source of truth).
 *
 * Every portal reuses the SAME shell component; only this config
 * differs. Adding a menu item here is the only step needed to add
 * a sidebar link — no shell code changes required.
 */
export const PORTAL_CONFIGS: Record<PortalRole, PortalConfig> = {
  admin: {
    role: 'admin',
    roleTag: 'Super Admin Portal',
    basePath: '/admin',
    nav: [
      { items: [{ label: 'Dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Company Management',
        items: [
          { label: 'Company Management', icon: 'i-building', path: 'companies' },
          { label: 'Subscription Plans', icon: 'i-tag', path: 'subscriptions' },
        ],
      },
      {
        title: 'User Management',
        items: [
          { label: 'User Management', icon: 'i-users', path: 'users' },
          { label: 'Roles & Permissions', icon: 'i-shield', path: 'roles' },
          { label: 'Customer Management', icon: 'i-user', path: 'customers' },
          { label: 'Transporter Management', icon: 'i-building', path: 'transporters' },
          { label: 'Driver Management', icon: 'i-truck', path: 'drivers' },
          { label: 'Vehicle & Fleet Management', icon: 'i-car', path: 'vehicles' },
          { label: 'Device Inventory', icon: 'i-api', path: 'devices' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Load / Booking Management', icon: 'i-box', path: 'bookings' },
          { label: 'Route Management', icon: 'i-route', path: 'routes' },
          { label: 'Trip Management', icon: 'i-truck', path: 'trips' },
          { label: 'Live Tracking', icon: 'i-map', path: 'tracking' },
        ],
      },
      {
        title: 'Finance',
        items: [
          { label: 'Wallet', icon: 'i-wallet', path: 'wallet' },
          { label: 'Payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Invoice & Tax', icon: 'i-invoice', path: 'invoices' },
        ],
      },
      {
        title: 'Support & Content',
        items: [
          { label: 'Notification Management', icon: 'i-bell', path: 'notifications' },
          { label: 'Support Tickets', icon: 'i-ticket', path: 'support' },
          { label: 'Document Verification', icon: 'i-doc', path: 'documents' },
          { label: 'CMS Management', icon: 'i-layers', path: 'cms' },
        ],
      },
      {
        title: 'System',
        items: [
          { label: 'Reports & Analytics', icon: 'i-chart', path: 'reports' },
          { label: 'Audit Logs', icon: 'i-audit', path: 'audit' },
          { label: 'API Management', icon: 'i-api', path: 'api' },
          { label: 'System Settings', icon: 'i-settings', path: 'settings' },
        ],
      },
    ],
  },

  shipper: {
    role: 'shipper',
    roleTag: 'Shipper Portal',
    basePath: '/shipper',
    nav: [
      { items: [{ label: 'Dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Marketplace',
        items: [
          { label: 'Post a Load', icon: 'i-plus', path: 'post-load' },
          { label: 'My Loads', icon: 'i-box', path: 'my-loads' },
          { label: 'Applications Received', icon: 'i-doc', path: 'applications' },
          { label: 'Bookings', icon: 'i-check', path: 'bookings' },
        ],
      },
      {
        title: 'Shipments',
        items: [
          { label: 'Live Tracking', icon: 'i-map', path: 'tracking' },
          { label: 'Trip History', icon: 'i-clock', path: 'trips' },
          { label: 'Reports & Analytics', icon: 'i-chart', path: 'reports' },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Wallet', icon: 'i-wallet', path: 'wallet' },
          { label: 'Payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Documents', icon: 'i-doc', path: 'documents' },
          { label: 'Support Tickets', icon: 'i-headset', path: 'support' },
          { label: 'Notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Business Settings', icon: 'i-settings', path: 'profile' },
        ],
      },
    ],
  },

  transporter: {
    role: 'transporter',
    roleTag: 'Transporter Portal',
    basePath: '/transporter',
    nav: [
      { items: [{ label: 'Dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Marketplace',
        items: [
          { label: 'Load Board', icon: 'i-search', path: 'load-board' },
          { label: 'Post Load (on behalf)', icon: 'i-plus', path: 'post-load' },
          { label: 'My Applications', icon: 'i-doc', path: 'applications' },
          { label: 'Booking Requests', icon: 'i-box', path: 'requests' },
        ],
      },
      {
        title: 'Fleet',
        items: [
          { label: 'Fleet & Drivers', icon: 'i-car', path: 'fleet' },
          { label: 'Device Inventory', icon: 'i-api', path: 'devices' },
          { label: 'Live Tracking', icon: 'i-map', path: 'tracking' },
        ],
      },
      {
        title: 'Trips',
        items: [{ label: 'Trips', icon: 'i-route', path: 'trips' }],
      },
      {
        title: 'Customers',
        items: [{ label: 'Offline Customers', icon: 'i-users', path: 'customers' }],
      },
      {
        title: 'Analytics',
        items: [{ label: 'Reports & Analytics', icon: 'i-chart', path: 'reports' }],
      },
      {
        title: 'Account',
        items: [
          { label: 'Wallet', icon: 'i-wallet', path: 'wallet' },
          { label: 'Payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Documents', icon: 'i-doc', path: 'documents' },
          { label: 'Notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Support Tickets', icon: 'i-headset', path: 'support' },
          { label: 'Business Settings', icon: 'i-settings', path: 'profile' },
        ],
      },
    ],
  },

  'truck-owner': {
    role: 'truck-owner',
    roleTag: 'Truck Owner Portal',
    basePath: '/truck-owner',
    nav: [
      { items: [{ label: 'Dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Marketplace',
        items: [
          { label: 'Load Board', icon: 'i-search', path: 'load-board' },
          { label: 'My Applications', icon: 'i-doc', path: 'applications' },
        ],
      },
      {
        title: 'Fleet',
        items: [
          { label: 'My Vehicles', icon: 'i-car', path: 'vehicles' },
          { label: 'My Drivers', icon: 'i-truck', path: 'drivers' },
          { label: 'Device Inventory', icon: 'i-api', path: 'devices' },
          { label: 'Live Tracking', icon: 'i-map', path: 'tracking' },
        ],
      },
      {
        title: 'Trips',
        items: [{ label: 'Trips', icon: 'i-route', path: 'trips' }],
      },
      {
        title: 'Analytics',
        items: [{ label: 'Reports & Analytics', icon: 'i-chart', path: 'reports' }],
      },
      {
        title: 'Account',
        items: [
          { label: 'Wallet', icon: 'i-wallet', path: 'wallet' },
          { label: 'Payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Documents', icon: 'i-doc', path: 'documents' },
          { label: 'Notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Support Tickets', icon: 'i-headset', path: 'support' },
          { label: 'Business Settings', icon: 'i-settings', path: 'profile' },
        ],
      },
    ],
  },

  company: {
    role: 'company',
    roleTag: 'Company Portal',
    basePath: '/company',
    nav: [
      { items: [{ label: 'Dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Organization',
        items: [{ label: 'Staff Management', icon: 'i-users', path: 'staff' }],
      },
      {
        title: 'Operations',
        items: [
          { label: 'Bookings', icon: 'i-box', path: 'bookings' },
          { label: 'Fleet & Drivers', icon: 'i-car', path: 'fleet' },
          { label: 'Trips', icon: 'i-route', path: 'trips' },
          { label: 'Reports & Analytics', icon: 'i-chart', path: 'reports' },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Wallet', icon: 'i-wallet', path: 'wallet' },
          { label: 'Payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Documents', icon: 'i-doc', path: 'documents' },
          { label: 'Notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Support Tickets', icon: 'i-headset', path: 'support' },
          { label: 'Business Settings', icon: 'i-settings', path: 'profile' },
        ],
      },
    ],
  },

  driver: {
    role: 'driver',
    roleTag: 'Driver Portal',
    basePath: '/driver',
    nav: [
      { items: [{ label: 'Dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Trips',
        items: [
          { label: 'Assigned Trips', icon: 'i-route', path: 'trips' },
          { label: 'Trip History', icon: 'i-clock', path: 'trip-history' },
          { label: 'Digital POD', icon: 'i-doc', path: 'pod' },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Wallet', icon: 'i-wallet', path: 'wallet' },
          { label: 'Documents', icon: 'i-doc', path: 'documents' },
          { label: 'Notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Support', icon: 'i-headset', path: 'support' },
          { label: 'Profile', icon: 'i-user', path: 'profile' },
        ],
      },
    ],
  },
};
