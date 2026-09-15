import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../core/i18n';
import { CommunicationMockService } from '../../core/services/communication-mock.service';
import { NotificationCategory } from '../../core/models/communication.model';

type NotificationFilter = 'all' | 'unread';

const CATEGORY_ICON: Record<NotificationCategory, string> = {
  Booking: 'i-box',
  Payment: 'i-credit-card',
  Trip: 'i-route',
  Document: 'i-doc',
  System: 'i-info',
};

const CATEGORY_KEY: Record<NotificationCategory, string> = {
  Booking: 'notifications.category.booking',
  Payment: 'notifications.category.payment',
  Trip: 'notifications.category.trip',
  Document: 'notifications.category.document',
  System: 'notifications.category.system',
};

/**
 * Notifications — Module 12. Full "view all" page complementing the
 * header bell dropdown. Supports filtering to unread only, marking
 * an individual notification read, and marking all read at once.
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent {
  protected readonly comms = inject(CommunicationMockService);
  protected readonly categoryIcon = CATEGORY_ICON;
  protected readonly categoryKey = CATEGORY_KEY;
  protected readonly filter = signal<NotificationFilter>('all');

  protected readonly visibleNotifications = computed(() => {
    const list = this.comms.notifications();
    return this.filter() === 'unread' ? list.filter((n) => !n.read) : list;
  });

  protected setFilter(filter: NotificationFilter): void {
    this.filter.set(filter);
  }

  protected markRead(id: string): void {
    this.comms.markNotificationRead(id);
  }

  protected markAllRead(): void {
    this.comms.markAllNotificationsRead();
  }
}
