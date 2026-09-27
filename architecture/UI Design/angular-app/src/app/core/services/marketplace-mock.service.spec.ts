import { TestBed } from '@angular/core/testing';
import { MarketplaceMockService } from './marketplace-mock.service';

describe('Marketplace booking negotiation lifecycle', () => {
  let marketplace: MarketplaceMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    marketplace = TestBed.inject(MarketplaceMockService);
  });

  it('does not allow a terminal application to be accepted, negotiated, or rejected again', () => {
    const initialBookingCount = marketplace.bookings().length;
    const initialOfferCount = marketplace.getOffersForApplication('a1')().length;

    expect(marketplace.acceptApplication('a1')).toBeTruthy();
    expect(marketplace.acceptApplication('a1')).toBeUndefined();
    marketplace.sendCounterOffer({
      applicationId: 'a1', loadId: 'l1', by: 'owner', byName: 'Mehta Industries', amount: '₹16,500',
    });
    marketplace.rejectApplication('a1');

    expect(marketplace.applications().find((application) => application.id === 'a1')?.status).toBe('Accepted');
    expect(marketplace.bookings().length).toBe(initialBookingCount + 1);
    const acceptedBooking = marketplace.bookings()[0];
    expect(acceptedBooking.commissionSnapshot?.components.length).toBe(2);
    expect(acceptedBooking.commissionSnapshot?.components.every((fee) => fee.billedToRole === 'transporter' && fee.billedToName === 'Verma Logistics')).toBeTrue();
    expect(marketplace.getOffersForApplication('a1')().length).toBe(initialOfferCount);
  });

  it('holds commission invoice creation while an active booking dispute is unresolved', () => {
    const booking = marketplace.acceptApplication('a1')!;
    marketplace.raiseDispute(booking.id, 'Freight amount disputed', 'Shipper');
    marketplace.settleBooking(booking.id);
    expect(marketplace.bookings().find((item) => item.id === booking.id)?.status).not.toBe('Completed');

    marketplace.resolveDispute(booking.id, false);
    marketplace.settleBooking(booking.id);
    expect(marketplace.bookings().find((item) => item.id === booking.id)?.commissionSnapshot?.status).toBe('Waived');
  });

  it('rejects nonnumeric freight quotes and counter-offers at the service boundary', () => {
    const initialCount = marketplace.applications().length;
    const initialOffers = marketplace.getOffersForApplication('a1')().length;
    expect(() => marketplace.applyForLoad({
      loadId: 'l1', applicantRole: 'transporter', applicantName: 'Test Transport',
      vehicleRegNumber: 'RJ14AB1234', vehicleType: 'Open Body Truck', availability: 'Tomorrow',
      quotedAmount: 'twelve thousand',
    })).toThrowError(RangeError);
    marketplace.sendCounterOffer({
      applicationId: 'a1', loadId: 'l1', by: 'owner', byName: 'Mehta Industries', amount: '12,500 rupees',
    });
    expect(marketplace.applications().length).toBe(initialCount);
    expect(marketplace.getOffersForApplication('a1')().length).toBe(initialOffers);
  });
});
