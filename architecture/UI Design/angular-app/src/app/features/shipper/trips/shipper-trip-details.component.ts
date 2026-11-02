import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, timeout, timer } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperTripService, ShipperTripDetail } from '../../../core/api/api-shipper-trip.service';
import { LanguageService } from '../../../core/i18n';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';
import { TRIP_COPY } from './trip-copy';

@Component({
  selector: 'app-shipper-trip-details', standalone: true, imports: [RouterLink], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shipper-trip-details.component.html', styleUrl: './shipper-trips.scss',
})
export class ShipperTripDetailsComponent {
  private readonly api = inject(ApiShipperTripService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => TRIP_COPY[this.language.lang()]);
  protected readonly dateTime = formatDateTime;
  protected readonly date = formatDate;
  protected readonly data = signal<ShipperTripDetail | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly stale = signal(false);
  protected readonly downloading = signal(false);
  protected readonly downloadError = signal('');
  protected readonly tab = signal<'overview' | 'timelineLabel' | 'podLabel'>('overview');
  protected readonly tabs = ['overview', 'timelineLabel', 'podLabel'] as const;
  private uuid = '';
  private fetching = false;
  private request?: Subscription;
  private downloadRequest?: Subscription;
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.request?.unsubscribe(); this.downloadRequest?.unsubscribe(); this.fetching = false; this.downloading.set(false); this.downloadError.set('');
      this.uuid = params.get('id') ?? ''; this.data.set(null); this.tab.set('overview'); this.load();
    });
    timer(10_000, 10_000).pipe(takeUntilDestroyed()).subscribe(() => { if (this.data() && !this.fetching && !this.downloading()) this.load(true); });
  }
  protected load(poll = false): void {
    if (this.fetching || this.downloading()) return;
    this.request?.unsubscribe(); this.fetching = true;
    if (!poll) { this.loading.set(true); this.error.set(''); }
    if (!API_CONFIG.useBackend || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(this.uuid)) {
      this.fetching = false; this.loading.set(false); this.data.set(null); this.error.set(this.copy().detailFailed); return;
    }
    this.request = this.api.get(this.uuid).pipe(timeout(25_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.fetching = false; this.loading.set(false); this.data.set(data); this.stale.set(false); },
      error: (e) => {
        this.fetching = false; this.loading.set(false);
        if (poll && ![403, 404].includes(e?.status)) this.stale.set(true);
        else { this.data.set(null); this.error.set(this.copy().detailFailed); }
      },
    });
  }
  protected download(): void {
    const view = this.data(); if (!view?.pod.download_available || this.downloading()) return;
    this.request?.unsubscribe(); this.fetching = false; this.downloading.set(true); this.downloadError.set('');
    this.downloadRequest = this.api.downloadPod(view.trip.uuid).pipe(timeout(45_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (file) => {
        const url = URL.createObjectURL(file); const link = this.document.createElement('a');
        link.href = url; link.download = (view.pod.file_name || 'proof-of-delivery').replace(/[\\/\u0000-\u001f\u007f]/g, '_').slice(0, 180);
        link.click(); URL.revokeObjectURL(url); this.downloading.set(false);
      },
      error: () => { this.downloading.set(false); this.downloadError.set(this.copy().downloadFailed); },
    });
  }
  protected money(value: string | number | null): string { return value !== null && Number.isFinite(Number(value)) ? '₹' + Number(value).toLocaleString('en-IN') : this.copy().notRecorded; }
}
