import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subject, Subscription, takeUntil, timeout, timer } from 'rxjs';
import { AppNotification } from '../models/communication.model';
import { ApiNotificationsService } from '../api/api-notifications.service';
import { API_CONFIG } from '../api/api-config';
import { formatDateTime } from '../utils/date-format';
import { notificationItem } from '../utils/notification-item';

@Injectable({ providedIn: 'root' })
export class CommunicationMockService {
  private readonly apiNotifications = inject(ApiNotificationsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly restarted = new Subject<void>();
  private request?: Subscription;
  private activeToken = '';
  private started = false;
  private generation = 0;
  private retryId = '';
  private readonly serverUnread = signal(0);
  readonly loading = signal(false);
  readonly loaded = signal(!API_CONFIG.useBackend);
  readonly loadFailed = signal(false);
  readonly readPending = signal('');
  readonly markingAll = signal(false);
  readonly writeError = signal<'read' | 'all' | null>(null);
  readonly revision = signal(0);
  readonly writing = computed(() => !!this.readPending() || this.markingAll());
  private readonly _notifications = signal<AppNotification[]>(API_CONFIG.useBackend ? [] : [
    { id: 'n1', category: 'Booking', title: 'Booking Confirmed', message: 'Your booking for load LD-1042 (Jaipur → Ahmedabad) has been confirmed by the transporter.', timestamp: '2024-06-18 09:20 AM', read: false },
    { id: 'n2', category: 'Payment', title: 'Payment Received', message: 'Freight payment of ₹42,000 received for trip TRIP-3877.', timestamp: '2024-06-18 08:05 AM', read: false },
    { id: 'n3', category: 'Trip', title: 'Trip Started', message: 'Vehicle RJ14GA1234 has started the trip on route Jaipur → Ahmedabad.', timestamp: '2024-06-17 06:40 PM', read: false },
    { id: 'n4', category: 'Document', title: 'Document Expiring Soon', message: 'Insurance for vehicle RJ14GB5678 expires in 12 days. Please renew.', timestamp: '2024-06-17 11:15 AM', read: true },
    { id: 'n5', category: 'System', title: 'New Feature: GST Invoices', message: 'You can now download GST invoices directly from the Payments section.', timestamp: '2024-06-16 04:00 PM', read: true },
    { id: 'n6', category: 'Booking', title: 'New Application Received', message: 'A new application was received for your load LD-1039 (Delhi → Lucknow).', timestamp: '2024-06-16 10:30 AM', read: true },
    { id: 'n7', category: 'Trip', title: 'POD Uploaded', message: 'Proof of Delivery uploaded for trip TRIP-3877.', timestamp: '2024-06-15 07:50 PM', read: true },
    { id: 'n8', category: 'Payment', title: 'Payout Processed', message: 'Payout of ₹18,500 has been processed to your bank account.', timestamp: '2024-06-14 02:10 PM', read: true },
  ]);
  readonly notifications = computed(() => this._notifications().map((n) => ({ ...n, timestamp: n.timestamp ? formatDateTime(n.timestamp) : '—' })));
  readonly unreadCount = computed(() => API_CONFIG.useBackend ? this.serverUnread() : this._notifications().filter((n) => !n.read).length);
  readonly recentNotifications = computed(() => this.notifications().slice(0,5));

  startLiveUpdates(): void {
    if (!API_CONFIG.useBackend) return;
    const token = localStorage.getItem('transportseva.access_token') || '';
    if (!token || (this.started && token === this.activeToken)) return;
    this.clearNotifications(); this.activeToken = token; this.started = true;
    timer(1_250,15_000).pipe(takeUntil(this.restarted),takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshNotifications());
  }
  refreshNotifications(force = false): void {
    if (!API_CONFIG.useBackend || this.writing() || (this.loading() && !force)) return;
    const token = localStorage.getItem('transportseva.access_token'); if (!token) return;
    this.request?.unsubscribe(); this.loading.set(true); const generation = this.generation;
    this.request = this.apiNotifications.page(1,false,5).pipe(timeout(25_000),takeUntil(this.restarted),takeUntilDestroyed(this.destroyRef),
      finalize(() => { if (generation === this.generation) this.loading.set(false); })).subscribe({
      next: (page) => {
        if (generation !== this.generation || token !== localStorage.getItem('transportseva.access_token')) return;
        this._notifications.set(page.rows.map(notificationItem)); this.serverUnread.set(page.unreadTotal); this.loadFailed.set(false); this.loaded.set(true);
      },
      error: () => { if (generation === this.generation) this.loadFailed.set(true); },
    });
  }
  clearNotifications(): void {
    this.generation++; this.restarted.next(); this.request?.unsubscribe(); this.started = false; this.activeToken = '';
    this._notifications.set([]); this.serverUnread.set(0); this.loading.set(false); this.loaded.set(!API_CONFIG.useBackend); this.loadFailed.set(false);
    this.readPending.set(''); this.markingAll.set(false); this.writeError.set(null); this.retryId = '';
  }
  markNotificationRead(id: string, afterSave?: () => void): void {
    if (this.writing()) return;
    if (!API_CONFIG.useBackend) { this._notifications.update((rows) => rows.map((n) => n.id === id ? {...n,read:true} : n)); afterSave?.(); return; }
    this.readPending.set(id); this.retryId = id; this.writeError.set(null); const generation = this.generation;
    this.apiNotifications.markRead(id).pipe(timeout(25_000),takeUntil(this.restarted),takeUntilDestroyed(this.destroyRef),
      finalize(() => { if (generation === this.generation) this.readPending.set(''); })).subscribe({
      next: () => {
        if (generation !== this.generation) return;
        this._notifications.update((rows) => rows.map((n) => n.id === id ? {...n,read:true} : n));
        this.readPending.set(''); this.revision.update((v) => v+1); this.refreshNotifications(true); afterSave?.();
      },
      error: () => { if (generation === this.generation) this.writeError.set('read'); },
    });
  }
  markAllNotificationsRead(afterSave?: () => void): void {
    if (this.writing()) return;
    if (!API_CONFIG.useBackend) { this._notifications.update((rows) => rows.map((n) => ({...n,read:true}))); afterSave?.(); return; }
    this.markingAll.set(true); this.writeError.set(null); const generation = this.generation;
    this.apiNotifications.markAllRead().pipe(timeout(25_000),takeUntil(this.restarted),takeUntilDestroyed(this.destroyRef),
      finalize(() => { if (generation === this.generation) this.markingAll.set(false); })).subscribe({
      next: () => {
        if (generation !== this.generation) return;
        this._notifications.update((rows) => rows.map((n) => ({...n,read:true}))); this.serverUnread.set(0);
        this.markingAll.set(false); this.revision.update((v) => v+1); this.refreshNotifications(true); afterSave?.();
      },
      error: () => { if (generation === this.generation) this.writeError.set('all'); },
    });
  }
  retryNotificationWrite(): void { if (this.writeError() === 'all') this.markAllNotificationsRead(); else if (this.retryId) this.markNotificationRead(this.retryId); }
  synchronizeUnreadCount(total: number): void { this.serverUnread.set(total); }
}
