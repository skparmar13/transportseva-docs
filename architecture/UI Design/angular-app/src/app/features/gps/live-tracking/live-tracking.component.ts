import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { take } from 'rxjs';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { GpsMockService } from '../../../core/services/gps-mock.service';
import { LiveVehicle } from '../../../core/models/gps.model';
import { LocationSearchService } from '../../../core/services/location-search.service';
import { GeoLocation } from '../../../core/models/location.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { TranslatePipe } from '../../../core/i18n';
import { formatDateTime } from '../../../core/utils/date-format';
import { API_CONFIG } from '../../../core/api/api-config';

const STATUS_DOT_CLASS: Record<LiveVehicle['status'], string> = {
  'On Trip': 'status-transit',
  Idle: 'status-pending',
  Maintenance: 'status-overdue',
  Offline: 'status-cancelled',
};

/**
 * Live Tracking — vehicle list first, with a focused OSM location view
 * for the selected vehicle. Geofence management lives on its own page.
 */
@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-tracking.component.html',
})
export class LiveTrackingComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly gps = inject(GpsMockService);
  private readonly locationSearch = inject(LocationSearchService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly session = inject(SessionService);
  protected readonly statusDotClass = STATUS_DOT_CLASS;

  protected readonly backendEnabled = API_CONFIG.useBackend;
  // Demo coordinates must never be displayed as real GPS data for API bookings.
  protected readonly liveVehicles = computed(() => this.backendEnabled ? [] : this.gps.liveVehicles());
  protected readonly mapVehicleReg = signal<string | null>(null);
  protected readonly mapLocation = signal<GeoLocation | null>(null);
  protected readonly mapLoading = signal(false);
  protected readonly requestedVehicleReg = signal<string | null>(null);
  protected readonly requestedVehicleUnavailable = computed(() => {
    const regNumber = this.requestedVehicleReg();
    return !!regNumber && !this.liveVehicles().some((vehicle) => vehicle.regNumber === regNumber);
  });
  protected readonly mapFrameUrl = computed<SafeResourceUrl | null>(() => {
    const location = this.mapLocation();
    if (!location) return null;
    const pad = 0.012;
    const bbox = [location.longitude - pad, location.latitude - pad, location.longitude + pad, location.latitude + pad].join(',');
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${location.latitude},${location.longitude}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
  protected readonly mapVehicle = computed(() => this.liveVehicles().find((vehicle) => vehicle.regNumber === this.mapVehicleReg()) ?? null);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const vehicleRegNumber = params.get('vehicle')?.trim().toUpperCase() ?? null;
      this.requestedVehicleReg.set(vehicleRegNumber);
      if (vehicleRegNumber) this.selectVehicle(vehicleRegNumber);
    });
  }

  private loadVehicleMap(vehicle: LiveVehicle): void {
    this.mapVehicleReg.set(vehicle.regNumber);
    this.mapLocation.set(null);
    this.mapLoading.set(true);
    this.locationSearch.search(`${vehicle.location}, India`).pipe(take(1)).subscribe({
      next: (locations) => {
        this.mapLocation.set(locations[0] ?? null);
        this.mapLoading.set(false);
      },
      error: () => {
        this.mapLocation.set(null);
        this.mapLoading.set(false);
      },
    });
  }

  protected selectVehicle(regNumber: string): void {
    const normalizedRegNumber = regNumber.trim().toUpperCase();
    const vehicle = this.liveVehicles().find((item) => item.regNumber.trim().toUpperCase() === normalizedRegNumber);
    if (vehicle) this.loadVehicleMap(vehicle);
  }

  protected backToVehicles(): void {
    this.mapVehicleReg.set(null);
    this.mapLocation.set(null);
    this.requestedVehicleReg.set(null);
    this.router.navigate([], { relativeTo: this.route, queryParams: { vehicle: null, booking: null }, queryParamsHandling: 'merge' });
  }

  protected openGeofences(): void {
    this.router.navigate([this.session.portal().basePath, 'geofences']);
  }

  // Alerts panel
  protected readonly showAlerts = signal(false);
  protected readonly alerts = this.gps.alerts;
  protected readonly unacknowledgedCount = this.gps.unacknowledgedAlertCount;

  protected toggleAlerts(): void {
    this.showAlerts.update((v) => !v);
  }

  protected acknowledge(id: string): void {
    this.gps.acknowledgeAlert(id);
  }

  protected acknowledgeAll(): void {
    this.gps.acknowledgeAllAlerts();
  }

  protected dateTime(value: string | undefined): string {
    return formatDateTime(value);
  }

}
