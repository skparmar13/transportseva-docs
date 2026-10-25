import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiMarketplaceReview, ApiReviewService, MarketplaceReviewStatus } from '../../../core/api/api-review.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDateTime } from '../../../core/utils/date-format';

type ModerationFilter = MarketplaceReviewStatus | 'all';

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './review-management.component.html',
  styleUrl: './review-management.component.scss',
})
export class ReviewManagementComponent implements OnInit {
  private readonly api = inject(ApiReviewService);
  protected readonly filter = signal<ModerationFilter>('pending');
  protected readonly reviews = signal<ApiMarketplaceReview[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly actionUuid = signal<string | null>(null);
  protected readonly rejecting = signal<ApiMarketplaceReview | null>(null);
  protected readonly rejectionNote = signal('');
  protected readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void { this.load(); }
  protected setFilter(filter: ModerationFilter): void { this.filter.set(filter); this.rejecting.set(null); this.load(); }
  protected displayDate(value?: string | null): string { return value ? formatDateTime(value) : '—'; }
  protected reviewRole(role: string): string { return role === 'shipper' ? 'Shipper' : 'Fleet owner'; }
  protected openReject(review: ApiMarketplaceReview): void { this.rejectionNote.set(''); this.rejecting.set(review); }
  protected cancelReject(): void { this.rejecting.set(null); this.rejectionNote.set(''); }
  protected approve(review: ApiMarketplaceReview): void { this.moderate(review, 'approved'); }
  protected reject(): void {
    const review = this.rejecting();
    if (!review) return;
    if (this.rejectionNote().trim().length < 3) { this.error.set('Give the reviewer a short reason for requesting changes.'); return; }
    this.moderate(review, 'rejected', this.rejectionNote().trim());
  }

  private load(): void {
    this.loading.set(true); this.error.set('');
    this.api.listForModeration(this.filter()).subscribe({
      next: (reviews) => { this.reviews.set(reviews); this.loading.set(false); },
      error: (error) => { this.loading.set(false); this.error.set(apiErrorMessage(error, 'Reviews could not be loaded. Please retry.')); },
    });
  }

  private moderate(review: ApiMarketplaceReview, status: 'approved' | 'rejected', note = ''): void {
    this.actionUuid.set(review.uuid); this.error.set('');
    this.api.moderate(review.uuid, status, note).subscribe({
      next: () => { this.actionUuid.set(null); this.cancelReject(); this.load(); },
      error: (error) => { this.actionUuid.set(null); this.error.set(apiErrorMessage(error, 'The review decision could not be saved. Please retry.')); },
    });
  }
}
