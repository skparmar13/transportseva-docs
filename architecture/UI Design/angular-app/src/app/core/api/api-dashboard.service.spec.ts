import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiDashboardService } from './api-dashboard.service';
import { API_CONFIG } from './api-config';

describe('ApiDashboardService', () => {
  let api: ApiDashboardService; let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiDashboardService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('requests a self-scoped shipper summary with no owner or role parameter', () => {
    let result: unknown; api.shipper().subscribe((data) => result = data);
    const request = http.expectOne(API_CONFIG.baseUrl + '/marketplace-dashboard');
    expect(request.request.params.keys()).toEqual([]);
    request.flush({ success: true, data: { dashboard_type: 'shipper', totals: { loads_posted: 125 }, recent_loads: [] } });
    expect(result).toEqual(jasmine.objectContaining({ totals: { loads_posted: 125 } }));
  });
  it('requests a provider summary through the same identity-derived endpoint', () => {
    let result: unknown; api.provider().subscribe((data) => result = data);
    const request = http.expectOne(API_CONFIG.baseUrl + '/marketplace-dashboard');
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, data: { dashboard_type: 'provider', totals: { vehicles_total: 120 }, recent_vehicles: [] } });
    expect(result).toEqual(jasmine.objectContaining({ totals: { vehicles_total: 120 } }));
  });
  it('rejects a mismatched dashboard type rather than mixing another role into the screen', () => {
    let failed = false; api.shipper().subscribe({ error: () => failed = true });
    http.expectOne(API_CONFIG.baseUrl + '/marketplace-dashboard').flush({ success: true, data: { dashboard_type: 'provider' } });
    expect(failed).toBeTrue();
  });
  it('does not treat a failed success envelope as zero business totals', () => {
    let failed = false; api.provider().subscribe({ error: () => failed = true });
    http.expectOne(API_CONFIG.baseUrl + '/marketplace-dashboard').flush({ success: false, data: null });
    expect(failed).toBeTrue();
  });
});
