import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiContactInquiryService, ContactDraft } from './api-contact-inquiry.service';
import { API_CONFIG } from './api-config';
describe('Contact enquiry HTTP contracts', () => {
  let api: ApiContactInquiryService; let http: HttpTestingController;
  const draft: ContactDraft = { full_name: 'QA Contact', email: 'qa@example.test', phone: '+919000011223', subject: 'general', message: 'A real QA enquiry message.', website: '' };
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiContactInquiryService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('posts an idempotent public request without choosing a staff/user owner', () => {
    api.submit({ ...draft, submission_id: 'submission' }).subscribe(); const r = http.expectOne(API_CONFIG.baseUrl + '/public/contact-inquiries'); expect(r.request.method).toBe('POST'); expect(r.request.body.subject).toBe('general'); expect(r.request.body.user_uuid).toBeUndefined();
    r.flush({ success: true, data: { reference: 'CI-20261031-ABCDEFGHIJKL', received_at: '2026-10-31T10:00:00Z' } });
  });
  it('does not accept a successful HTTP status as proof of a saved receipt', () => {
    let error = false; api.submit({ ...draft, submission_id: 'submission' }).subscribe({ error: () => error = true }); http.expectOne(API_CONFIG.baseUrl + '/public/contact-inquiries').flush({ success: true, data: {} }); expect(error).toBeTrue();
  });
  it('sends bounded private list filters and exact versioned follow-up data', () => {
    api.list(2, 'new', 'CI-2026').subscribe(); const list = http.expectOne((r) => r.url.endsWith('/admin/contact-inquiries')); expect(list.request.params.get('per_page')).toBe('25'); expect(list.request.params.get('status')).toBe('new'); list.flush({ success: true, data: [], meta: { current_page: 2, last_page: 2, total: 26 } });
    api.update('uuid', 3, 'resolved', 'Called customer').subscribe(); const update = http.expectOne(API_CONFIG.baseUrl + '/admin/contact-inquiries/uuid'); expect(update.request.body).toEqual({ version: 3, status: 'resolved', note: 'Called customer' }); update.flush({ success: true, data: { inquiry: { uuid: 'uuid', version: 4 }, updates: [] } });
  });
});
