import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { SessionService } from '../../../core/services/session.service';
import { CommunicationMockService } from '../../../core/services/communication-mock.service';
import { NotificationCategory } from '../../../core/models/communication.model';

const CATEGORY_ICON: Record<NotificationCategory, string> = {
  Booking: 'i-box',
  Payment: 'i-wallet',
  Trip: 'i-route',
  Document: 'i-doc',
  System: 'i-info',
};

/**
 * Single shared shell reused by every portal (Admin, Shipper,
 * Transporter, Truck Owner, Company, Driver). The sidebar/topbar
 * markup mirrors the existing HTML prototype's `.admin-shell` /
 * `.sidebar` / `.topbar` classes 1:1 (see Website/admin/index.html)
 * so styling stays pixel-consistent; only the nav data changes based
 * on the active `PortalConfig` from SessionService.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  constructor(
    private readonly sessionSvc: SessionService,
    private readonly router: Router,
    protected readonly comms: CommunicationMockService,
  ) {}

  protected readonly portal = computed(() => this.sessionSvc.portal());
  protected readonly user = computed(() => this.sessionSvc.user());

  protected readonly categoryIcon = CATEGORY_ICON;
  protected readonly showBellDropdown = signal(false);

  protected toggleBellDropdown(): void {
    this.showBellDropdown.update((v) => !v);
  }

  protected closeBellDropdown(): void {
    this.showBellDropdown.set(false);
  }

  protected markRead(id: string): void {
    this.comms.markNotificationRead(id);
  }

  protected viewAllNotifications(): void {
    this.closeBellDropdown();
    this.router.navigate([this.portal().basePath, 'notifications']);
  }
}
