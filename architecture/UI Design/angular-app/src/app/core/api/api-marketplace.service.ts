import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from './api-client.service';

/** Backend load contract used by the first marketplace integration slice. */
export interface ApiLoad {
  uuid: string;
  load_id?: string;
  pickup_city: string;
  drop_city: string;
  material?: string;
  weight_tons?: number;
  vehicle_type?: string;
  pickup_date?: string;
  budget?: number;
  status: string;
  applications_count?: number;
  created_at?: string;
}

export interface LoadSearchParams {
  pickup_city?: string;
  drop_city?: string;
  vehicle_type?: string;
  page?: number;
  per_page?: number;
}

export interface CreateApplicationPayload {
  applicant_role: 'transporter' | 'truck-owner';
  applicant_name: string;
  vehicle_reg_number: string;
  vehicle_type: string;
  availability: string;
  quoted_amount: number;
  message?: string;
}

export interface ApiApplication {
  uuid: string;
  application_id?: string;
  load_uuid: string;
  applicant_role: 'transporter' | 'truck-owner';
  applicant_name: string;
  vehicle_reg_number: string;
  vehicle_type: string;
  availability: string;
  quoted_amount: number;
  message?: string;
  status: string;
  created_at?: string;
}

export interface CreateOfferPayload {
  by_role: 'owner' | 'applicant';
  by_name: string;
  amount: number;
  message?: string;
}

export interface ApiTokenOrder {
  uuid: string;
  booking_uuid: string;
  party_role: string;
  amount: number;
  currency: string;
  status: string;
  provider_order_id?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiMarketplaceService {
  private readonly api = inject(ApiClientService);

  listRecentLoads(perPage = 10): Observable<ApiLoad[]> {
    return this.api.get<ApiLoad[]>('loads/recent', { per_page: Math.min(perPage, 20) }).pipe(map((response) => response.data));
  }

  listLoads(params: LoadSearchParams = {}): Observable<ApiLoad[]> {
    return this.api.get<ApiLoad[]>('loads', { ...params }).pipe(map((response) => response.data));
  }

  getLoad(uuid: string): Observable<ApiLoad> {
    return this.api.get<ApiLoad>(`loads/${encodeURIComponent(uuid)}`).pipe(map((response) => response.data));
  }

  createLoad(payload: Record<string, unknown>): Observable<ApiLoad> {
    return this.api.post<ApiLoad>('loads', payload).pipe(map((response) => response.data));
  }

  createApplication(loadUuid: string, payload: CreateApplicationPayload): Observable<unknown> {
    return this.api.post<unknown>(`loads/${encodeURIComponent(loadUuid)}/applications`, payload).pipe(map((response) => response.data));
  }

  listApplications(loadUuid: string): Observable<ApiApplication[]> {
    return this.api.get<ApiApplication[]>(`loads/${encodeURIComponent(loadUuid)}/applications`, { per_page: 100 }).pipe(map((response) => response.data));
  }

  createOffer(applicationUuid: string, payload: CreateOfferPayload): Observable<unknown> {
    return this.api.post<unknown>(`applications/${encodeURIComponent(applicationUuid)}/offers`, payload).pipe(map((response) => response.data));
  }

  acceptApplication(loadUuid: string, applicationUuid: string): Observable<unknown> {
    return this.api.post<unknown>(`loads/${encodeURIComponent(loadUuid)}/applications/${encodeURIComponent(applicationUuid)}/accept`, {}).pipe(map((response) => response.data));
  }

  rejectApplication(loadUuid: string, applicationUuid: string): Observable<unknown> {
    return this.api.post<unknown>(`loads/${encodeURIComponent(loadUuid)}/applications/${encodeURIComponent(applicationUuid)}/reject`, {}).pipe(map((response) => response.data));
  }

  createMarketplaceBooking(loadUuid: string, applicationUuid: string): Observable<unknown> {
    return this.api.post<unknown>(`loads/${encodeURIComponent(loadUuid)}/applications/${encodeURIComponent(applicationUuid)}/booking`, {}).pipe(map((response) => response.data));
  }

  listTokenOrders(bookingUuid: string): Observable<ApiTokenOrder[]> {
    return this.api.get<ApiTokenOrder[]>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/token-orders`).pipe(map((response) => response.data));
  }

  createTokenOrder(bookingUuid: string): Observable<ApiTokenOrder> {
    return this.api.post<ApiTokenOrder>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/token-orders`, {}).pipe(map((response) => response.data));
  }

  createTokenCheckout(bookingUuid: string, orderUuid: string): Observable<{ payment_session_id: string; provider_order_id: string; order: ApiTokenOrder }> {
    return this.api.post<{ payment_session_id: string; provider_order_id: string; order: ApiTokenOrder }>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/token-orders/${encodeURIComponent(orderUuid)}/checkout`, {}).pipe(map((response) => response.data));
  }
}
