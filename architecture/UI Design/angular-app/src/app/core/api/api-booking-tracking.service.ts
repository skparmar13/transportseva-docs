import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export interface BookingTrackingPoint {
  uuid: string; latitude: number; longitude: number; accuracy_m: number | null;
  speed_kmph: number | null; heading: number | null; source: string; simulated: boolean;
  recorded_at: string; received_at: string;
}
export interface BookingTrackingView {
  booking_uuid: string; booking_reference: string; booking_status: string;
  vehicle_reg_number: string | null; driver_name: string | null;
  status: 'not_started' | 'no_signal' | 'updating' | 'stale' | 'paused' | 'ended';
  latest: BookingTrackingPoint | null; points: BookingTrackingPoint[];
  poll_after_seconds: number; stale_after_seconds: number; test_mode: boolean;
}
@Injectable({ providedIn: 'root' })
export class ApiBookingTrackingService {
  private readonly api = inject(ApiClientService);
  view(uuid: string, vehicle?: string) {
    return this.api.get<BookingTrackingView>(`marketplace-bookings/${encodeURIComponent(uuid)}/tracking`, vehicle ? { vehicle } : undefined).pipe(map(r => r.data));
  }
  bookings(page: number) {
    return this.api.get<{ uuid: string; booking_reference: string; status: string; workflow?: { vehicle_assignment?: { vehicle_reg_number: string } } }[]>('marketplace-bookings', { page, per_page: 20 });
  }
}
