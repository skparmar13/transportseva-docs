import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ApiCommercialTermsService, CommercialAgreement } from '../../../core/api/api-commercial-terms.service';
import { BookingCommercialTermsComponent } from './booking-commercial-terms.component';

describe('Booking commercial agreement', () => {
  let api: jasmine.SpyObj<ApiCommercialTermsService>;
  const sample = (): CommercialAgreement => ({
    required: true, status: 'awaiting_acceptance', viewer_side: 'owner', booking_reference: 'QA-TERMS', booking_status: 'awaiting_tokens', history: [],
    current: { version: 2, fingerprint: 'a'.repeat(64), terms: { advance_percent: 30, advance_before_dispatch: true, balance_due_days: 7, tolls: 'included', loading: 'shipper_arranged', unloading: 'shipper_arranged', pickup_free_hours: 4, delivery_free_hours: 4, detention_rate_amount: 200, detention_rate_unit: 'per_hour', cancellation_policy: 'admin_review', cargo_insurance: 'shipper_arranged' },
      financials: { currency: 'INR', rate_basis: 'per_trip', payment_model: 'direct_gross', gross_freight: 17000, owner_platform_fee: 1003, provider_platform_fee: 1003, token_each: 1000, advance_amount: 5100, balance_before_mid_trip: 11900, commission_policy_version: 1 }, owner_accepted_at: null, provider_accepted_at: null, agreed_at: null, created_at: '2026-11-27T10:00:00Z' },
  });
  beforeEach(() => {
    api = jasmine.createSpyObj('ApiCommercialTermsService', ['get', 'accept', 'propose', 'document']); api.get.and.returnValue(of(sample()));
    TestBed.configureTestingModule({ imports: [BookingCommercialTermsComponent], providers: [provideRouter([]), { provide: ApiCommercialTermsService, useValue: api }] });
  });
  function mount() {
    const f = TestBed.createComponent(BookingCommercialTermsComponent); f.componentRef.setInput('bookingUuid', 'booking-qa'); f.detectChanges(); return f;
  }
  it('loads once and renders gross freight, independent fees, tokens and the actual advance', () => {
    const f = mount(); f.detectChanges();
    expect(api.get).toHaveBeenCalledTimes(1); expect(f.nativeElement.textContent).toContain('₹5,100.00');
    expect(f.nativeElement.textContent).toContain('Provider platform fee (separate)'); expect(f.nativeElement.textContent).toContain('Booking token, each party (separate)');
    expect(f.nativeElement.textContent).not.toContain('Download agreed confirmation');
  });
  it('requires explicit acknowledgement and submits the exact displayed version', () => {
    const f = mount(); f.componentInstance.submit(); expect(api.accept).not.toHaveBeenCalled();
    api.accept.and.returnValue(of(sample())); f.componentInstance.acknowledged = true; f.componentInstance.submit();
    expect(api.accept).toHaveBeenCalledWith('booking-qa', jasmine.objectContaining({ version: 2, fingerprint: 'a'.repeat(64) }));
  });
  it('shows a pending action and prevents duplicate clicks', () => {
    const waiting = new Subject<CommercialAgreement>(); api.accept.and.returnValue(waiting);
    const f = mount(); f.componentInstance.acknowledged = true; f.componentInstance.submit(); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Recording acceptance'); f.componentInstance.submit(); expect(api.accept).toHaveBeenCalledTimes(1);
    waiting.next(sample()); waiting.complete(); expect(f.componentInstance.busy()).toBe('');
  });
  it('keeps a stale-version failure visible and clears acknowledgement', () => {
    api.accept.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Terms changed. Refresh and review the latest version.' } })));
    const f = mount(); f.componentInstance.acknowledged = true; f.componentInstance.submit(); f.detectChanges();
    expect(f.nativeElement.querySelector('[role=alert]').textContent).toContain('Terms changed'); expect(f.componentInstance.acknowledged).toBeFalse();
  });
  it('allows recovery from a failed read without sending acceptance', () => {
    api.get.and.returnValue(throwError(() => ({ status: 500 })));
    const f = mount(); expect(f.componentInstance.loading()).toBeFalse(); expect(f.nativeElement.querySelector('[role=alert]')).toBeTruthy();
    api.get.and.returnValue(of(sample())); f.componentInstance.refresh(); f.detectChanges(); expect(f.componentInstance.data()?.current?.version).toBe(2);
    expect(api.accept).not.toHaveBeenCalled();
  });
  it('does not fabricate terms or offer acceptance for legacy bookings', () => {
    api.get.and.returnValue(of({ ...sample(), required: false, status: 'legacy_not_recorded', current: null }));
    const f = mount(); expect(f.nativeElement.textContent).toContain('Historical commercial terms were not recorded');
    expect(f.nativeElement.textContent).not.toContain('Accept this version'); f.componentInstance.download(); expect(api.document).not.toHaveBeenCalled();
  });
  it('a new proposal carries all edited terms and records only the caller’s acceptance', () => {
    api.propose.and.returnValue(of(sample())); const f = mount(); f.componentInstance.draft!.advance_percent = 25;
    f.componentInstance.acknowledged = true; f.componentInstance.submit(true);
    expect(api.propose).toHaveBeenCalledWith('booking-qa', jasmine.objectContaining({ version: 2 }), jasmine.objectContaining({ advance_percent: 25 }));
    expect(f.componentInstance.notice()).toContain('other party');
  });
});
