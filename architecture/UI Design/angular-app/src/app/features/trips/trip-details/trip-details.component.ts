import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TripMockService } from '../../../core/services/trip-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { TripStatus } from '../../../core/models/trip.model';

const STATUS_CLASS: Record<TripStatus, string> = {
  Planned: 'status-pending',
  'In Transit': 'status-transit',
  Delivered: 'status-delivered',
  Settled: 'status-delivered',
};

type TripTab = 'timeline' | 'route' | 'pod';

/** Trip Details — Module 7. Timeline / Route / POD tabs for a single trip. */
@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [IconComponent, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-details.component.html',
})
export class TripDetailsComponent {
  private readonly trips = inject(TripMockService);
  protected readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);

  protected readonly statusClass = STATUS_CLASS;
  protected readonly activeTab = signal<TripTab>('timeline');

  protected readonly listPath = computed(() => [this.session.portal().basePath, 'trips']);

  protected readonly trip = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.trips.getTrip(id);
  });

  protected setTab(tab: TripTab): void {
    this.activeTab.set(tab);
  }

  // POD upload form
  protected readonly podNumber = signal('');
  protected readonly receivedByName = signal('');
  protected readonly remarks = signal('');
  protected readonly saving = signal(false);

  protected submitPod(): void {
    const trip = this.trip();
    if (!trip || !this.podNumber() || !this.receivedByName()) return;
    this.saving.set(true);
    setTimeout(() => {
      this.trips.uploadPod(trip.id, {
        podNumber: this.podNumber().trim(),
        receivedByName: this.receivedByName().trim(),
        remarks: this.remarks().trim() || undefined,
        fileName: 'pod-signed-copy.pdf',
      });
      this.saving.set(false);
      this.podNumber.set('');
      this.receivedByName.set('');
      this.remarks.set('');
    }, 400);
  }
}
