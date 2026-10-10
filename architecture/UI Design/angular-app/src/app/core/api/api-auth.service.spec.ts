import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiAuthService } from './api-auth.service';

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
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('sends the selected signup role with OTP verification and stores returned session', () => {
    let result: unknown;
    service.verifySignupOtp('+918505838433', '903744', 'truck-owner').subscribe((data) => result = data);

    const request = http.expectOne('http://localhost:8000/api/auth/signup/verify-otp');
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
    const request = http.expectOne('http://localhost:8000/api/auth/signup/request-otp');
    expect(request.request.body).toEqual({ phone: '+918505838433' });
    request.flush({ success: true, data: { debug_otp: '903744' } });
  });

  it('keeps verification compatible with signup sessions created before role was stored', () => {
    service.verifySignupOtp('+918505838433', '903744').subscribe();
    const request = http.expectOne('http://localhost:8000/api/auth/signup/verify-otp');
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
