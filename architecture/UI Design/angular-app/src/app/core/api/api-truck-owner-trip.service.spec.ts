import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiTruckOwnerTripService } from './api-truck-owner-trip.service';
import { tripDetailFixture, tripListFixture } from '../../features/shipper/trips/shipper-trip.fixtures';

describe('Truck owner operational trip API', () => {
  let http: HttpTestingController;
  let api: ApiTruckOwnerTripService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), ApiTruckOwnerTripService] });
    http = TestBed.inject(HttpTestingController); api = TestBed.inject(ApiTruckOwnerTripService);
  });
  afterEach(() => http.verify());
  it('uses the provider endpoint with bounded page, stage and literal search parameters', () => {
    api.list(2, 'delivered', '100%_goods').subscribe((r) => expect(r.matching).toBe(21));
    const request = http.expectOne((r) => r.url.endsWith('/account/truck-owner/trips'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('stage')).toBe('delivered');
    expect(request.request.params.get('q')).toBe('100%_goods');
    expect(request.request.params.has('provider_uuid')).toBeFalse();
    request.flush({ success: true, data: tripListFixture, meta: { current_page: 2, last_page: 2, total: 21 } });
  });
  it('keeps the exact trip identity and downloads the authenticated original booking POD', () => {
    const uuid = tripDetailFixture.trip.uuid;
    api.get(uuid).subscribe((r) => expect(r.trip.shipper_name).toBe('Actual Shipper'));
    http.expectOne((r) => r.url.endsWith('/account/truck-owner/trips/' + uuid)).flush({
      success: true, data: { ...tripDetailFixture, trip: { ...tripDetailFixture.trip, shipper_name: 'Actual Shipper' } },
    });
    const original = new Blob(['private original'], { type: 'application/pdf' });
    api.downloadPod(uuid).subscribe((blob) => expect(blob).toEqual(original));
    const request = http.expectOne((r) => r.url.endsWith('/marketplace-bookings/' + uuid + '/pod/download'));
    expect(request.request.responseType).toBe('blob'); expect(request.request.method).toBe('GET'); request.flush(original);
  });
  it('rejects malformed success responses rather than inventing empty records', () => {
    let failed = false;
    api.list().subscribe({ error: () => failed = true });
    http.expectOne((r) => r.url.endsWith('/account/truck-owner/trips')).flush({ success: true, data: { rows: [] } });
    expect(failed).toBeTrue();
    failed = false; api.get(tripDetailFixture.trip.uuid).subscribe({ error: () => failed = true });
    http.expectOne((r) => r.url.endsWith('/account/truck-owner/trips/' + tripDetailFixture.trip.uuid)).flush({
      success: true, data: { ...tripDetailFixture, trip: { ...tripDetailFixture.trip, uuid: 'different-trip' } },
    });
    expect(failed).toBeTrue();
  });
});
