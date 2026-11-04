import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiTruckOwnerReportService } from '../../../core/api/api-truck-owner-report.service';
import { LanguageService } from '../../../core/i18n';
import { TruckOwnerReportsComponent } from './truck-owner-reports.component';
import { ownerReportFixture, ownerBookingReportFixture, ownerReportUuid } from './report.fixtures';

describe('Real Truck Owner Reports', () => {
  const config = API_CONFIG as { useBackend: boolean }; let original: boolean;
  let api: jasmine.SpyObj<ApiTruckOwnerReportService>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true;
    api = jasmine.createSpyObj('ownerReports', ['list', 'export']); api.list.and.returnValue(of(structuredClone(ownerReportFixture)));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiTruckOwnerReportService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  const create = () => { const f = TestBed.createComponent(TruckOwnerReportsComponent); f.detectChanges(); return f; };
  it('shows provider application counters and safe exact load/booking links with escaped content', () => {
    const f = create(); expect(f.nativeElement.querySelector('[data-report-total=applications]').textContent).toBe('4');
    expect(f.nativeElement.querySelector('[data-report-total=pending]').textContent).toBe('2');
    expect(f.nativeElement.textContent).toContain('Applications sent'); expect(f.nativeElement.textContent).toContain('PROPOSED123');
    expect(f.nativeElement.querySelector('script')).toBeNull();
    const links = [...f.nativeElement.querySelectorAll('a')].map((a: any) => a.getAttribute('href'));
    expect(links).toContain('/truck-owner/load-board/' + ownerReportUuid);
    expect(links).toContain('/truck-owner/bookings?booking=' + ownerReportUuid);
  });
  it('renders actual booking assignments and recorded dates with provider trip links', () => {
    api.list.and.returnValue(of(ownerBookingReportFixture)); const f = create();
    expect(f.nativeElement.textContent).toContain('ACTUAL123'); expect(f.nativeElement.textContent).not.toContain('PROPOSED123');
    expect(f.nativeElement.querySelector('[data-report-row]').textContent).toContain('Not recorded');
    expect(f.nativeElement.querySelector('a[href="/truck-owner/trips/' + ownerReportUuid + '"]')).not.toBeNull();
  });
  it('retains the failed request and page for retry without sample rows', () => {
    const f = create(); const c = f.componentInstance as any;
    api.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 }))); c.search.set('Saved search'); c.load(2); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-report-row]')).toBeNull(); expect(f.nativeElement.textContent).toContain('could not be loaded');
    c.search.set('unapplied'); c.load(c.page(), true);
    expect(api.list.calls.mostRecent().args).toEqual([{ table: 'applications', from: '', to: '', q: 'Saved search' }, 2]);
  });
  it('exports applied filters, guards concurrent actions and downloads real response bytes', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:qa-report'); spyOn(URL, 'revokeObjectURL');
    const clicked = spyOn(HTMLAnchorElement.prototype, 'click').and.stub();
    const pending = new Subject<Blob>(); api.export.and.returnValue(pending);
    const f = create(); const c = f.componentInstance as any; c.search.set('UNAPPLIED'); c.export(); c.export(); c.load(); c.selectTable('bookings'); f.detectChanges();
    expect(api.export).toHaveBeenCalledOnceWith({ table: 'applications', from: null, to: null, q: '' }); expect(api.list).toHaveBeenCalledTimes(1);
    expect(f.nativeElement.querySelector('.report-spinner')).not.toBeNull();
    const blob = new Blob(['actual CSV bytes']); pending.next(blob);
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect((clicked.calls.mostRecent().object as HTMLAnchorElement).download).toBe('transportseva-truck-owner-applications-report.csv');
    expect(c.exporting()).toBeFalse();
  });
  it('blocks reversed dates, allows correction and supports provider-specific Hindi copy', () => {
    const f = create(); const c = f.componentInstance as any; c.from.set('2026-11-04'); c.to.set('2026-11-01'); c.load(); f.detectChanges();
    expect(api.list).toHaveBeenCalledTimes(1); expect(f.nativeElement.textContent).toContain('From must not be after');
    c.to.set('2026-11-04'); c.load(); expect(api.list.calls.mostRecent().args[0].from).toBe('2026-11-04');
    TestBed.inject(LanguageService).setLang('hi'); f.detectChanges(); expect(f.nativeElement.textContent).toContain('भेजे गए आवेदन');
  });
});
