import { Injectable, computed, signal } from '@angular/core';
import { Trip, TripPod } from '../models/trip.model';

const INITIAL_TRIPS: Trip[] = [
  {
    id: 't1', tripId: 'TRIP-5001', loadId: 'l3', pickupCity: 'Pune', dropCity: 'Bengaluru', material: 'Electronics',
    vehicleRegNumber: 'RJ14GC9012', driverName: 'Suresh Yadav', customerName: 'Mehta Industries',
    distanceKm: 840, startDate: '12 Aug 2026', eta: '14 Aug 2026, 9:00 AM', amount: '₹19,500', status: 'Planned',
    timeline: [
      { stage: 'Booking Confirmed', completed: true, timestamp: '2 days ago' },
      { stage: 'Vehicle Assigned', completed: true, timestamp: '2 days ago' },
      { stage: 'Driver Assigned', completed: true, timestamp: '1 day ago' },
      { stage: 'In Transit', completed: false },
      { stage: 'Delivered', completed: false },
      { stage: 'POD Uploaded', completed: false },
      { stage: 'Settled', completed: false },
    ],
    route: [
      { name: 'Pune Warehouse', type: 'Pickup', eta: '12 Aug, 8:00 AM', completed: false },
      { name: 'Solapur Toll Plaza', type: 'Checkpoint', eta: '12 Aug, 12:30 PM', completed: false },
      { name: 'Hubli Bypass', type: 'Checkpoint', eta: '13 Aug, 6:00 AM', completed: false },
      { name: 'Bengaluru Distribution Center', type: 'Drop', eta: '14 Aug, 9:00 AM', completed: false },
    ],
    pod: { uploaded: false },
  },
  {
    id: 't2', tripId: 'TRIP-5002', pickupCity: 'Delhi', dropCity: 'Jaipur', material: 'Cement Bags',
    vehicleRegNumber: 'RJ14GD3456', driverName: 'Om Prakash', customerName: 'UltraTech Distributors',
    distanceKm: 280, startDate: '11 Aug 2026', eta: '11 Aug 2026, 8:00 PM', amount: '₹8,200', status: 'Planned',
    timeline: [
      { stage: 'Booking Confirmed', completed: true, timestamp: '1 day ago' },
      { stage: 'Vehicle Assigned', completed: true, timestamp: '1 day ago' },
      { stage: 'Driver Assigned', completed: true, timestamp: '10 hours ago' },
      { stage: 'In Transit', completed: false },
      { stage: 'Delivered', completed: false },
      { stage: 'POD Uploaded', completed: false },
      { stage: 'Settled', completed: false },
    ],
    route: [
      { name: 'Delhi Transport Nagar', type: 'Pickup', eta: '11 Aug, 6:00 AM', completed: false },
      { name: 'Kotputli Bypass', type: 'Checkpoint', eta: '11 Aug, 12:00 PM', completed: false },
      { name: 'Jaipur Yard', type: 'Drop', eta: '11 Aug, 8:00 PM', completed: false },
    ],
    pod: { uploaded: false },
  },
  {
    id: 't3', tripId: 'TRIP-4890', pickupCity: 'Jaipur', dropCity: 'Ahmedabad', material: 'Textile Rolls',
    vehicleRegNumber: 'RJ14GA1234', driverName: 'Mahesh Patel', customerName: 'Anand Textiles',
    distanceKm: 660, startDate: '8 Aug 2026', eta: '9 Aug 2026, 6:00 PM', amount: '₹15,800', status: 'In Transit',
    timeline: [
      { stage: 'Booking Confirmed', completed: true, timestamp: '2 days ago' },
      { stage: 'Vehicle Assigned', completed: true, timestamp: '2 days ago' },
      { stage: 'Driver Assigned', completed: true, timestamp: '2 days ago' },
      { stage: 'In Transit', completed: true, timestamp: '8 Aug 2026, 6:10 AM' },
      { stage: 'Delivered', completed: false },
      { stage: 'POD Uploaded', completed: false },
      { stage: 'Settled', completed: false },
    ],
    route: [
      { name: 'Jaipur Yard', type: 'Pickup', eta: '8 Aug, 6:00 AM', actualTime: '8 Aug, 6:10 AM', completed: true },
      { name: 'Kishangarh Toll Plaza', type: 'Checkpoint', eta: '8 Aug, 9:30 AM', actualTime: '8 Aug, 9:42 AM', completed: true },
      { name: 'Udaipur Bypass', type: 'Checkpoint', eta: '8 Aug, 1:00 PM', actualTime: '8 Aug, 1:18 PM', completed: true },
      { name: 'Ahmedabad Bypass', type: 'Checkpoint', eta: '9 Aug, 2:00 PM', completed: false },
      { name: 'Ahmedabad Bypass Warehouse', type: 'Drop', eta: '9 Aug, 6:00 PM', completed: false },
    ],
    pod: { uploaded: false },
  },
  {
    id: 't4', tripId: 'TRIP-4763', bookingId: 'b1', loadId: 'l2', pickupCity: 'Pune', dropCity: 'Bengaluru', material: 'FMCG Cartons',
    vehicleRegNumber: 'RJ14GB5678', driverName: 'Ramesh Kumar', customerName: 'Sanjay Yadav',
    distanceKm: 840, startDate: '7 Aug 2026', eta: '9 Aug 2026, 10:00 AM', amount: '₹22,300', status: 'In Transit',
    timeline: [
      { stage: 'Booking Confirmed', completed: true, timestamp: '1 day ago' },
      { stage: 'Vehicle Assigned', completed: true, timestamp: '1 day ago' },
      { stage: 'Driver Assigned', completed: true, timestamp: '22 hours ago' },
      { stage: 'In Transit', completed: true, timestamp: '18 hours ago' },
      { stage: 'Delivered', completed: false },
      { stage: 'POD Uploaded', completed: false },
      { stage: 'Settled', completed: false },
    ],
    route: [
      { name: 'Pune Warehouse', type: 'Pickup', eta: '7 Aug, 8:00 AM', actualTime: '7 Aug, 8:15 AM', completed: true },
      { name: 'Solapur Toll Plaza', type: 'Checkpoint', eta: '7 Aug, 12:30 PM', actualTime: '7 Aug, 1:05 PM', completed: true },
      { name: 'Hubli Bypass', type: 'Checkpoint', eta: '8 Aug, 6:00 AM', completed: false },
      { name: 'Bengaluru Distribution Center', type: 'Drop', eta: '9 Aug, 10:00 AM', completed: false },
    ],
    pod: { uploaded: false },
  },
  {
    id: 't5', tripId: 'TRIP-4102', pickupCity: 'Mumbai', dropCity: 'Nagpur', material: 'Auto Parts',
    vehicleRegNumber: 'RJ14GC9012', driverName: 'Suresh Yadav', customerName: 'Bajaj Auto Ltd',
    distanceKm: 830, startDate: '2 Aug 2026', eta: '4 Aug 2026, 3:40 PM', amount: '₹17,200', status: 'Delivered',
    timeline: [
      { stage: 'Booking Confirmed', completed: true, timestamp: '8 days ago' },
      { stage: 'Vehicle Assigned', completed: true, timestamp: '8 days ago' },
      { stage: 'Driver Assigned', completed: true, timestamp: '7 days ago' },
      { stage: 'In Transit', completed: true, timestamp: '6 days ago' },
      { stage: 'Delivered', completed: true, timestamp: '4 Aug 2026, 3:40 PM' },
      { stage: 'POD Uploaded', completed: false },
      { stage: 'Settled', completed: false },
    ],
    route: [
      { name: 'Mumbai Transport Nagar', type: 'Pickup', eta: '2 Aug, 7:00 AM', actualTime: '2 Aug, 7:20 AM', completed: true },
      { name: 'Nashik Bypass', type: 'Checkpoint', eta: '2 Aug, 12:00 PM', actualTime: '2 Aug, 12:35 PM', completed: true },
      { name: 'Aurangabad Toll Plaza', type: 'Checkpoint', eta: '3 Aug, 6:00 AM', actualTime: '3 Aug, 6:45 AM', completed: true },
      { name: 'Nagpur Distribution Center', type: 'Drop', eta: '4 Aug, 3:40 PM', actualTime: '4 Aug, 3:40 PM', completed: true },
    ],
    pod: { uploaded: false },
  },
  {
    id: 't6', tripId: 'TRIP-3877', pickupCity: 'Ahmedabad', dropCity: 'Surat', material: 'Textile Rolls',
    vehicleRegNumber: 'RJ14GD3456', driverName: 'Om Prakash', customerName: 'Reliance Textiles',
    distanceKm: 260, startDate: '28 Jul 2026', eta: '29 Jul 2026, 6:10 PM', amount: '₹6,500', status: 'Settled',
    timeline: [
      { stage: 'Booking Confirmed', completed: true, timestamp: '12 days ago' },
      { stage: 'Vehicle Assigned', completed: true, timestamp: '12 days ago' },
      { stage: 'Driver Assigned', completed: true, timestamp: '11 days ago' },
      { stage: 'In Transit', completed: true, timestamp: '11 days ago' },
      { stage: 'Delivered', completed: true, timestamp: '29 Jul 2026, 6:10 PM' },
      { stage: 'POD Uploaded', completed: true, timestamp: '29 Jul 2026, 6:25 PM' },
      { stage: 'Settled', completed: true, timestamp: '31 Jul 2026' },
    ],
    route: [
      { name: 'Ahmedabad Bypass Warehouse', type: 'Pickup', eta: '28 Jul, 8:00 AM', actualTime: '28 Jul, 8:05 AM', completed: true },
      { name: 'Bharuch Toll Plaza', type: 'Checkpoint', eta: '28 Jul, 12:00 PM', actualTime: '28 Jul, 12:20 PM', completed: true },
      { name: 'Surat Distribution Center', type: 'Drop', eta: '29 Jul, 6:10 PM', actualTime: '29 Jul, 6:10 PM', completed: true },
    ],
    pod: {
      uploaded: true, podNumber: 'POD-88213', receivedByName: 'Ramesh (Warehouse Incharge)',
      remarks: 'Goods received in good condition, no damage.', fileName: 'pod-3877-signed.pdf', uploadedAt: '29 Jul 2026, 6:25 PM',
    },
  },
];

/**
 * In-memory Trips store shared across the whole prototype — the
 * operational execution view of confirmed Marketplace bookings.
 * Planned / In Transit / Delivered / Settled cover the full
 * lifecycle; POD upload actually mutates state so the flow feels
 * real during the demo session.
 */
@Injectable({ providedIn: 'root' })
export class TripMockService {
  private readonly tripsState = signal<Trip[]>(INITIAL_TRIPS);

  readonly trips = computed(() => this.tripsState());
  readonly plannedTrips = computed(() => this.tripsState().filter((t) => t.status === 'Planned'));
  readonly activeTrips = computed(() => this.tripsState().filter((t) => t.status === 'In Transit'));
  readonly completedTrips = computed(() => this.tripsState().filter((t) => t.status === 'Delivered' || t.status === 'Settled'));
  readonly pendingPodCount = computed(() => this.tripsState().filter((t) => t.status === 'Delivered' && !t.pod.uploaded).length);

  getTrip(id: string): Trip | undefined {
    return this.tripsState().find((t) => t.id === id || t.tripId === id);
  }

  /** Uploads POD for a delivered trip and marks the "POD Uploaded" timeline stage complete. */
  uploadPod(id: string, pod: Omit<TripPod, 'uploaded' | 'uploadedAt'>): void {
    this.tripsState.update((trips) =>
      trips.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          pod: { ...pod, uploaded: true, uploadedAt: 'Just now' },
          timeline: t.timeline.map((e) => (e.stage === 'POD Uploaded' ? { ...e, completed: true, timestamp: 'Just now' } : e)),
        };
      }),
    );
  }

  /** Advances a Planned trip to In Transit (dispatch). */
  startTrip(id: string): void {
    this.tripsState.update((trips) =>
      trips.map((t) => {
        if (t.id !== id || t.status !== 'Planned') return t;
        return {
          ...t,
          status: 'In Transit',
          timeline: t.timeline.map((e) => (e.stage === 'In Transit' ? { ...e, completed: true, timestamp: 'Just now' } : e)),
        };
      }),
    );
  }
}
