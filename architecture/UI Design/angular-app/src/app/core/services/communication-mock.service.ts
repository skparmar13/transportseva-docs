import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, exhaustMap, Subject, takeUntil, timer } from 'rxjs';
import { AppNotification } from '../models/communication.model';
import { ApiNotification, ApiNotificationsService } from '../api/api-notifications.service';
import { API_CONFIG } from '../api/api-config';
import { formatDateTime } from '../utils/date-format';

@Injectable({ providedIn: 'root' })
export class CommunicationMockService {
  private readonly apiNotifications = inject(ApiNotificationsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationPollingRestarted = new Subject<void>();
  private liveUpdatesStarted = false;
  private notificationToken = '';
  private readonly _notifications = signal<AppNotification[]>([
    { id: 'n1', category: 'Booking', title: 'Booking Confirmed', message: 'Your booking for load LD-1042 (Jaipur → Ahmedabad) has been confirmed by the transporter.', timestamp: '2024-06-18 09:20 AM', read: false },
    { id: 'n2', category: 'Payment', title: 'Payment Received', message: 'Freight payment of ₹42,000 received for trip TRIP-3877.', timestamp: '2024-06-18 08:05 AM', read: false },
    { id: 'n3', category: 'Trip', title: 'Trip Started', message: 'Vehicle RJ14GA1234 has started the trip on route Jaipur → Ahmedabad.', timestamp: '2024-06-17 06:40 PM', read: false },
    { id: 'n4', category: 'Document', title: 'Document Expiring Soon', message: 'Insurance for vehicle RJ14GB5678 expires in 12 days. Please renew.', timestamp: '2024-06-17 11:15 AM', read: true },
    { id: 'n5', category: 'System', title: 'New Feature: GST Invoices', message: 'You can now download GST invoices directly from the Payments section.', timestamp: '2024-06-16 04:00 PM', read: true },
    { id: 'n6', category: 'Booking', title: 'New Application Received', message: 'A new application was received for your load LD-1039 (Delhi → Lucknow).', timestamp: '2024-06-16 10:30 AM', read: true },
    { id: 'n7', category: 'Trip', title: 'POD Uploaded', message: 'Proof of Delivery uploaded for trip TRIP-3877.', timestamp: '2024-06-15 07:50 PM', read: true },
    { id: 'n8', category: 'Payment', title: 'Payout Processed', message: 'Payout of ₹18,500 has been processed to your bank account.', timestamp: '2024-06-14 02:10 PM', read: true },
  ]);
  readonly notifications = computed(() => this._notifications().map((notification) => ({ ...notification, timestamp: formatDateTime(notification.timestamp) })));
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);
  readonly recentNotifications = computed(() => this.notifications().slice(0, 5));

  /** Keep the bell current while the user has the app open. */
  startLiveUpdates(): void {
    if (!API_CONFIG.useBackend) return;
    const token = localStorage.getItem('transportseva.access_token') ?? '';
    if (this.liveUpdatesStarted && this.notificationToken === token) return;
    if (this.liveUpdatesStarted) this.notificationPollingRestarted.next();
    this.liveUpdatesStarted = true;
    this.notificationToken = token;
    this._notifications.set([]);
    // A local PHP server handles requests serially.  Give the route that just
    // opened a short head start.  A new login replaces—not duplicates—the
    // previous account's polling stream, so its bell stays current without
    // blocking the screen's own request.
    timer(1_250, 15_000).pipe(
      takeUntil(this.notificationPollingRestarted),
      takeUntilDestroyed(this.destroyRef),
      exhaustMap(() => {
        const activeToken = localStorage.getItem('transportseva.access_token');
        return this.apiNotifications.list().pipe(
          catchError(() => EMPTY),
          exhaustMap((notifications) => activeToken && activeToken === localStorage.getItem('transportseva.access_token') ? [notifications] : EMPTY),
        );
      }),
    ).subscribe((notifications) => this._notifications.set(notifications.map((notification) => this.mapNotification(notification))));
  }

  clearNotifications(): void {
    this.notificationPollingRestarted.next();
    this.liveUpdatesStarted = false;
    this.notificationToken = '';
    this._notifications.set([]);
  }

  markNotificationRead(id: string, afterSave?: () => void) {
    this._notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (API_CONFIG.useBackend) this.apiNotifications.markRead(id).subscribe({ complete: () => afterSave?.(), error: () => afterSave?.() });
    else afterSave?.();
  }

  markAllNotificationsRead() {
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    if (API_CONFIG.useBackend) this.apiNotifications.markAllRead().subscribe({ error: () => undefined });
  }

  private mapNotification(notification: ApiNotification): AppNotification {
    const allowed: AppNotification['category'][] = ['Booking', 'Payment', 'Trip', 'Document', 'System'];
    const category = allowed.includes(notification.category as AppNotification['category'])
      ? notification.category as AppNotification['category']
      : 'System';
    return {
      id: notification.id,
      category,
      title: notification.title,
      message: notification.message,
      timestamp: notification.created_at ? formatDateTime(notification.created_at) : 'Just now',
      read: !!notification.read_at,
      data: notification.data,
      actionUrl: notification.action_url,
    };
  }

}
