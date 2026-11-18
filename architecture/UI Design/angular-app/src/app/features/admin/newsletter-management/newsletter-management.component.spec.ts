import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiNewsletterAdminService, NewsletterDetail } from '../../../core/api/api-newsletter-admin.service';
import { LanguageService } from '../../../core/i18n';
import { NewsletterManagementComponent } from './newsletter-management.component';

describe('Real newsletter consent queue', () => {
  const id = '12345678-1234-1234-1234-123456789012'; const config = API_CONFIG as { useBackend: boolean };
  const subscriber = { uuid: id, email: 'qa@example.test', status: 'unsubscribed' as const, created_at: '2026-11-17T12:00:00Z', confirmed_at: '2026-11-17T12:01:00Z', unsubscribed_at: '2026-11-17T12:02:00Z', consent_version: 'newsletter-updates-v1' };
  const list = { rows: [subscriber], page: 1, lastPage: 2, total: 26, summary: { total: 26, pending: 20, subscribed: 1, unsubscribed: 5 } };
  const detail: NewsletterDetail = { subscriber, requests: [{ uuid: id, delivery_status: 'sandbox', consent_version: 'newsletter-updates-v1', created_at: '2026-11-17T12:00:00Z', expires_at: '2026-11-19T12:00:00Z', confirmed_at: '2026-11-17T12:01:00Z' }], history: { page: 1, last_page: 1, total: 1 } };
  let original: boolean; let api: jasmine.SpyObj<ApiNewsletterAdminService>; let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true; params = new BehaviorSubject(convertToParamMap({}));
    api = jasmine.createSpyObj('ApiNewsletterAdminService', ['list', 'detail']); api.list.and.returnValue(of(list)); api.detail.and.returnValue(of(detail));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { queryParamMap: params, snapshot: {}, toString: () => '' } }, { provide: ApiNewsletterAdminService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { TestBed.resetTestingModule(); config.useBackend = original; });
  const create = () => { const f = TestBed.createComponent(NewsletterManagementComponent); f.detectChanges(); return { f, c: f.componentInstance as any }; };
  it('renders global server totals and dated consent without prototype mutations', () => {
    const { f } = create(); const text = f.nativeElement.textContent;
    expect(text).toContain('qa@example.test'); expect(text).toContain('26'); expect(text).toMatch(/17\/11\/2026 \d{2}:\d{2} (AM|PM)/);
    expect(text).not.toContain('Resubscribe'); expect(text).not.toContain('Remove'); expect(text).toContain('Read-only consent records');
  });
  it('locks duplicate reads and hides totals while pending, then permits paging', () => {
    const pending = new Subject<any>(); api.list.and.returnValue(pending); const { f, c } = create(); c.load(); f.detectChanges();
    expect(api.list).toHaveBeenCalledTimes(1); expect(f.nativeElement.querySelector('.consent-spinner')).not.toBeNull();
    expect(f.nativeElement.querySelector('.kpi-grid')).toBeNull();
    pending.next(list); pending.complete(); c.load(2); expect(api.list.calls.mostRecent().args[0]).toBe(2);
  });
  it('validates exact emails without querying and retains a failed lookup for retry', () => {
    const { f, c } = create(); c.query.set('part'); c.applyFilters(); f.detectChanges();
    expect(api.list).toHaveBeenCalledTimes(1); expect(f.nativeElement.textContent).toContain('complete, valid email');
    c.query.set(' QA@EXAMPLE.TEST '); c.statusFilter.set('unsubscribed');
    api.list.and.returnValues(throwError(() => new Error('offline')), of(list)); c.applyFilters(); f.detectChanges();
    expect(c.query()).toBe(' QA@EXAMPLE.TEST '); expect(f.nativeElement.textContent).toContain('could not be loaded');
    c.retry(); expect(api.list.calls.mostRecent().args).toEqual([1, 'unsubscribed', 'qa@example.test']);
  });
  it('times out stalled reads and cancels them on navigation', fakeAsync(() => {
    const pending = new Subject<any>(); api.list.and.returnValue(pending); const { f, c } = create(); tick(30_001); f.detectChanges();
    expect(pending.observed).toBeFalse(); expect(c.error()).toBe('failed'); c.retry(); expect(pending.observed).toBeTrue(); f.destroy(); expect(pending.observed).toBeFalse();
  }));
  it('opens exact history links, shows sandbox delivery honestly and cancels stale targets', () => {
    const { f, c } = create(); params.next(convertToParamMap({ subscriber: id })); f.detectChanges();
    expect(api.detail).toHaveBeenCalledWith(id, 1); expect(f.nativeElement.textContent).toContain('no email sent');
    expect(f.nativeElement.querySelector('[data-consent-status]').textContent).toBe('Unsubscribed');
    const pending = new Subject<NewsletterDetail>(); api.detail.and.returnValue(pending); c.loadDetail(); expect(pending.observed).toBeTrue();
    params.next(convertToParamMap({ subscriber: 'bad-id' })); f.detectChanges(); expect(pending.observed).toBeFalse(); expect(c.detail()).toBeNull(); expect(c.detailLoading()).toBeFalse(); expect(c.detailError()).toBe('notFound');
  });
  it('handles denied and missing records without a sample fallback', () => {
    api.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 }))); const { f, c } = create();
    expect(c.error()).toBe('denied'); expect(f.nativeElement.querySelector('table')).toBeNull();
    api.detail.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 }))); params.next(convertToParamMap({ subscriber: id })); f.detectChanges(); expect(c.detailError()).toBe('notFound');
  });
  it('renders translated empty state and never fetches prototype subscribers', () => {
    api.list.and.returnValue(of({ ...list, rows: [], total: 0 })); const { f } = create();
    TestBed.inject(LanguageService).setLang('hi'); f.detectChanges(); expect(f.nativeElement.textContent).toContain('सहमति रिकॉर्ड नहीं मिले');
  });
  it('denies backend-off rendering without importing local subscriber data', () => {
    config.useBackend = false; const { c } = create(); expect(api.list).not.toHaveBeenCalled(); expect(c.error()).toBe('denied');
  });
  it('keeps paging on applied filters until a new search is submitted', () => {
    const { c } = create(); c.query.set('other@example.test'); c.load(2);
    expect(api.list.calls.mostRecent().args).toEqual([2, 'all', '']);
    c.applyFilters(); expect(api.list.calls.mostRecent().args).toEqual([1, 'all', 'other@example.test']);
  });
  it('clears cached list and detail data and cancels pending history after a server denial', () => {
    const { c } = create(); const pending = new Subject<NewsletterDetail>(); api.detail.and.returnValue(pending);
    params.next(convertToParamMap({ subscriber: id })); expect(pending.observed).toBeTrue();
    api.list.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 }))); c.load();
    expect(c.rows()).toEqual([]); expect(c.summary()).toBeNull(); expect(c.detail()).toBeNull(); expect(pending.observed).toBeFalse(); expect(c.detailError()).toBe('denied');
  });
});
