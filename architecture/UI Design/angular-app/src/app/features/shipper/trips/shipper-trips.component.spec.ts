import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperTripService, ShipperTripDetail, ShipperTripList } from '../../../core/api/api-shipper-trip.service';
import { LanguageService } from '../../../core/i18n';
import { ShipperTripListComponent } from './shipper-trip-list.component';
import { ShipperTripDetailsComponent } from './shipper-trip-details.component';

import { tripDetailFixture, tripListFixture } from './shipper-trip.fixtures';
const uuid = tripDetailFixture.trip.uuid;

describe('Real shipper Trip History and Details', () => {
  const config = API_CONFIG as { useBackend: boolean }; let original: boolean;
  let api: jasmine.SpyObj<ApiShipperTripService>; let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true; params = new BehaviorSubject(convertToParamMap({ id: uuid }));
    api = jasmine.createSpyObj('ApiShipperTripService', ['list', 'get', 'downloadPod']);
    api.list.and.returnValue(of(structuredClone(tripListFixture))); api.get.and.returnValue(of(structuredClone(tripDetailFixture)));
    api.downloadPod.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ActivatedRoute, useFactory: () => ({ paramMap: params, snapshot: TestBed.inject(Router).routerState.snapshot.root }) }, { provide: ApiShipperTripService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  const list = () => { const f = TestBed.createComponent(ShipperTripListComponent); f.detectChanges(); return f; };
  const detail = () => { const f = TestBed.createComponent(ShipperTripDetailsComponent); f.detectChanges(); return f; };
  it('renders owned persisted rows and global totals with exact UUID links and standard dates', () => {
    const f = list(); expect(f.nativeElement.textContent).toContain('TS-QA-REAL'); expect(f.nativeElement.querySelector('[data-trip-total=total]').textContent).toBe('9'); expect(f.nativeElement.querySelector('[data-trip-row] a').getAttribute('href')).toBe('/shipper/trips/' + uuid); expect(f.nativeElement.textContent).toMatch(/30\/10\/2026 \d{2}:\d{2} (AM|PM)/);
  });
  it('shows a genuine zero state with no sample trips', () => {
    api.list.and.returnValue(of({ ...tripListFixture, rows: [], matching: 0, totals: Object.fromEntries(Object.keys(tripListFixture.totals).map((key) => [key, 0])) as ShipperTripList['totals'] }));
    const f = list(); expect(f.nativeElement.textContent).toContain('no booking/trip records yet'); expect(f.nativeElement.querySelector('[data-trip-total=total]').textContent).toBe('0'); expect(f.nativeElement.querySelector('[data-trip-row]')).toBeNull();
  });
  it('shows real loading and guards duplicate filter/refresh requests', () => {
    const pending = new Subject<typeof tripListFixture>(); api.list.and.returnValue(pending); const f = list(); (f.componentInstance as any).load(); expect(api.list).toHaveBeenCalledTimes(1); expect(f.nativeElement.querySelector('.trip-spinner')).not.toBeNull(); pending.next(tripListFixture); f.detectChanges(); expect(f.nativeElement.querySelector('.trip-spinner')).toBeNull();
  });
  it('keeps failed-page retries on the requested page with no fabricated rows', () => {
    const f = list(); api.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 }))); const c = f.componentInstance as any; c.load(2); f.detectChanges(); expect(f.nativeElement.textContent).toContain('could not be loaded'); expect(c.page()).toBe(2); c.load(c.page()); expect(api.list.calls.mostRecent().args[0]).toBe(2); expect(f.nativeElement.querySelector('[data-trip-row]')).toBeNull();
  });
  it('passes actual stage and search filters to the API and distinguishes empty matches from no records', () => {
    const f = list(); const c = f.componentInstance as any; c.stage.set('active'); c.search.set(' QATRIP1234 '); api.list.and.returnValue(of({ ...tripListFixture, rows: [], matching: 0 })); c.load(); f.detectChanges(); expect(api.list).toHaveBeenCalledWith(1, 'active', 'QATRIP1234'); expect(f.nativeElement.textContent).toContain('match these filters'); expect(f.nativeElement.querySelector('[data-trip-total=total]').textContent).toBe('9');
  });
  it('never uses samples or API mutations when the backend is disconnected', () => {
    config.useBackend = false; const f = list(); expect(api.list).not.toHaveBeenCalled(); expect(f.nativeElement.textContent).toContain('No sample trips'); detail(); expect(api.get).not.toHaveBeenCalled();
  });
  it('renders actual assignments and timeline times with an exact booking/POD link and no fake GPS', () => {
    const f = detail(); expect(api.get).toHaveBeenCalledWith(uuid); expect(f.nativeElement.querySelector('[data-trip-vehicle]').textContent).toBe('QATRIP1234'); expect(f.nativeElement.querySelector('[data-trip-booking-link]').getAttribute('href')).toBe('/shipper/bookings?booking=' + uuid);
    const c = f.componentInstance as any; c.tab.set('timelineLabel'); f.detectChanges(); expect(f.nativeElement.querySelectorAll('.trip-event').length).toBe(3); expect(f.nativeElement.textContent).toContain('Missing historical times'); expect(f.nativeElement.querySelector('iframe')).toBeNull();
  });
  it('renders POD remarks as text, not executable HTML, and never offers a shipper upload', () => {
    const f = detail(); (f.componentInstance as any).tab.set('podLabel'); f.detectChanges(); expect(f.nativeElement.textContent).toContain('<script>escaped only</script>'); expect(f.nativeElement.querySelector('script')).toBeNull(); expect(f.nativeElement.querySelector('input[type=file]')).toBeNull(); expect(f.nativeElement.querySelector('[data-trip-pod-status]').textContent).toBe('Approved');
  });
  it('shows honest missing original and missing recorded times', () => {
    api.get.and.returnValue(of({ ...tripDetailFixture, trip: { ...tripDetailFixture.trip, vehicle: null, started_at: null }, pod: { ...tripDetailFixture.pod, download_available: false } })); const f = detail(); expect(f.nativeElement.querySelector('[data-trip-vehicle]').textContent).toBe('Not assigned'); expect(f.nativeElement.textContent).toContain('Not recorded');
    (f.componentInstance as any).tab.set('podLabel'); f.detectChanges(); expect(f.nativeElement.textContent).toContain('No stored original POD'); expect(f.nativeElement.querySelector('.btn-primary')).toBeNull();
  });
  it('provides safe unavailable/retry states for foreign or missing trip IDs', () => {
    api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 }))); const f = detail(); expect(f.nativeElement.textContent).toContain('does not belong'); expect(f.nativeElement.querySelector('[data-trip-reference]')).toBeNull(); api.get.and.returnValue(of(tripDetailFixture)); (f.componentInstance as any).load(); f.detectChanges(); expect(f.nativeElement.textContent).toContain('TS-QA-REAL');
  });
  it('polls persisted details without fabricating a financial completion status', fakeAsync(() => {
    const f = detail(); api.get.and.returnValue(of({ ...tripDetailFixture, trip: { ...tripDetailFixture.trip, stage: 'paused', status: 'disputed' } })); tick(10_000); f.detectChanges(); expect(f.nativeElement.querySelector('[data-trip-stage]').textContent).toBe('Disputed / paused'); f.destroy();
  }));
  it('labels failed update checks as stale and clears private details after revoked/404 access', fakeAsync(() => {
    const f = detail(); api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 }))); tick(10_000); f.detectChanges(); expect(f.nativeElement.textContent).toContain('may be stale'); expect(f.nativeElement.querySelector('[data-trip-reference]')).not.toBeNull();
    api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 }))); tick(10_000); f.detectChanges(); expect(f.nativeElement.querySelector('[data-trip-reference]')).toBeNull(); f.destroy();
  }));
  it('animates private original download, blocks duplicate clicks and reports a failure honestly', () => {
    const response = new Subject<Blob>(); api.downloadPod.and.returnValue(response); const f = detail(); const c = f.componentInstance as any; c.tab.set('podLabel'); c.download(); c.download(); f.detectChanges(); expect(api.downloadPod).toHaveBeenCalledOnceWith(uuid); expect(f.nativeElement.querySelector('.trip-spinner')).not.toBeNull();
    response.error(new HttpErrorResponse({ status: 404 })); f.detectChanges(); expect(f.nativeElement.textContent).toContain('could not be downloaded'); expect(c.downloading()).toBeFalse();
  });
  it('downloads original response bytes with the saved filename, never synthesized POD text', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:qa'); spyOn(URL, 'revokeObjectURL'); const click = spyOn(HTMLAnchorElement.prototype, 'click').and.stub();
    const blob = new Blob(['original bytes'], { type: 'application/pdf' }); api.downloadPod.and.returnValue(of(blob)); const f = detail(); (f.componentInstance as any).download();
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob); expect((click.calls.mostRecent().object as HTMLAnchorElement).download).toBe('original.pdf'); expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:qa');
  });
  it('cancels obsolete detail loads and rejects malformed route IDs without querying', () => {
    const pending = new Subject<ShipperTripDetail>(); api.get.and.returnValue(pending); const f = detail(); params.next(convertToParamMap({ id: 'sample-trip-id' })); pending.next(tripDetailFixture); f.detectChanges(); expect(api.get).toHaveBeenCalledTimes(1); expect(f.nativeElement.querySelector('[data-trip-reference]')).toBeNull(); expect(f.nativeElement.textContent).toContain('unavailable');
  });
});
