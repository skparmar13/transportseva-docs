import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { ApiClientService } from './api-client.service';

/** Backend load contract used by the first marketplace integration slice. */
export interface ApiLoad {
  uuid: string;
  id?: number;
  load_id?: string;
  posted_by_name?: string;
  posted_by_role?: string;
  pickup_city: string;
  drop_city: string;
  material?: string;
  weight_tons?: number;
  vehicle_type?: string;
  pickup_date?: string;
  /** Laravel decimal casts may arrive as either a number or a numeric string. */
  budget?: number | string;
  status: string;
  applications_count?: number;
  /** Status of the current user's application, if they have applied to this load. */
  viewer_application_status?: string;
  created_at?: string;
}

export interface LoadSearchParams {
  pickup_city?: string;
  drop_city?: string;
  vehicle_type?: string;
  page?: number;
  per_page?: number;
  mine?: boolean;
}

export interface CreateApplicationPayload {
  applicant_role: 'transporter' | 'truck-owner';
  applicant_name: string;
  vehicle_reg_number: string;
  vehicle_type: string;
  availability: string;
  quoted_amount: number;
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
  current_offer_amount?: number | string;
  accepted_amount?: number | string | null;
  message?: string;
  status: string;
  created_at?: string;
  load?: ApiLoad;
}

export interface ApiOffer {
  uuid: string;
  application_uuid: string;
  load_uuid: string;
  by_role: 'owner' | 'applicant';
  by_name: string;
  amount: number | string;
  message?: string;
  created_at?: string;
}

export interface ApiChatMessage {
  uuid: string;
  booking_uuid: string;
  load_uuid: string;
  application_uuid: string;
  sender_role: 'owner' | 'applicant';
  sender_name: string;
  message: string;
  created_at?: string;
}

export interface CreateOfferPayload {
  by_role: 'owner' | 'applicant';
  by_name: string;
  amount: number;
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

export interface ApiMarketplaceBooking {
  uuid: string;
  booking_reference: string;
  load_uuid: string;
  application_uuid: string;
  gross_freight: number | string;
  shipper_fee?: number | string;
  provider_fee?: number | string;
  shipper_payable?: number | string;
  provider_payout?: number | string;
  status: string;
  workflow?: {
    vehicle_assignment?: { mode: 'Own Fleet' | 'Subcontracted'; vehicle_reg_number: string; subcontracted_to?: string; assigned_at?: string };
    driver_assignment?: { driver_name: string; driver_phone?: string; assigned_at?: string };
    loading_completed_at?: string;
    released_milestones?: Record<string, string>;
    trip_started_at?: string;
    trip_completed_at?: string;
  };
  owner_token_status?: string;
  provider_token_status?: string;
  settlement?: ApiSettlement;
  viewer_side?: 'owner' | 'provider';
  created_at?: string;
}

export interface ApiSettlement {
  uuid: string;
  booking_uuid: string;
  gross_freight: number | string;
  shipper_fee: number;
  provider_fee: number;
  shipper_payable: number;
  provider_payout: number;
  status: string;
  settled_at?: string;
}

export interface ApiDispute {
  uuid: string;
  booking_uuid: string;
  raised_by_uuid: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved';
  resolution?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiMarketplaceService {
  private readonly api = inject(ApiClientService);

  listRecentLoads(perPage = 10): Observable<ApiLoad[]> {
    return this.api.get<ApiLoad[]>('loads/recent', { per_page: Math.min(perPage, 20) }).pipe(map((response) => response.data.map((load) => this.normalizeLoad(load))));
  }

  listLoads(params: LoadSearchParams = {}): Observable<ApiLoad[]> {
    return this.api.get<ApiLoad[]>('loads', { ...params }).pipe(map((response) => response.data.map((load) => this.normalizeLoad(load))));
  }

  getLoad(uuid: string): Observable<ApiLoad> {
    return this.api.get<ApiLoad>(`loads/${encodeURIComponent(uuid)}`).pipe(map((response) => this.normalizeLoad(response.data)));
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

  listMyApplications(): Observable<ApiApplication[]> {
    return this.api.get<ApiApplication[]>('applications/mine', { per_page: 100 }).pipe(map((response) => response.data));
  }

  createOffer(applicationUuid: string, payload: CreateOfferPayload): Observable<unknown> {
    return this.api.post<unknown>(`applications/${encodeURIComponent(applicationUuid)}/offers`, payload).pipe(map((response) => response.data));
  }

  listOffers(applicationUuid: string): Observable<ApiOffer[]> {
    return this.api.get<ApiOffer[]>(`applications/${encodeURIComponent(applicationUuid)}/offers`).pipe(map((response) => response.data));
  }

  listChatMessages(bookingUuid: string): Observable<ApiChatMessage[]> {
    return this.api.get<ApiChatMessage[]>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/messages`).pipe(map((response) => response.data));
  }

  sendChatMessage(bookingUuid: string, message: string): Observable<ApiChatMessage> {
    return this.api.post<ApiChatMessage>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/messages`, { message }).pipe(map((response) => response.data));
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

  requestTokenRefund(bookingUuid: string, orderUuid: string): Observable<ApiTokenOrder> {
    return this.api.post<ApiTokenOrder>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/token-orders/${encodeURIComponent(orderUuid)}/refund`, {}).pipe(map((response) => response.data));
  }

  verifyTokenPayment(bookingUuid: string, orderUuid: string): Observable<{ order: ApiTokenOrder; payments: unknown[] }> {
    return this.api.get<{ order: ApiTokenOrder; payments: unknown[] }>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/token-orders/${encodeURIComponent(orderUuid)}/status`).pipe(map((response) => response.data));
  }

  listMarketplaceBookings(): Observable<ApiMarketplaceBooking[]> {
    return this.api.get<ApiMarketplaceBooking[]>('marketplace-bookings', { per_page: 100 }).pipe(map((response) => response.data));
  }

  createSettlement(bookingUuid: string): Observable<ApiSettlement> {
    return this.api.post<ApiSettlement>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/settle`, {}).pipe(map((response) => response.data));
  }

  updateMarketplaceWorkflow(bookingUuid: string, action: string, payload: Record<string, unknown> = {}): Observable<ApiMarketplaceBooking> {
    return this.api.post<ApiMarketplaceBooking>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/workflow`, { action, ...payload }).pipe(map((response) => response.data));
  }

  raiseDispute(bookingUuid: string, reason: string): Observable<ApiDispute> {
    return this.api.post<ApiDispute>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/disputes`, { reason }).pipe(map((response) => response.data));
  }

  listDisputes(bookingUuid: string): Observable<ApiDispute[]> {
    return this.api.get<ApiDispute[]>(`marketplace-bookings/${encodeURIComponent(bookingUuid)}/disputes`).pipe(map((response) => response.data));
  }

  resolveDispute(disputeUuid: string, resolution: 'refunded' | 'forfeited' | 'commission_waived' | 'commission_due'): Observable<ApiDispute> {
    return this.api.post<ApiDispute>(`marketplace-disputes/${encodeURIComponent(disputeUuid)}/resolve`, { resolution }).pipe(map((response) => response.data));
  }

  resolveBookingDispute(bookingUuid: string, resolution: 'refunded' | 'forfeited' | 'commission_waived' | 'commission_due'): Observable<ApiDispute> {
    return this.listDisputes(bookingUuid).pipe(
      map((disputes) => disputes.find((dispute) => dispute.status !== 'resolved')),
      switchMap((dispute) => this.resolveDispute(dispute?.uuid ?? '', resolution)),
    );
  }

  private normalizeLoad(load: ApiLoad): ApiLoad {
    return {
      ...load,
      budget: load.budget === null || load.budget === undefined || load.budget === ''
        ? load.budget
        : Number(load.budget),
    };
  }
}
