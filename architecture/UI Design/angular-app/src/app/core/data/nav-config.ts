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
    roleTagKey: 'nav.roleTag.admin',
    basePath: '/admin',
    nav: [
      { items: [{ label: 'Dashboard', labelKey: 'nav.dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Company Management',
        titleKey: 'nav.companyManagement',
        items: [
          { label: 'Company Management', labelKey: 'nav.companyManagement', icon: 'i-building', path: 'companies' },
          { label: 'Subscription Plans', labelKey: 'nav.subscriptionPlans', icon: 'i-tag', path: 'subscriptions', planned: true },
        ],
      },
      {
        title: 'User Management',
        titleKey: 'nav.userManagement',
        items: [
          { label: 'User Management', labelKey: 'nav.userManagement', icon: 'i-users', path: 'users' },
          { label: 'Roles & Permissions', labelKey: 'nav.rolesPermissions', icon: 'i-shield', path: 'roles' },
          { label: 'Customer Management', labelKey: 'nav.customerManagement', icon: 'i-user', path: 'customers' },
          { label: 'Transporter Management', labelKey: 'nav.transporterManagement', icon: 'i-building', path: 'transporters' },
          { label: 'Driver Management', labelKey: 'nav.driverManagement', icon: 'i-truck', path: 'drivers' },
          { label: 'Vehicle & Fleet Management', labelKey: 'nav.vehicleFleetManagement', icon: 'i-car', path: 'vehicles' },
          { label: 'Device Inventory', labelKey: 'nav.deviceInventory', icon: 'i-api', path: 'devices' },
        ],
      },
      {
        title: 'Operations',
        titleKey: 'nav.operations',
        items: [
          { label: 'Load / Booking Management', labelKey: 'nav.loadBookingManagement', icon: 'i-box', path: 'bookings' },
          { label: 'Route Management', labelKey: 'nav.routeManagement', icon: 'i-route', path: 'routes', planned: true },
          { label: 'Trip Management', labelKey: 'nav.tripManagement', icon: 'i-truck', path: 'trips' },
          { label: 'Live Tracking', labelKey: 'nav.liveTracking', icon: 'i-map', path: 'tracking' },
        ],
      },
      {
        title: 'Finance',
        titleKey: 'nav.finance',
        items: [
          { label: 'Payment Ledger', labelKey: 'nav.paymentLedger', icon: 'i-invoice', path: 'financials' },
          { label: 'Payments', labelKey: 'nav.payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Invoice & Tax', labelKey: 'nav.invoiceTax', icon: 'i-invoice', path: 'invoices' },
        ],
      },
      {
        title: 'Support & Content',
        titleKey: 'nav.supportContent',
        items: [
          { label: 'Notification Management', labelKey: 'nav.notificationManagement', icon: 'i-bell', path: 'notifications' },
          { label: 'Support Tickets', labelKey: 'nav.supportTickets', icon: 'i-ticket', path: 'support' },
          { label: 'Document Verification', labelKey: 'nav.documentVerification', icon: 'i-doc', path: 'documents' },
          { label: 'CMS Management', labelKey: 'nav.cmsManagement', icon: 'i-layers', path: 'cms', planned: true },
        ],
      },
      {
        title: 'System',
        titleKey: 'nav.system',
        items: [
          { label: 'Reports & Analytics', labelKey: 'nav.reportsAnalytics', icon: 'i-chart', path: 'reports' },
          { label: 'Audit Logs', labelKey: 'nav.auditLogs', icon: 'i-audit', path: 'audit' },
          { label: 'API Management', labelKey: 'nav.apiManagement', icon: 'i-api', path: 'api', planned: true },
          { label: 'System Settings', labelKey: 'nav.systemSettings', icon: 'i-settings', path: 'settings' },
        ],
      },
    ],
  },

  shipper: {
    role: 'shipper',
    roleTag: 'Shipper Portal',
    roleTagKey: 'nav.roleTag.shipper',
    basePath: '/shipper',
    nav: [
      { items: [{ label: 'Dashboard', labelKey: 'nav.dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Marketplace',
        titleKey: 'nav.marketplace',
        items: [
          { label: 'Post a Load', labelKey: 'nav.postLoad', icon: 'i-plus', path: 'post-load' },
          { label: 'My Loads', labelKey: 'nav.myLoads', icon: 'i-box', path: 'my-loads' },
          { label: 'Applications Received', labelKey: 'nav.applicationsReceived', icon: 'i-doc', path: 'applications' },
          { label: 'Bookings', labelKey: 'nav.bookings', icon: 'i-check', path: 'bookings' },
        ],
      },
      {
        title: 'Shipments',
        titleKey: 'nav.shipments',
        items: [
          { label: 'Live Tracking', labelKey: 'nav.liveTracking', icon: 'i-map', path: 'tracking' },
          { label: 'Trip History', labelKey: 'nav.tripHistory', icon: 'i-clock', path: 'trips' },
          { label: 'Reports & Analytics', labelKey: 'nav.reportsAnalytics', icon: 'i-chart', path: 'reports' },
        ],
      },
      {
        title: 'Account',
        titleKey: 'nav.account',
        items: [
          { label: 'Payment Ledger', labelKey: 'nav.paymentLedger', icon: 'i-invoice', path: 'financials' },
          { label: 'Payments', labelKey: 'nav.payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Documents', labelKey: 'nav.documents', icon: 'i-doc', path: 'documents' },
          { label: 'Support Tickets', labelKey: 'nav.supportTickets', icon: 'i-headset', path: 'support' },
          { label: 'Notifications', labelKey: 'nav.notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Business Settings', labelKey: 'nav.businessSettings', icon: 'i-settings', path: 'profile' },
        ],
      },
    ],
  },

  transporter: {
    role: 'transporter',
    roleTag: 'Transporter Portal',
    roleTagKey: 'nav.roleTag.transporter',
    basePath: '/transporter',
    nav: [
      { items: [{ label: 'Dashboard', labelKey: 'nav.dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Marketplace',
        titleKey: 'nav.marketplace',
        items: [
          { label: 'Load Board', labelKey: 'nav.loadBoard', icon: 'i-search', path: 'load-board' },
          { label: 'Post Load (on behalf)', labelKey: 'nav.postLoadOnBehalf', icon: 'i-plus', path: 'post-load' },
          { label: 'My Applications', labelKey: 'nav.myApplications', icon: 'i-doc', path: 'applications' },
          { label: 'Booking Requests', labelKey: 'nav.bookingRequests', icon: 'i-box', path: 'requests' },
        ],
      },
      {
        title: 'Fleet',
        titleKey: 'nav.fleet',
        items: [
          { label: 'Fleet & Drivers', labelKey: 'nav.fleetDrivers', icon: 'i-car', path: 'fleet' },
          { label: 'Device Inventory', labelKey: 'nav.deviceInventory', icon: 'i-api', path: 'devices' },
          { label: 'Live Tracking', labelKey: 'nav.liveTracking', icon: 'i-map', path: 'tracking' },
        ],
      },
      {
        title: 'Trips',
        titleKey: 'nav.trips',
        items: [{ label: 'Trips', labelKey: 'nav.trips', icon: 'i-route', path: 'trips' }],
      },
      {
        title: 'Customers',
        titleKey: 'nav.customers',
        items: [{ label: 'Offline Customers', labelKey: 'nav.offlineCustomers', icon: 'i-users', path: 'customers', planned: true }],
      },
      {
        title: 'Analytics',
        titleKey: 'nav.analytics',
        items: [{ label: 'Reports & Analytics', labelKey: 'nav.reportsAnalytics', icon: 'i-chart', path: 'reports' }],
      },
      {
        title: 'Account',
        titleKey: 'nav.account',
        items: [
          { label: 'Payment Ledger', labelKey: 'nav.paymentLedger', icon: 'i-invoice', path: 'financials' },
          { label: 'Payments', labelKey: 'nav.payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Documents', labelKey: 'nav.documents', icon: 'i-doc', path: 'documents' },
          { label: 'Notifications', labelKey: 'nav.notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Support Tickets', labelKey: 'nav.supportTickets', icon: 'i-headset', path: 'support' },
          { label: 'Business Settings', labelKey: 'nav.businessSettings', icon: 'i-settings', path: 'profile' },
        ],
      },
    ],
  },

  'truck-owner': {
    role: 'truck-owner',
    roleTag: 'Truck Owner Portal',
    roleTagKey: 'nav.roleTag.truckOwner',
    basePath: '/truck-owner',
    nav: [
      { items: [{ label: 'Dashboard', labelKey: 'nav.dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Marketplace',
        titleKey: 'nav.marketplace',
        items: [
          { label: 'Load Board', labelKey: 'nav.loadBoard', icon: 'i-search', path: 'load-board' },
          { label: 'My Applications', labelKey: 'nav.myApplications', icon: 'i-doc', path: 'applications' },
        ],
      },
      {
        title: 'Fleet',
        titleKey: 'nav.fleet',
        items: [
          { label: 'My Vehicles', labelKey: 'nav.myVehicles', icon: 'i-car', path: 'vehicles' },
          { label: 'My Drivers', labelKey: 'nav.myDrivers', icon: 'i-truck', path: 'drivers' },
          { label: 'Device Inventory', labelKey: 'nav.deviceInventory', icon: 'i-api', path: 'devices' },
          { label: 'Live Tracking', labelKey: 'nav.liveTracking', icon: 'i-map', path: 'tracking' },
        ],
      },
      {
        title: 'Trips',
        titleKey: 'nav.trips',
        items: [{ label: 'Trips', labelKey: 'nav.trips', icon: 'i-route', path: 'trips' }],
      },
      {
        title: 'Analytics',
        titleKey: 'nav.analytics',
        items: [{ label: 'Reports & Analytics', labelKey: 'nav.reportsAnalytics', icon: 'i-chart', path: 'reports' }],
      },
      {
        title: 'Account',
        titleKey: 'nav.account',
        items: [
          { label: 'Payment Ledger', labelKey: 'nav.paymentLedger', icon: 'i-invoice', path: 'financials' },
          { label: 'Payments', labelKey: 'nav.payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Documents', labelKey: 'nav.documents', icon: 'i-doc', path: 'documents' },
          { label: 'Notifications', labelKey: 'nav.notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Support Tickets', labelKey: 'nav.supportTickets', icon: 'i-headset', path: 'support' },
          { label: 'Business Settings', labelKey: 'nav.businessSettings', icon: 'i-settings', path: 'profile' },
        ],
      },
    ],
  },

  company: {
    role: 'company',
    roleTag: 'Company Portal',
    roleTagKey: 'nav.roleTag.company',
    basePath: '/company',
    nav: [
      { items: [{ label: 'Dashboard', labelKey: 'nav.dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Organization',
        titleKey: 'nav.organization',
        items: [{ label: 'Staff Management', labelKey: 'nav.staffManagement', icon: 'i-users', path: 'staff' }],
      },
      {
        title: 'Operations',
        titleKey: 'nav.operations',
        items: [
          { label: 'Bookings', labelKey: 'nav.bookings', icon: 'i-box', path: 'bookings' },
          { label: 'Fleet & Drivers', labelKey: 'nav.fleetDrivers', icon: 'i-car', path: 'fleet' },
          { label: 'Trips', labelKey: 'nav.trips', icon: 'i-route', path: 'trips' },
          { label: 'Reports & Analytics', labelKey: 'nav.reportsAnalytics', icon: 'i-chart', path: 'reports' },
        ],
      },
      {
        title: 'Account',
        titleKey: 'nav.account',
        items: [
          { label: 'Payment Ledger', labelKey: 'nav.paymentLedger', icon: 'i-invoice', path: 'financials' },
          { label: 'Payments', labelKey: 'nav.payments', icon: 'i-invoice', path: 'payments' },
          { label: 'Documents', labelKey: 'nav.documents', icon: 'i-doc', path: 'documents' },
          { label: 'Notifications', labelKey: 'nav.notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Support Tickets', labelKey: 'nav.supportTickets', icon: 'i-headset', path: 'support' },
          { label: 'Business Settings', labelKey: 'nav.businessSettings', icon: 'i-settings', path: 'profile' },
        ],
      },
    ],
  },

  driver: {
    role: 'driver',
    roleTag: 'Driver Portal',
    roleTagKey: 'nav.roleTag.driver',
    basePath: '/driver',
    nav: [
      { items: [{ label: 'Dashboard', labelKey: 'nav.dashboard', icon: 'i-grid', path: 'dashboard' }] },
      {
        title: 'Trips',
        titleKey: 'nav.trips',
        items: [
          { label: 'Assigned Trips', labelKey: 'nav.assignedTrips', icon: 'i-route', path: 'trips' },
          { label: 'Trip History', labelKey: 'nav.tripHistory', icon: 'i-clock', path: 'trip-history' },
          { label: 'Digital POD', labelKey: 'nav.digitalPod', icon: 'i-doc', path: 'pod' },
        ],
      },
      {
        title: 'Account',
        titleKey: 'nav.account',
        items: [
          { label: 'Payment Ledger', labelKey: 'nav.paymentLedger', icon: 'i-invoice', path: 'financials' },
          { label: 'Documents', labelKey: 'nav.documents', icon: 'i-doc', path: 'documents' },
          { label: 'Notifications', labelKey: 'nav.notifications', icon: 'i-bell', path: 'notifications' },
          { label: 'Support', labelKey: 'nav.support', icon: 'i-headset', path: 'support' },
          { label: 'Profile', labelKey: 'nav.profile', icon: 'i-user', path: 'profile', planned: true },
        ],
      },
    ],
  },
};
