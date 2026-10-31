import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NotificationNavigationService } from './notification-navigation.service';
import { SessionService } from './session.service';

describe('NotificationNavigationService', () => {
  it('opens the exact contact enquiry for authorized staff navigation', () => {
    const session = TestBed.inject(SessionService); session.setRole('admin'); const router = TestBed.inject(Router);
    const uuid = '12345678-1234-1234-1234-123456789012';
    expect(router.serializeUrl(TestBed.inject(NotificationNavigationService).destination({ id: 'contact', category: 'System', title: 'New contact enquiry', message: '', timestamp: '', read: false, data: { contact_inquiry_uuid: uuid } })!)).toBe('/admin/contact-inquiries?inquiry=' + uuid);
  });
  const kycUuid = '1b5ae2a3-67fa-4df0-b13c-7a20162ccf42';

  it('opens the current account business profile for a saved-profile notification', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const service = TestBed.inject(NotificationNavigationService);
    const session = TestBed.inject(SessionService); const router = TestBed.inject(Router);
    session.setRole('truck-owner');
    expect(router.serializeUrl(service.destination({ id: 'profile', category: 'System', title: 'Business profile updated', message: '', timestamp: '', read: false,
      data: { event_type: 'business_profile_updated', profile_version: 2 }, actionUrl: '/truck-owner/profile' })!)).toBe('/truck-owner/profile');
  });

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('opens the current user’s KYC screen for a KYC decision notification', () => {
    const service = TestBed.inject(NotificationNavigationService);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.setRole('shipper');
    expect(router.serializeUrl(service.destination({ id: 'n-1', category: 'System', title: 'KYC approved', message: '', timestamp: '', read: false, data: { kyc_profile_uuid: kycUuid } })!)).toBe('/shipper/kyc');
  });

  it('opens the admin KYC queue for a moderation notification', () => {
    const service = TestBed.inject(NotificationNavigationService);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.setRole('admin');
    expect(router.serializeUrl(service.destination({ id: 'n-2', category: 'System', title: 'KYC awaiting review', message: '', timestamp: '', read: false, data: { kyc_profile_uuid: kycUuid } })!)).toBe('/admin/kyc');
  });

  it('opens the disputed booking for an admin cancellation notification', () => {
    const service = TestBed.inject(NotificationNavigationService);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.setRole('admin');
    expect(router.serializeUrl(service.destination({ id: 'n-3', category: 'Booking', title: 'Cancellation decision required', message: '', timestamp: '', read: false, data: { booking_uuid: kycUuid } })!)).toBe('/admin/bookings?booking=' + kycUuid);
  });
  it('opens verified staff access for a staff role-change notification', () => {
    const service = TestBed.inject(NotificationNavigationService);
    const session = TestBed.inject(SessionService);
    const router = TestBed.inject(Router);
    session.setRole('admin');
    expect(router.serializeUrl(service.destination({ id: 'staff', category: 'System', title: 'Staff access updated', message: '', timestamp: '', read: false, data: { staff_access_changed: true } })!)).toBe('/admin/access');
  });
});
