import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { ApiRecipientPaymentService, DirectPaymentView } from '../../core/api/api-recipient-payment.service';
import { BookingDirectPaymentsComponent } from './booking-direct-payments.component';
import { RecipientBankSetupComponent } from './recipient-bank-setup.component';
import { RecipientBankReviewComponent } from './recipient-bank-review.component';

const bank = { uuid: 'bank-1', version: 1, holder_name: 'QA Recipient', account_mask: '****9012', ifsc: 'TEST0000001', bank_name: 'QA Bank', status: 'manually_reviewed' as const, review_method: 'manual_document_review', reviewed_at: null, submitted_at: '2026-11-21T10:00:00Z' };
const view: DirectPaymentView = { booking_uuid: 'booking-1', booking_reference: 'QA-BOOKING', side: 'payer', eligible: true, allocation: 'gross', bank, instruction: { version: 1, bank_uuid: bank.uuid, bank_version: 1, current: true, acknowledged_at: '' }, amounts: { recipient_basis: 17000, confirmed_received: 0, awaiting_or_disputed: 2000, confirmed_unpaid: 17000, available_to_report: 15000, owner_fee: 1003, provider_fee: 1003 }, allowed_milestones: ['final'], milestones: [], receipts: [], receipt_page: { current_page: 1, last_page: 1, total: 0 } };
describe('Recipient payments interaction safeguards', () => {
  let api: jasmine.SpyObj<ApiRecipientPaymentService>;
  beforeEach(() => {
    localStorage.setItem('ts_lang', 'en');
    api = jasmine.createSpyObj('ApiRecipientPaymentService', ['bank', 'saveBank', 'view', 'acknowledge', 'reveal', 'report', 'decide', 'queue', 'reviewBank', 'revealReview']);
    api.bank.and.returnValue(of(bank)); api.view.and.returnValue(of(view)); api.queue.and.returnValue(of({ success: true, data: [], meta: { current_page: 1, last_page: 1 } }));
    TestBed.configureTestingModule({ imports: [BookingDirectPaymentsComponent, RecipientBankSetupComponent, RecipientBankReviewComponent], providers: [provideRouter([]), { provide: ApiRecipientPaymentService, useValue: api }] });
  });
  function booking(v = view) { api.view.and.returnValue(of(v)); const f = TestBed.createComponent(BookingDirectPaymentsComponent); f.componentRef.setInput('bookingUuid', 'booking-1'); f.detectChanges(); return f; }
  it('keeps pending reports separate from confirmed received and gross unpaid', () => {
    const f = booking(); expect(f.nativeElement.querySelector('[data-confirmed-received]').textContent).toContain('₹0'); expect(f.nativeElement.querySelector('[data-confirmed-unpaid]').textContent).toContain('₹17,000');
    expect(f.nativeElement.textContent).toContain('Each party pays its own');
  });
  it('refreshes available payment stages when the parent booking workflow changes', () => {
    const f = booking({ ...view, allowed_milestones: [] });
    expect(f.nativeElement.querySelector('select[name=milestone]')).toBeNull();
    api.view.and.returnValue(of({ ...view, allowed_milestones: ['loading_advance'] }));
    f.componentRef.setInput('revision', 'loading-confirmed'); f.detectChanges();
    expect(api.view).toHaveBeenCalledTimes(2);
    expect(f.nativeElement.querySelector('select[name=milestone]')?.value).toBe('loading_advance');
  });
  it('queues a workflow refresh if an older payment read is still running', () => {
    const pending = new Subject<DirectPaymentView>(); api.view.and.returnValue(pending);
    const f = TestBed.createComponent(BookingDirectPaymentsComponent); f.componentRef.setInput('bookingUuid', 'booking-1'); f.detectChanges();
    api.view.and.returnValue(of({ ...view, allowed_milestones: ['loading_advance'] }));
    f.componentRef.setInput('revision', 'loading-confirmed'); f.detectChanges(); expect(api.view).toHaveBeenCalledTimes(1);
    pending.next({ ...view, allowed_milestones: [] }); pending.complete(); f.detectChanges();
    expect(api.view).toHaveBeenCalledTimes(2); expect(f.nativeElement.querySelector('select[name=milestone]')?.value).toBe('loading_advance');
    f.destroy();
  });
  it('disables duplicate report submissions while keeping a retry key after an unknown outcome', () => {
    const pending = new Subject<DirectPaymentView>(); api.report.and.returnValue(pending); const f = booking(); const c = f.componentInstance as any; c.amount = '2000'; c.reference = 'QA123456'; c.report(); c.report(); f.detectChanges();
    expect(api.report).toHaveBeenCalledTimes(1); expect(f.nativeElement.querySelector('.spinner')).toBeTruthy(); const key = api.report.calls.mostRecent().args[1].request_uuid;
    pending.error(new HttpErrorResponse({ status: 0 })); api.report.and.returnValue(of(view)); c.report(); expect(api.report.calls.mostRecent().args[1].request_uuid).toBe(key);
  });
  it('does not reveal a stale bank version or retain the password after a failure', () => {
    const f = booking({ ...view, instruction: { ...view.instruction!, current: false } }); const c = f.componentInstance as any; c.password = 'private'; c.reveal(); expect(api.reveal).not.toHaveBeenCalled();
    c.view.set(view); api.reveal.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Bank instructions changed.' } }))); c.reveal(); expect(c.password).toBe(''); expect(c.full()).toBeNull(); expect(c.error()).toBe('Bank instructions changed.');
  });
  it('keeps full accounts out of default view and clears them when refreshed', () => {
    api.reveal.and.returnValue(of({ ...bank, account_number: '0000123456789012' })); const f = booking(); const c = f.componentInstance as any; expect(f.nativeElement.textContent).not.toContain('0000123456789012');
    c.password = 'private'; c.reveal(); f.detectChanges(); expect(f.nativeElement.querySelector('[data-full-bank]').textContent).toContain('0000123456789012'); c.load(); expect(c.full()).toBeNull(); expect(c.password).toBe(''); f.destroy();
  });
  it('requires a dispute reason and shows recipient-only actions', () => {
    const receipt = { uuid: 'receipt-1', milestone: 'final' as const, milestone_uuid: null, amount: '2000', transfer_date: '2026-11-21', reference: 'QA123456', status: 'reported_by_payer' as const, decision_note: null, decided_at: null, created_at: '2026-11-21T10:00:00Z', account_mask: '****9012', bank_version: 1 };
    const f = booking({ ...view, side: 'recipient', receipts: [receipt] }); const c = f.componentInstance as any; c.decision(receipt.uuid, 'disputed'); expect(api.decide).not.toHaveBeenCalled(); expect(c.error()).toContain('Explain');
    expect(f.nativeElement.textContent).toContain('Confirm money received'); expect(f.nativeElement.querySelector('#receipt-reference')).toBeNull();
  });
  it('automatically clears a revealed account after 60 seconds', fakeAsync(() => {
    api.reveal.and.returnValue(of({ ...bank, account_number: '0000123456789012' }));
    const f = booking(); const c = f.componentInstance as any; c.password = 'private'; c.reveal();
    tick(59_999); expect(c.full()).not.toBeNull(); tick(1); expect(c.full()).toBeNull();
    expect(c.password).toBe(''); f.destroy();
  }));
  it('starts bank edits blank and preserves leading zeroes on save', () => {
    const f = TestBed.createComponent(RecipientBankSetupComponent); f.detectChanges(); const c = f.componentInstance as any; c.edit(); expect(c.draft.account_number).toBe(''); expect(c.draft.version).toBe(1);
    api.saveBank.and.returnValue(of({ ...bank, version: 2, status: 'pending' })); c.draft.account_number = '0000123456789012'; c.draft.current_password = 'private'; c.save();
    expect(api.saveBank.calls.mostRecent().args[0].account_number).toBe('0000123456789012'); expect(c.draft.current_password).toBe(''); expect(c.bank().status).toBe('pending');
  });
  it('never shows saved success when bank submission fails', () => {
    api.saveBank.and.returnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { errors: { current_password: ['Your current password is incorrect.'] } } })));
    const f = TestBed.createComponent(RecipientBankSetupComponent); f.detectChanges(); const c = f.componentInstance as any; c.edit(); c.save(); f.detectChanges(); expect(c.message()).toBe(''); expect(c.error()).toContain('password is incorrect');
  });
  it('does not show an empty review queue when authorization fails', () => {
    api.queue.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'Bank review is not authorized.' } })));
    const f = TestBed.createComponent(RecipientBankReviewComponent); f.detectChanges(); expect(f.nativeElement.textContent).toContain('not authorized'); expect(f.nativeElement.textContent).not.toContain('No bank submissions');
  });
});
