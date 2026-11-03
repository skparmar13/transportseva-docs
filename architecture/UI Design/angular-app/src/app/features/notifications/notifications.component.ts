import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout, timer } from 'rxjs';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../core/i18n';
import { CommunicationMockService } from '../../core/services/communication-mock.service';
import { AppNotification, NotificationCategory } from '../../core/models/communication.model';
import { NotificationNavigationService } from '../../core/services/notification-navigation.service';
import { Router } from '@angular/router';
import { ApiNotificationsService } from '../../core/api/api-notifications.service';
import { API_CONFIG } from '../../core/api/api-config';
import { LanguageService } from '../../core/i18n';
import { formatDateTime } from '../../core/utils/date-format';
import { notificationItem } from '../../core/utils/notification-item';
import { NOTIFICATION_COPY } from './notification-copy';

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
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  protected readonly comms = inject(CommunicationMockService);
  protected readonly navigation = inject(NotificationNavigationService);
  private readonly router = inject(Router);
  protected readonly categoryIcon = CATEGORY_ICON;
  protected readonly categoryKey = CATEGORY_KEY;
  protected readonly filter = signal<NotificationFilter>('all');
  private readonly api = inject(ApiNotificationsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => NOTIFICATION_COPY[this.language.lang()]);
  protected readonly backend = API_CONFIG.useBackend;
  protected readonly dateTime = formatDateTime;
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly stale = signal(false);
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly total = signal(0);
  protected readonly rows = signal<AppNotification[]>([]);
  private seenRevision = this.comms.revision();
  constructor() {
    this.load();
    effect(() => {
      const revision = this.comms.revision();
      if (revision !== this.seenRevision) { this.seenRevision = revision; untracked(() => this.load(this.page())); }
    });
    if (this.backend) timer(15_000,15_000).pipe(takeUntilDestroyed()).subscribe(() => { if (!this.error() && !this.comms.writing()) this.load(this.page(),true); });
  }
  protected load(page = 1, poll = false): void {
    if (!this.backend || this.loading() || this.comms.writing()) return;
    this.page.set(page); this.loading.set(true);
    if (!poll) { this.error.set(false); this.rows.set([]); }
    const token = localStorage.getItem('transportseva.access_token');
    this.api.page(page,this.filter() === 'unread').pipe(timeout(25_000),takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (token !== localStorage.getItem('transportseva.access_token')) { this.rows.set([]); this.error.set(true); return; }
        this.rows.set(result.rows.map(notificationItem)); this.lastPage.set(result.lastPage); this.total.set(result.total); this.stale.set(false); this.comms.synchronizeUnreadCount(result.unreadTotal);
      },
      error: () => { this.loading.set(false); if (poll) this.stale.set(true); else this.error.set(true); },
    });
  }

  protected readonly visibleNotifications = computed(() => {
    if (this.backend) return this.rows();
    const list = this.comms.notifications();
    return this.filter() === 'unread' ? list.filter((n) => !n.read) : list;
  });

  protected setFilter(filter: NotificationFilter): void {
    if (this.loading() || this.comms.writing()) return;
    this.filter.set(filter);
    this.load();
  }

  protected markRead(id: string): void {
    this.comms.markNotificationRead(id);
  }

  protected openNotification(notification: AppNotification): void {
    const destination = this.navigation.destination(notification);
    if (!destination) return;
    // Navigate first so a slow notification PATCH never delays the action
    // screen on the serial local PHP development server.
    void this.router.navigateByUrl(destination).then(() => setTimeout(() => this.comms.markNotificationRead(notification.id), 250));
  }

  protected markAllRead(): void {
    this.comms.markAllNotificationsRead();
  }
}
