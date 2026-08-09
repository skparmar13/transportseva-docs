import { Injectable, signal } from '@angular/core';
import {
  DriverReportRow,
  FleetReportRow,
  GpsReportRow,
  MarketplaceReportRow,
  RevenueReportRow,
  TripsReportRow,
} from '../models/report.model';

/**
 * Shared mock datasets for Module 10 — Reports. Reuses vehicle,
 * driver, and route names already seeded in Fleet/Drivers/Trips
 * modules for continuity, but as static summarized rows rather than
 * live joins (a real backend would aggregate this from the
 * transactional tables).
 */
@Injectable({ providedIn: 'root' })
export class ReportMockService {
  private readonly fleetRowsState = signal<FleetReportRow[]>([
    { vehicleRegNumber: 'RJ14GA1234', vehicleType: 'Truck (10 Wheeler)', distanceKm: '4,820 km', utilization: '86%', status: 'On Trip' },
    { vehicleRegNumber: 'GJ01AB5678', vehicleType: 'Trailer (14 Wheeler)', distanceKm: '3,910 km', utilization: '72%', status: 'Available' },
    { vehicleRegNumber: 'MH12CD4321', vehicleType: 'Mini Truck', distanceKm: '2,340 km', utilization: '58%', status: 'Maintenance' },
    { vehicleRegNumber: 'DL08EF9988', vehicleType: 'Truck (6 Wheeler)', distanceKm: '5,105 km', utilization: '91%', status: 'On Trip' },
  ]);

  private readonly driverRowsState = signal<DriverReportRow[]>([
    { driverName: 'Mahesh Patel', tripsCompleted: 42, onTimeRate: '96%', rating: '4.8' },
    { driverName: 'Ramesh Kumar', tripsCompleted: 35, onTimeRate: '91%', rating: '4.6' },
    { driverName: 'Suresh Singh', tripsCompleted: 28, onTimeRate: '88%', rating: '4.4' },
    { driverName: 'Dinesh Yadav', tripsCompleted: 19, onTimeRate: '94%', rating: '4.7' },
  ]);

  private readonly revenueRowsState = signal<RevenueReportRow[]>([
    { month: 'May 2026', freightRevenue: '\u20b98,42,000', commission: '\u20b942,100', netPayout: '\u20b97,99,900' },
    { month: 'Jun 2026', freightRevenue: '\u20b99,18,500', commission: '\u20b945,925', netPayout: '\u20b98,72,575' },
    { month: 'Jul 2026', freightRevenue: '\u20b98,76,200', commission: '\u20b943,810', netPayout: '\u20b98,32,390' },
    { month: 'Aug 2026', freightRevenue: '\u20b99,64,750', commission: '\u20b948,238', netPayout: '\u20b99,16,512' },
  ]);

  private readonly gpsRowsState = signal<GpsReportRow[]>([
    { metric: 'Total Devices Installed', value: '4' },
    { metric: 'Devices Online (24h uptime)', value: '3' },
    { metric: 'Average Signal Strength', value: '82%' },
    { metric: 'Geofence Breaches (This Month)', value: '2' },
    { metric: 'Total Distance Tracked', value: '16,175 km' },
  ]);

  private readonly marketplaceRowsState = signal<MarketplaceReportRow[]>([
    { category: 'Steel & Metals', loadsPosted: 24, loadsBooked: 19, conversionRate: '79%' },
    { category: 'Cement & Construction', loadsPosted: 31, loadsBooked: 22, conversionRate: '71%' },
    { category: 'FMCG & Retail', loadsPosted: 18, loadsBooked: 15, conversionRate: '83%' },
    { category: 'Agriculture', loadsPosted: 12, loadsBooked: 8, conversionRate: '67%' },
  ]);

  private readonly tripsRowsState = signal<TripsReportRow[]>([
    { route: 'Jaipur \u2192 Ahmedabad', tripsCompleted: 14, avgDurationHrs: '9.2 hrs', onTimePercent: '93%' },
    { route: 'Mumbai \u2192 Pune', tripsCompleted: 22, avgDurationHrs: '3.5 hrs', onTimePercent: '97%' },
    { route: 'Delhi \u2192 Lucknow', tripsCompleted: 9, avgDurationHrs: '8.1 hrs', onTimePercent: '89%' },
    { route: 'Kota \u2192 Indore', tripsCompleted: 6, avgDurationHrs: '6.4 hrs', onTimePercent: '90%' },
  ]);

  readonly fleetRows = this.fleetRowsState.asReadonly();
  readonly driverRows = this.driverRowsState.asReadonly();
  readonly revenueRows = this.revenueRowsState.asReadonly();
  readonly gpsRows = this.gpsRowsState.asReadonly();
  readonly marketplaceRows = this.marketplaceRowsState.asReadonly();
  readonly tripsRows = this.tripsRowsState.asReadonly();
}
