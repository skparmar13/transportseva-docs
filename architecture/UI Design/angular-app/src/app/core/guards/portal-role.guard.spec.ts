import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { API_CONFIG } from '../api/api-config';
import { ApiAuthService, BackendLoginUser } from '../api/api-auth.service';
import { SessionService } from '../services/session.service';
import { setPortalRole } from './portal-role.guard';

describe('Server-verified portal access', () => {
  const config = API_CONFIG as unknown as { useBackend: boolean };
  const originalBackend = config.useBackend;
  const customer: BackendLoginUser = { uuid: 'customer', email: 'customer@example.test', full_name: 'Customer', role: 'customer' };
  let api: jasmine.SpyObj<ApiAuthService>;
  beforeEach(() => {
    config.useBackend = true;
    localStorage.setItem('transportseva.access_token', 'test-token');
    api = jasmine.createSpyObj<ApiAuthService>('ApiAuthService', ['me']);
    api.me.and.returnValue(of(customer));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiAuthService, useValue: api }] });
  });
  afterEach(() => { config.useBackend = originalBackend; localStorage.removeItem('transportseva.access_token'); localStorage.removeItem('transportseva.api_user'); });
  async function check() {
    const result = TestBed.runInInjectionContext(() => setPortalRole('admin')({} as ActivatedRouteSnapshot, { url: '/admin/audit' } as RouterStateSnapshot));
    return isObservable(result) ? firstValueFrom(result) : await result;
  }
  it('redirects anonymous access before requesting admin data', async () => {
    localStorage.removeItem('transportseva.access_token');
    expect((await check() as UrlTree).toString()).toBe('/auth/login');
    expect(api.me).not.toHaveBeenCalled();
  });
  it('ignores a forged administrator in local storage', async () => {
    localStorage.setItem('transportseva.api_user', JSON.stringify({ role: 'admin' }));
    expect((await check() as UrlTree).toString()).toBe('/shipper/dashboard');
    expect(TestBed.inject(SessionService).role()).toBe('shipper');
  });
  it('does not treat a privileged role name on a customer as an administrator', async () => {
    api.me.and.returnValue(of({ ...customer, roles: ['Super Admin'] }));
    expect((await check() as UrlTree).toString()).toBe('/shipper/dashboard');
  });
  it('allows an administrator verified by the server', async () => {
    api.me.and.returnValue(of({ ...customer, role: 'admin' }));
    expect(await check()).toBeTrue();
  });
  it('routes an incomplete profile to profile setup', async () => {
    api.me.and.returnValue(of({ ...customer, profile_completion_required: true }));
    expect((await check() as UrlTree).toString()).toBe('/auth/profile-setup');
  });
  it('keeps credentials and offers a check retry on a transient API failure', async () => {
    api.me.and.returnValue(throwError(() => new Error('Temporary connection failure')));
    const result = await check() as UrlTree;
    expect(result.queryParams['reason']).toBe('access-check-failed');
    expect(result.queryParams['returnUrl']).toBe('/admin/audit');
    expect(localStorage.getItem('transportseva.access_token')).toBe('test-token');
  });
  it('retains the explicitly disconnected prototype behavior', async () => {
    config.useBackend = false;
    expect(await check()).toBeTrue();
    expect(api.me).not.toHaveBeenCalled();
  });
  it('does not call a confirmed authentication failure a transient check failure', async () => {
    api.me.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    expect((await check() as UrlTree).queryParams['reason']).toBe('session-expired');
  });
});
