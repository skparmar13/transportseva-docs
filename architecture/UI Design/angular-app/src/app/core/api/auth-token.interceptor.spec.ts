import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authTokenInterceptor } from './auth-token.interceptor';

describe('authTokenInterceptor', () => {
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

  it('refreshes an expired access token and retries the original request', () => {
    localStorage.setItem('transportseva.access_token', 'expired-access');
    localStorage.setItem('transportseva.refresh_token', 'refresh-1');
    localStorage.setItem('transportseva.api_user', JSON.stringify({ uuid: 'user-1', full_name: 'Test User', role: 'customer' }));

    let response: unknown;
    httpClient.get('http://localhost:8000/api/loads').subscribe((value) => response = value);

    const first = http.expectOne('http://localhost:8000/api/loads');
    expect(first.request.headers.get('Authorization')).toBe('Bearer expired-access');
    first.flush({ success: false, message: 'Invalid or expired token' }, { status: 401, statusText: 'Unauthorized' });

    const refresh = http.expectOne('http://localhost:8000/api/auth/refresh');
    expect(refresh.request.body).toEqual({ refresh_token: 'refresh-1' });
    refresh.flush({ success: true, data: { access_token: 'access-2', refresh_token: 'refresh-2', expires_in: 900 } });

    const retry = http.expectOne('http://localhost:8000/api/loads');
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

    httpClient.get('http://localhost:8000/api/loads').subscribe({ error: (value) => error = value });
    http.expectOne('http://localhost:8000/api/loads').flush({ success: false }, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('http://localhost:8000/api/auth/refresh').flush({ success: false, message: 'Invalid or expired refresh token' }, { status: 401, statusText: 'Unauthorized' });

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(localStorage.getItem('transportseva.access_token')).toBeNull();
    expect(localStorage.getItem('transportseva.refresh_token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { reason: 'session-expired' } });
  });
});
