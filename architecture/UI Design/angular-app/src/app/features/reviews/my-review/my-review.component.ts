import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiMarketplaceReview, ApiReviewService } from '../../../core/api/api-review.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDateTime } from '../../../core/utils/date-format';

@Component({
  selector: 'app-my-review',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-review.component.html',
  styleUrl: './my-review.component.scss',
})
export class MyReviewComponent implements OnInit {
  private readonly api = inject(ApiReviewService);
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly review = signal<ApiMarketplaceReview | null>(null);
  protected readonly rating = signal(0);
  protected readonly comment = signal('');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');

  ngOnInit(): void { this.load(); }
  protected chooseRating(value: number): void { this.rating.set(value); this.error.set(''); }

  protected save(): void {
    const rating = this.rating();
    const comment = this.comment().trim();
    if (!rating) { this.error.set('Choose a star rating before submitting your review.'); return; }
    if (comment.length < 10) { this.error.set('Please write at least 10 characters so the review is useful.'); return; }
    this.saving.set(true); this.error.set(''); this.success.set('');
    this.api.submit({ rating, comment }).subscribe({
      next: (review) => { this.review.set(review); this.rating.set(review.rating); this.comment.set(review.comment); this.saving.set(false); this.success.set(review.status === 'pending' ? 'Your review has been submitted for moderation.' : 'Your review has been updated.'); },
      error: (error) => { this.saving.set(false); this.error.set(apiErrorMessage(error, 'We could not submit your review. Please try again.')); },
    });
  }

  protected statusLabel(status?: string): string { return status === 'approved' ? 'Published on the home page' : status === 'rejected' ? 'Needs changes' : 'Awaiting admin moderation'; }
  protected submittedAt(value?: string | null): string { return value ? formatDateTime(value) : '—'; }

  private load(): void {
    this.loading.set(true);
    this.api.listMine().subscribe({
      next: (review) => { this.review.set(review); if (review) { this.rating.set(review.rating); this.comment.set(review.comment); } this.loading.set(false); },
      error: (error) => { this.loading.set(false); this.error.set(apiErrorMessage(error, 'Your review could not be loaded. Please refresh the page.')); },
    });
  }
}
