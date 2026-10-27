import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiAdminAccessService } from './api-admin-access.service';
import { API_CONFIG } from './api-config';

describe('Admin access read APIs', () => {
  let http: HttpTestingController;
  let api: ApiAdminAccessService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController); api = TestBed.inject(ApiAdminAccessService);
  });
  afterEach(() => http.verify());
  it('sends bounded server-side audit filters and preserves pagination', () => {
    let total = 0;
    api.activity(2, 'Review', 'target-uuid').subscribe((page) => total = page.meta.total);
    const request = http.expectOne((r) => r.url === `${API_CONFIG.baseUrl}/admin/audit-events`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('per_page')).toBe('25');
    expect(request.request.params.get('category')).toBe('Review');
    expect(request.request.params.get('target_uuid')).toBe('target-uuid');
    request.flush({ data: [], meta: { current_page: 2, last_page: 3, total: 63 } });
    expect(total).toBe(63);
  });
  it('loads real role records without issuing any save operation', () => {
    api.roles().subscribe();
    const request = http.expectOne((r) => r.url === `${API_CONFIG.baseUrl}/admin/access/roles`);
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } });
  });
});
