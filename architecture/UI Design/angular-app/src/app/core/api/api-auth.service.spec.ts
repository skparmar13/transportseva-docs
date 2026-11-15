import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiAuthService } from './api-auth.service';
import { API_CONFIG } from './api-config';
import { signupOtpWait } from '../utils/signup-otp-session';

describe('ApiAuthService', () => {
  let service: ApiAuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiAuthService);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('uses real recovery endpoints without authenticating or caching recovery proof', () => {
    service.requestPasswordRecovery(' qa@example.test ').subscribe();
    const requested = http.expectOne(API_CONFIG.baseUrl + '/auth/password/request-otp');
    expect(requested.request.body).toEqual({ identifier: 'qa@example.test' });
    requested.flush({ success: true, data: { challenge_id: 'c-1', expires_in: 600, resend_after: 60 } });
    service.verifyPasswordRecovery('c-1', '123456').subscribe();
    const verified = http.expectOne(API_CONFIG.baseUrl + '/auth/password/verify-otp');
    expect(verified.request.body).toEqual({ challenge_id: 'c-1', otp: '123456' });
    verified.flush({ success: true, data: { reset_token: 'proof', expires_in: 300 } });
    service.resetPassword('c-1', 'proof', 'NewPassword@123', 'NewPassword@123').subscribe();
    const reset = http.expectOne(API_CONFIG.baseUrl + '/auth/password/reset');
    expect(reset.request.body).toEqual({ challenge_id: 'c-1', reset_token: 'proof', password: 'NewPassword@123', password_confirmation: 'NewPassword@123' });
    reset.flush({ success: true, data: null });
    expect(localStorage.length).toBe(0);
  });

  it('sends the selected signup role with OTP verification and stores returned session', () => {
    let result: unknown;
    service.verifySignupOtp('+918505838433', '903744', 'truck-owner').subscribe((data) => result = data);

    const request = http.expectOne(`${API_CONFIG.baseUrl}/auth/signup/verify-otp`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ phone: '+918505838433', otp: '903744', role: 'truck-owner' });
    request.flush({
      success: true,
      data: {
        user: { uuid: 'u-1', email: 'owner@example.test', full_name: 'Truck Owner', role: 'truck-owner' },
        access_token: 'access-1',
        refresh_token: 'refresh-1',
        expires_in: 3600,
      },
    });

    expect(result).toEqual(jasmine.objectContaining({ access_token: 'access-1' }));
    expect(localStorage.getItem('transportseva.access_token')).toBe('access-1');
    expect(JSON.parse(localStorage.getItem('transportseva.api_user') ?? '{}').role).toBe('truck-owner');
  });

  it('resends OTP to the same signup phone', () => {
    service.requestSignupOtp('+918505838433').subscribe();
    const request = http.expectOne(`${API_CONFIG.baseUrl}/auth/signup/request-otp`);
    expect(request.request.body).toEqual({ phone: '+918505838433' });
    request.flush({ success: true, data: { debug_otp: '903744' } });
    expect(signupOtpWait('+918505838433')).toBe(60);
    expect(sessionStorage.getItem('transportseva.debug_otp')).toBe('903744');
  });

  it('does not replace a valid session with an incomplete verification response',()=>{
    localStorage.setItem('transportseva.access_token','existing');
    for(const body of [{success:false,data:null},{success:true,data:{access_token:'new',refresh_token:'refresh',expires_in:3600}},{success:true,data:{user:{uuid:'u-1'},access_token:'new',refresh_token:'',expires_in:3600}}]){
      let rejected=false;service.verifySignupOtp('+918505838433','123456','shipper').subscribe({next:()=>fail('Invalid session accepted'),error:()=>rejected=true});
      http.expectOne(`${API_CONFIG.baseUrl}/auth/signup/verify-otp`).flush(body);expect(rejected).toBeTrue();expect(localStorage.getItem('transportseva.access_token')).toBe('existing');
    }
  });

  it('clears an old development code after a non-debug request and rejects unsuccessful envelopes',()=>{
    sessionStorage.setItem('transportseva.debug_otp','123456');service.requestSignupOtp('+918505838433').subscribe();
    http.expectOne(`${API_CONFIG.baseUrl}/auth/signup/request-otp`).flush({success:true,data:null});expect(sessionStorage.getItem('transportseva.debug_otp')).toBeNull();
    let rejected=false;service.requestSignupOtp('+919876543210').subscribe({error:()=>rejected=true});
    http.expectOne(`${API_CONFIG.baseUrl}/auth/signup/request-otp`).flush({success:false,data:null});expect(rejected).toBeTrue();expect(signupOtpWait('+919876543210')).toBe(0);
  });

  it('keeps verification compatible with signup sessions created before role was stored', () => {
    service.verifySignupOtp('+918505838433', '903744').subscribe();
    const request = http.expectOne(`${API_CONFIG.baseUrl}/auth/signup/verify-otp`);
    expect(request.request.body).toEqual(jasmine.objectContaining({ phone: '+918505838433', otp: '903744' }));
    expect(request.request.body.role).toBeUndefined();
    request.flush({
      success: true,
      data: {
        user: { uuid: 'u-2', email: 'legacy@example.test', full_name: 'Legacy User' },
        access_token: 'access-2',
        refresh_token: 'refresh-2',
        expires_in: 3600,
      },
    });
  });
});
