import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ApiMarketplaceService, ApiMarketplaceDriver } from '../../../core/api/api-marketplace.service';
import { LanguageService } from '../../../core/i18n';
import { RegisteredDriverDetailsComponent } from './registered-driver-details.component';

describe('RegisteredDriverDetailsComponent', () => {
  const uuid = '12345678-1234-1234-1234-123456789012';
  const second = '22345678-1234-1234-1234-123456789012';
  const driver: ApiMarketplaceDriver = { uuid, name: '<b>Registered Driver</b>', phone: '9000011111', license_number: 'QA-LICENCE', license_expiry: '2028-12-31', experience_years: 0, status: 'available', is_busy: true, assigned_vehicle_reg_number: 'QA14AA1234' };
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let api: jasmine.SpyObj<ApiMarketplaceService>;
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id: uuid }));
    api = jasmine.createSpyObj('ApiMarketplaceService', ['listMarketplaceDrivers']);
    api.listMarketplaceDrivers.and.returnValue(of([driver]));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { paramMap: params } }, { provide: ApiMarketplaceService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  it('shows only persisted fields, escaped name, zero experience and real assignment', () => {
    const f = TestBed.createComponent(RegisteredDriverDetailsComponent); f.detectChanges();
    expect(f.nativeElement.textContent).toContain(driver.name);
    expect(f.nativeElement.querySelector('h2 b')).toBeNull();
    expect(f.nativeElement.textContent).toContain('31/12/2028');
    expect(f.nativeElement.textContent).toContain('QA14AA1234');
    expect(f.nativeElement.textContent).toContain('Experience (years): 0');
    expect(f.nativeElement.textContent).not.toContain('Rating');
    expect(f.nativeElement.querySelector('input[type=file]')).toBeNull();
    expect(f.nativeElement.querySelector('a.btn').getAttribute('href')).toContain('/bookings');
  });
  it('rejects malformed and foreign UUIDs without sample fallback', () => {
    params.next(convertToParamMap({ id: 'd1' }));
    const f = TestBed.createComponent(RegisteredDriverDetailsComponent); f.detectChanges();
    expect(api.listMarketplaceDrivers).not.toHaveBeenCalled();
    expect(f.nativeElement.textContent).toContain('Driver not found');
    params.next(convertToParamMap({ id: second })); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Driver not found');
    expect(f.nativeElement.textContent).not.toContain(driver.phone);
  });
  it('clears stale driver on route change and cancels old responses', () => {
    const old = new Subject<ApiMarketplaceDriver[]>(); const next = new Subject<ApiMarketplaceDriver[]>();
    api.listMarketplaceDrivers.and.returnValues(old, next);
    const f = TestBed.createComponent(RegisteredDriverDetailsComponent); f.detectChanges();
    expect(f.nativeElement.querySelector('.driver-spinner')).not.toBeNull();
    expect(f.nativeElement.querySelector('button').disabled).toBeTrue();
    params.next(convertToParamMap({ id: second })); old.next([driver]); f.detectChanges();
    expect(f.nativeElement.textContent).not.toContain(driver.phone);
    next.next([{ ...driver, uuid: second, name: 'Second', is_busy: false, assigned_vehicle_reg_number: null }]); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Second');
    expect(f.nativeElement.textContent).toContain('No active booking assignment');
  });
  it('recovers from failed reads and translates the view', () => {
    api.listMarketplaceDrivers.and.returnValues(throwError(() => new HttpErrorResponse({ status: 503 })), of([driver]));
    const f = TestBed.createComponent(RegisteredDriverDetailsComponent); f.detectChanges();
    expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();
    const buttons = Array.from(f.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    buttons.find(b => b.textContent === 'Retry')!.click(); f.detectChanges();
    expect(f.nativeElement.textContent).toContain(driver.phone);
    TestBed.inject(LanguageService).setLang('hi'); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('ड्राइवर प्रोफ़ाइल');
    TestBed.inject(LanguageService).setLang('en');
  });
  it('keeps denied and malformed reads distinct from missing drivers', () => {
    api.listMarketplaceDrivers.and.returnValues(throwError(() => new HttpErrorResponse({ status: 403 })), of(null as any));
    const f = TestBed.createComponent(RegisteredDriverDetailsComponent); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Access unavailable');
    params.next(convertToParamMap({ id: second })); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Driver could not be loaded');
  });
});
