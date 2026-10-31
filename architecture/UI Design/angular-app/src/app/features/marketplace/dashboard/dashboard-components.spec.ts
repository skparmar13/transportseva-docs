import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiDashboardService, ShipperDashboard, ProviderDashboard } from '../../../core/api/api-dashboard.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { SessionService } from '../../../core/services/session.service';
import { ShipperDashboardComponent } from '../../shipper/dashboard/shipper-dashboard.component';
import { TruckOwnerDashboardComponent } from '../../truck-owner/dashboard/truck-owner-dashboard.component';

const shipper: ShipperDashboard = { dashboard_type: 'shipper', generated_at: '2026-10-31T08:00:00Z',
  totals: { loads_posted: 125, pending_applications: 8, in_transit_bookings: 2, delivered_bookings: 3 },
  recent_loads: [{ uuid: 'load-qa', load_id: 'LD-000125', pickup_city: 'QA Origin', drop_city: 'QA Destination', status: 'open', budget: '17000.00', applications_count: 4 }] };
const provider: ProviderDashboard = { dashboard_type: 'provider', generated_at: shipper.generated_at,
  totals: { vehicles_total: 120, vehicles_on_trip: 4, vehicles_available: 110, pending_applications: 2 },
  recent_vehicles: [{ uuid: 'vehicle-qa', registration_number: 'DASHQA1234', vehicle_type: '32ft Trailer', make: 'Tata', model: 'Registered',
    capacity_tons: '18.00', status: 'available', availability_status: 'reserved', created_at: shipper.generated_at }] };

for (const scenario of [
  { role: 'shipper', component: ShipperDashboardComponent, method: 'shipper', data: shipper, expected: ['125', '8', '2', '3'],
    rowText: 'QA Origin', rowPath: '/shipper/load-board/load-qa', empty: 'No loads posted yet.' },
  { role: 'truck-owner', component: TruckOwnerDashboardComponent, method: 'provider', data: provider, expected: ['120', '4', '110', '2'],
    rowText: 'DASHQA1234', rowPath: '/truck-owner/vehicles/vehicle-qa', empty: 'No vehicles registered yet.' },
] as const) {
  describe(scenario.role + ' real dashboard', () => {
    let api: jasmine.SpyObj<ApiDashboardService>; let original: boolean;
    const config = API_CONFIG as { useBackend: boolean };
    const create = () => { const fixture = TestBed.createComponent(scenario.component as Type<any>); fixture.detectChanges(); return fixture; };
    const zero = () => scenario.role === 'shipper'
      ? { ...shipper, totals: { loads_posted: 0, pending_applications: 0, in_transit_bookings: 0, delivered_bookings: 0 }, recent_loads: [] }
      : { ...provider, totals: { vehicles_total: 0, vehicles_on_trip: 0, vehicles_available: 0, pending_applications: 0 }, recent_vehicles: [] };
    beforeEach(() => {
      original = config.useBackend; config.useBackend = true;
      api = jasmine.createSpyObj('ApiDashboardService', ['shipper', 'provider']);
      api[scenario.method].and.returnValue(of(scenario.data) as any);
      TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiDashboardService, useValue: api },
        { provide: SessionService, useValue: { user: () => ({ name: 'Dashboard QA' }) } }] });
      TestBed.inject(LanguageService).setLang('en');
    });
    afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });

    it('renders server totals, real row links and formatted timestamps without fake trends or money', () => {
      const fixture = create(); const element: HTMLElement = fixture.nativeElement;
      expect(Array.from(element.querySelectorAll('.kpi-value')).map((node) => node.textContent?.trim())).toEqual([...scenario.expected]);
      expect(element.querySelectorAll('.kpi-trend').length).toBe(0);
      expect(element.textContent).toContain(scenario.rowText);
      expect(element.querySelector('tbody a')?.getAttribute('href')).toBe(scenario.rowPath);
      expect(element.textContent).toMatch(/31\/10\/2026 \d{2}:\d{2} (AM|PM)/);
      expect(element.textContent).not.toContain('Earnings (This Month)');
      expect(element.textContent).not.toContain('Payment Ledger Due');
    });
    it('shows a genuine successful zero state with no sample rows', () => {
      api[scenario.method].and.returnValue(of(zero()) as any);
      const element: HTMLElement = create().nativeElement;
      expect(Array.from(element.querySelectorAll('.kpi-value')).map((node) => node.textContent?.trim())).toEqual(['0', '0', '0', '0']);
      expect(element.textContent).toContain(scenario.empty);
      expect(element.querySelectorAll('tbody tr').length).toBe(0);
    });
    it('shows loading feedback and disables duplicate refresh without zero placeholders', () => {
      api[scenario.method].and.returnValue(new Subject<any>());
      const fixture = create(); const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('[aria-busy=true]')).not.toBeNull();
      expect(element.querySelectorAll('.kpi-value').length).toBe(0);
      const refresh = element.querySelector('button')!; expect(refresh.disabled).toBeTrue();
      refresh.click(); fixture.detectChanges(); expect(api[scenario.method]).toHaveBeenCalledTimes(1);
    });
    it('shows a retryable failure and then recovers to the actual server totals', () => {
      api[scenario.method].and.returnValues(throwError(() => new Error('Unavailable')), of(scenario.data) as any);
      const fixture = create(); const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('[role=alert]')).not.toBeNull();
      expect(element.querySelectorAll('.kpi-value').length).toBe(0);
      (element.querySelector('[role=alert] button') as HTMLButtonElement).click(); fixture.detectChanges();
      expect(element.textContent).toContain(scenario.rowText); expect(api[scenario.method]).toHaveBeenCalledTimes(2);
    });
    it('clears stale records during refresh and applies a changed successful response', () => {
      const pending = new Subject<any>(); api[scenario.method].and.returnValues(of(scenario.data) as any, pending);
      const fixture = create(); const element: HTMLElement = fixture.nativeElement;
      element.querySelector('button')!.click(); fixture.detectChanges();
      expect(element.textContent).not.toContain(scenario.rowText); expect(element.querySelectorAll('.kpi-value').length).toBe(0);
      pending.next(zero()); fixture.detectChanges(); expect(element.textContent).toContain(scenario.empty);
      expect(Array.from(element.querySelectorAll('.kpi-value')).every((node) => node.textContent?.trim() === '0')).toBeTrue();
    });
    it('does not call APIs or show mock figures when backend mode is disabled', () => {
      config.useBackend = false; const element: HTMLElement = create().nativeElement;
      expect(api[scenario.method]).not.toHaveBeenCalled(); expect(element.querySelector('[role=alert]')).not.toBeNull();
      expect(element.querySelectorAll('.kpi-value').length).toBe(0);
    });
    it('uses the Hindi feature copy instead of untranslated keys', () => {
      TestBed.inject(LanguageService).setLang('hi'); const element: HTMLElement = create().nativeElement;
      expect(element.textContent).toContain('लंबित आवेदन'); expect(element.textContent).toContain('डैशबोर्ड रीफ़्रेश करें');
      expect(element.textContent).not.toContain('shipperDashboard.'); expect(element.textContent).not.toContain('truckOwnerDashboard.');
    });
  });
}
