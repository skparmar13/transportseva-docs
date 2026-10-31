import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiAccountProfileService, SaveAccountProfile } from './api-account-profile.service';
import { API_CONFIG } from './api-config';

describe('ApiAccountProfileService', () => {
  let api: ApiAccountProfileService; let http: HttpTestingController;
  const base = API_CONFIG.baseUrl;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiAccountProfileService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('reads the authenticated own profile without an owner identifier', () => {
    let result: any; api.get().subscribe((v) => result = v);
    const r = http.expectOne(base + '/account/profile'); expect(r.request.method).toBe('GET'); expect(r.request.params.keys()).toEqual([]);
    r.flush({ success: true, data: { account: { uuid: 'self' }, profile: { version: 0, notify_email: false } } }); expect(result.profile.notify_email).toBe(false);
  });
  it('preserves false preferences and the exact current version when saving', () => {
    const payload: SaveAccountProfile = { first_name: 'QA', last_name: 'User', email: 'qa@example.test', designation: '', address: '', city: '', pincode: '', notify_email: false, notify_sms: false, version: 4 };
    api.save(payload).subscribe(); const r = http.expectOne(base + '/account/profile'); expect(r.request.method).toBe('PUT'); expect(r.request.body).toEqual(payload);
    r.flush({ success: true, data: { account: { uuid: 'self' }, profile: { version: 5 } } });
  });
  it('rejects invalid successful HTTP envelopes instead of displaying saved success', () => {
    let failed = false; api.get().subscribe({ error: () => failed = true });
    http.expectOne(base + '/account/profile').flush({ success: false, data: {} }); expect(failed).toBeTrue();
  });
  it('uses only the saved server email for requests and sends an account-bound challenge for verification', () => {
    api.requestEmail().subscribe(); const send = http.expectOne(base + '/account/email/request-otp'); expect(send.request.body).toEqual({});
    send.flush({ success: true, data: { challenge_id: 'challenge' } });
    api.verifyEmail('challenge', '123456').subscribe(); const verify = http.expectOne(base + '/account/email/verify-otp');
    expect(verify.request.body).toEqual({ challenge_id: 'challenge', otp: '123456' }); verify.flush({ success: true, data: { portal_access_ready: true } });
  });
});
