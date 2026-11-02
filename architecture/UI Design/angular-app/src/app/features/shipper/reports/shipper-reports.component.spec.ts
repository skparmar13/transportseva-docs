import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperReportService } from '../../../core/api/api-shipper-report.service';
import { LanguageService } from '../../../core/i18n';
import { ShipperReportsComponent } from './shipper-reports.component';
import { reportFixture, reportBookingFixture, reportUuid } from './report.fixtures';

describe('Real private Shipper Reports', () => {
  const config = API_CONFIG as { useBackend: boolean }; let original: boolean;
  let api: jasmine.SpyObj<ApiShipperReportService>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true;
    api = jasmine.createSpyObj('ApiShipperReportService', ['list', 'export']);
    api.list.and.returnValue(of(structuredClone(reportFixture))); api.export.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiShipperReportService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  const create = () => { const f = TestBed.createComponent(ShipperReportsComponent); f.detectChanges(); return f; };
  it('renders real counts, recorded dates and exact load links with no sample analytics', () => {
    const f = create(); const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[data-report-total=applications]')?.textContent).toBe('2');
    expect(el.querySelector('[data-report-row] a')?.getAttribute('href')).toBe('/shipper/load-board/' + reportUuid);
    expect(el.textContent).toMatch(/\d{2}\/\d{2}\/2026 \d{2}:\d{2} (AM|PM)/);
    expect(el.textContent).not.toContain('Fleet Utilization'); expect(el.textContent).not.toContain('₹'); expect(el.textContent).not.toContain('86%');
    expect(el.textContent).toContain('Statuses are current, not a historical snapshot');
  });
  it('renders untrusted goods as text only', () => {
    const f = create(); expect(f.nativeElement.textContent).toContain('<script>escaped goods</script>'); expect(f.nativeElement.querySelector('script')).toBeNull();
  });
  it('has genuine zero states and disables empty exports', () => {
    const fixture = structuredClone(reportFixture); fixture.rows = []; fixture.matching = 0;
    fixture.summary.loads = { total: 0, applications: 0, pending_applications: 0, with_booking: 0, statuses: { open: 0, applications_received: 0, booked: 0, closed: 0, cancelled: 0, other: 0 } };
    fixture.summary.bookings = { total: 0, approved_pods: 0, delivered_without_approved_pod: 0, stages: { awaiting: 0, planned: 0, active: 0, delivered: 0, paused: 0, cancelled: 0, other: 0 } };
    api.list.and.returnValue(of(fixture)); const f = create();
    expect(f.nativeElement.textContent).toContain('No records yet'); expect(f.nativeElement.querySelector('[data-report-export]').disabled).toBeTrue();
    (f.componentInstance as any).export(); expect(api.export).not.toHaveBeenCalled();
  });
  it('animates loads and guards duplicate reads, tab changes and exports', () => {
    const pending = new Subject<typeof reportFixture>(); api.list.and.returnValue(pending);
    const f = create(); const c = f.componentInstance as any; c.load(); c.selectTable('bookings'); c.export();
    expect(api.list).toHaveBeenCalledTimes(1); expect(api.export).not.toHaveBeenCalled(); expect(c.table()).toBe('loads');
    expect(f.nativeElement.querySelector('.report-spinner')).not.toBeNull();
  });
  it('clears previous private rows on error but leaves filters available and retries requested page', () => {
    const f = create(); const c = f.componentInstance as any; api.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    c.load(2); f.detectChanges(); expect(f.nativeElement.querySelector('[data-report-row]')).toBeNull();
    expect(f.nativeElement.querySelector('#report-from')).not.toBeNull(); expect(f.nativeElement.textContent).toContain('could not be loaded');
    api.list.and.returnValue(of(reportFixture)); c.load(c.page()); expect(api.list.calls.mostRecent().args[1]).toBe(2);
  });
  it('uses inclusive-date/search filters without changing date-cohort summaries for no matches', () => {
    const f = create(); const c = f.componentInstance as any; c.from.set('2026-10-31'); c.to.set('2026-10-31'); c.search.set(' NO-MATCH ');
    api.list.and.returnValue(of({ ...reportFixture, rows: [], matching: 0, filters: { ...reportFixture.filters, from: '2026-10-31', to: '2026-10-31', q: 'NO-MATCH' } }));
    c.load(); f.detectChanges(); expect(api.list).toHaveBeenCalledWith({ table: 'loads', from: '2026-10-31', to: '2026-10-31', q: 'NO-MATCH' }, 1);
    expect(f.nativeElement.querySelector('[data-report-total=loads]').textContent).toBe('1'); expect(f.nativeElement.textContent).toContain('No records match');
  });
  it('rejects reversed dates without an HTTP request and allows correction', () => {
    const f = create(); const c = f.componentInstance as any; c.from.set('2026-11-02'); c.to.set('2026-10-31'); c.load(); f.detectChanges();
    expect(api.list).toHaveBeenCalledTimes(1); expect(f.nativeElement.textContent).toContain('From must not be after');
    expect(f.nativeElement.querySelector('#report-to')).not.toBeNull(); c.to.set('2026-11-03'); c.load(); expect(api.list).toHaveBeenCalledTimes(2);
  });
  it('never falls back to mock reports or CSV when disconnected', () => {
    config.useBackend = false; const f = create(); expect(api.list).not.toHaveBeenCalled(); expect(f.nativeElement.textContent).toContain('No sample figures or CSV'); expect(f.nativeElement.querySelector('[data-report-export]').disabled).toBeTrue();
  });
  it('shows actual assignment, missing timestamps and exact booking/trip links', () => {
    const f = create(); const c = f.componentInstance as any; api.list.and.returnValue(of(reportBookingFixture)); c.selectTable('bookings'); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('ACTUAL1234'); expect(f.nativeElement.textContent).toContain('Trip started: Not recorded');
    expect(f.nativeElement.querySelector('[data-report-row] a').getAttribute('href')).toBe('/shipper/bookings?booking=' + reportUuid);
    expect(f.nativeElement.querySelector('[data-report-row] a:last-child').getAttribute('href')).toBe('/shipper/trips/' + reportUuid);
  });
  it('exports applied data filters, never an unapplied form draft or just the visible page', () => {
    const f = create(); const c = f.componentInstance as any; c.from.set('2027-01-01'); c.search.set('unapplied'); c.export();
    expect(api.export).toHaveBeenCalledOnceWith({ table: 'loads', from: null, to: null, q: '' });
  });
  it('keeps pagination and refresh on applied filters until the form is submitted', () => {
    const f = create(); const c = f.componentInstance as any; c.from.set('2027-01-01'); c.search.set('unapplied');
    c.load(2, true); expect(api.list.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ table: 'loads', from: null, to: null, q: '' }));
    expect(c.search()).toBe('unapplied');
  });
  it('animates exports, blocks duplicate export/read and reports failure without fake success', () => {
    const pending = new Subject<Blob>(); api.export.and.returnValue(pending); const f = create(); const c = f.componentInstance as any;
    c.export(); c.export(); c.load(); f.detectChanges(); expect(api.export).toHaveBeenCalledTimes(1); expect(api.list).toHaveBeenCalledTimes(1);
    expect(f.nativeElement.querySelector('.report-spinner')).not.toBeNull(); pending.error(new HttpErrorResponse({ status: 422 })); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('maximum 10,000 rows'); expect(f.nativeElement.querySelector('[data-report-row]')).not.toBeNull();
  });
  it('downloads the actual server CSV blob with a fixed safe filename', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:reports'); spyOn(URL, 'revokeObjectURL'); const click = spyOn(HTMLAnchorElement.prototype, 'click').and.stub();
    const blob = new Blob(['server,report'], { type: 'text/csv' }); api.export.and.returnValue(of(blob)); const f = create(); (f.componentInstance as any).export();
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob); expect((click.calls.mostRecent().object as HTMLAnchorElement).download).toBe('transportseva-shipper-loads-report.csv');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:reports');
  });
  it('uses real pagination and cancels pending work on destroy', () => {
    const f = create(); const pending = new Subject<typeof reportFixture>(); api.list.and.returnValue(pending); (f.componentInstance as any).load(2);
    expect(api.list.calls.mostRecent().args[1]).toBe(2); expect(pending.observed).toBeTrue(); f.destroy(); expect(pending.observed).toBeFalse();
  });
  it('updates the feature copy in Hindi', () => {
    const f = create(); TestBed.inject(LanguageService).setLang('hi'); f.detectChanges(); expect(f.nativeElement.textContent).toContain('रिपोर्ट और विश्लेषण'); expect(f.nativeElement.textContent).toContain('पोस्ट किए लोड');
  });
});
