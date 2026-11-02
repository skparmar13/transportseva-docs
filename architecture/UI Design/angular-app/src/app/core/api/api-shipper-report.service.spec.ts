import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiShipperReportService } from './api-shipper-report.service';
import { reportFixture } from '../../features/shipper/reports/report.fixtures';
describe('Private report HTTP contracts', () => {
  let api: ApiShipperReportService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiShipperReportService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('sends bounded server paging without owner/company claims', () => {
    api.list({ table: 'loads' }, 2).subscribe(); const r = http.expectOne((r) => r.url.endsWith('/account/reports'));
    expect(r.request.method).toBe('GET'); expect(r.request.params.get('per_page')).toBe('20'); expect(r.request.params.get('owner_uuid')).toBeNull();
    r.flush({ success: true, data: reportFixture, meta: { current_page: 2, last_page: 2, total: 21 } });
  });
  it('rejects incomplete summary counts and non-real row identifiers', () => {
    for (const data of [{ ...reportFixture, summary: {} }, { ...reportFixture, rows: [{ uuid: 'sample', reference: 'fake' }] }]) {
      let failed = false; api.list({ table: 'loads' }).subscribe({ error: () => failed = true });
      http.expectOne((r) => r.url.endsWith('/account/reports')).flush({ success: true, data, meta: { current_page: 1, last_page: 1, total: 1 } }); expect(failed).toBeTrue();
    }
  });
  it('rejects a different table or period instead of labelling incorrect figures as applied', () => {
    let failed = false; api.list({ table: 'loads', from: '2026-10-31' }).subscribe({ error: () => failed = true });
    http.expectOne((r) => r.url.endsWith('/account/reports')).flush({ success: true, data: reportFixture, meta: { current_page: 1, last_page: 1, total: 1 } }); expect(failed).toBeTrue();
  });
  it('encodes export filters and omits paging to retrieve all matching server rows', () => {
    api.export({ table: 'bookings', from: '2026-10-31', q: 'A&B%' }).subscribe();
    const r = http.expectOne((r) => r.url.includes('/account/reports/export?'));
    expect(r.request.method).toBe('GET'); expect(r.request.responseType).toBe('blob'); expect(r.request.url).toContain('q=A%26B%25'); expect(r.request.url).not.toContain('page=');
    r.flush(new Blob(['actual CSV']));
  });
});
