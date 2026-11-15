import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperTripService } from '../../../core/api/api-shipper-trip.service';
import { LanguageService } from '../../../core/i18n';
import { ShipperTripListComponent } from '../../shipper/trips/shipper-trip-list.component';
import { ShipperTripDetailsComponent } from '../../shipper/trips/shipper-trip-details.component';
import { tripDetailFixture, tripListFixture } from '../../shipper/trips/shipper-trip.fixtures';

describe('Shared trip pages in the guarded transporter portal', () => {
  const config = API_CONFIG as { useBackend: boolean };
  let original: boolean;
  let api: jasmine.SpyObj<ApiShipperTripService>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true;
    api = jasmine.createSpyObj('providerTrips', ['list', 'get', 'downloadPod']);
    api.list.and.returnValue(of(structuredClone(tripListFixture)));
    api.get.and.returnValue(of({ ...structuredClone(tripDetailFixture), trip: { ...tripDetailFixture.trip, shipper_name: 'Actual QA Shipper', viewer_side: 'provider' } }));
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), { provide: ApiShipperTripService, useValue: api },
      { provide: ActivatedRoute, useFactory: () => ({
        snapshot: { ...TestBed.inject(Router).routerState.snapshot.root, data: { tripPortal: 'transporter' } },
        paramMap: new BehaviorSubject(convertToParamMap({ id: tripDetailFixture.trip.uuid })),
      }) },
    ] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  it('renders real totals and links every list row into the transporter portal', () => {
    const f = TestBed.createComponent(ShipperTripListComponent); f.detectChanges();
    expect(f.nativeElement.querySelector('h1').textContent).toBe('My Trips');
    expect(f.nativeElement.querySelector('[data-trip-total=total]').textContent).toBe(String(tripListFixture.totals.total));
    expect(f.nativeElement.querySelector('[data-trip-row] a').getAttribute('href')).toBe('/transporter/trips/' + tripDetailFixture.trip.uuid);
  });
  it('shows the actual shipper and exact owner booking/load/back links', () => {
    const f = TestBed.createComponent(ShipperTripDetailsComponent); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Actual QA Shipper');
    expect(f.nativeElement.querySelector('[data-trip-booking-link]').getAttribute('href')).toBe('/transporter/requests?booking=' + tripDetailFixture.trip.uuid);
    const links = [...f.nativeElement.querySelectorAll('a')].map((a: any) => a.getAttribute('href'));
    expect(links).toContain('/transporter/trips');
    expect(links.some((href) => href?.startsWith('/shipper/'))).toBeFalse();
    expect(f.nativeElement.querySelector('[data-trip-gps-unavailable]')).toBeNull();
  });
  it('uses provider-specific unavailable/retry copy, then renders the genuine saved detail', () => {
    api.get.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const f = TestBed.createComponent(ShipperTripDetailsComponent); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('transporter account');
    expect(f.nativeElement.querySelector('[data-trip-reference]')).toBeNull();
    api.get.and.returnValue(of(tripDetailFixture)); (f.componentInstance as any).load(); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-trip-reference]').textContent).toBe(tripDetailFixture.trip.reference);
  });
  it('shows provider and review copy when the transporter owns the load', () => {
    api.get.and.returnValue(of({ ...tripDetailFixture, trip: { ...tripDetailFixture.trip, viewer_side: 'owner', shipper_name: 'Self Owner' } }));
    const f = TestBed.createComponent(ShipperTripDetailsComponent); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('QA Provider');
    expect(f.nativeElement.textContent).not.toContain('Self Owner');
    (f.componentInstance as any).tab.set('podLabel'); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Review the provider');
    expect(f.nativeElement.querySelector('[data-trip-booking-link]').getAttribute('href')).toContain('/transporter/requests?booking=');
  });
  it('supports Hindi and offers only the linked booking workflow for POD changes', () => {
    TestBed.inject(LanguageService).setLang('hi');
    const f = TestBed.createComponent(ShipperTripDetailsComponent); f.detectChanges();
    (f.componentInstance as any).tab.set('podLabel'); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('लोड स्वामी इसकी समीक्षा करता है');
    expect(f.nativeElement.querySelector('input[type=file]')).toBeNull();
    expect(f.nativeElement.querySelector('[data-trip-booking-link]').getAttribute('href')).toContain('/transporter/requests?booking=');
  });
});
