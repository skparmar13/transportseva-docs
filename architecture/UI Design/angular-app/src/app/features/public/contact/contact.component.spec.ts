import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { ContactComponent } from './contact.component';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiContactInquiryService, InquiryReceipt } from '../../../core/api/api-contact-inquiry.service';
import { LanguageService } from '../../../core/i18n';
import { SeoService } from '../../../core/seo/seo.service';

describe('Real Contact Us submissions', () => {
  const config = API_CONFIG as { useBackend: boolean }; let original: boolean; let api: jasmine.SpyObj<ApiContactInquiryService>;
  const receipt: InquiryReceipt = { reference: 'CI-20261031-ABCDEFGHIJKL', received_at: '2026-10-31T12:00:00Z' };
  beforeEach(() => { original = config.useBackend; config.useBackend = true; api = jasmine.createSpyObj('ApiContactInquiryService', ['submit']); api.submit.and.returnValue(of(receipt));
    TestBed.configureTestingModule({ providers: [{ provide: ApiContactInquiryService, useValue: api }, { provide: SeoService, useValue: jasmine.createSpyObj('SeoService', ['update']) }] }); TestBed.inject(LanguageService).setLang('en'); });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  const create = () => { const f = TestBed.createComponent(ContactComponent); f.detectChanges(); return f; };
  const valid = (c: any) => { c.update('full_name', 'QA Contact'); c.update('phone', '+919000011223'); c.update('email', 'qa@example.test'); c.update('message', 'This is a genuine local QA enquiry.'); };
  it('never presents sample contact channels, map lookups or a pre-submit success', () => {
    const f = create(); expect(f.nativeElement.querySelector('iframe')).toBeNull(); expect(f.nativeElement.textContent).not.toContain('12345 67890'); expect(f.nativeElement.querySelector('[data-contact-receipt]')).toBeNull(); expect(api.submit).not.toHaveBeenCalled();
  });
  it('validates all required contact fields before any network request', () => {
    const f = create(); (f.componentInstance as any).submit(); f.detectChanges(); expect(api.submit).not.toHaveBeenCalled(); expect(f.nativeElement.querySelectorAll('[role=alert]').length).toBe(4);
  });
  it('blocks duplicate clicks, displays a saving animation and only clears after a confirmed save', () => {
    const pending = new Subject<InquiryReceipt>(); api.submit.and.returnValue(pending); const f = create(); const c = f.componentInstance as any; valid(c); c.submit(); c.submit(); f.detectChanges();
    expect(api.submit).toHaveBeenCalledTimes(1); expect(f.nativeElement.querySelector('.contact-spinner')).not.toBeNull(); expect(c.draft().full_name).toBe('QA Contact'); expect(c.receipt()).toBeNull();
    pending.next(receipt); f.detectChanges(); expect(f.nativeElement.textContent).toContain(receipt.reference); expect(c.draft().full_name).toBe('');
  });
  it('retains draft and submission ID after failure so retry cannot duplicate storage', () => {
    api.submit.and.returnValues(throwError(() => new HttpErrorResponse({ status: 503 })), of(receipt)); const f = create(); const c = f.componentInstance as any; valid(c); c.submit();
    const first = api.submit.calls.mostRecent().args[0]; expect(c.draft().message).toContain('genuine'); expect(c.receipt()).toBeNull(); c.submit();
    expect(api.submit.calls.mostRecent().args[0].submission_id).toBe(first.submission_id); expect(c.receipt().reference).toBe(receipt.reference);
  });
  it('requires an explicit new submission after an idempotency conflict and preserves the draft', () => {
    api.submit.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 }))); const f = create(); const c = f.componentInstance as any; valid(c); c.submit(); c.submit(); expect(api.submit).toHaveBeenCalledTimes(1); expect(c.draft().full_name).toBe('QA Contact');
    c.newEnquiry(); c.submit(); expect(api.submit).toHaveBeenCalledTimes(2);
  });
  it('shows a rate-limit message and no success on rejected requests', () => {
    api.submit.and.returnValue(throwError(() => new HttpErrorResponse({ status: 429 }))); const f = create(); const c = f.componentInstance as any; valid(c); c.submit(); f.detectChanges(); expect(f.nativeElement.textContent).toContain('Too many enquiries'); expect(c.receipt()).toBeNull();
  });
  it('fails honestly when backend mode is disabled', () => {
    config.useBackend = false; const f = create(); const c = f.componentInstance as any; valid(c); c.submit(); f.detectChanges(); expect(api.submit).not.toHaveBeenCalled(); expect(f.nativeElement.textContent).toContain('Nothing has been submitted');
  });
  it('uses stable subject codes with Hindi labels rather than translated payload values', () => {
    TestBed.inject(LanguageService).setLang('hi'); const f = create(); expect(f.nativeElement.textContent).toContain('पूछताछ भेजें'); expect(f.nativeElement.querySelector('option').value).toBe('general');
  });
});
