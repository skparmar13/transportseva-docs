import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { WritableSignal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { BookingsComponent } from './bookings.component';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceBooking, ApiMarketplaceService, ApiMarketplaceVehicle } from '../../../core/api/api-marketplace.service';
import { CashfreeCheckoutService } from '../../../core/api/cashfree-checkout.service';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { PaymentMockService } from '../../../core/services/payment-mock.service';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { DriverMockService } from '../../../core/services/driver-mock.service';
import { SessionService } from '../../../core/services/session.service';

type Harness = {
  backendBookings: WritableSignal<ApiMarketplaceBooking[]>;
  backendVehicles: WritableSignal<ApiMarketplaceVehicle[]>;
  loading: WritableSignal<boolean>;
  loadError: WritableSignal<string>;
  assigningVehicleFor: WritableSignal<string | null>;
  vehicleRegInput: WritableSignal<string>;
  startTrip(id: string): void;
  completeTrip(id: string): void;
  confirmAssignVehicle(): void;
  retryBookings(): void;
  workflowActionErrorFor(id: string, action: string): string;
};

describe('Bookings request efficiency and recovery', () => {
  const config = API_CONFIG as unknown as { useBackend: boolean };
  const originalBackend = config.useBackend;
  const first: ApiMarketplaceBooking = {
    uuid: 'booking-first', booking_reference: 'TS-FIRST', load_uuid: 'load-first', application_uuid: 'app-first',
    gross_freight: 20000, status: 'confirmed', workflow: {},
  };
  const other: ApiMarketplaceBooking = { ...first, uuid: 'booking-other', booking_reference: 'TS-OTHER' };
  let fixture: ComponentFixture<BookingsComponent> | undefined;
  let api: jasmine.SpyObj<ApiMarketplaceService>;

  beforeEach(() => {
    config.useBackend = true;
    api = jasmine.createSpyObj<ApiMarketplaceService>('ApiMarketplaceService', ['listMarketplaceBookings', 'listMarketplaceVehicles', 'updateMarketplaceWorkflow']);
    api.listMarketplaceBookings.and.returnValue(of([first, other]));
    api.listMarketplaceVehicles.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [BookingsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({})) } },
        { provide: ApiMarketplaceService, useValue: api },
        { provide: CashfreeCheckoutService, useValue: {} },
        { provide: MarketplaceMockService, useValue: {} },
        { provide: PaymentMockService, useValue: {} },
        { provide: FleetMockService, useValue: {} },
        { provide: DriverMockService, useValue: {} },
        { provide: SessionService, useValue: { role: () => 'truck-owner', user: () => ({ name: 'Test provider' }) } },
      ],
    }).overrideComponent(BookingsComponent, { set: { template: '' } });
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = undefined;
    config.useBackend = originalBackend;
  });

  function create(): Harness {
    fixture = TestBed.createComponent(BookingsComponent);
    return fixture.componentInstance as unknown as Harness;
  }

  function selectVehicle(state: Harness): void {
    state.backendVehicles.set([{
      uuid: 'vehicle-first', registration_number: 'RJ14TEST1234', vehicle_type: '32ft Trailer',
      make: 'Tata', model: 'Test', capacity_tons: 20, status: 'available',
    }]);
    state.assigningVehicleFor.set(first.uuid);
    state.vehicleRegInput.set('RJ14TEST1234');
  }

  it('updates only the saved booking without a second list request or global spinner', () => {
    const pending = new Subject<ApiMarketplaceBooking>();
    api.updateMarketplaceWorkflow.and.returnValue(pending);
    const state = create();
    selectVehicle(state);
    state.confirmAssignVehicle();
    expect(state.loading()).toBeFalse();
    expect(state.assigningVehicleFor()).toBe(first.uuid);
    const saved: ApiMarketplaceBooking = { ...first, workflow: { vehicle_assignment: { mode: 'Own Fleet', vehicle_reg_number: 'RJ14TEST1234' } } };
    pending.next(saved);
    pending.complete();
    expect(state.backendBookings()).toEqual([saved, other]);
    expect(state.assigningVehicleFor()).toBeNull();
    expect(api.listMarketplaceBookings).toHaveBeenCalledTimes(1);
    expect(api.listMarketplaceVehicles).not.toHaveBeenCalled();
  });

  it('keeps existing state and shows a conflict instead of optimistically assigning a vehicle', () => {
    api.updateMarketplaceWorkflow.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 422, error: { message: 'This vehicle is already assigned to an active booking.' },
    })));
    const state = create();
    selectVehicle(state);
    state.confirmAssignVehicle();
    expect(state.backendBookings()).toEqual([first, other]);
    expect(state.assigningVehicleFor()).toBe(first.uuid);
    expect(state.workflowActionErrorFor(first.uuid, 'assign-vehicle')).toContain('already assigned');
    expect(api.listMarketplaceBookings).toHaveBeenCalledTimes(1);
  });

  it('renders trip transition responses without refetching every booking', () => {
    const state = create();
    const started: ApiMarketplaceBooking = { ...first, status: 'in_transit', workflow: { trip_started_at: '2026-10-27T10:00:00Z' } };
    api.updateMarketplaceWorkflow.and.returnValue(of(started));
    state.startTrip(first.uuid);
    expect(state.backendBookings()[0]).toEqual(started);
    const delivered: ApiMarketplaceBooking = { ...started, status: 'completed', workflow: { ...started.workflow, trip_completed_at: '2026-10-27T11:00:00Z' } };
    api.updateMarketplaceWorkflow.and.returnValue(of(delivered));
    state.completeTrip(first.uuid);
    expect(state.backendBookings()).toEqual([delivered, other]);
    expect(api.listMarketplaceBookings).toHaveBeenCalledTimes(1);
    expect(state.loading()).toBeFalse();
  });

  it('ends a stalled request after 30 seconds and recovers on retry', fakeAsync(() => {
    api.listMarketplaceBookings.and.returnValue(NEVER);
    const state = create();
    expect(state.loading()).toBeTrue();
    tick(30_001);
    expect(state.loading()).toBeFalse();
    expect(state.loadError()).toContain('took too long');
    api.listMarketplaceBookings.and.returnValue(of([first, other]));
    state.retryBookings();
    expect(state.loadError()).toBe('');
    expect(state.backendBookings()).toEqual([first, other]);
  }));

  it('cancels a pending list subscription when leaving the screen', () => {
    let cancelled = false;
    api.listMarketplaceBookings.and.returnValue(new Observable(() => () => { cancelled = true; }));
    create();
    expect(cancelled).toBeFalse();
    fixture!.destroy();
    expect(cancelled).toBeTrue();
  });
});
