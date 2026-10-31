import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ApiContactInquiryService, InquiryDetail } from '../../../core/api/api-contact-inquiry.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { SessionService } from '../../../core/services/session.service';
import { LanguageService } from '../../../core/i18n';
import { ContactInquiriesComponent } from './contact-inquiries.component';

describe('Private Contact Enquiries queue', () => {
  const uuid = '12345678-1234-1234-1234-123456789012'; const config = API_CONFIG as { useBackend: boolean }; let original: boolean;
  const detail: InquiryDetail = { inquiry: { uuid, reference: 'CI-20261031-ABCDEFGHIJKL', full_name: 'QA Contact', email: 'contact@example.test', phone: '+919000011223', subject: 'general', message: '<script>alert(1)</script> Plain enquiry', status: 'new', version: 1, created_at: '2026-10-31T10:00:00Z', updated_at: '2026-10-31T10:00:00Z', resolved_at: null }, updates: [] };
  let api: jasmine.SpyObj<ApiContactInquiryService>; let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => { original = config.useBackend; config.useBackend = true; params = new BehaviorSubject(convertToParamMap({ inquiry: uuid })); api = jasmine.createSpyObj('ApiContactInquiryService', ['list', 'get', 'update']);
    api.list.and.returnValue(of({ rows: [detail.inquiry], page: 1, lastPage: 1, total: 1 })); api.get.and.returnValue(of(structuredClone(detail))); api.update.and.returnValue(of({ ...detail, inquiry: { ...detail.inquiry, version: 2, status: 'in_progress' } }));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { queryParamMap: params } }, { provide: ApiContactInquiryService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en'); TestBed.inject(SessionService).setBackendUser({ role: 'admin', full_name: 'QA Staff', staff_access: { enforced: true, ready: true, role_code: 'SUPPORT_AGENT', role_name: 'Support Agent', permissions: ['contact.inquiries.view', 'contact.inquiries.update'], routes: ['contact-inquiries'], blocked_reason: null } });
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  const create = () => { const f = TestBed.createComponent(ContactInquiriesComponent); f.detectChanges(); return f; };
  it('opens the exact notification-linked enquiry and renders untrusted messages as text', () => {
    const f = create(); expect(api.get).toHaveBeenCalledWith(uuid); expect(f.nativeElement.querySelector('[data-inquiry-message]').textContent).toContain('<script>'); expect(f.nativeElement.querySelector('script')).toBeNull(); expect(f.nativeElement.textContent).toMatch(/31\/10\/2026 \d{2}:\d{2} (AM|PM)/);
  });
  it('provides a retryable queue failure without sample enquiries', () => {
    api.list.and.returnValues(throwError(() => new Error('offline')), of({ rows: [], page: 1, lastPage: 1, total: 0 })); const f = create(); const c = f.componentInstance as any; expect(f.nativeElement.textContent).toContain('could not be loaded'); c.load(); f.detectChanges(); expect(f.nativeElement.textContent).toContain('No enquiries match');
  });
  it('requires a follow-up note before writing', () => { const f = create(); (f.componentInstance as any).save(); expect(api.update).not.toHaveBeenCalled(); });
  it('exits loading and rejects a malformed target when a pending detail request is replaced', () => {
    api.get.and.returnValue(new Subject<InquiryDetail>()); const f = create(); const c = f.componentInstance as any; expect(c.detailLoading()).toBeTrue();
    params.next(convertToParamMap({ inquiry: 'not-a-real-uuid' })); f.detectChanges(); expect(c.detailLoading()).toBeFalse(); expect(f.nativeElement.textContent).toContain('details could not be loaded'); expect(api.get).toHaveBeenCalledTimes(1);
  });
  it('shows saving feedback, rejects duplicate clicks and only shows saved after the response', () => {
    const pending = new Subject<InquiryDetail>(); api.update.and.returnValue(pending); const f = create(); const c = f.componentInstance as any; c.note.set('Called customer'); c.status.set('in_progress'); c.save(); c.save(); f.detectChanges();
    expect(api.update).toHaveBeenCalledOnceWith(uuid, 1, 'in_progress', 'Called customer'); expect(f.nativeElement.querySelector('.contact-spinner')).not.toBeNull(); expect(c.saved()).toBeFalse(); pending.next({ ...detail, inquiry: { ...detail.inquiry, version: 2 } }); expect(c.saved()).toBeTrue();
  });
  it('retains the unsaved note on a version conflict and requires explicit reload', () => {
    api.update.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Stale enquiry' } }))); const f = create(); const c = f.componentInstance as any; c.note.set('Unsaved call note'); c.save(); f.detectChanges(); expect(c.note()).toBe('Unsaved call note'); expect(f.nativeElement.textContent).toContain('Reload latest'); c.save(); expect(api.update).toHaveBeenCalledTimes(1);
  });
  it('does not offer or submit updates without the exact capability', () => {
    TestBed.inject(SessionService).setBackendUser({ role: 'admin', staff_access: { enforced: true, ready: true, role_code: 'SUPPORT_AGENT', role_name: 'Support', permissions: ['contact.inquiries.view'], routes: ['contact-inquiries'], blocked_reason: null } }); const f = create(); const c = f.componentInstance as any; c.note.set('No write grant'); c.save(); expect(api.update).not.toHaveBeenCalled(); expect(f.nativeElement.querySelector('#follow-up-note')).toBeNull();
  });
});
