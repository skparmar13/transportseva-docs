import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, exhaustMap, finalize, merge, Subject, switchMap, timer } from 'rxjs';
import { ApiBookingTrackingService, BookingTrackingView } from '../../../core/api/api-booking-tracking.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { SessionService } from '../../../core/services/session.service';
import { formatDateTime } from '../../../core/utils/date-format';
import { MapProviderService } from '../../../core/services/map-provider.service';

@Component({ selector: 'app-booking-tracking', standalone: true, imports: [RouterLink], templateUrl: './booking-tracking.component.html', styleUrl: './booking-tracking.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class BookingTrackingComponent implements OnInit {
  private readonly api = inject(ApiBookingTrackingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly maps = inject(MapProviderService);
  private readonly destroy = inject(DestroyRef);
  private readonly platform = inject(PLATFORM_ID);
  protected readonly session = inject(SessionService);
  protected readonly view = signal<BookingTrackingView | null>(null);
  protected readonly selected = signal('');
  protected readonly loading = signal(false);
  protected readonly refreshing = signal(false);
  protected readonly error = signal('');
  protected readonly rows = signal<{ uuid: string; booking_reference: string; status: string; vehicle: string }[]>([]);
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly listError = signal('');
  protected readonly listLoading = signal(false);
  private readonly refresh = new Subject<void>();
  private readonly pages = new Subject<number>();
  protected readonly dateTime = formatDateTime;
  protected readonly history = computed(() => [...(this.view()?.points ?? [])].reverse().slice(0, 10));
  private readonly coordinate = computed(() => {
    const p = this.view()?.latest;
    return p ? `${p.latitude},${p.longitude}` : '';
  });
  protected readonly mapUrl = computed(() => {
    const coordinate = this.coordinate(); if (!coordinate) return null;
    const [lat, lon] = coordinate.split(',').map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return this.maps.frameUrl(lat, lon);
  });
  protected readonly statusText = computed(() => {
    if (this.error()) return 'Connection interrupted — location may be out of date';
    switch (this.view()?.status) {
      case 'updating': return this.view()?.latest?.simulated ? 'Test positions updating' : 'Location updating';
      case 'stale': return 'Signal stale — last known location';
      case 'ended': return 'Trip ended — last recorded location';
      case 'paused': return 'Trip paused — last known location';
      case 'not_started': return 'Tracking begins when the trip starts';
      default: return 'Waiting for vehicle signal';
    }
  });
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platform)) return;
    this.pages.pipe(switchMap(page => {
      this.page.set(page); this.listLoading.set(true); this.listError.set('');
      return this.api.bookings(page).pipe(catchError(e => { this.listLoading.set(false); this.listError.set(apiErrorMessage(e, 'Could not load bookings.')); return EMPTY; }));
    }), takeUntilDestroyed(this.destroy)).subscribe(r => {
      this.rows.set(r.data.map(b => ({ uuid: b.uuid, booking_reference: b.booking_reference, status: b.status, vehicle: b.workflow?.vehicle_assignment?.vehicle_reg_number ?? '' })));
      this.lastPage.set(r.meta?.last_page ?? 1); this.listLoading.set(false);
    });
    this.route.queryParamMap.pipe(switchMap(params => {
      const uuid = params.get('booking') ?? '', vehicle = params.get('vehicle') ?? undefined;
      this.selected.set(uuid); this.view.set(null); this.error.set(''); this.loading.set(!!uuid);
      if (!uuid) { this.loading.set(false); this.loadPage(1); return EMPTY; }
      return merge(timer(0, 10_000), this.refresh).pipe(exhaustMap(() => {
        this.refreshing.set(true);
        return this.api.view(uuid, vehicle).pipe(catchError(e => {
          if (e?.status === 403 || e?.status === 404) this.view.set(null);
          this.loading.set(false); this.error.set(apiErrorMessage(e, 'Tracking could not be refreshed. Please retry.')); return EMPTY;
        }), finalize(() => this.refreshing.set(false)));
      }));
    }), takeUntilDestroyed(this.destroy)).subscribe(v => { this.view.set(v); this.error.set(''); this.loading.set(false); });
  }
  protected loadPage(page: number): void { if (!this.listLoading()) this.pages.next(page); }
  protected retry(): void { if (!this.refreshing()) this.refresh.next(); }
  protected choose(uuid: string, vehicle?: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { booking: uuid || null, vehicle: vehicle || null }, queryParamsHandling: 'merge' });
  }
  protected bookingPath(): string { return `${this.session.portal().basePath}/${this.session.role() === 'transporter' ? 'requests' : 'bookings'}`; }
}
