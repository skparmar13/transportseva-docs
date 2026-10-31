import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiLoad, ApiMarketplaceVehicle } from './api-marketplace.service';

export interface ShipperDashboard {
  dashboard_type: 'shipper';
  generated_at: string;
  totals: { loads_posted: number; pending_applications: number; in_transit_bookings: number; delivered_bookings: number };
  recent_loads: ApiLoad[];
}
export interface ProviderDashboard {
  dashboard_type: 'provider';
  generated_at: string;
  totals: { vehicles_total: number; vehicles_on_trip: number; vehicles_available: number; pending_applications: number };
  recent_vehicles: ApiMarketplaceVehicle[];
}

@Injectable({ providedIn: 'root' })
export class ApiDashboardService {
  private readonly api = inject(ApiClientService);

  shipper(): Observable<ShipperDashboard> { return this.load<ShipperDashboard>('shipper'); }
  provider(): Observable<ProviderDashboard> { return this.load<ProviderDashboard>('provider'); }

  private load<T extends ShipperDashboard | ProviderDashboard>(expected: T['dashboard_type']): Observable<T> {
    // Identity and scope are inferred by the API, never supplied by the browser.
    return this.api.get<T>('marketplace-dashboard').pipe(map((response) => {
      if (!response.success || response.data?.dashboard_type !== expected) throw new Error('Unexpected dashboard response');
      return response.data;
    }));
  }
}
