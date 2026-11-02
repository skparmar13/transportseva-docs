import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiSupportTicketService } from './api-support-ticket.service';
import { API_CONFIG } from './api-config';
describe('Support Ticket HTTP contracts', () => {
  let api: ApiSupportTicketService; let http: HttpTestingController;
  const detail = { ticket: { uuid: 'ticket', version: 2 }, events: [], capabilities: { reply: true }, history: { has_more: false, before: null } };
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); api = TestBed.inject(ApiSupportTicketService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('sends creation idempotency data without accepting an owner or company', () => {
    api.create({ submission_id: 'operation', subject: 'QA issue', category: 'account', priority: 'medium', message: 'QA support message' }).subscribe();
    const r = http.expectOne(API_CONFIG.baseUrl + '/support-tickets'); expect(r.request.method).toBe('POST'); expect(r.request.body.owner_uuid).toBeUndefined(); expect(r.request.body.company_uuid).toBeUndefined(); r.flush({ success: true, data: detail });
  });
  it('does not mistake a 200 response with an invalid body for a saved ticket', () => {
    let failed = false; api.get('ticket').subscribe({ error: () => failed = true }); http.expectOne(API_CONFIG.baseUrl + '/support-tickets/ticket').flush({ success: true, data: {} }); expect(failed).toBeTrue();
  });
  it('sends bounded list/history pagination and preserves versioned mutation data', () => {
    api.list(2, 'open', 'ST-2026').subscribe(); const list = http.expectOne((r) => r.url.endsWith('/support-tickets')); expect(list.request.params.get('per_page')).toBe('25'); list.flush({ success: true, data: [], meta: { scope: 'assigned' } });
    api.get('ticket', 4).subscribe(); const history = http.expectOne((r) => r.url.endsWith('/support-tickets/ticket')); expect(history.request.params.get('before')).toBe('4'); history.flush({ success: true, data: detail });
    const body = { operation_id: 'reply', version: 1, message: 'QA reply' }; api.action('ticket', 'replies', body).subscribe(); const reply = http.expectOne(API_CONFIG.baseUrl + '/support-tickets/ticket/replies'); expect(reply.request.method).toBe('POST'); expect(reply.request.body).toEqual(body); reply.flush({ success: true, data: detail });
    api.action('ticket', 'status', { ...body, status: 'resolved' }).subscribe(); const status = http.expectOne(API_CONFIG.baseUrl + '/support-tickets/ticket/status'); expect(status.request.method).toBe('PATCH'); status.flush({ success: true, data: detail });
  });
});
