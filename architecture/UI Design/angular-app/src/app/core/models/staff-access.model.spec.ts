import { TestBed } from '@angular/core/testing';
import { SessionService } from '../services/session.service';
import { StaffAccess, staffRouteAllowed } from './staff-access.model';

describe('Staff capability navigation', () => {
  const access: StaffAccess = { enforced: true, ready: true, role_code: 'OPERATIONS_MANAGER', role_name: 'Operations Manager',
    permissions: ['marketplace.reviews.view', 'admin.audit.view'], routes: ['access', 'notifications', 'reviews', 'audit'], blocked_reason: null };
  afterEach(() => localStorage.clear());
  it('requires explicit Super Admin bank-review access even when general enforcement is off', () => {
    const bank = { ...access, enforced: false, role_code: 'SUPER_ADMIN', routes: ['bank-reviews'], permissions: ['recipient.bank.review'] };
    expect(staffRouteAllowed(bank, 'bank-reviews')).toBeTrue();
    expect(staffRouteAllowed({ ...bank, permissions: [] }, 'bank-reviews')).toBeFalse();
    expect(staffRouteAllowed({ ...bank, role_code: 'KYC_OFFICER' }, 'bank-reviews')).toBeFalse();
    expect(staffRouteAllowed(undefined, 'bank-reviews')).toBeFalse();
  });
  it('requires both the enabled route and its capability', () => {
    const reports = { ...access, routes: ['reports'], permissions: ['admin.reports.view', 'marketplace.bookings.view'] };
    expect(staffRouteAllowed(reports, 'reports')).toBeTrue();
    expect(staffRouteAllowed({ ...reports, permissions: ['admin.reports.view'] }, 'reports')).toBeFalse();
    const dashboard = { ...access, routes: ['dashboard'], permissions: ['admin.dashboard.view'] };
    expect(staffRouteAllowed(dashboard, 'dashboard')).toBeTrue();
    expect(staffRouteAllowed({ ...dashboard, permissions: ['admin.audit.view'] }, 'dashboard')).toBeFalse();
    const newsletter = { ...access, routes: ['newsletter'], permissions: ['newsletter.subscribers.view'] };
    expect(staffRouteAllowed(newsletter, 'newsletter')).toBeTrue();
    expect(staffRouteAllowed({ ...newsletter, permissions: ['contact.inquiries.view'] }, 'newsletter')).toBeFalse();
    const contact = { ...access, routes: ['contact-inquiries'], permissions: ['contact.inquiries.view'] };
    expect(staffRouteAllowed(contact, 'contact-inquiries')).toBeTrue();
    expect(staffRouteAllowed({ ...contact, permissions: ['support.cases.view'] }, 'contact-inquiries')).toBeFalse();
    expect(staffRouteAllowed({ ...contact, routes: ['support'], permissions: ['support.tickets.view'] }, 'support')).toBeTrue();
    expect(staffRouteAllowed({ ...contact, routes: ['support'], permissions: ['support.cases.view'] }, 'support')).toBeFalse();
    expect(staffRouteAllowed(access, 'reviews')).toBeTrue();
    expect(staffRouteAllowed({ ...access, permissions: [] }, 'reviews')).toBeFalse();
    expect(staffRouteAllowed({ ...access, routes: ['access'] }, 'reviews')).toBeFalse();
  });
  it('does not enable an unknown/deferred route merely because the server listed it', () => {
    expect(staffRouteAllowed({ ...access, routes: ['payments', 'settings', 'users'] }, 'payments')).toBeFalse();
    expect(staffRouteAllowed(access, 'dashboard')).toBeFalse();
  });
  it('keeps self-access and notification inspection available without broader staff access', () => {
    expect(staffRouteAllowed({ ...access, ready: false }, 'access')).toBeTrue();
    expect(staffRouteAllowed({ ...access, ready: false }, 'notifications')).toBeTrue();
    expect(staffRouteAllowed({ ...access, ready: false }, 'audit')).toBeFalse();
  });
  it('filters sidebar/search navigation and never labels operations as Super Admin', () => {
    const session = TestBed.inject(SessionService);
    session.setBackendUser({ full_name: 'QA Operations', role: 'admin', staff_access: access }); session.setRole('admin');
    const paths = session.portal().nav.flatMap((section) => section.items.map((item) => item.path));
    expect(paths).toContain('reviews'); expect(paths).toContain('access');
    expect(paths).not.toContain('roles'); expect(paths).not.toContain('financials'); expect(paths).not.toContain('dashboard');
    expect(session.portal().nav.every((section) => section.items.length > 0)).toBeTrue();
    expect(session.user().roleTag).toBe('Operations Manager');
    expect(session.portal().roleTag).not.toContain('Super Admin');
  });
});
