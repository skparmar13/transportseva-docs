import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiMarketplaceService } from './api-marketplace.service';

describe('ApiMarketplaceService', () => {
  let service: ApiMarketplaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ApiMarketplaceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('normalizes Laravel decimal budget strings for all load screens', () => {
    let loadBudget: number | string | undefined;
    service.getLoad('load-1').subscribe((load) => loadBudget = load.budget);
    const request = http.expectOne('http://localhost:8000/api/loads/load-1');
    request.flush({ success: true, data: {
      uuid: 'load-1', pickup_city: 'Delhi', drop_city: 'Mumbai', budget: '45000.00', status: 'open',
    } });
    expect(loadBudget).toBe(45000);
  });

  it('loads negotiation offers without rewriting their party attribution', () => {
    let offers: unknown;
    service.listOffers('application-1').subscribe((value) => offers = value);
    const request = http.expectOne('http://localhost:8000/api/applications/application-1/offers');
    request.flush({ success: true, data: [{
      uuid: 'offer-1', application_uuid: 'application-1', load_uuid: 'load-1',
      by_role: 'owner', by_name: 'Mehta Industries', amount: '17250.00', message: 'Counter', created_at: '2026-10-10 10:20:00',
    }] });
    expect(offers).toEqual([jasmine.objectContaining({ by_role: 'owner', amount: '17250.00' })]);
  });

  it('loads the authenticated applicant applications, including their load and current offer', () => {
    let applications: unknown;
    service.listMyApplications().subscribe((value) => applications = value);
    const request = http.expectOne('http://localhost:8000/api/applications/mine?per_page=100');
    request.flush({ success: true, data: [{
      uuid: 'application-1', load_uuid: 'load-1', applicant_role: 'truck-owner', applicant_name: 'Fleet owner',
      vehicle_reg_number: 'RJ14GA1234', vehicle_type: '32ft Trailer', availability: 'Today', quoted_amount: '18500.00',
      current_offer_amount: '17000.00', status: 'accepted', load: {
        uuid: 'load-1', load_id: 'LD-000001', pickup_city: 'Delhi', drop_city: 'Mumbai', status: 'booked', budget: '45000.00',
      },
    }] });
    expect(applications).toEqual([jasmine.objectContaining({ uuid: 'application-1', current_offer_amount: '17000.00', load: jasmine.objectContaining({ uuid: 'load-1' }) })]);
  });

  it('posts a counter-offer as a structured amount without a freeform message', () => {
    service.createOffer('application-1', { by_role: 'owner', by_name: 'Mehta Industries', amount: 17250 }).subscribe();
    const request = http.expectOne('http://localhost:8000/api/applications/application-1/offers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ by_role: 'owner', by_name: 'Mehta Industries', amount: 17250 });
    request.flush({ success: true, data: {} });
  });

  it('accepts the latest offer through the bilateral application endpoint', () => {
    service.acceptApplication('load-1', 'application-1').subscribe();
    const request = http.expectOne('http://localhost:8000/api/loads/load-1/applications/application-1/accept');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    request.flush({ success: true, data: {} });
  });

  it('loads and sends booking chat messages through the authenticated booking', () => {
    let messages: unknown;
    service.listChatMessages('booking-1').subscribe((value) => messages = value);
    const getRequest = http.expectOne('http://localhost:8000/api/marketplace-bookings/booking-1/messages');
    getRequest.flush({ success: true, data: [{
      uuid: 'message-1', booking_uuid: 'booking-1', load_uuid: 'load-1', application_uuid: 'application-1',
      sender_role: 'owner', sender_name: 'Shipper Singh', message: 'Ready for pickup', created_at: '2026-10-10 10:30:00',
    }] });
    expect(messages).toEqual([jasmine.objectContaining({ message: 'Ready for pickup' })]);

    service.sendChatMessage('booking-1', 'Driver assigned').subscribe();
    const postRequest = http.expectOne('http://localhost:8000/api/marketplace-bookings/booking-1/messages');
    expect(postRequest.request.method).toBe('POST');
    expect(postRequest.request.body).toEqual({ message: 'Driver assigned' });
    postRequest.flush({ success: true, data: { uuid: 'message-2' } });
  });

  it('posts operational workflow transitions for the booking lifecycle', () => {
    service.updateMarketplaceWorkflow('booking-1', 'assign_vehicle', { mode: 'Own Fleet', vehicle_reg_number: 'RJ14GA1234' }).subscribe();
    const request = http.expectOne('http://localhost:8000/api/marketplace-bookings/booking-1/workflow');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ action: 'assign_vehicle', mode: 'Own Fleet', vehicle_reg_number: 'RJ14GA1234' });
    request.flush({ success: true, data: {} });
  });
});
