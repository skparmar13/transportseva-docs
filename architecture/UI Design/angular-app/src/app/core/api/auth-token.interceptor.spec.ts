import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authTokenInterceptor } from './auth-token.interceptor';
import { API_CONFIG } from './api-config';

describe('authTokenInterceptor', () => {
  it('submits public contact enquiries anonymously without refreshing or dropping a stored session', () => {
    localStorage.setItem('transportseva.access_token', 'stored-session');
    httpClient.post(API_CONFIG.baseUrl + '/public/contact-inquiries', {}).subscribe({ error: () => undefined });
    const r = http.expectOne(API_CONFIG.baseUrl + '/public/contact-inquiries'); expect(r.request.headers.has('Authorization')).toBeFalse(); r.flush({}, { status: 503, statusText: 'Unavailable' });
    http.expectNone(API_CONFIG.baseUrl + '/auth/refresh'); expect(localStorage.getItem('transportseva.access_token')).toBe('stored-session');
  });
  it('redirects an onboarding denial to the validated profile path without signing out', () => {
    localStorage.setItem('transportseva.access_token', 'valid-session');
    const go = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    httpClient.get(API_CONFIG.baseUrl + '/loads').subscribe({ error: () => undefined });
    http.expectOne(API_CONFIG.baseUrl + '/loads').flush({ code: 'ACCOUNT_ONBOARDING_REQUIRED', data: { profile_url: '/shipper/profile' } }, { status: 403, statusText: 'Forbidden' });
    expect(go).toHaveBeenCalledWith('/shipper/profile');
    expect(localStorage.getItem('transportseva.access_token')).toBe('valid-session');
    http.expectNone(API_CONFIG.baseUrl + '/auth/refresh');
  });
  let httpClient: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('sends anonymous recovery requests without refreshing or clearing an unrelated session', () => {
    localStorage.setItem('transportseva.access_token', 'existing-session');
    localStorage.setItem('transportseva.refresh_token', 'existing-refresh');
    httpClient.post(API_CONFIG.baseUrl + '/auth/password/verify-otp', {}).subscribe({ error: () => undefined });
    const request = http.expectOne(API_CONFIG.baseUrl + '/auth/password/verify-otp');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectNone(API_CONFIG.baseUrl + '/auth/refresh');
    expect(localStorage.getItem('transportseva.access_token')).toBe('existing-session');
  });

  it('refreshes an expired access token and retries the original request', () => {
    localStorage.setItem('transportseva.access_token', 'expired-access');
    localStorage.setItem('transportseva.refresh_token', 'refresh-1');
    localStorage.setItem('transportseva.api_user', JSON.stringify({ uuid: 'user-1', full_name: 'Test User', role: 'customer' }));

    let response: unknown;
    httpClient.get(`${API_CONFIG.baseUrl}/loads`).subscribe((value) => response = value);

    const first = http.expectOne(`${API_CONFIG.baseUrl}/loads`);
    expect(first.request.headers.get('Authorization')).toBe('Bearer expired-access');
    first.flush({ success: false, message: 'Invalid or expired token' }, { status: 401, statusText: 'Unauthorized' });

    const refresh = http.expectOne(`${API_CONFIG.baseUrl}/auth/refresh`);
    expect(refresh.request.body).toEqual({ refresh_token: 'refresh-1' });
    refresh.flush({ success: true, data: { access_token: 'access-2', refresh_token: 'refresh-2', expires_in: 900 } });

    const retry = http.expectOne(`${API_CONFIG.baseUrl}/loads`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer access-2');
    retry.flush({ success: true, data: [] });

    expect(response).toEqual({ success: true, data: [] });
    expect(localStorage.getItem('transportseva.access_token')).toBe('access-2');
    expect(localStorage.getItem('transportseva.refresh_token')).toBe('refresh-2');
  });

  it('clears the session and redirects only when the refresh token is unusable', () => {
    localStorage.setItem('transportseva.access_token', 'expired-access');
    localStorage.setItem('transportseva.refresh_token', 'refresh-1');
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    let error: unknown;

    httpClient.get(`${API_CONFIG.baseUrl}/loads`).subscribe({ error: (value) => error = value });
    http.expectOne(`${API_CONFIG.baseUrl}/loads`).flush({ success: false }, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${API_CONFIG.baseUrl}/auth/refresh`).flush({ success: false, message: 'Invalid or expired refresh token' }, { status: 401, statusText: 'Unauthorized' });

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(localStorage.getItem('transportseva.access_token')).toBeNull();
    expect(localStorage.getItem('transportseva.refresh_token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { reason: 'session-expired' } });
  });

  for (const status of [0, 503]) {
    it(`retains the session after a temporary refresh failure (${status})`, () => {
      localStorage.setItem('transportseva.access_token', 'expired-access');
      localStorage.setItem('transportseva.refresh_token', 'refresh-1');
      localStorage.setItem('transportseva.api_user', '{"uuid":"user-1"}');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      let error: HttpErrorResponse | undefined;

      httpClient.get(`${API_CONFIG.baseUrl}/loads`).subscribe({ error: (value) => error = value });
      http.expectOne(`${API_CONFIG.baseUrl}/loads`).flush({}, { status: 401, statusText: 'Unauthorized' });
      const refresh = http.expectOne(`${API_CONFIG.baseUrl}/auth/refresh`);
      if (status === 0) refresh.error(new ProgressEvent('error'));
      else refresh.flush({}, { status, statusText: 'Service Unavailable' });

      expect(error?.status).toBe(status);
      expect(localStorage.getItem('transportseva.access_token')).toBe('expired-access');
      expect(localStorage.getItem('transportseva.refresh_token')).toBe('refresh-1');
      expect(localStorage.getItem('transportseva.api_user')).toBe('{"uuid":"user-1"}');
      expect(navigate).not.toHaveBeenCalled();
    });
  }

  for (const status of [403, 503]) {
    it(`retains the renewed session when the retried business request fails (${status})`, () => {
      localStorage.setItem('transportseva.access_token', 'expired-access');
      localStorage.setItem('transportseva.refresh_token', 'refresh-1');
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      let error: HttpErrorResponse | undefined;

      httpClient.get(`${API_CONFIG.baseUrl}/loads`).subscribe({ error: (value) => error = value });
      http.expectOne(`${API_CONFIG.baseUrl}/loads`).flush({}, { status: 401, statusText: 'Unauthorized' });
      http.expectOne(`${API_CONFIG.baseUrl}/auth/refresh`).flush({ success: true, data: { access_token: 'access-2', refresh_token: 'refresh-2', expires_in: 900 } });
      http.expectOne(`${API_CONFIG.baseUrl}/loads`).flush({}, { status, statusText: 'Request Failed' });

      expect(error?.status).toBe(status);
      expect(localStorage.getItem('transportseva.access_token')).toBe('access-2');
      expect(localStorage.getItem('transportseva.refresh_token')).toBe('refresh-2');
      expect(navigate).not.toHaveBeenCalled();
    });
  }

  it('expires the session if the renewed access token is also rejected', () => {
    localStorage.setItem('transportseva.access_token', 'expired-access');
    localStorage.setItem('transportseva.refresh_token', 'refresh-1');
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    httpClient.get(`${API_CONFIG.baseUrl}/loads`).subscribe({ error: () => undefined });
    http.expectOne(`${API_CONFIG.baseUrl}/loads`).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${API_CONFIG.baseUrl}/auth/refresh`).flush({ success: true, data: { access_token: 'access-2', refresh_token: 'refresh-2', expires_in: 900 } });
    http.expectOne(`${API_CONFIG.baseUrl}/loads`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('transportseva.access_token')).toBeNull();
    expect(localStorage.getItem('transportseva.refresh_token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { reason: 'session-expired' } });
  });

  it('shares one token refresh between concurrent expired requests', () => {
    localStorage.setItem('transportseva.access_token', 'expired-access');
    localStorage.setItem('transportseva.refresh_token', 'refresh-1');
    let responses = 0;
    httpClient.get(`${API_CONFIG.baseUrl}/loads`).subscribe(() => responses++);
    httpClient.get(`${API_CONFIG.baseUrl}/bookings`).subscribe(() => responses++);
    http.expectOne(`${API_CONFIG.baseUrl}/loads`).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${API_CONFIG.baseUrl}/bookings`).flush({}, { status: 401, statusText: 'Unauthorized' });

    http.expectOne(`${API_CONFIG.baseUrl}/auth/refresh`).flush({ success: true, data: { access_token: 'access-2', refresh_token: 'refresh-2', expires_in: 900 } });
    for (const path of ['loads', 'bookings']) {
      const retry = http.expectOne(`${API_CONFIG.baseUrl}/${path}`);
      expect(retry.request.headers.get('Authorization')).toBe('Bearer access-2');
      retry.flush({ success: true, data: [] });
    }
    expect(responses).toBe(2);
  });
});
