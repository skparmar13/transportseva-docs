import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, timeout } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperTripService, SHIPPER_TRIP_STAGES, ShipperTripStage } from '../../../core/api/api-shipper-trip.service';
import { LanguageService } from '../../../core/i18n';
import { formatDateTime } from '../../../core/utils/date-format';
import { TRIP_COPY } from './trip-copy';

@Component({
  selector: 'app-shipper-trip-list', standalone: true, imports: [FormsModule, RouterLink], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shipper-trip-list.component.html', styleUrl: './shipper-trips.scss',
})
export class ShipperTripListComponent {
  private readonly api = inject(ApiShipperTripService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => TRIP_COPY[this.language.lang()]);
  protected readonly dateTime = formatDateTime;
  protected readonly stages = SHIPPER_TRIP_STAGES;
  protected readonly kpiKeys = ['total', 'active', 'delivered', 'pod_outstanding'] as const;
  protected readonly data = signal<ReturnTypeState | null>(null);
  protected readonly stage = signal<ShipperTripStage | 'all'>('all');
  protected readonly search = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly page = signal(1);
  private request?: Subscription;
  constructor() { this.load(); }
  protected load(page = 1): void {
    if (this.loading()) return;
    this.request?.unsubscribe(); this.error.set(''); this.loading.set(true); this.page.set(page);
    if (!API_CONFIG.useBackend) { this.data.set(null); this.loading.set(false); this.error.set(this.copy().unavailable); return; }
    this.request = this.api.list(page, this.stage(), this.search().trim()).pipe(timeout(25_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.data.set(data); this.page.set(data.page); this.loading.set(false); },
      error: () => { this.data.set(null); this.loading.set(false); this.error.set(this.copy().failed); },
    });
  }
}
type ReturnTypeState = import('../../../core/api/api-shipper-trip.service').ShipperTripList & { page: number; lastPage: number; matching: number };
