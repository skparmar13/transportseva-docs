/**
 * TransportSeva Trips — Module 7 domain model. Covers Planned,
 * Active (In Transit) and Completed (Delivered / Settled) trips,
 * each with a Timeline, Route (stop-by-stop) and POD (Proof of
 * Delivery) view. A Trip is the execution record of a confirmed
 * Marketplace Booking — same vehicle/driver/route data, viewed
 * through an operations lens instead of a commercial one.
 */
export type TripStatus = 'Planned' | 'In Transit' | 'Delivered' | 'Settled';

export type RouteStopType = 'Pickup' | 'Checkpoint' | 'Drop';

export interface RouteStop {
  name: string;
  type: RouteStopType;
  eta: string;
  actualTime?: string;
  completed: boolean;
}

export type TripTimelineStage = 'Booking Confirmed' | 'Vehicle Assigned' | 'Driver Assigned' | 'In Transit' | 'Delivered' | 'POD Uploaded' | 'Settled';

export interface TripTimelineEvent {
  stage: TripTimelineStage;
  completed: boolean;
  timestamp?: string;
}

export interface TripPod {
  uploaded: boolean;
  podNumber?: string;
  receivedByName?: string;
  remarks?: string;
  fileName?: string;
  uploadedAt?: string;
}

export interface Trip {
  id: string;
  tripId: string;
  bookingId?: string;
  loadId?: string;
  pickupCity: string;
  dropCity: string;
  material: string;
  vehicleRegNumber: string;
  driverName: string;
  customerName: string;
  distanceKm: number;
  startDate: string;
  eta: string;
  amount: string;
  status: TripStatus;
  timeline: TripTimelineEvent[];
  route: RouteStop[];
  pod: TripPod;
}
