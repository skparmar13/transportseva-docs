import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG } from './api-config';
import { ApiBusinessProfileService, SaveBusinessProfile } from './api-business-profile.service';

describe('ApiBusinessProfileService', () => {
  let api: ApiBusinessProfileService; let http: HttpTestingController;
  const endpoint = API_CONFIG.baseUrl + '/account/business-profile';
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiBusinessProfileService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('reads the current account profile without a browser-supplied ownership scope', () => {
    let result: unknown; api.get().subscribe((data) => result = data);
    const request = http.expectOne(endpoint); expect(request.request.params.keys()).toEqual([]);
    request.flush({ success: true, data: { account: { uuid: 'self' }, profile: { version: 0 }, persisted: false } });
    expect(result).toEqual(jasmine.objectContaining({ persisted: false }));
  });
  it('sends an explicit version and only the business fields supplied to the self endpoint', () => {
    const payload: SaveBusinessProfile = { version: 0, business_name: 'QA Logistics', business_type: 'other',
      contact_email: null, contact_phone: null, address: null, city: null, state: null, pincode: null };
    api.save(payload).subscribe(); const request = http.expectOne(endpoint);
    expect(request.request.method).toBe('PUT'); expect(request.request.body).toEqual(payload);
    expect(request.request.body.user_uuid).toBeUndefined();
    request.flush({ success: true, data: { account: { uuid: 'self' }, profile: { version: 1 } } });
  });
  it('preserves a real version conflict as an error for explicit UI recovery', () => {
    let status = 0; api.save({ version: 1 } as SaveBusinessProfile).subscribe({ error: (error) => status = error.status });
    http.expectOne(endpoint).flush({ message: 'Changed in another session' }, { status: 409, statusText: 'Conflict' });
    expect(status).toBe(409);
  });
  it('rejects unsuccessful or malformed envelopes instead of claiming persistence', () => {
    let failures = 0; api.get().subscribe({ error: () => failures++ });
    http.expectOne(endpoint).flush({ success: false, data: null });
    api.get().subscribe({ error: () => failures++ });
    http.expectOne(endpoint).flush({ success: true, data: { account: { uuid: 'self' }, profile: {} } });
    expect(failures).toBe(2);
  });
});
