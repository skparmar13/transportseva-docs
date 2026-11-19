import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiAdminDashboardService, AdminDashboard } from './api-admin-dashboard.service';
import { API_CONFIG } from './api-config';

describe('Admin operational dashboard adapter', () => {
  let api: ApiAdminDashboardService; let http: HttpTestingController;
  const path = API_CONFIG.baseUrl+'/admin/dashboard';
  const empty: AdminDashboard = { dashboard_type: 'admin', generated_at: '2026-11-19T10:00:00Z', sections: [], totals: {}, recent_activity: [] };
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiAdminDashboardService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('uses a single scope-free GET and preserves legitimate zeros', () => {
    let value: unknown; api.get().subscribe(v => value = v); const r = http.expectOne(path);
    expect(r.request.method).toBe('GET'); expect(r.request.params.keys()).toEqual([]);
    const data = { ...empty, sections: ['reviews'], totals: { pending_reviews: 0 } }; r.flush({ success: true, data }); expect(value).toEqual(data);
  });
  it('rejects missing, negative, unauthorized and incomplete totals rather than displaying invented zeros', () => {
    for (const data of [null, { ...empty, sections: ['unknown'] }, { ...empty, sections: ['reviews'] }, { ...empty, sections: ['reviews'], totals: { pending_reviews: -1 } },
      { ...empty, totals: { pending_reviews: 1 } }, { ...empty, sections: ['reviews', 'reviews'], totals: { pending_reviews: 1 } }]) {
      let failed = false; api.get().subscribe({ next: () => fail('Invalid summary accepted'), error: () => failed = true });
      http.expectOne(path).flush({ success: true, data }); expect(failed).toBeTrue();
    }
  });
  it('rejects activity without audit access and invalid or unbounded activity rows', () => {
    const event = { uuid: '12345678-1234-1234-1234-123456789012', action: 'review.approved', category: 'Review', target_uuid: null, created_at: '2026-11-19T10:00:00Z' };
    for (const data of [{ ...empty, recent_activity: [event] }, { ...empty, sections: ['audit'], recent_activity: Array(11).fill(event) },
      { ...empty, sections: ['audit'], recent_activity: [{ ...event, target_uuid: 'not-a-uuid' }] }]) {
      let failed = false; api.get().subscribe({ next: () => fail('Unsafe activity accepted'), error: () => failed = true });
      http.expectOne(path).flush({ success: true, data }); expect(failed).toBeTrue();
    }
  });
});
