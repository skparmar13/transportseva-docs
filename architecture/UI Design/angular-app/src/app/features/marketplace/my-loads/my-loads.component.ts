import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { LoadStatus } from '../../../core/models/marketplace.model';

const STATUS_CLASS: Record<LoadStatus, string> = {
  Open: 'status-pending',
  'Applications Received': 'status-transit',
  Booked: 'status-delivered',
  'In Transit': 'status-transit',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
};

/** "My Loads" — loads posted by the current role (Shipper, or Transporter on behalf of customers). */
@Component({
  selector: 'app-my-loads',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-loads.component.html',
})
export class MyLoadsComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly loads = computed(() => this.marketplace.getLoadsPostedBy(this.session.role())());
  protected readonly statusClass = STATUS_CLASS;

  protected viewLoad(loadId: string): void {
    this.router.navigate([this.session.portal().basePath, 'load-board', loadId]);
  }

  protected postLoad(): void {
    this.router.navigate([this.session.portal().basePath, 'post-load']);
  }
}
