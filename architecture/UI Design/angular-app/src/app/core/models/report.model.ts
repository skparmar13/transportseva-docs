/**
 * TransportSeva Reports — Module 10 domain model. Six report views:
 * Fleet, Driver, Revenue, GPS, Marketplace, Trips. Each report is a
 * lightweight summary (KPIs + breakdown rows) rather than raw
 * transactional data, since the real analytics/BI would eventually
 * come from the backend warehouse.
 */
export interface ReportKpi {
  label: string;
  value: string;
  icon: string;
}

export interface ReportBreakdownRow {
  label: string;
  value: string;
  percent: number;
}

export interface FleetReportRow {
  vehicleRegNumber: string;
  vehicleType: string;
  distanceKm: string;
  utilization: string;
  status: string;
}

export interface DriverReportRow {
  driverName: string;
  tripsCompleted: number;
  onTimeRate: string;
  rating: string;
}

export interface RevenueReportRow {
  month: string;
  freightRevenue: string;
  commission: string;
  netPayout: string;
}

export interface GpsReportRow {
  metric: string;
  value: string;
}

export interface MarketplaceReportRow {
  category: string;
  loadsPosted: number;
  loadsBooked: number;
  conversionRate: string;
}

export interface TripsReportRow {
  route: string;
  tripsCompleted: number;
  avgDurationHrs: string;
  onTimePercent: string;
}
