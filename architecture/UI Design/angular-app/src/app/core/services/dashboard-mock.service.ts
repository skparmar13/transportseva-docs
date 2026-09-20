import { Injectable } from '@angular/core';
import { of, delay } from 'rxjs';
import {
  AssignedTrip,
  KpiCard,
  OwnedVehicle,
  QuickAction,
  RecentBooking,
  RecentLoad,
} from '../models/dashboard.model';

/**
 * Mock data service — stands in for a real backend during the
 * UX/UI prototype phase. Returns static JSON wrapped in an
 * Observable (with a tiny delay) so components already look and
 * behave like they're calling a real API (skeleton loaders etc.
 * can be wired later without changing consumers).
 */
@Injectable({ providedIn: 'root' })
export class DashboardMockService {
  getKpis() {
    const kpis: KpiCard[] = [
      { icon: 'i-box', trend: '+12.4%', value: '48,562', label: 'Total Bookings' },
      { icon: 'i-truck', trend: '+5.1%', value: '3,214', label: 'Active Vehicles' },
      { icon: 'i-wallet', trend: '+18.7%', value: '₹2.4 Cr', label: 'Revenue (This Month)' },
      { icon: 'i-ticket', trend: '-3.2%', trendDown: true, value: '86', label: 'Pending Tickets' },
    ];
    return of(kpis).pipe(delay(150));
  }

  getRecentBookings() {
    const bookings: RecentBooking[] = [
      { bookingId: '#TS-48231', customer: 'Rajesh Kumar', route: 'Delhi → Mumbai', driver: 'Suresh Yadav', status: 'Delivered', amount: '₹18,500' },
      { bookingId: '#TS-48230', customer: 'Priya Sharma', route: 'Pune → Bengaluru', driver: 'Ramesh Singh', status: 'In Transit', amount: '₹22,300' },
      { bookingId: '#TS-48229', customer: 'Vikram Enterprises', route: 'Ahmedabad → Jaipur', driver: 'Mahesh Patel', status: 'Pending', amount: '₹9,750' },
      { bookingId: '#TS-48228', customer: 'Anita Traders', route: 'Chennai → Hyderabad', driver: 'Karthik Reddy', status: 'Delivered', amount: '₹14,200' },
      { bookingId: '#TS-48227', customer: 'Global Logistics Co.', route: 'Kolkata → Patna', driver: 'Amit Das', status: 'Cancelled', amount: '₹7,100' },
    ];
    return of(bookings).pipe(delay(150));
  }

  getQuickActions() {
    const actions: QuickAction[] = [
      { icon: 'i-building', label: 'Add Company', path: 'companies' },
      { icon: 'i-user', label: 'Add User', path: 'users' },
      { icon: 'i-tag', label: 'New Subscription Plan', path: 'subscriptions' },
      { icon: 'i-bell', label: 'Broadcast Notification', path: 'notifications' },
    ];
    return of(actions).pipe(delay(150));
  }

  // ---------------------------------------------------------------
  // Shipper portal
  // ---------------------------------------------------------------
  getShipperKpis() {
    const kpis: KpiCard[] = [
      { icon: 'i-box', trend: '+4', value: '24', label: 'Total Loads Posted' },
      { icon: 'i-doc', trend: '+9', value: '11', label: 'New Applications' },
      { icon: 'i-truck', trend: '', value: '3', label: 'Loads In Transit' },
      { icon: 'i-invoice', trend: '', value: '₹1,240', label: 'Payment Ledger Due' },
    ];
    return of(kpis).pipe(delay(150));
  }

  getShipperRecentLoads() {
    const loads: RecentLoad[] = [
      { loadId: '#LD-3841', route: 'Delhi → Mumbai', material: 'Steel Coils', applications: 6, status: 'Applications', amount: '₹18,500' },
      { loadId: '#LD-3840', route: 'Pune → Bengaluru', material: 'FMCG Cartons', applications: 3, status: 'Booked', amount: '₹22,300' },
      { loadId: '#LD-3835', route: 'Ahmedabad → Jaipur', material: 'Cement Bags', applications: 0, status: 'Open', amount: '₹9,750' },
      { loadId: '#LD-3798', route: 'Delhi → Chandigarh', material: 'Electronics', applications: 8, status: 'Delivered', amount: '₹4,200' },
    ];
    return of(loads).pipe(delay(150));
  }

  getShipperQuickActions() {
    const actions: QuickAction[] = [
      { icon: 'i-plus', label: 'Post a Load', path: 'post-load' },
      { icon: 'i-map', label: 'Track Shipment', path: 'tracking' },
      { icon: 'i-headset', label: 'Raise a Ticket', path: 'support' },
      { icon: 'i-invoice', label: 'Review Payment Ledger', path: 'payments' },
    ];
    return of(actions).pipe(delay(150));
  }

  // ---------------------------------------------------------------
  // Transporter portal
  // ---------------------------------------------------------------
  getTransporterKpis() {
    const kpis: KpiCard[] = [
      { icon: 'i-box', trend: '+8', value: '142', label: 'Total Bookings' },
      { icon: 'i-truck', trend: '', value: '18', label: 'Active Vehicles' },
      { icon: 'i-wallet', trend: '+12.4%', value: '₹8.4 L', label: 'Earnings (This Month)' },
      { icon: 'i-box', trend: '', value: '6', label: 'New Requests' },
    ];
    return of(kpis).pipe(delay(150));
  }

  getTransporterQuickActions() {
    const actions: QuickAction[] = [
      { icon: 'i-search', label: 'Browse Load Board', path: 'load-board' },
      { icon: 'i-car', label: 'Add Vehicle', path: 'fleet' },
      { icon: 'i-user', label: 'Add Driver', path: 'fleet' },
      { icon: 'i-credit-card', label: 'Review Pending Settlement', path: 'payments' },
    ];
    return of(actions).pipe(delay(150));
  }

  // ---------------------------------------------------------------
  // Truck Owner portal
  // ---------------------------------------------------------------
  getTruckOwnerKpis() {
    const kpis: KpiCard[] = [
      { icon: 'i-car', trend: '', value: '9', label: 'My Vehicles' },
      { icon: 'i-truck', trend: '+2', value: '6', label: 'On Trip' },
      { icon: 'i-wallet', trend: '+7.1%', value: '₹2.1 L', label: 'Earnings (This Month)' },
      { icon: 'i-doc', trend: '', value: '4', label: 'Applications Pending' },
    ];
    return of(kpis).pipe(delay(150));
  }

  getTruckOwnerVehicles() {
    const vehicles: OwnedVehicle[] = [
      { regNumber: 'RJ14GA1234', vehicleType: '32ft Trailer', driver: 'Mahesh Patel', status: 'On Trip', location: 'Ahmedabad Bypass' },
      { regNumber: 'RJ14GB5678', vehicleType: '20ft Container', driver: 'Suresh Yadav', status: 'On Trip', location: 'NH-48, Kishangarh' },
      { regNumber: 'RJ14GC9012', vehicleType: 'Open Body Truck', driver: '—', status: 'Idle', location: 'Jaipur Yard' },
      { regNumber: 'RJ14GD3456', vehicleType: '32ft Trailer', driver: 'Om Prakash', status: 'Maintenance', location: 'Service Center, Jaipur' },
    ];
    return of(vehicles).pipe(delay(150));
  }

  getTruckOwnerQuickActions() {
    const actions: QuickAction[] = [
      { icon: 'i-search', label: 'Apply for a Load', path: 'load-board' },
      { icon: 'i-car', label: 'Add Vehicle', path: 'vehicles' },
      { icon: 'i-user', label: 'Add Driver', path: 'drivers' },
      { icon: 'i-api', label: 'Connect GPS Device', path: 'devices' },
    ];
    return of(actions).pipe(delay(150));
  }

  // ---------------------------------------------------------------
  // Driver portal
  // ---------------------------------------------------------------
  getDriverKpis() {
    const kpis: KpiCard[] = [
      { icon: 'i-route', trend: '', value: '2', label: 'Assigned Trips' },
      { icon: 'i-check', trend: '+18', value: '164', label: 'Trips Completed' },
      { icon: 'i-invoice', trend: '', value: '₹6,400', label: 'Pending Settlement' },
      { icon: 'i-star', trend: '', value: '4.8', label: 'Rating' },
    ];
    return of(kpis).pipe(delay(150));
  }

  getDriverTrips() {
    const trips: AssignedTrip[] = [
      { tripId: '#TR-9021', route: 'Delhi → Mumbai', vehicle: 'RJ14GA1234', status: 'In Progress', eta: 'Tomorrow, 6:00 PM' },
      { tripId: '#TR-9022', route: 'Mumbai → Pune', vehicle: 'RJ14GA1234', status: 'Assigned', eta: 'In 2 days' },
    ];
    return of(trips).pipe(delay(150));
  }

  getDriverQuickActions() {
    const actions: QuickAction[] = [
      { icon: 'i-route', label: 'View Trip Details', path: 'trips' },
      { icon: 'i-doc', label: 'Upload POD', path: 'pod' },
      { icon: 'i-invoice', label: 'View Payment Ledger', path: 'financials' },
      { icon: 'i-headset', label: 'Contact Support', path: 'profile' },
    ];
    return of(actions).pipe(delay(150));
  }
}
