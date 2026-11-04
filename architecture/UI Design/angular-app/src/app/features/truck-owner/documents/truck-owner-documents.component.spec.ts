import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperDocumentService } from '../../../core/api/api-shipper-document.service';
import { LanguageService } from '../../../core/i18n';
import { ShipperDocumentsComponent } from '../../shipper/documents/shipper-documents.component';
import { documentFixture } from '../../shipper/documents/document.fixtures';

describe('Shared Documents in the guarded truck owner portal', () => {
  const config = API_CONFIG as { useBackend: boolean };
  let original: boolean;
  let api: jasmine.SpyObj<ApiShipperDocumentService>;
  let query: Record<string, string>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true; query = {};
    api = jasmine.createSpyObj('providerDocuments', ['list', 'download']);
    api.list.and.returnValue(of(structuredClone(documentFixture)));
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), { provide: ApiShipperDocumentService, useValue: api },
      { provide: ActivatedRoute, useFactory: () => ({
        snapshot: { ...TestBed.inject(Router).routerState.snapshot.root, data: { documentPortal: 'truck-owner' }, queryParamMap: convertToParamMap(query) },
      }) },
    ] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  it('renders actual PODs and directs booking/trip actions to the owner portal', () => {
    const f = TestBed.createComponent(ShipperDocumentsComponent); f.detectChanges();
    const links = [...f.nativeElement.querySelectorAll('a')].map((a: any) => a.getAttribute('href'));
    const uuid = documentFixture.pods[0].booking_uuid;
    expect(links).toContain('/truck-owner/bookings?booking=' + uuid);
    expect(links).toContain('/truck-owner/trips/' + uuid);
    expect(links.some((href) => href?.startsWith('/shipper/'))).toBeFalse();
    expect(f.nativeElement.textContent).toContain('TS-QA-DOCUMENT');
    expect(f.nativeElement.textContent).toContain('Open booking / POD actions');
  });
  it('honors the KYC deep link and opens the owning KYC workflow', () => {
    query = { tab: 'kyc' };
    const f = TestBed.createComponent(ShipperDocumentsComponent); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-document-kyc]')).not.toBeNull();
    expect(f.nativeElement.textContent).toContain(documentFixture.kyc!.business_name);
    expect(f.nativeElement.querySelector('[data-document-kyc] a').getAttribute('href')).toBe('/truck-owner/kyc');
    expect(f.nativeElement.querySelector('input[type=file]')).toBeNull();
  });
  it('keeps recorded review status visible when originals are unavailable', () => {
    api.list.and.returnValue(of({ ...structuredClone(documentFixture), pods: [{ ...documentFixture.pods[0], download_available: false }] }));
    const f = TestBed.createComponent(ShipperDocumentsComponent); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-document-status]').textContent).toBe('Approved');
    expect(f.nativeElement.querySelector('[data-file-unavailable]')).not.toBeNull();
    expect(f.nativeElement.querySelector('[data-document-row] button')).toBeNull();
  });
  it('supports Hindi and cancels an unfinished provider read on page destruction', () => {
    const pending = new Subject<typeof documentFixture>(); api.list.and.returnValue(pending);
    TestBed.inject(LanguageService).setLang('hi');
    const f = TestBed.createComponent(ShipperDocumentsComponent); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('दस्तावेज़');
    expect(f.nativeElement.textContent).toContain('POD अपलोड और सुधार बुकिंग में करें');
    expect(pending.observed).toBeTrue(); f.destroy(); expect(pending.observed).toBeFalse();
  });
});
