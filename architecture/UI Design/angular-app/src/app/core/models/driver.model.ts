/**
 * TransportSeva Drivers — Module 5 domain model. Covers Driver
 * Directory, Profile, Documents, Vehicle Assignment and Trip
 * Timeline. Drivers are managed by Truck Owners, Transporters and
 * Companies (their employer pays; the driver app itself is free).
 */
import { PortalRole } from './nav.model';

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export type DriverDocStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'Not Uploaded';

export interface DriverDocument {
  type: 'Driving License' | 'Aadhaar Card' | 'Police Verification' | 'Medical Certificate';
  documentNumber?: string;
  expiryDate?: string;
  status: DriverDocStatus;
}

export interface DriverTimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  employerRole: PortalRole;
  licenseNumber: string;
  licenseExpiry: string;
  experienceYears: number;
  status: DriverStatus;
  assignedVehicleRegNumber?: string;
  rating: number;
  totalTrips: number;
  joinedOn: string;
  address: string;
  documents: DriverDocument[];
  timeline: DriverTimelineEvent[];
}
