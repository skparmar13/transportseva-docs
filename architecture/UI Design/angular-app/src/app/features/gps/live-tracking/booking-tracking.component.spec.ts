import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { ApiBookingTrackingService, BookingTrackingView } from '../../../core/api/api-booking-tracking.service';
import { SessionService } from '../../../core/services/session.service';
import { BookingTrackingComponent } from './booking-tracking.component';

const initial: BookingTrackingView = { booking_uuid: 'one', booking_reference: 'QA-ONE', booking_status: 'in_transit', vehicle_reg_number: 'QATRACK', driver_name: 'QA Driver', status: 'no_signal', latest: null, points: [], poll_after_seconds: 10, stale_after_seconds: 120, test_mode: true };
const located: BookingTrackingView = { ...initial, status: 'updating', latest: { uuid: 'point-1', latitude: 28.6, longitude: 77.2, accuracy_m: 8, speed_kmph: 42, heading: 120, source: 'simulation', simulated: true, recorded_at: '2026-11-26T10:00:00Z', received_at: '2026-11-26T10:00:00Z' } };

describe('Booking tracking refresh and boundaries', () => {
  let api: jasmine.SpyObj<ApiBookingTrackingService>;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    api = jasmine.createSpyObj('ApiBookingTrackingService', ['view', 'bookings']);
    api.view.and.returnValue(of(initial)); api.bookings.and.returnValue(of({ success: true, data: [], meta: { last_page: 1 } }));
    params = new BehaviorSubject(convertToParamMap({ booking: 'one', vehicle: 'QATRACK' }));
    TestBed.configureTestingModule({ imports: [BookingTrackingComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), { provide: ApiBookingTrackingService, useValue: api }, { provide: ActivatedRoute, useValue: { queryParamMap: params } }, { provide: SessionService, useValue: { role: () => 'shipper', portal: () => ({ basePath: '/shipper' }) } }] });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function create(config = { provider: 'openstreetmap', google_embed_key: null as string | null, embed_available: true, search_available: true }) { const f = TestBed.createComponent(BookingTrackingComponent); TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/public/maps/config')).flush({ success: true, data: config }); f.detectChanges(); tick(0); f.detectChanges(); return f; }
  it('uses a Google map when the server selects Google and preserves the recorded coordinates', fakeAsync(() => {
    api.view.and.returnValue(of(located)); const f = create({ provider: 'google', google_embed_key: 'browser-test-key', embed_available: true, search_available: true });
    const frame: HTMLIFrameElement = f.nativeElement.querySelector('iframe');
    expect(new URL(frame.src).origin).toBe('https://www.google.com'); expect(new URL(frame.src).searchParams.get('q')).toBe('28.6,77.2');
    expect(frame.referrerPolicy).toBe('strict-origin-when-cross-origin'); f.destroy();
  }));
  it('keeps coordinates visible when Google is not configured and retries map configuration', fakeAsync(() => {
    api.view.and.returnValue(of(located)); const f = create({ provider: 'google', google_embed_key: null, embed_available: false, search_available: false });
    expect(f.nativeElement.querySelector('iframe')).toBeNull(); expect(f.nativeElement.textContent).toContain('Google Maps is unavailable'); expect(f.nativeElement.querySelector('[data-tracking-coordinate]')).toBeTruthy();
    const retry = [...f.nativeElement.querySelectorAll('button')].find((b: any) => b.textContent.includes('Retry map')) as HTMLButtonElement; retry.click();
    TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/public/maps/config')).flush({ success: true, data: { provider: 'google', google_embed_key: 'browser-test-key', embed_available: true, search_available: true } }); f.detectChanges();
    expect(f.nativeElement.querySelector('iframe').src).toContain('www.google.com'); f.destroy();
  }));
  it('shows no signal without inventing coordinates and passes the assigned registration to the API', fakeAsync(() => {
    const f = create(); expect(f.nativeElement.querySelector('[data-tracking-no-signal]')).toBeTruthy(); expect(f.nativeElement.querySelector('iframe')).toBeNull();
    expect(api.view).toHaveBeenCalledWith('one', 'QATRACK'); f.destroy();
  }));
  it('polls without navigation and labels simulated positions explicitly', fakeAsync(() => {
    const f = create(); api.view.and.returnValue(of(located)); tick(10_000); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-tracking-coordinate]').textContent).toContain('28.6000000, 77.2000000');
    expect(f.nativeElement.querySelector('[data-tracking-simulation]').textContent).toContain('not a real vehicle location');
    const src = f.nativeElement.querySelector('iframe').src; expect(src).toContain('marker=28.6,77.2'); f.destroy();
    const calls = api.view.calls.count(); tick(30_000); expect(api.view.calls.count()).toBe(calls);
  }));
  it('cancels the previous booking read when the route changes', fakeAsync(() => {
    const pending = new Subject<BookingTrackingView>(); api.view.and.returnValue(pending); const f = create();
    api.view.and.returnValue(of({ ...initial, booking_uuid: 'two', booking_reference: 'QA-TWO' }));
    params.next(convertToParamMap({ booking: 'two' })); tick(0); pending.next(located); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-booking-tracking]').getAttribute('data-booking')).toBe('two');
    expect(f.nativeElement.querySelector('[data-tracking-coordinate]')).toBeNull(); f.destroy();
  }));
  it('marks connection failures as out of date and clears coordinates if authorization is lost', fakeAsync(() => {
    api.view.and.returnValue(of(located)); const f = create();
    api.view.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 }))); tick(10_000); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-tracking-status]').textContent).toContain('Connection interrupted');
    api.view.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 }))); tick(10_000); f.detectChanges();
    expect(f.nativeElement.querySelector('iframe')).toBeNull(); expect(f.nativeElement.querySelector('[data-tracking-coordinate]')).toBeNull(); f.destroy();
  }));
  it('distinguishes stale positions from ended trips and never calls them live', fakeAsync(() => {
    api.view.and.returnValue(of({ ...located, status: 'stale' })); const f = create();
    expect(f.nativeElement.querySelector('[data-tracking-status]').textContent).toContain('Signal stale');
    api.view.and.returnValue(of({ ...located, status: 'ended' })); tick(10_000); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-tracking-status]').textContent).toContain('Trip ended'); f.destroy();
  }));
  it('shows refresh feedback and does not overlap a slow read with polling or another click', fakeAsync(() => {
    const f = create(), pending = new Subject<BookingTrackingView>(); api.view.and.returnValue(pending);
    f.nativeElement.querySelector('[data-refresh-location]').click(); f.detectChanges();
    const button: HTMLButtonElement = f.nativeElement.querySelector('[data-refresh-location]');
    expect(button.disabled).toBeTrue(); expect(button.getAttribute('aria-busy')).toBe('true'); expect(button.querySelector('.tracking-spinner')).toBeTruthy();
    const calls = api.view.calls.count(); tick(20_000); expect(api.view.calls.count()).toBe(calls);
    pending.next(initial); pending.complete(); f.detectChanges(); expect(button.disabled).toBeFalse(); f.destroy();
  }));
});
