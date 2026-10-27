import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NotificationNavigationService } from './notification-navigation.service';
import { SessionService } from './session.service';

describe('NotificationNavigationService', () => {
  const kycUuid = '1b5ae2a3-67fa-4df0-b13c-7a20162ccf42';

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
});
