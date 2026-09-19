import { Injectable, computed, signal } from '@angular/core';
import { PortalRole } from '../models/nav.model';
import { FuelLog, GpsDevice, MaintenanceRecord, Vehicle, VehicleCategory, VehicleDocument } from '../models/fleet.model';

let idCounter = 200;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1', regNumber: 'RJ14GA1234', vehicleType: '32ft Trailer', ownerRole: 'truck-owner',
    make: 'Tata', model: 'Signa 4225.TK', yearOfMake: '2022', capacityTons: 25,
    driver: 'Mahesh Patel', status: 'On Trip', location: 'Ahmedabad Bypass',
    deviceImei: '867654322', addedOn: '14 Jan 2024',
    documents: [
      { type: 'RC', documentNumber: 'RJ14GA1234-RC', expiryDate: '—', status: 'Valid' },
      { type: 'Insurance', documentNumber: 'INS-88213', expiryDate: '30 Nov 2026', status: 'Valid' },
      { type: 'Permit', documentNumber: 'PMT-44210', expiryDate: '12 Sep 2026', status: 'Valid' },
      { type: 'Fitness Certificate', documentNumber: 'FIT-90021', expiryDate: '05 Sep 2026', status: 'Expiring Soon' },
      { type: 'PUC', documentNumber: 'PUC-11209', expiryDate: '20 Aug 2026', status: 'Expiring Soon' },
    ],
    maintenance: [
      { id: 'mt1', serviceType: 'Full Service', date: '02 Jun 2026', odometer: '1,42,300 km', cost: '₹8,200', workshop: 'Tata Motors Service, Jaipur' },
      { id: 'mt2', serviceType: 'Tyre Replacement (2)', date: '18 Mar 2026', odometer: '1,28,500 km', cost: '₹22,000', workshop: 'Bridgestone Truck Point' },
    ],
    fuelLogs: [
      { id: 'fl1', date: '07 Aug 2026', liters: 220, cost: '₹21,340', odometer: '1,52,880 km', fuelStation: 'IOCL, Ahmedabad Bypass' },
      { id: 'fl2', date: '01 Aug 2026', liters: 210, cost: '₹20,370', odometer: '1,50,120 km', fuelStation: 'HPCL, Udaipur' },
    ],
  },
  {
    id: 'v2', regNumber: 'RJ14GB5678', vehicleType: '20ft Container', ownerRole: 'truck-owner',
    make: 'Ashok Leyland', model: 'Boss 1920', yearOfMake: '2021', capacityTons: 16,
    driver: 'Suresh Yadav', status: 'On Trip', location: 'NH-48, Kishangarh',
    deviceImei: undefined, addedOn: '02 Mar 2023',
    documents: [
      { type: 'RC', documentNumber: 'RJ14GB5678-RC', expiryDate: '—', status: 'Valid' },
      { type: 'Insurance', documentNumber: 'INS-77120', expiryDate: '14 Dec 2026', status: 'Valid' },
      { type: 'Permit', documentNumber: 'PMT-33012', expiryDate: '28 Jul 2026', status: 'Expiring Soon' },
      { type: 'Fitness Certificate', status: 'Not Uploaded' },
      { type: 'PUC', documentNumber: 'PUC-40098', expiryDate: '02 Feb 2027', status: 'Valid' },
    ],
    maintenance: [
      { id: 'mt3', serviceType: 'Oil Change + Filter', date: '25 Jun 2026', odometer: '98,400 km', cost: '₹3,600', workshop: 'Ashok Leyland Service Center' },
    ],
    fuelLogs: [
      { id: 'fl3', date: '06 Aug 2026', liters: 160, cost: '₹15,520', odometer: '1,01,220 km', fuelStation: 'BPCL, Kishangarh' },
    ],
  },
  {
    id: 'v3', regNumber: 'RJ14GC9012', vehicleType: 'Open Body Truck', ownerRole: 'truck-owner',
    make: 'Eicher', model: 'Pro 3015', yearOfMake: '2020', capacityTons: 12,
    driver: undefined, status: 'Idle', location: 'Jaipur Yard',
    deviceImei: '867654321', addedOn: '19 Nov 2022',
    documents: [
      { type: 'RC', documentNumber: 'RJ14GC9012-RC', expiryDate: '—', status: 'Valid' },
      { type: 'Insurance', documentNumber: 'INS-56032', expiryDate: '09 Jan 2027', status: 'Valid' },
      { type: 'Permit', documentNumber: 'PMT-21987', expiryDate: '15 Oct 2026', status: 'Valid' },
      { type: 'Fitness Certificate', documentNumber: 'FIT-70213', expiryDate: '01 Jun 2026', status: 'Expired' },
      { type: 'PUC', documentNumber: 'PUC-88214', expiryDate: '10 Sep 2026', status: 'Valid' },
    ],
    maintenance: [],
    fuelLogs: [],
  },
  {
    id: 'v4', regNumber: 'RJ14GD3456', vehicleType: '32ft Trailer', ownerRole: 'truck-owner',
    make: 'BharatBenz', model: '3123R', yearOfMake: '2019', capacityTons: 28,
    driver: 'Om Prakash', status: 'Maintenance', location: 'Service Center, Jaipur',
    deviceImei: '867654324', addedOn: '05 May 2021',
    documents: [
      { type: 'RC', documentNumber: 'RJ14GD3456-RC', expiryDate: '—', status: 'Valid' },
      { type: 'Insurance', documentNumber: 'INS-30044', expiryDate: '22 Apr 2026', status: 'Expiring Soon' },
      { type: 'Permit', documentNumber: 'PMT-10938', expiryDate: '11 Nov 2026', status: 'Valid' },
      { type: 'Fitness Certificate', documentNumber: 'FIT-50122', expiryDate: '19 Dec 2026', status: 'Valid' },
      { type: 'PUC', documentNumber: 'PUC-60312', expiryDate: '30 Jun 2026', status: 'Expiring Soon' },
    ],
    maintenance: [
      { id: 'mt4', serviceType: 'Gearbox Repair', date: '08 Aug 2026', odometer: '2,10,400 km', cost: '₹34,500', workshop: 'BharatBenz Authorized Workshop', notes: 'Vehicle under repair, expected back in service by 15 Aug 2026.' },
    ],
    fuelLogs: [
      { id: 'fl4', date: '28 Jul 2026', liters: 240, cost: '₹23,280', odometer: '2,09,900 km', fuelStation: 'IOCL, Jaipur' },
    ],
  },
];

const INITIAL_DEVICES: GpsDevice[] = [
  { imei: '867654321', status: 'Installed', assignedVehicleRegNumber: 'RJ14GC9012' },
  { imei: '867654322', status: 'Installed', assignedVehicleRegNumber: 'RJ14GA1234' },
  { imei: '867654323', status: 'Faulty' },
  { imei: '867654324', status: 'Installed', assignedVehicleRegNumber: 'RJ14GD3456' },
  { imei: '867654325', status: 'Available' },
  { imei: '867654326', status: 'Available' },
  { imei: '867654327', status: 'Maintenance' },
];

/**
 * In-memory Fleet store — same pattern as MarketplaceMockService.
 * Signals hold vehicles + the shared GPS device inventory so Add
 * Vehicle / Assign Device / Log Maintenance / Log Fuel actions
 * mutate visible state during the session.
 */
@Injectable({ providedIn: 'root' })
export class FleetMockService {
  private readonly vehiclesState = signal<Vehicle[]>(INITIAL_VEHICLES);
  private readonly devicesState = signal<GpsDevice[]>(INITIAL_DEVICES);

  readonly vehicles = computed(() => this.vehiclesState());
  readonly devices = computed(() => this.devicesState());

  /** Devices not currently installed on a vehicle — selectable for assignment. */
  readonly availableDevices = computed(() => this.devicesState().filter((d) => d.status === 'Available'));

  getVehiclesByOwner(role: PortalRole) {
    return computed(() => this.vehiclesState().filter((v) => v.ownerRole === role));
  }

  getVehicleById(id: string) {
    return computed(() => this.vehiclesState().find((v) => v.id === id));
  }

  addVehicle(input: {
    ownerRole: PortalRole;
    regNumber: string;
    vehicleType: VehicleCategory;
    make: string;
    model: string;
    yearOfMake: string;
    capacityTons: number;
    driver?: string;
  }): Vehicle {
    const documents: VehicleDocument[] = [
      { type: 'RC', status: 'Not Uploaded' },
      { type: 'Insurance', status: 'Not Uploaded' },
      { type: 'Permit', status: 'Not Uploaded' },
      { type: 'Fitness Certificate', status: 'Not Uploaded' },
      { type: 'PUC', status: 'Not Uploaded' },
    ];
    const vehicle: Vehicle = {
      id: nextId('v'),
      status: 'Idle',
      location: 'Not tracked yet',
      addedOn: 'Just now',
      documents,
      maintenance: [],
      fuelLogs: [],
      ...input,
    };
    this.vehiclesState.update((vehicles) => [vehicle, ...vehicles]);
    return vehicle;
  }

  assignDevice(vehicleId: string, imei: string): void {
    const vehicle = this.vehiclesState().find((v) => v.id === vehicleId);
    if (!vehicle) return;

    // Free up the vehicle's previous device, if any.
    if (vehicle.deviceImei) {
      this.devicesState.update((devices) =>
        devices.map((d) => (d.imei === vehicle.deviceImei ? { ...d, status: 'Available', assignedVehicleRegNumber: undefined } : d)),
      );
    }

    this.devicesState.update((devices) =>
      devices.map((d) => (d.imei === imei ? { ...d, status: 'Installed', assignedVehicleRegNumber: vehicle.regNumber } : d)),
    );
    this.vehiclesState.update((vehicles) => vehicles.map((v) => (v.id === vehicleId ? { ...v, deviceImei: imei } : v)));
  }

  unassignDevice(vehicleId: string): void {
    const vehicle = this.vehiclesState().find((v) => v.id === vehicleId);
    if (!vehicle?.deviceImei) return;
    this.devicesState.update((devices) =>
      devices.map((d) => (d.imei === vehicle.deviceImei ? { ...d, status: 'Available', assignedVehicleRegNumber: undefined } : d)),
    );
    this.vehiclesState.update((vehicles) => vehicles.map((v) => (v.id === vehicleId ? { ...v, deviceImei: undefined } : v)));
  }

  /** Adds a brand-new device to the shared inventory pool (Module 6 — Device Inventory). */
  addDevice(imei: string): GpsDevice {
    const device: GpsDevice = { imei, status: 'Available' };
    this.devicesState.update((devices) => [device, ...devices]);
    return device;
  }

  /** Sets a vehicle's driver name by registration number (used by DriverMockService to stay in sync). */
  assignDriver(regNumber: string, driverName: string): void {
    this.vehiclesState.update((vehicles) => vehicles.map((v) => (v.regNumber === regNumber ? { ...v, driver: driverName } : v)));
  }

  /** Clears a vehicle's driver name by registration number (used by DriverMockService to stay in sync). */
  unassignDriver(regNumber: string): void {
    this.vehiclesState.update((vehicles) => vehicles.map((v) => (v.regNumber === regNumber ? { ...v, driver: undefined } : v)));
  }

  attachDocument(regNumber: string, type: VehicleDocument['type'], fileName: string): void {
    this.vehiclesState.update((vehicles) => vehicles.map((vehicle) => vehicle.regNumber !== regNumber ? vehicle : {
      ...vehicle,
      documents: vehicle.documents.map((document) => document.type !== type ? document : { ...document, fileName }),
    }));
  }

  addMaintenanceRecord(vehicleId: string, input: Omit<MaintenanceRecord, 'id'>): void {
    const record: MaintenanceRecord = { id: nextId('mt'), ...input };
    this.vehiclesState.update((vehicles) =>
      vehicles.map((v) => (v.id === vehicleId ? { ...v, maintenance: [record, ...v.maintenance] } : v)),
    );
  }

  addFuelLog(vehicleId: string, input: Omit<FuelLog, 'id'>): void {
    const log: FuelLog = { id: nextId('fl'), ...input };
    this.vehiclesState.update((vehicles) =>
      vehicles.map((v) => (v.id === vehicleId ? { ...v, fuelLogs: [log, ...v.fuelLogs] } : v)),
    );
  }
}
