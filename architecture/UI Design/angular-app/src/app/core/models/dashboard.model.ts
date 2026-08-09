export interface KpiCard {
  icon: string;
  trend: string;
  trendDown?: boolean;
  value: string;
  label: string;
}

export type BookingStatus = 'Delivered' | 'In Transit' | 'Pending' | 'Cancelled';

export interface RecentBooking {
  bookingId: string;
  customer: string;
  route: string;
  driver: string;
  status: BookingStatus;
  amount: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  path?: string;
}

/** Shipper portal — a load the shipper has posted to the marketplace. */
export type LoadStatus = 'Open' | 'Applications' | 'Booked' | 'In Transit' | 'Delivered';

export interface RecentLoad {
  loadId: string;
  route: string;
  material: string;
  applications: number;
  status: LoadStatus;
  amount: string;
}

/** Transporter/Truck Owner portal — an inbound booking request awaiting action. */
export interface BookingRequest {
  bookingId: string;
  customer: string;
  route: string;
  amount: string;
}

/** Truck Owner portal — one of the owner's own vehicles + its live status. */
export type VehicleLiveStatus = 'On Trip' | 'Idle' | 'Maintenance' | 'Offline';

export interface OwnedVehicle {
  regNumber: string;
  vehicleType: string;
  driver: string;
  status: VehicleLiveStatus;
  location: string;
}

/** Driver portal — a trip assigned to the logged-in driver. */
export type TripStatus = 'Assigned' | 'In Progress' | 'Completed';

export interface AssignedTrip {
  tripId: string;
  route: string;
  vehicle: string;
  status: TripStatus;
  eta: string;
}
