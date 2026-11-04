import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiTruckOwnerDocumentService } from './api-truck-owner-document.service';
import { documentFixture, documentUuid } from '../../features/shipper/documents/document.fixtures';

describe('Private truck owner document HTTP contracts', () => {
  let api: ApiTruckOwnerDocumentService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), ApiTruckOwnerDocumentService] });
    api = TestBed.inject(ApiTruckOwnerDocumentService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses the provider endpoint and preserves real paging without caller-selected ownership', () => {
    api.list(2, 'approved', '100%_original').subscribe((r) => expect(r.matching).toBe(21));
    const r = http.expectOne((r) => r.url.endsWith('/account/truck-owner/documents'));
    expect(r.request.method).toBe('GET'); expect(r.request.params.get('page')).toBe('2');
    expect(r.request.params.get('status')).toBe('approved'); expect(r.request.params.get('q')).toBe('100%_original');
    expect(r.request.params.has('provider_uuid')).toBeFalse(); expect(r.request.params.has('owner_uuid')).toBeFalse();
    r.flush({ success: true, data: documentFixture, meta: { current_page: 2, last_page: 2, total: 21 } });
  });
  it('downloads both exact typed originals through the private provider endpoint', () => {
    for (const kind of ['pod', 'kyc'] as const) {
      const original = new Blob(['private original ' + kind]);
      api.download(kind, documentUuid).subscribe((blob) => expect(blob).toEqual(original));
      const r = http.expectOne((r) => r.url.endsWith('/account/truck-owner/documents/' + (kind === 'pod' ? 'pods' : 'kyc') + '/' + documentUuid + '/download'));
      expect(r.request.method).toBe('GET'); expect(r.request.responseType).toBe('blob'); r.flush(original);
    }
  });
  it('rejects malformed success responses while accepting an actual empty hub', () => {
    let failed = false; api.list().subscribe({ error: () => failed = true });
    http.expectOne((r) => r.url.endsWith('/account/truck-owner/documents')).flush({ success: true, data: { pods: [] } });
    expect(failed).toBeTrue();
    const empty = { ...documentFixture, pods: [], kyc: null, totals: { total: 0, approved: 0, pending_approval: 0, rejected: 0, other: 0 } };
    api.list().subscribe((r) => { expect(r.totals.total).toBe(0); expect(r.kyc).toBeNull(); });
    http.expectOne((r) => r.url.endsWith('/account/truck-owner/documents')).flush({ success: true, data: empty, meta: { current_page: 1, last_page: 1, total: 0 } });
  });
});
