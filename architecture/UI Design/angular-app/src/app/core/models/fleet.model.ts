import { PortalRole } from './nav.model';

/**
 * TransportSeva Fleet — Module 4 domain model. Covers Vehicles, GPS
 * device assignment (AIS-140), live status, documents, maintenance
 * and fuel logs. Owned by Truck Owners directly, or by Transporters
 * / Companies managing their own fleet.
 */
export type VehicleCategory = 'Open Body Truck' | '20ft Container' | '32ft Trailer' | 'Mini Truck' | 'Tanker' | 'Trailer (Flatbed)';

export type VehicleLiveStatus = 'On Trip' | 'Idle' | 'Maintenance' | 'Offline';

export type DocumentStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'Not Uploaded';

export interface VehicleDocument {
  type: 'RC' | 'Insurance' | 'Permit' | 'Fitness Certificate' | 'PUC';
  documentNumber?: string;
  expiryDate?: string;
  status: DocumentStatus;
  fileName?: string;
}

export interface MaintenanceRecord {
  id: string;
  serviceType: string;
  date: string;
  odometer: string;
  cost: string;
  workshop: string;
  notes?: string;
}

export interface FuelLog {
  id: string;
  date: string;
  liters: number;
  cost: string;
  odometer: string;
  fuelStation: string;
}

export interface Vehicle {
  id: string;
  regNumber: string;
  vehicleType: VehicleCategory;
  ownerRole: PortalRole;
  make: string;
  model: string;
  yearOfMake: string;
  capacityTons: number;
  driver?: string;
  status: VehicleLiveStatus;
  location: string;
  /** IMEI of the assigned AIS-140 device, if connected. */
  deviceImei?: string;
  addedOn: string;
  documents: VehicleDocument[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
}

export type DeviceStatus = 'Available' | 'Installed' | 'Faulty' | 'Maintenance';

/** A device in inventory that can be assigned to a vehicle (AIS-140 GPS unit). */
export interface GpsDevice {
  imei: string;
  status: DeviceStatus;
  assignedVehicleRegNumber?: string;
}
