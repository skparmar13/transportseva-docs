import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_CONFIG } from './api-config';
import { ApiShipperTripService } from './api-shipper-trip.service';
import { tripDetailFixture, tripListFixture } from '../../features/shipper/trips/shipper-trip.fixtures';

describe('Shipper Trip read-only HTTP contracts', () => {
  let api: ApiShipperTripService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiShipperTripService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('uses bounded read-only filters without client-chosen ownership', () => {
    api.list(2, 'delivered', 'Delhi').subscribe(); const r = http.expectOne((r) => r.url.endsWith('/account/trips')); expect(r.request.method).toBe('GET'); expect(r.request.params.get('per_page')).toBe('20'); expect(r.request.params.get('owner_uuid')).toBeNull(); r.flush({ success: true, data: tripListFixture, meta: { current_page: 2, last_page: 2, total: 21 } });
  });
  it('rejects incomplete totals instead of presenting undefined or invented KPI values', () => {
    let error = false; api.list().subscribe({ error: () => error = true }); http.expectOne((r) => r.url.endsWith('/account/trips')).flush({ success: true, data: { ...tripListFixture, totals: {} }, meta: { current_page: 1, last_page: 1, total: 1 } }); expect(error).toBeTrue();
  });
  it('requires the exact requested trip identity and reuses the authenticated original-POD endpoint', () => {
    const uuid = tripDetailFixture.trip.uuid; let error = false; api.get(uuid).subscribe({ error: () => error = true }); http.expectOne(API_CONFIG.baseUrl + '/account/trips/' + uuid).flush({ success: true, data: { ...tripDetailFixture, trip: { ...tripDetailFixture.trip, uuid: '22222222-2222-2222-2222-222222222222' } } }); expect(error).toBeTrue();
    api.downloadPod(uuid).subscribe(); const r = http.expectOne(API_CONFIG.baseUrl + '/marketplace-bookings/' + uuid + '/pod/download'); expect(r.request.method).toBe('GET'); expect(r.request.responseType).toBe('blob'); r.flush(new Blob(['original']));
  });
});
