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

  it('keeps the truck owner quote separate from a shipper counter-offer', () => {
    const application = marketplace.applications().find((item) => item.id === 'a2')!;
    const originalQuote = application.quotedAmount;
    const beforeOffers = marketplace.getOffersForApplication('a2')().length;

    marketplace.sendCounterOffer({
      applicationId: 'a2', loadId: 'l1', by: 'owner', byName: 'Mehta Industries', amount: '17250',
    });

    expect(marketplace.applications().find((item) => item.id === 'a2')?.quotedAmount).toBe(originalQuote);
    expect(marketplace.getOffersForApplication('a2')().length).toBe(beforeOffers + 1);
    expect(marketplace.getLatestOffer('a2')()?.by).toBe('owner');
    expect(marketplace.getLatestOffer('a2')()?.amount).toContain('17,250');
  });

  it('does not let either party accept its own latest offer', () => {
    expect(marketplace.acceptApplication('a2', 'applicant')).toBeUndefined();
    marketplace.sendCounterOffer({
      applicationId: 'a2', loadId: 'l1', by: 'owner', byName: 'Mehta Industries', amount: '17500',
    });
    expect(marketplace.acceptApplication('a2', 'owner')).toBeUndefined();
    expect(marketplace.acceptApplication('a2', 'applicant')).toBeTruthy();
  });

  it('runs the practical truck-owner flow from counter-offer acceptance to trip completion', () => {
    marketplace.sendCounterOffer({
      applicationId: 'a2', loadId: 'l1', by: 'owner', byName: 'Mehta Industries', amount: '17500',
    });

    const booking = marketplace.acceptApplication('a2', 'applicant');
    expect(booking?.status).toBe('Awaiting Deposit');
    expect(booking?.amount).toContain('17,500');
    expect(marketplace.applications().find((application) => application.id === 'a2')?.status).toBe('Accepted');
    expect(marketplace.getApplicationsBy('truck-owner')().find((application) => application.id === 'a2')).toEqual(jasmine.objectContaining({ status: 'Accepted', quotedAmount: jasmine.stringContaining('17,500') }));
    expect(marketplace.applications().find((application) => application.id === 'a3')?.status).toBe('Rejected');

    marketplace.payDeposit(booking!.id, 'owner');
    marketplace.payDeposit(booking!.id, 'counterparty');
    expect(marketplace.bookings().find((item) => item.id === booking!.id)?.status).toBe('Confirmed');

    marketplace.assignVehicle(booking!.id, { mode: 'Own Fleet', vehicleRegNumber: 'RJ14GA1234' });
    marketplace.assignDriver(booking!.id, { driverName: 'Ramesh Kumar' });
    marketplace.markLoadingCompleted(booking!.id);
    const loadingAdvance = marketplace.bookings().find((item) => item.id === booking!.id)?.settlementPlan.find((milestone) => milestone.label === 'Loading Advance');
    expect(loadingAdvance).toBeTruthy();
    marketplace.releaseMilestone(booking!.id, loadingAdvance!.id);
    marketplace.startTrip(booking!.id);
    marketplace.settleBooking(booking!.id);

    const completed = marketplace.bookings().find((item) => item.id === booking!.id);
    expect(completed?.status).toBe('Completed');
    expect(completed?.escrowStatus).toBe('Released');
    expect(completed?.settlement?.payoutAmount).toBeTruthy();
  });
});
