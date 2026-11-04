import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiTruckOwnerReportService } from './api-truck-owner-report.service';
import { ownerReportFixture } from '../../features/truck-owner/reports/report.fixtures';

describe('Truck owner report HTTP contracts', () => {
  let api: ApiTruckOwnerReportService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiTruckOwnerReportService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('requests only provider report filters and keeps server totals beyond the page', () => {
    api.list({ table: 'applications', q: ' QA ' }, 2).subscribe((r) => { expect(r.matching).toBe(21); expect(r.summary.applications.total).toBe(4); });
    const r = http.expectOne((r) => r.url.endsWith('/account/truck-owner/reports'));
    expect(r.request.method).toBe('GET'); expect(r.request.params.get('page')).toBe('2'); expect(r.request.params.get('q')).toBe('QA');
    expect(r.request.params.has('provider_uuid')).toBeFalse(); expect(r.request.params.get('per_page')).toBe('20');
    r.flush({ success: true, data: { ...ownerReportFixture, filters: { ...ownerReportFixture.filters, q: 'QA' } }, meta: { current_page: 2, last_page: 2, total: 21 } });
  });
  it('rejects wrong cohorts, unsafe record identities and missing counters rather than showing fake success', () => {
    for (const data of [
      { ...ownerReportFixture, summary: {} },
      { ...ownerReportFixture, filters: { ...ownerReportFixture.filters, timezone: 'UTC' } },
      { ...ownerReportFixture, rows: [{ ...ownerReportFixture.rows[0], booking_uuid: '/external' }] },
    ]) {
      let failed = false; api.list({ table: 'applications' }).subscribe({ error: () => failed = true });
      http.expectOne((r) => r.url.endsWith('/account/truck-owner/reports')).flush({ success: true, data, meta: { current_page: 1, last_page: 1, total: 1 } });
      expect(failed).toBeTrue();
    }
  });
  it('exports the selected full filter set without pagination or account selectors', () => {
    const blob = new Blob(['original csv']);
    api.export({ table: 'bookings', from: '2026-11-01', to: '2026-11-04', q: 'Actual' }).subscribe((r) => expect(r).toEqual(blob));
    const r = http.expectOne((r) => r.url.includes('/account/truck-owner/reports/export?'));
    expect(r.request.responseType).toBe('blob');
    const url = new URL(r.request.url); expect(url.searchParams.get('table')).toBe('bookings');
    expect(url.searchParams.get('from')).toBe('2026-11-01'); expect(url.searchParams.has('page')).toBeFalse();
    expect(url.searchParams.has('provider_uuid')).toBeFalse(); r.flush(blob);
  });
});
