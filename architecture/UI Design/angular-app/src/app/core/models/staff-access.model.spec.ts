import { TestBed } from '@angular/core/testing';
import { SessionService } from '../services/session.service';
import { StaffAccess, staffRouteAllowed } from './staff-access.model';

describe('Staff capability navigation', () => {
  const access: StaffAccess = { enforced: true, ready: true, role_code: 'OPERATIONS_MANAGER', role_name: 'Operations Manager',
    permissions: ['marketplace.reviews.view', 'admin.audit.view'], routes: ['access', 'notifications', 'reviews', 'audit'], blocked_reason: null };
  afterEach(() => localStorage.clear());
  it('requires both the enabled route and its capability', () => {
    const contact = { ...access, routes: ['contact-inquiries'], permissions: ['contact.inquiries.view'] };
    expect(staffRouteAllowed(contact, 'contact-inquiries')).toBeTrue();
    expect(staffRouteAllowed({ ...contact, permissions: ['support.cases.view'] }, 'contact-inquiries')).toBeFalse();
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
