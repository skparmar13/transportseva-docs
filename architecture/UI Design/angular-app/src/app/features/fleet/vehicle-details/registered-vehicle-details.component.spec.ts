import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ApiMarketplaceService, ApiMarketplaceVehicle } from '../../../core/api/api-marketplace.service';
import { RegisteredVehicleDetailsComponent } from './registered-vehicle-details.component';

describe('RegisteredVehicleDetailsComponent', () => {
  const uuid = '12345678-1234-1234-1234-123456789012';
  const second = '22345678-1234-1234-1234-123456789012';
  const vehicle: ApiMarketplaceVehicle = { uuid, registration_number: 'QA14AA1234', vehicle_type: '32ft Trailer',
    make: 'Tata', model: 'Registered', year_of_make: 2023, capacity_tons: '18.50', status: 'available', availability_status: 'reserved' };
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let api: jasmine.SpyObj<ApiMarketplaceService>;

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id: uuid }));
    api = jasmine.createSpyObj('ApiMarketplaceService', ['getMarketplaceVehicle']);
    api.getMarketplaceVehicle.and.returnValue(of(vehicle));
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: params } }, { provide: ApiMarketplaceService, useValue: api }] });
  });

  it('renders persisted values and allocation without prototype-only actions', () => {
    const fixture = TestBed.createComponent(RegisteredVehicleDetailsComponent); fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('QA14AA1234'); expect(text).toContain('Registered');
    expect(text).toContain('18.50'); expect(text).toContain('Reserved');
    expect(fixture.nativeElement.querySelector('input[type=file]')).toBeNull();
    expect(text).not.toContain('Assign Device'); expect(text).not.toContain('Log Maintenance');
  });

  it('shows loading, clears old data and cancels stale requests on route changes', () => {
    const firstRequest = new Subject<ApiMarketplaceVehicle>();
    const nextRequest = new Subject<ApiMarketplaceVehicle>();
    api.getMarketplaceVehicle.and.returnValues(firstRequest, nextRequest);
    const fixture = TestBed.createComponent(RegisteredVehicleDetailsComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading registered vehicle');
    params.next(convertToParamMap({ id: second }));
    firstRequest.next(vehicle); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('QA14AA1234');
    nextRequest.next({ ...vehicle, uuid: second, registration_number: 'QA14BB5678' }); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('QA14BB5678');
    expect(fixture.nativeElement.textContent).not.toContain('QA14AA1234');
  });

  it('shows a retryable error, then recovers without reloading the browser', () => {
    api.getMarketplaceVehicle.and.returnValues(throwError(() => new HttpErrorResponse({ status: 503 })), of(vehicle));
    const fixture = TestBed.createComponent(RegisteredVehicleDetailsComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Vehicle details could not be loaded');
    const button = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    button.find((item) => item.textContent?.includes('Try again'))!.click(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('QA14AA1234');
  });

  it('distinguishes denied and missing vehicles without substituting sample data', () => {
    api.getMarketplaceVehicle.and.returnValues(throwError(() => new HttpErrorResponse({ status: 403 })),
      throwError(() => new HttpErrorResponse({ status: 404 })));
    const fixture = TestBed.createComponent(RegisteredVehicleDetailsComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Vehicle access unavailable');
    params.next(convertToParamMap({ id: second })); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Vehicle not found');
    expect(fixture.nativeElement.textContent).not.toContain('QA14AA1234');
  });

  it('rejects prototype IDs before calling the backend', () => {
    params.next(convertToParamMap({ id: 'v1' }));
    const fixture = TestBed.createComponent(RegisteredVehicleDetailsComponent); fixture.detectChanges();
    expect(api.getMarketplaceVehicle).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Vehicle not found');
  });
});
