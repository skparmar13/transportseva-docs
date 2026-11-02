import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ApiSupportTicketService, SupportDetail } from '../../core/api/api-support-ticket.service';
import { API_CONFIG } from '../../core/api/api-config';
import { SessionService } from '../../core/services/session.service';
import { LanguageService } from '../../core/i18n';
import { SupportComponent } from './support.component';

describe('Real Support Ticket screen', () => {
  const uuid = '12345678-1234-1234-1234-123456789012';
  const config = API_CONFIG as { useBackend: boolean }; let original: boolean;
  const detail: SupportDetail = {
    ticket: { uuid, reference: 'ST-20261101-ABCDEFGHIJKL', subject: 'QA support issue', category: 'account', priority: 'medium', status: 'open', version: 1, created_at: '2026-11-01T10:00:00Z', updated_at: '2026-11-01T10:00:00Z', resolved_at: null, owner_name: 'QA Owner', assigned_name: null, assigned_to_uuid: null },
    events: [{ uuid: 'event', version: 1, actor_name: 'QA Owner', actor_role: 'Shipper', type: 'created', message: '<script>plain text only</script>', from_status: null, status: 'open', assigned_name: null, created_at: '2026-11-01T10:00:00Z' }],
    history: { has_more: false, before: null }, capabilities: { reply: true, manage: false, assign: false },
  };
  let api: jasmine.SpyObj<ApiSupportTicketService>; let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true; params = new BehaviorSubject(convertToParamMap({ ticket: uuid }));
    api = jasmine.createSpyObj('ApiSupportTicketService', ['list', 'get', 'action', 'create', 'assignees']);
    api.list.and.returnValue(of({ rows: [detail.ticket], page: 1, lastPage: 1, total: 1, scope: 'own' }));
    api.get.and.returnValue(of(structuredClone(detail))); api.action.and.returnValue(of({ ...detail, ticket: { ...detail.ticket, version: 2 } })); api.create.and.returnValue(of(detail)); api.assignees.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { queryParamMap: params } }, { provide: ApiSupportTicketService, useValue: api }] });
    const session = TestBed.inject(SessionService); session.setRole('shipper'); session.setBackendUser({ role: 'shipper', full_name: 'QA Owner' }); TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  const create = () => { const f = TestBed.createComponent(SupportComponent); f.detectChanges(); return f; };
  it('loads the exact linked ticket with escaped history and standard date format', () => {
    const f = create(); expect(api.get).toHaveBeenCalledWith(uuid); expect(f.nativeElement.querySelector('[data-ticket-history]').textContent).toContain('<script>'); expect(f.nativeElement.querySelector('script')).toBeNull(); expect(f.nativeElement.textContent).toMatch(/01\/11\/2026 \d{2}:\d{2} (AM|PM)/);
  });
  it('never falls back to sample tickets when the backend is disconnected', () => {
    config.useBackend = false; const f = create(); expect(api.list).not.toHaveBeenCalled(); expect(api.get).not.toHaveBeenCalled(); expect(f.nativeElement.textContent).toContain('No sample tickets');
  });
  it('shows a retryable real-list error without sample rows', () => {
    api.list.and.returnValue(throwError(() => new Error('offline'))); const f = create(); expect(f.nativeElement.textContent).toContain('could not be loaded'); expect(f.nativeElement.querySelector('[data-ticket-id]')).toBeNull();
  });
  it('validates new ticket content before any write', () => {
    const f = create(); const c = f.componentInstance as any; c.openNew(); c.create(); f.detectChanges(); expect(api.create).not.toHaveBeenCalled(); expect(f.nativeElement.textContent).toContain('3–160');
  });
  it('shows creation animation, guards duplicate clicks and keeps an identical pending draft on failure', () => {
    const response = new Subject<SupportDetail>(); api.create.and.returnValue(response); const f = create(); const c = f.componentInstance as any;
    c.openNew(); c.subject.set('QA request'); c.message.set('Please check this QA issue.'); c.create(); c.create(); f.detectChanges(); expect(api.create).toHaveBeenCalledTimes(1); expect(f.nativeElement.querySelector('.support-spinner')).not.toBeNull();
    response.error(new HttpErrorResponse({ status: 503 })); const first = api.create.calls.mostRecent().args[0]; c.subject.set('edited in devtools'); api.create.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 }))); c.create(); expect(api.create.calls.mostRecent().args[0]).toEqual(first); expect(c.message()).toBe('Please check this QA issue.');
  });
  it('shows action animation and submits one versioned reply even after repeated clicks', () => {
    const response = new Subject<SupportDetail>(); api.action.and.returnValue(response); const f = create(); const c = f.componentInstance as any; c.replyText.set('QA reply'); c.act('replies'); c.act('replies'); f.detectChanges();
    expect(api.action).toHaveBeenCalledTimes(1); expect(api.action.calls.mostRecent().args[2].version).toBe(1); expect(f.nativeElement.querySelector('.support-spinner')).not.toBeNull(); expect(c.success()).toBe(''); response.next({ ...detail, ticket: { ...detail.ticket, version: 2 } }); expect(c.success()).toBe('Action saved.'); expect(c.replyText()).toBe('');
  });
  it('retries a failed action with the same operation ID and body', () => {
    api.action.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 }))); const f = create(); const c = f.componentInstance as any; c.replyText.set('Unsaved reply'); c.act('replies'); const first = api.action.calls.mostRecent().args[2]; c.replyText.set('tampered draft'); c.act('replies'); expect(api.action.calls.mostRecent().args[2]).toEqual(first); expect(c.pending()).not.toBeNull();
  });
  it('keeps uncertain write retries available even after a read poll observes the committed version', fakeAsync(() => {
    api.action.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 }))); const f = create(); const c = f.componentInstance as any;
    c.replyText.set('QA uncertain reply'); c.act('replies'); const first = api.action.calls.mostRecent().args[2];
    api.get.and.returnValue(of({ ...detail, ticket: { ...detail.ticket, version: 2 } })); tick(5000);
    expect(c.external()).toBeFalse(); expect(c.pending()?.payload).toEqual(first); c.act('replies'); expect(api.action.calls.mostRecent().args[2]).toEqual(first); f.destroy();
  }));
  it('retains a stale draft and requires an explicit reload after a conflict', () => {
    api.action.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 }))); const f = create(); const c = f.componentInstance as any; c.replyText.set('Stale draft'); c.act('replies'); c.act('replies'); f.detectChanges(); expect(api.action).toHaveBeenCalledTimes(1); expect(c.replyText()).toBe('Stale draft'); expect(f.nativeElement.textContent).toContain('Reload latest'); c.loadDetail(); expect(c.replyText()).toBe('Stale draft'); expect(c.pending()).toBeNull();
  });
  it('updates a clean thread by polling without navigation or refresh', fakeAsync(() => {
    const f = create(); api.get.and.returnValue(of({ ...detail, ticket: { ...detail.ticket, version: 2 }, events: [...detail.events, { ...detail.events[0], uuid: 'reply', type: 'reply', message: 'A new Support reply' }] })); tick(5000); f.detectChanges(); expect(f.nativeElement.textContent).toContain('A new Support reply'); f.destroy();
  }));
  it('never overwrites a draft when a concurrent reply arrives', fakeAsync(() => {
    const f = create(); const c = f.componentInstance as any; c.replyText.set('My draft'); api.get.and.returnValue(of({ ...detail, ticket: { ...detail.ticket, version: 2 } })); tick(5000); expect(c.external()).toBeTrue(); expect(c.replyText()).toBe('My draft'); c.act('replies'); expect(api.action).not.toHaveBeenCalled(); f.destroy();
  }));
  it('clears stale details when assignment is revoked and the poll receives 404', fakeAsync(() => {
    const f = create(); api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 }))); tick(5000); f.detectChanges(); expect(f.nativeElement.querySelector('[data-ticket-history]')).toBeNull(); expect(f.nativeElement.textContent).toContain('no longer have access'); f.destroy();
  }));
  it('does not offer or submit staff assignment without a server-provided capability', () => {
    TestBed.inject(SessionService).setRole('admin'); const f = create(); const c = f.componentInstance as any; c.assignmentNote.set('Forbidden'); c.act('assignment'); expect(api.assignees).not.toHaveBeenCalled(); expect(api.action).not.toHaveBeenCalled(); expect(f.nativeElement.querySelector('#support-agent')).toBeNull();
  });
  it('cancels an obsolete detail request and rejects a malformed notification target', () => {
    api.get.and.returnValue(new Subject<SupportDetail>()); const f = create(); params.next(convertToParamMap({ ticket: 'bad' })); f.detectChanges(); expect((f.componentInstance as any).detailLoading()).toBeFalse(); expect(f.nativeElement.textContent).toContain('unavailable'); expect(api.get).toHaveBeenCalledTimes(1);
  });
});
