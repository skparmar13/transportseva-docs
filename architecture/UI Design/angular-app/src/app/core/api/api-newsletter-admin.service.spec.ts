import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiNewsletterAdminService } from './api-newsletter-admin.service';
import { API_CONFIG } from './api-config';

describe('Newsletter private read adapter', () => {
  let api: ApiNewsletterAdminService; let http: HttpTestingController;
  const path = API_CONFIG.baseUrl + '/admin/newsletter/subscribers';
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiNewsletterAdminService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('uses bounded GET paging and exact email/status filters, without any write', () => {
    let result: any; api.list(2, 'pending', 'qa@example.test').subscribe(v => result = v);
    const r = http.expectOne(req => req.url === path && req.params.get('page') === '2');
    expect(r.request.method).toBe('GET'); expect(r.request.params.get('per_page')).toBe('25');
    expect(r.request.params.get('email')).toBe('qa@example.test'); expect(r.request.params.get('status')).toBe('pending');
    r.flush({ success: true, data: [], meta: { current_page: 2, last_page: 2, total: 26, summary: { total: 50, pending: 26, subscribed: 12, unsubscribed: 12 } } });
    expect(result.total).toBe(26); expect(result.summary.total).toBe(50);
  });
  it('rejects missing metadata and contradictory totals instead of inventing empty success', () => {
    for (const meta of [null, { current_page: 1, last_page: 1, total: 0, summary: { total: 9, pending: 0, subscribed: 0, unsubscribed: 0 } }]) {
      let error: unknown; api.list(1, 'all', '').subscribe({ next: () => fail('Malformed list accepted'), error: e => error = e });
      http.expectOne(req => req.url === path).flush({ success: true, data: [], meta }); expect(error).toEqual(jasmine.any(Error));
    }
  });
  it('rejects a different subscriber or unsupported history state', () => {
    let error: unknown; api.detail('requested-id', 1).subscribe({ next: () => fail('Wrong detail accepted'), error: e => error = e });
    http.expectOne(path+'/requested-id?page=1').flush({ success: true, data: { subscriber: { uuid: 'other-id', email: 'qa@example.test', status: 'pending', created_at: '2026-11-18' }, requests: [], history: { page: 1, last_page: 1, total: 0 } } });
    expect(error).toEqual(jasmine.any(Error));
  });
});
