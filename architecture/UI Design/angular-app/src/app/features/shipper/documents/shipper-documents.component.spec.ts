import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperDocumentService } from '../../../core/api/api-shipper-document.service';
import { LanguageService } from '../../../core/i18n';
import { ShipperDocumentsComponent } from './shipper-documents.component';
import { documentFixture, documentUuid } from './document.fixtures';

describe('Private Shipper Documents', () => {
  const config = API_CONFIG as { useBackend: boolean }; let original: boolean;
  let api: jasmine.SpyObj<ApiShipperDocumentService>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true;
    api = jasmine.createSpyObj('ApiShipperDocumentService', ['list', 'download']);
    api.list.and.returnValue(of(structuredClone(documentFixture)));
    api.download.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiShipperDocumentService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  const create = () => { const f = TestBed.createComponent(ShipperDocumentsComponent); f.detectChanges(); return f; };
  it('shows real metadata, separate global totals, exact booking/trip links and formatted dates', () => {
    const f = create(); const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('TS-QA-DOCUMENT'); expect(el.querySelector('[data-document-total=total]')?.textContent).toBe('9');
    expect(el.querySelector('[data-document-row] a')?.getAttribute('href')).toBe('/shipper/bookings?booking=' + documentUuid);
    expect(el.textContent).toMatch(/30\/10\/2026 \d{2}:\d{2} (AM|PM)/);
    expect(el.querySelector('input[type=file]')).toBeNull(); expect(el.textContent).toContain('identity documents belong to their owners');
  });
  it('renders no fake fleet/driver documents and has a true empty POD and KYC state', () => {
    api.list.and.returnValue(of({ ...documentFixture, pods: [], kyc: null, matching: 0, totals: { total: 0, approved: 0, pending_approval: 0, rejected: 0, other: 0 } }));
    const f = create(); expect(f.nativeElement.textContent).toContain('No POD documents have been submitted');
    (f.componentInstance as any).tab.set('kyc'); f.detectChanges(); expect(f.nativeElement.textContent).toContain('not submitted a business KYC');
    expect(f.nativeElement.querySelector('[data-document-kyc] a').getAttribute('href')).toBe('/shipper/kyc');
  });
  it('animates loading and prevents duplicate requests', () => {
    const pending = new Subject<typeof documentFixture>(); api.list.and.returnValue(pending);
    const f = create(); (f.componentInstance as any).load(); expect(api.list).toHaveBeenCalledTimes(1); expect(f.nativeElement.querySelector('.doc-spinner')).not.toBeNull();
    pending.next(documentFixture); f.detectChanges(); expect(f.nativeElement.querySelector('.doc-spinner')).toBeNull();
  });
  it('clears prior private results on a failed refresh and retries the requested page', () => {
    const f = create(); const c = f.componentInstance as any;
    api.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 }))); c.load(2); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-document-row]')).toBeNull(); expect(f.nativeElement.querySelector('[data-document-kyc]')).toBeNull();
    expect(f.nativeElement.textContent).toContain('could not be loaded'); api.list.and.returnValue(of(documentFixture)); c.load(c.page()); expect(api.list.calls.mostRecent().args[0]).toBe(2);
  });
  it('passes review/search filters and distinguishes no matches from no submitted records', () => {
    const f = create(); const c = f.componentInstance as any; c.search.set(' POD-123 '); c.status.set('rejected');
    api.list.and.returnValue(of({ ...documentFixture, pods: [], matching: 0 })); c.load(); f.detectChanges();
    expect(api.list).toHaveBeenCalledWith(1, 'rejected', 'POD-123'); expect(f.nativeElement.textContent).toContain('match these filters');
  });
  it('does not query or fall back to samples in disconnected mode', () => {
    config.useBackend = false; const f = create(); expect(api.list).not.toHaveBeenCalled(); expect(f.nativeElement.textContent).toContain('No sample documents');
  });
  it('shows review notes as escaped text and never invents missing reviewed dates', () => {
    const f = create(); expect(f.nativeElement.textContent).toContain('<script>escaped review note</script>');
    expect(f.nativeElement.querySelector('script')).toBeNull(); expect(f.nativeElement.textContent).toContain('Reviewed: Not recorded');
  });
  it('preserves approved/rejected state when the original file is missing', () => {
    const fixture = structuredClone(documentFixture); fixture.pods[0].download_available = false; fixture.kyc!.download_available = false;
    api.list.and.returnValue(of(fixture)); const f = create(); expect(f.nativeElement.querySelector('[data-document-status]').textContent).toBe('Approved');
    expect(f.nativeElement.querySelector('[data-file-unavailable]')).not.toBeNull();
    (f.componentInstance as any).tab.set('kyc'); f.detectChanges(); expect(f.nativeElement.querySelector('[data-kyc-status]').textContent).toBe('Approved');
    expect(f.nativeElement.querySelector('[data-file-unavailable]')).not.toBeNull();
  });
  it('uses the correct private KYC record and management route', () => {
    const f = create(); const c = f.componentInstance as any; c.tab.set('kyc'); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Own Legal Business'); c.download('kyc', documentFixture.kyc!.uuid, 'identity.pdf', true);
    expect(api.download).toHaveBeenCalledWith('kyc', documentFixture.kyc!.uuid);
  });
  it('animates original downloads, guards duplicates/refresh and reports missing originals honestly', () => {
    const pending = new Subject<Blob>(); api.download.and.returnValue(pending); const f = create(); const c = f.componentInstance as any;
    c.download('pod', documentUuid, 'original.pdf', true); c.download('pod', documentUuid, 'original.pdf', true); c.load(); f.detectChanges();
    expect(api.download).toHaveBeenCalledOnceWith('pod', documentUuid); expect(api.list).toHaveBeenCalledTimes(1);
    expect(f.nativeElement.querySelector('.doc-spinner')).not.toBeNull(); pending.error(new HttpErrorResponse({ status: 404 })); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('could not be downloaded'); expect(c.downloading()).toBe('');
  });
  it('downloads actual bytes with a safe original filename rather than generated text', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:docs-qa'); spyOn(URL, 'revokeObjectURL'); const click = spyOn(HTMLAnchorElement.prototype, 'click').and.stub();
    const blob = new Blob(['original document bytes'], { type: 'application/pdf' }); api.download.and.returnValue(of(blob));
    const f = create(); (f.componentInstance as any).download('pod', documentUuid, '../unsafe\\name.pdf', true);
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob); expect((click.calls.mostRecent().object as HTMLAnchorElement).download).toBe('.._unsafe_name.pdf');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:docs-qa');
  });
  it('does not issue a download when the API says the original is unavailable', () => {
    const f = create(); (f.componentInstance as any).download('pod', documentUuid, 'missing.pdf', false); expect(api.download).not.toHaveBeenCalled();
  });
  it('shows Hindi copy and cancels outstanding requests when destroyed', () => {
    const pending = new Subject<typeof documentFixture>(); api.list.and.returnValue(pending); const f = create();
    TestBed.inject(LanguageService).setLang('hi'); f.detectChanges(); expect(f.nativeElement.textContent).toContain('दस्तावेज़');
    expect(pending.observed).toBeTrue(); f.destroy(); expect(pending.observed).toBeFalse();
  });
});
