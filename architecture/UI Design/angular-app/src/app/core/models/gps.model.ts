/**
 * TransportSeva GPS — Module 6 domain model. Builds on the
 * `GpsDevice` inventory introduced in Module 4 (Fleet) and adds
 * OEM/health/connectivity metadata, live-tracking positions, trip
 * replay waypoints, geofence zones and alerts.
 */

export type DeviceHealthStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';

export type OemPartner = 'Teltonika' | 'Concox' | 'Ruptela' | 'ATrack';

export interface ConnectivityTestResult {
  timestamp: string;
  result: 'Passed' | 'Failed';
  latencyMs: number;
  signalQuality: 'Strong' | 'Moderate' | 'Weak';
}

/** Extra OEM / health metadata for a device, keyed by IMEI. */
export interface DeviceHealthInfo {
  imei: string;
  oem: OemPartner;
  simNumber: string;
  firmwareVersion: string;
  batteryPercent: number;
  signalStrength: number;
  healthStatus: DeviceHealthStatus;
  lastPingAt: string;
  installedOn?: string;
  testHistory: ConnectivityTestResult[];
}

export type GpsAlertType = 'Speed Violation' | 'Geofence Exit' | 'Device Offline' | 'Harsh Braking' | 'Low Battery';

export type GpsAlertSeverity = 'Critical' | 'Warning' | 'Info';

export interface GpsAlert {
  id: string;
  vehicleRegNumber: string;
  imei?: string;
  type: GpsAlertType;
  severity: GpsAlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'Circle' | 'Polygon';
  centerLabel: string;
  radiusKm?: number;
  assignedVehicles: string[];
  status: 'Active' | 'Inactive';
}

export interface TripReplayPoint {
  time: string;
  location: string;
  speedKmph: number;
  event?: string;
}

/** A vehicle plotted on the Live Tracking map placeholder. */
export interface LiveVehicle {
  regNumber: string;
  driver?: string;
  imei: string;
  speedKmph: number;
  heading: string;
  location: string;
  lastUpdated: string;
  status: 'On Trip' | 'Idle' | 'Maintenance' | 'Offline';
  /** Percentage-based position within the map placeholder canvas. */
  topPct: number;
  leftPct: number;
}
