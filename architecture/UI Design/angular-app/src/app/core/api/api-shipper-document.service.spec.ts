import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiShipperDocumentService } from './api-shipper-document.service';
import { documentFixture, documentUuid } from '../../features/shipper/documents/document.fixtures';
describe('Private shipper document HTTP contracts', () => {
  let api: ApiShipperDocumentService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiShipperDocumentService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('sends only bounded read filters, never a client-chosen owner/company', () => {
    api.list(2, 'approved', 'Delhi').subscribe(); const r = http.expectOne((r) => r.url.endsWith('/account/documents'));
    expect(r.request.method).toBe('GET'); expect(r.request.params.get('per_page')).toBe('20'); expect(r.request.params.get('owner_uuid')).toBeNull();
    r.flush({ success: true, data: documentFixture, meta: { current_page: 2, last_page: 2, total: 21 } });
  });
  it('rejects missing or malformed totals, rows and KYC rather than fabricating state', () => {
    for (const data of [{ ...documentFixture, totals: {} }, { ...documentFixture, pods: [{ booking_uuid: 'sample' }] }, { ...documentFixture, kyc: {} }]) {
      let failed = false; api.list().subscribe({ error: () => failed = true });
      http.expectOne((r) => r.url.endsWith('/account/documents')).flush({ success: true, data, meta: { current_page: 1, last_page: 1, total: 1 } }); expect(failed).toBeTrue();
    }
  });
  it('fetches private binary originals from the exact typed record, not an arbitrary URL', () => {
    for (const kind of ['pod', 'kyc'] as const) {
      api.download(kind, documentUuid).subscribe(); const r = http.expectOne((r) => r.url.endsWith('/account/documents/' + (kind === 'pod' ? 'pods' : 'kyc') + '/' + documentUuid + '/download'));
      expect(r.request.method).toBe('GET'); expect(r.request.responseType).toBe('blob'); r.flush(new Blob(['original']));
    }
  });
});
