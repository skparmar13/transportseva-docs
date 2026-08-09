import { Injectable, computed, signal } from '@angular/core';
import { FleetMockService } from './fleet-mock.service';
import {
  ConnectivityTestResult,
  DeviceHealthInfo,
  DeviceHealthStatus,
  GeofenceZone,
  GpsAlert,
  GpsAlertSeverity,
  GpsAlertType,
  LiveVehicle,
  OemPartner,
  TripReplayPoint,
} from '../models/gps.model';

let idCounter = 400;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

const INITIAL_HEALTH: DeviceHealthInfo[] = [
  {
    imei: '867654321', oem: 'Teltonika', simNumber: '+91 98230 90011', firmwareVersion: 'v2.4.1',
    batteryPercent: 92, signalStrength: 88, healthStatus: 'Healthy', lastPingAt: '2 min ago', installedOn: '19 Nov 2022',
    testHistory: [{ timestamp: '07 Aug 2026, 10:12 AM', result: 'Passed', latencyMs: 340, signalQuality: 'Strong' }],
  },
  {
    imei: '867654322', oem: 'Concox', simNumber: '+91 98230 90012', firmwareVersion: 'v1.9.6',
    batteryPercent: 76, signalStrength: 64, healthStatus: 'Healthy', lastPingAt: '1 min ago', installedOn: '14 Jan 2024',
    testHistory: [{ timestamp: '07 Aug 2026, 09:40 AM', result: 'Passed', latencyMs: 510, signalQuality: 'Moderate' }],
  },
  {
    imei: '867654323', oem: 'Ruptela', simNumber: '+91 98230 90013', firmwareVersion: 'v3.0.2',
    batteryPercent: 12, signalStrength: 8, healthStatus: 'Critical', lastPingAt: '3 days ago',
    testHistory: [{ timestamp: '04 Aug 2026, 06:05 PM', result: 'Failed', latencyMs: 0, signalQuality: 'Weak' }],
  },
  {
    imei: '867654324', oem: 'Teltonika', simNumber: '+91 98230 90014', firmwareVersion: 'v2.4.1',
    batteryPercent: 54, signalStrength: 41, healthStatus: 'Warning', lastPingAt: '18 min ago', installedOn: '05 May 2021',
    testHistory: [{ timestamp: '06 Aug 2026, 04:22 PM', result: 'Passed', latencyMs: 890, signalQuality: 'Weak' }],
  },
  {
    imei: '867654325', oem: 'ATrack', simNumber: '+91 98230 90015', firmwareVersion: 'v1.6.0',
    batteryPercent: 100, signalStrength: 95, healthStatus: 'Healthy', lastPingAt: '—',
    testHistory: [],
  },
  {
    imei: '867654326', oem: 'ATrack', simNumber: '+91 98230 90016', firmwareVersion: 'v1.6.0',
    batteryPercent: 100, signalStrength: 91, healthStatus: 'Healthy', lastPingAt: '—',
    testHistory: [],
  },
  {
    imei: '867654327', oem: 'Concox', simNumber: '+91 98230 90017', firmwareVersion: 'v1.9.6',
    batteryPercent: 30, signalStrength: 0, healthStatus: 'Offline', lastPingAt: '11 days ago',
    testHistory: [{ timestamp: '28 Jul 2026, 11:15 AM', result: 'Failed', latencyMs: 0, signalQuality: 'Weak' }],
  },
];

const INITIAL_ALERTS: GpsAlert[] = [
  { id: 'al-1', vehicleRegNumber: 'RJ14GA1234', imei: '867654322', type: 'Speed Violation', severity: 'Warning', message: 'Speed of 92 km/h detected on NH-48 (limit 80 km/h).', timestamp: '07 Aug 2026, 11:20 AM', acknowledged: false },
  { id: 'al-2', vehicleRegNumber: 'RJ14GD3456', imei: '867654324', type: 'Low Battery', severity: 'Warning', message: 'Device battery at 54% — recommend inspection during next service.', timestamp: '06 Aug 2026, 04:25 PM', acknowledged: false },
  { id: 'al-3', vehicleRegNumber: 'RJ14GC9012', imei: '867654321', type: 'Geofence Exit', severity: 'Info', message: 'Vehicle exited "Jaipur Yard" geofence zone.', timestamp: '05 Aug 2026, 08:02 AM', acknowledged: true },
  { id: 'al-4', vehicleRegNumber: '—', imei: '867654327', type: 'Device Offline', severity: 'Critical', message: 'Device 867654327 has not reported a location in over 24 hours.', timestamp: '28 Jul 2026, 11:16 AM', acknowledged: false },
  { id: 'al-5', vehicleRegNumber: 'RJ14GB5678', type: 'Harsh Braking', severity: 'Info', message: 'Harsh braking event recorded near Kishangarh toll plaza.', timestamp: '06 Aug 2026, 07:48 PM', acknowledged: true },
];

const INITIAL_GEOFENCES: GeofenceZone[] = [
  { id: 'gf-1', name: 'Jaipur Yard', type: 'Circle', centerLabel: 'Jaipur Transport Nagar', radiusKm: 2, assignedVehicles: ['RJ14GC9012', 'RJ14GD3456'], status: 'Active' },
  { id: 'gf-2', name: 'Ahmedabad Delivery Zone', type: 'Circle', centerLabel: 'Ahmedabad Bypass Warehouse', radiusKm: 5, assignedVehicles: ['RJ14GA1234'], status: 'Active' },
  { id: 'gf-3', name: 'Kishangarh Marble Hub', type: 'Polygon', centerLabel: 'Kishangarh Industrial Area', assignedVehicles: ['RJ14GB5678'], status: 'Inactive' },
];

const INITIAL_TRIP_REPLAY: Record<string, TripReplayPoint[]> = {
  RJ14GA1234: [
    { time: '06:00 AM', location: 'Jaipur Yard', speedKmph: 0, event: 'Trip started' },
    { time: '08:30 AM', location: 'Kishangarh Toll Plaza', speedKmph: 78 },
    { time: '11:45 AM', location: 'Udaipur Bypass', speedKmph: 64 },
    { time: '02:10 PM', location: 'Ahmedabad Bypass', speedKmph: 92, event: 'Speed violation flagged' },
    { time: '03:05 PM', location: 'Ahmedabad Bypass Warehouse', speedKmph: 12, event: 'Entered geofence' },
  ],
  RJ14GB5678: [
    { time: '05:30 AM', location: 'Jaipur Yard', speedKmph: 0, event: 'Trip started' },
    { time: '07:48 PM', location: 'Kishangarh Toll Plaza', speedKmph: 22, event: 'Harsh braking' },
    { time: '09:10 PM', location: 'NH-48, Kishangarh', speedKmph: 58 },
  ],
  RJ14GC9012: [
    { time: '07:55 AM', location: 'Jaipur Yard', speedKmph: 5, event: 'Exited geofence' },
    { time: '08:20 AM', location: 'Ajmer Road', speedKmph: 46 },
  ],
  RJ14GD3456: [
    { time: 'Yesterday, 09:00 AM', location: 'Service Center, Jaipur', speedKmph: 0, event: 'Arrived for maintenance' },
  ],
};

/**
 * In-memory GPS store — Module 6. Layers OEM/health metadata,
 * connectivity tests, live-tracking positions, trip replay and
 * geofence/alert data on top of the device inventory owned by
 * `FleetMockService`.
 */
@Injectable({ providedIn: 'root' })
export class GpsMockService {
  private readonly healthState = signal<DeviceHealthInfo[]>(INITIAL_HEALTH);
  private readonly alertsState = signal<GpsAlert[]>(INITIAL_ALERTS);
  private readonly geofencesState = signal<GeofenceZone[]>(INITIAL_GEOFENCES);
  private readonly tripReplayState = signal<Record<string, TripReplayPoint[]>>(INITIAL_TRIP_REPLAY);

  /** Fixed placeholder-map coordinates per registration number, for a stable Live Tracking layout. */
  private readonly mapPositions: Record<string, { topPct: number; leftPct: number; heading: string }> = {
    RJ14GA1234: { topPct: 62, leftPct: 74, heading: 'North-West' },
    RJ14GB5678: { topPct: 44, leftPct: 30, heading: 'North-East' },
    RJ14GC9012: { topPct: 22, leftPct: 52, heading: 'Stationary' },
    RJ14GD3456: { topPct: 78, leftPct: 20, heading: 'Stationary' },
  };

  constructor(private readonly fleet: FleetMockService) {}

  readonly alerts = computed(() => this.alertsState());
  readonly unacknowledgedAlertCount = computed(() => this.alertsState().filter((a) => !a.acknowledged).length);
  readonly geofences = computed(() => this.geofencesState());

  /** Devices from the shared Fleet inventory, joined with OEM/health metadata. */
  readonly devices = computed(() =>
    this.fleet.devices().map((device) => ({
      ...device,
      health: this.healthState().find((h) => h.imei === device.imei),
    })),
  );

  getDeviceByImei(imei: string) {
    return computed(() => this.devices().find((d) => d.imei === imei));
  }

  /** Vehicles with an installed device, plotted on the Live Tracking map placeholder. */
  readonly liveVehicles = computed<LiveVehicle[]>(() =>
    this.fleet
      .vehicles()
      .filter((v) => v.deviceImei)
      .map((v) => {
        const pos = this.mapPositions[v.regNumber] ?? { topPct: 50, leftPct: 50, heading: 'Unknown' };
        const health = this.healthState().find((h) => h.imei === v.deviceImei);
        return {
          regNumber: v.regNumber,
          driver: v.driver,
          imei: v.deviceImei!,
          speedKmph: v.status === 'On Trip' ? 58 : 0,
          heading: pos.heading,
          location: v.location,
          lastUpdated: health?.lastPingAt ?? '—',
          status: v.status,
          topPct: pos.topPct,
          leftPct: pos.leftPct,
        };
      }),
  );

  getTripReplay(regNumber: string) {
    return computed(() => this.tripReplayState()[regNumber] ?? []);
  }

  getAlertsForVehicle(regNumber: string) {
    return computed(() => this.alertsState().filter((a) => a.vehicleRegNumber === regNumber));
  }

  addDevice(imei: string, oem: OemPartner, simNumber: string): void {
    this.fleet.addDevice(imei);
    const info: DeviceHealthInfo = {
      imei, oem, simNumber, firmwareVersion: 'v1.0.0',
      batteryPercent: 100, signalStrength: 100, healthStatus: 'Healthy', lastPingAt: 'Just now',
      testHistory: [],
    };
    this.healthState.update((list) => [info, ...list]);
  }

  /** Simulates a connectivity test — deterministic-ish result derived from current health. */
  runConnectivityTest(imei: string): ConnectivityTestResult {
    const current = this.healthState().find((h) => h.imei === imei);
    const passed = (current?.signalStrength ?? 0) > 15;
    const result: ConnectivityTestResult = {
      timestamp: 'Just now',
      result: passed ? 'Passed' : 'Failed',
      latencyMs: passed ? Math.round(200 + Math.random() * 400) : 0,
      signalQuality: (current?.signalStrength ?? 0) > 60 ? 'Strong' : (current?.signalStrength ?? 0) > 25 ? 'Moderate' : 'Weak',
    };
    this.healthState.update((list) =>
      list.map((h) =>
        h.imei === imei
          ? { ...h, lastPingAt: passed ? 'Just now' : h.lastPingAt, healthStatus: passed ? this.deriveHealthStatus(h.batteryPercent, h.signalStrength) : 'Offline', testHistory: [result, ...h.testHistory] }
          : h,
      ),
    );
    return result;
  }

  private deriveHealthStatus(batteryPercent: number, signalStrength: number): DeviceHealthStatus {
    if (batteryPercent < 20 || signalStrength < 15) return 'Critical';
    if (batteryPercent < 50 || signalStrength < 40) return 'Warning';
    return 'Healthy';
  }

  acknowledgeAlert(id: string): void {
    this.alertsState.update((alerts) => alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }

  acknowledgeAllAlerts(): void {
    this.alertsState.update((alerts) => alerts.map((a) => ({ ...a, acknowledged: true })));
  }

  addGeofence(input: { name: string; type: 'Circle' | 'Polygon'; centerLabel: string; radiusKm?: number; assignedVehicles: string[] }): GeofenceZone {
    const zone: GeofenceZone = { id: nextId('gf'), status: 'Active', ...input };
    this.geofencesState.update((zones) => [zone, ...zones]);
    return zone;
  }

  toggleGeofence(id: string): void {
    this.geofencesState.update((zones) =>
      zones.map((z) => (z.id === id ? { ...z, status: z.status === 'Active' ? 'Inactive' : 'Active' } : z)),
    );
  }

  addAlert(input: { vehicleRegNumber: string; imei?: string; type: GpsAlertType; severity: GpsAlertSeverity; message: string }): void {
    const alert: GpsAlert = { id: nextId('al'), timestamp: 'Just now', acknowledged: false, ...input };
    this.alertsState.update((alerts) => [alert, ...alerts]);
  }
}
