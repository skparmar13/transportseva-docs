import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timeout } from 'rxjs';
import { ApiCommercialTermsService, CommercialAgreement, CommercialTerms } from '../../../core/api/api-commercial-terms.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDateTime } from '../../../core/utils/date-format';

@Component({
  selector: 'app-booking-commercial-terms',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './booking-commercial-terms.component.html',
  styleUrl: './booking-commercial-terms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCommercialTermsComponent {
  readonly bookingUuid = input.required<string>();
  readonly loadPath = input<string[]>([]);
  readonly changed = output<void>();
  private readonly api = inject(ApiCommercialTermsService);
  private readonly destroy = inject(DestroyRef);
  readonly data = signal<CommercialAgreement | null>(null);
  readonly loading = signal(false);
  readonly busy = signal('');
  readonly error = signal('');
  readonly notice = signal('');
  editing = false;
  acknowledged = false;
  draft: CommercialTerms | null = null;
  readonly date = formatDateTime;
  readonly money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  constructor() { effect(() => { const id = this.bookingUuid(); untracked(() => this.load(id)); }); }
  refresh() { this.load(this.bookingUuid()); }
  private load(id: string) {
    if (this.loading() || this.busy()) return;
    this.loading.set(true); this.error.set('');
    this.api.get(id).pipe(timeout(20000), takeUntilDestroyed(this.destroy), finalize(() => this.loading.set(false))).subscribe({
      next: d => this.receive(d), error: e => this.error.set(apiErrorMessage(e, 'Could not load commercial terms. Please retry.')),
    });
  }
  private receive(d: CommercialAgreement) {
    this.data.set(d); this.draft = d.current ? { ...d.current.terms } : null;
    this.editing = false; this.acknowledged = false;
  }
  canAgree() { const d = this.data(); return d?.booking_status === 'awaiting_tokens' && d.status === 'awaiting_acceptance'; }
  alreadyAccepted() { const d = this.data(); return d?.viewer_side === 'owner' ? !!d.current?.owner_accepted_at : !!d?.current?.provider_accepted_at; }
  submit(propose = false) {
    const v = this.data()?.current;
    if (!v || !this.draft || !this.canAgree() || !this.acknowledged || this.busy()) return;
    this.error.set(''); this.notice.set(''); this.busy.set(propose ? 'proposal' : 'accept');
    const action = propose ? this.api.propose(this.bookingUuid(), v, this.draft) : this.api.accept(this.bookingUuid(), v);
    action.pipe(timeout(20000), takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(''))).subscribe({
      next: d => { this.receive(d); this.notice.set(d.status === 'agreed' ? 'Both parties accepted. Booking tokens can now be paid.' : 'Your acceptance is recorded. The other party must review and accept this version.'); this.changed.emit(); },
      error: e => { this.acknowledged = false; this.error.set(apiErrorMessage(e, 'The action could not be completed. Refresh the terms before retrying.')); },
    });
  }
  download() {
    if (this.data()?.status !== 'agreed' || this.busy()) return;
    this.busy.set('download'); this.error.set('');
    this.api.document(this.bookingUuid()).pipe(timeout(20000), takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(''))).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = `booking-${this.bookingUuid()}-v${this.data()?.current?.version}.html`;
        a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, error: () => this.error.set('Could not download the agreed confirmation. Please retry.'),
    });
  }
}
