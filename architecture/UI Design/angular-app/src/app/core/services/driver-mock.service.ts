import { Injectable, computed, inject, signal } from '@angular/core';
import { PortalRole } from '../models/nav.model';
import { Driver, DriverDocument, DriverTimelineEvent } from '../models/driver.model';
import { FleetMockService } from './fleet-mock.service';

let idCounter = 300;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'd1', name: 'Mahesh Patel', phone: '+91 98230 11234', employerRole: 'truck-owner',
    licenseNumber: 'RJ-0420220011234', licenseExpiry: '14 Mar 2028', experienceYears: 9,
    status: 'On Trip', assignedVehicleRegNumber: 'RJ14GA1234', rating: 4.7, totalTrips: 312,
    joinedOn: '14 Jan 2024', address: 'Sanganer, Jaipur, Rajasthan',
    documents: [
      { type: 'Driving License', documentNumber: 'RJ-0420220011234', expiryDate: '14 Mar 2028', status: 'Valid' },
      { type: 'Aadhaar Card', documentNumber: 'XXXX-XXXX-4521', status: 'Valid' },
      { type: 'Police Verification', documentNumber: 'PV-88102', expiryDate: '20 Sep 2026', status: 'Expiring Soon' },
      { type: 'Medical Certificate', documentNumber: 'MED-30291', expiryDate: '02 Feb 2027', status: 'Valid' },
    ],
    timeline: [
      { id: 'te1', date: '09 Aug 2026', title: 'Trip Started', description: 'Assigned to trip 4LD-3841 (Delhi → Mumbai) on RJ14GA1234.' },
      { id: 'te2', date: '02 Jun 2026', title: 'Vehicle Serviced', description: 'Full service completed on RJ14GA1234 before dispatch.' },
      { id: 'te3', date: '14 Jan 2024', title: 'Joined', description: 'Onboarded as a driver for RJ14GA1234.' },
    ],
  },
  {
    id: 'd2', name: 'Suresh Yadav', phone: '+91 98290 55678', employerRole: 'truck-owner',
    licenseNumber: 'RJ-0420190045671', licenseExpiry: '02 Nov 2027', experienceYears: 12,
    status: 'On Trip', assignedVehicleRegNumber: 'RJ14GB5678', rating: 4.5, totalTrips: 428,
    joinedOn: '02 Mar 2023', address: 'Kishangarh, Ajmer, Rajasthan',
    documents: [
      { type: 'Driving License', documentNumber: 'RJ-0420190045671', expiryDate: '02 Nov 2027', status: 'Valid' },
      { type: 'Aadhaar Card', documentNumber: 'XXXX-XXXX-7712', status: 'Valid' },
      { type: 'Police Verification', status: 'Not Uploaded' },
      { type: 'Medical Certificate', documentNumber: 'MED-20981', expiryDate: '18 Jul 2026', status: 'Expiring Soon' },
    ],
    timeline: [
      { id: 'te4', date: '06 Aug 2026', title: 'Trip Started', description: 'Assigned to trip 4LD-3845 on RJ14GB5678, en route via NH-48.' },
      { id: 'te5', date: '02 Mar 2023', title: 'Joined', description: 'Onboarded as a driver for RJ14GB5678.' },
    ],
  },
  {
    id: 'd3', name: 'Om Prakash', phone: '+91 97831 90045', employerRole: 'truck-owner',
    licenseNumber: 'RJ-0420170078812', licenseExpiry: '25 May 2026', experienceYears: 15,
    status: 'Off Duty', assignedVehicleRegNumber: 'RJ14GD3456', rating: 4.8, totalTrips: 601,
    joinedOn: '05 May 2021', address: 'Vaishali Nagar, Jaipur, Rajasthan',
    documents: [
      { type: 'Driving License', documentNumber: 'RJ-0420170078812', expiryDate: '25 May 2026', status: 'Expiring Soon' },
      { type: 'Aadhaar Card', documentNumber: 'XXXX-XXXX-3390', status: 'Valid' },
      { type: 'Police Verification', documentNumber: 'PV-55029', expiryDate: '11 Jan 2027', status: 'Valid' },
      { type: 'Medical Certificate', status: 'Not Uploaded' },
    ],
    timeline: [
      { id: 'te6', date: '08 Aug 2026', title: 'Vehicle Under Repair', description: 'RJ14GD3456 sent for gearbox repair — off duty until vehicle is back in service.' },
      { id: 'te7', date: '05 May 2021', title: 'Joined', description: 'Onboarded as a driver for RJ14GD3456.' },
    ],
  },
  {
    id: 'd4', name: 'Ramesh Kumar', phone: '+91 90045 11278', employerRole: 'truck-owner',
    licenseNumber: 'RJ-0420210099234', licenseExpiry: '10 Oct 2029', experienceYears: 6,
    status: 'Available', rating: 4.3, totalTrips: 158,
    joinedOn: '21 Sep 2024', address: 'Malviya Nagar, Jaipur, Rajasthan',
    documents: [
      { type: 'Driving License', documentNumber: 'RJ-0420210099234', expiryDate: '10 Oct 2029', status: 'Valid' },
      { type: 'Aadhaar Card', documentNumber: 'XXXX-XXXX-6644', status: 'Valid' },
      { type: 'Police Verification', documentNumber: 'PV-91021', expiryDate: '30 Dec 2026', status: 'Valid' },
      { type: 'Medical Certificate', documentNumber: 'MED-40122', expiryDate: '15 Apr 2027', status: 'Valid' },
    ],
    timeline: [
      { id: 'te8', date: '21 Sep 2024', title: 'Joined', description: 'Onboarded and available for vehicle assignment.' },
    ],
  },
];

/**
 * In-memory Driver store — same pattern as FleetMockService /
 * MarketplaceMockService. Assignment methods keep the Vehicle's
 * `driver` field in sync via FleetMockService so both modules
 * reflect the same source of truth during the prototype session.
 */
@Injectable({ providedIn: 'root' })
export class DriverMockService {
  private readonly fleet = inject(FleetMockService);
  private readonly driversState = signal<Driver[]>(INITIAL_DRIVERS);

  readonly drivers = computed(() => this.driversState());

  /** Drivers with no vehicle assigned — selectable for assignment. */
  readonly unassignedDrivers = computed(() => this.driversState().filter((d) => !d.assignedVehicleRegNumber));

  getDriversByEmployer(role: PortalRole) {
    return computed(() => this.driversState().filter((d) => d.employerRole === role));
  }

  getDriverById(id: string) {
    return computed(() => this.driversState().find((d) => d.id === id));
  }

  addDriver(input: {
    employerRole: PortalRole;
    name: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: string;
    experienceYears: number;
    address: string;
  }): Driver {
    const documents: DriverDocument[] = [
      { type: 'Driving License', documentNumber: input.licenseNumber, expiryDate: input.licenseExpiry, status: 'Valid' },
      { type: 'Aadhaar Card', status: 'Not Uploaded' },
      { type: 'Police Verification', status: 'Not Uploaded' },
      { type: 'Medical Certificate', status: 'Not Uploaded' },
    ];
    const driver: Driver = {
      id: nextId('d'),
      status: 'Available',
      rating: 0,
      totalTrips: 0,
      joinedOn: 'Just now',
      documents,
      timeline: [{ id: nextId('te'), date: 'Just now', title: 'Joined', description: 'Onboarded and available for vehicle assignment.' }],
      ...input,
    };
    this.driversState.update((drivers) => [driver, ...drivers]);
    return driver;
  }

  assignVehicle(driverId: string, regNumber: string): void {
    const driver = this.driversState().find((d) => d.id === driverId);
    if (!driver) return;

    // Free up the driver's previous vehicle, if any.
    if (driver.assignedVehicleRegNumber) {
      this.fleet.unassignDriver(driver.assignedVehicleRegNumber);
    }

    this.driversState.update((drivers) =>
      drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              assignedVehicleRegNumber: regNumber,
              status: 'On Trip' === d.status ? d.status : 'Available',
              timeline: [
                { id: nextId('te'), date: 'Just now', title: 'Vehicle Assigned', description: `Assigned to vehicle ${regNumber}.` },
                ...d.timeline,
              ],
            }
          : d,
      ),
    );
    this.fleet.assignDriver(regNumber, driver.name);
  }

  unassignVehicle(driverId: string): void {
    const driver = this.driversState().find((d) => d.id === driverId);
    if (!driver?.assignedVehicleRegNumber) return;
    const regNumber = driver.assignedVehicleRegNumber;
    this.driversState.update((drivers) =>
      drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              assignedVehicleRegNumber: undefined,
              timeline: [
                { id: nextId('te'), date: 'Just now', title: 'Vehicle Unassigned', description: `Unassigned from vehicle ${regNumber}.` },
                ...d.timeline,
              ],
            }
          : d,
      ),
    );
    this.fleet.unassignDriver(regNumber);
  }

  addTimelineEvent(driverId: string, input: Omit<DriverTimelineEvent, 'id'>): void {
    const event: DriverTimelineEvent = { id: nextId('te'), ...input };
    this.driversState.update((drivers) =>
      drivers.map((d) => (d.id === driverId ? { ...d, timeline: [event, ...d.timeline] } : d)),
    );
  }
}
