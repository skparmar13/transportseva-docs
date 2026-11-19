import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiAdminDashboardService, AdminDashboard } from '../../../core/api/api-admin-dashboard.service';
import { LanguageService } from '../../../core/i18n';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('Real Admin Dashboard', () => {
  const config = API_CONFIG as { useBackend: boolean }; let old: boolean; let api: jasmine.SpyObj<ApiAdminDashboardService>;
  const state: AdminDashboard = { dashboard_type: 'admin', generated_at: '2026-11-19T10:00:00Z', sections: ['marketplace', 'reviews', 'audit'],
    totals: { loads_total: 31, open_loads: 2, pending_applications: 3, bookings_total: 15, bookings_in_transit: 1, bookings_delivered: 9, pending_reviews: 0 },
    recent_activity: [{ uuid: '12345678-1234-1234-1234-123456789012', action: 'review.approved', category: 'Review', target_uuid: '87654321-1234-1234-1234-123456789012', created_at: '2026-11-19T09:00:00Z' }] };
  beforeEach(() => {
    old = config.useBackend; config.useBackend = true;
    api = jasmine.createSpyObj('ApiAdminDashboardService', ['get']); api.get.and.returnValue(of(structuredClone(state)));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiAdminDashboardService, useValue: api }] }); TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { TestBed.resetTestingModule(); config.useBackend = old; });
  const create = () => { const f = TestBed.createComponent(AdminDashboardComponent); f.detectChanges(); return { f, c: f.componentInstance as any }; };
  it('renders actual totals, translated action and exact audit target link with standard date/time', () => {
    const { f } = create();
    expect(f.nativeElement.querySelector('[data-metric=loads_total] .kpi-value').textContent).toBe('31');
    expect(f.nativeElement.querySelector('[data-metric=pending_reviews] .kpi-value').textContent).toBe('0');
    expect(f.nativeElement.textContent).toContain('Customer review published'); expect(f.nativeElement.textContent).toMatch(/19\/11\/2026 \d{2}:\d{2} (AM|PM)/);
    expect(f.nativeElement.querySelector('tbody a').getAttribute('href')).toBe('/admin/audit?target=87654321-1234-1234-1234-123456789012');
    expect(f.nativeElement.querySelector('[data-metric=pending_reviews]').getAttribute('href')).toBe('/admin/reviews');
  });
  it('shows busy feedback and blocks repeated refreshes without rendering stale cards', () => {
    const pending = new Subject<AdminDashboard>(); api.get.and.returnValue(pending); const { f, c } = create(); c.load();
    expect(api.get).toHaveBeenCalledTimes(1); expect(f.nativeElement.querySelector('[aria-busy=true]')).not.toBeNull(); expect(f.nativeElement.querySelector('.kpi-grid')).toBeNull();
    expect(f.nativeElement.querySelector('button').disabled).toBeTrue(); pending.next(state); pending.complete(); f.detectChanges();
    c.load(); f.detectChanges(); expect(f.nativeElement.querySelector('.kpi-grid')).toBeNull();
  });
  it('offers retry after a failure and never substitutes prototype totals', () => {
    api.get.and.returnValues(throwError(() => new Error('Internal SQL detail')), of(state)); const { f, c } = create();
    expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull(); expect(f.nativeElement.textContent).not.toContain('Internal SQL detail'); expect(c.data()).toBeNull();
    c.load(); f.detectChanges(); expect(f.nativeElement.querySelector('[data-metric=loads_total]')).not.toBeNull();
  });
  it('clears a previously loaded dashboard after permission revocation', () => {
    const { f, c } = create(); api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 }))); c.load(); f.detectChanges();
    expect(c.data()).toBeNull(); expect(f.nativeElement.textContent).toContain('not authorized'); expect(f.nativeElement.querySelector('tbody')).toBeNull();
  });
  it('bounds a stalled read and cancels pending reads on navigation', fakeAsync(() => {
    const pending = new Subject<AdminDashboard>(); api.get.and.returnValue(pending); const { f, c } = create(); tick(30_001); f.detectChanges();
    expect(pending.observed).toBeFalse(); expect(c.error()).toBe('failed'); c.load(); expect(pending.observed).toBeTrue(); f.destroy(); expect(pending.observed).toBeFalse();
  }));
  it('hides unauthorized sections and offers an honest empty activity state in Hindi', () => {
    api.get.and.returnValue(of({ ...state, sections: ['audit'], totals: {}, recent_activity: [] })); const { f } = create(); TestBed.inject(LanguageService).setLang('hi'); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('अभी कोई प्रशासनिक गतिविधि दर्ज नहीं है');
    expect(f.nativeElement.querySelector('.kpi-grid')).toBeNull(); expect(f.nativeElement.querySelector('[data-metric=pending_kyc]')).toBeNull();
  });
  it('renders a genuinely empty permission-limited summary without invented statistics', () => {
    api.get.and.returnValue(of({ ...state, sections: [], totals: {}, recent_activity: [] })); const { f } = create();
    expect(f.nativeElement.textContent).toContain('No operational sections'); expect(f.nativeElement.querySelector('table')).toBeNull();
  });
  it('never requests or substitutes a prototype when the backend is disabled', () => {
    config.useBackend = false; const { c } = create(); expect(api.get).not.toHaveBeenCalled(); expect(c.error()).toBe('denied');
  });
  it('uses readable labels for saved support activity rather than exposing internal event codes', () => {
    api.get.and.returnValue(of({ ...state, recent_activity: [{ ...state.recent_activity[0], action: 'support_ticket.reply' }] }));
    const { f } = create(); expect(f.nativeElement.textContent).toContain('Support ticket reply recorded');
    expect(f.nativeElement.querySelector('tbody').textContent).not.toContain('support_ticket.reply');
  });
});
