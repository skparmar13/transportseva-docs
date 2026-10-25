import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from './api-client.service';

export type MarketplaceReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ApiMarketplaceReview {
  uuid: string;
  reviewer_name: string;
  reviewer_role: 'shipper' | 'truck-owner';
  rating: number;
  comment: string;
  status?: MarketplaceReviewStatus;
  moderation_note?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
}

export interface SubmitMarketplaceReviewPayload {
  rating: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ApiReviewService {
  private readonly api = inject(ApiClientService);

  listMine(): Observable<ApiMarketplaceReview | null> {
    return this.api.get<ApiMarketplaceReview | null>('reviews/mine').pipe(map((response) => response.data));
  }

  submit(payload: SubmitMarketplaceReviewPayload): Observable<ApiMarketplaceReview> {
    return this.api.post<ApiMarketplaceReview>('reviews', payload).pipe(map((response) => response.data));
  }

  listPublic(limit = 6): Observable<ApiMarketplaceReview[]> {
    return this.api.get<ApiMarketplaceReview[]>('public/reviews', { limit: Math.min(Math.max(limit, 1), 12) })
      .pipe(map((response) => response.data));
  }

  listForModeration(status: MarketplaceReviewStatus | 'all' = 'pending'): Observable<ApiMarketplaceReview[]> {
    const request = status === 'all'
      ? this.api.get<ApiMarketplaceReview[]>('admin/reviews')
      : this.api.get<ApiMarketplaceReview[]>('admin/reviews', { status });
    return request.pipe(map((response) => response.data));
  }

  moderate(uuid: string, status: Extract<MarketplaceReviewStatus, 'approved' | 'rejected'>, moderationNote = ''): Observable<ApiMarketplaceReview> {
    return this.api.patch<ApiMarketplaceReview>(`admin/reviews/${encodeURIComponent(uuid)}`, {
      status,
      moderation_note: moderationNote,
    }).pipe(map((response) => response.data));
  }
}
