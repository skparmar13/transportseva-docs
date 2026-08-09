import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { ApplicationStatus } from '../../../core/models/marketplace.model';

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  Pending: 'status-pending',
  Negotiating: 'status-transit',
  Accepted: 'status-delivered',
  Rejected: 'status-cancelled',
  Withdrawn: 'status-cancelled',
};

/**
 * Applications — dual purpose screen:
 *   - Shipper / Transporter (load owners): "Applications Received"
 *     aggregated across all their posted loads.
 *   - Transporter / Truck Owner (applicants): "My Applications"
 *     showing what they've applied for.
 * Branches on whether the current role has posted loads at all.
 */
@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './applications.component.html',
})
export class ApplicationsComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly statusClass = STATUS_CLASS;

  /** Loads owned by the current role — determines which mode to show. */
  private readonly myLoads = computed(() => this.marketplace.getLoadsPostedBy(this.session.role())());
  protected readonly isOwnerMode = computed(() => this.myLoads().length > 0);

  /** Owner mode: applications across all of my posted loads. */
  protected readonly receivedApplications = computed(() => {
    const myLoadIds = new Set(this.myLoads().map((l) => l.id));
    return this.marketplace
      .applications()
      .filter((app) => myLoadIds.has(app.loadId))
      .map((app) => ({ app, load: this.marketplace.loads().find((l) => l.id === app.loadId) }));
  });

  /** Applicant mode: my own applications submitted to other loads. */
  protected readonly myApplications = computed(() => {
    const apps = this.marketplace.getApplicationsBy(this.session.role())();
    return apps.map((app) => ({ app, load: this.marketplace.loads().find((l) => l.id === app.loadId) }));
  });

  protected viewLoad(loadId: string): void {
    this.router.navigate([this.session.portal().basePath, 'load-board', loadId]);
  }
}
