import { Injectable, computed, signal } from '@angular/core';
import { AppNotification, SupportTicket, TicketMessage } from '../models/communication.model';

@Injectable({ providedIn: 'root' })
export class CommunicationMockService {
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
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);
  readonly recentNotifications = computed(() => this._notifications().slice(0, 5));

  markNotificationRead(id: string) {
    this._notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllNotificationsRead() {
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  private readonly _tickets = signal<SupportTicket[]>([
    {
      id: 't1',
      ticketNumber: 'TKT-2201',
      subject: 'GPS device not sending live location',
      category: 'GPS & Tracking',
      priority: 'High',
      status: 'In Progress',
      createdOn: '2024-06-16 11:00 AM',
      updatedOn: '2024-06-17 03:20 PM',
      messages: [
        { id: 'm1', author: 'You', authorType: 'You', message: 'The AIS-140 device on RJ14GA1234 stopped sending live location updates since yesterday.', timestamp: '2024-06-16 11:00 AM' },
        { id: 'm2', author: 'Priya Sharma', authorType: 'Support Agent', message: 'Thanks for reporting. We are checking connectivity with the OEM. Can you confirm the device is powered on?', timestamp: '2024-06-16 01:15 PM' },
        { id: 'm3', author: 'You', authorType: 'You', message: 'Yes, the device is powered on. Vehicle ignition is also on.', timestamp: '2024-06-17 09:00 AM' },
        { id: 'm4', author: 'Priya Sharma', authorType: 'Support Agent', message: 'We have escalated this to the OEM team. Expected resolution within 24 hours.', timestamp: '2024-06-17 03:20 PM' },
      ],
    },
    {
      id: 't2',
      ticketNumber: 'TKT-2198',
      subject: 'Unable to download GST invoice',
      category: 'Payments',
      priority: 'Medium',
      status: 'Resolved',
      createdOn: '2024-06-12 09:30 AM',
      updatedOn: '2024-06-13 10:00 AM',
      messages: [
        { id: 'm1', author: 'You', authorType: 'You', message: 'The download button for GST invoice INV-3021 is not working.', timestamp: '2024-06-12 09:30 AM' },
        { id: 'm2', author: 'Rahul Verma', authorType: 'Support Agent', message: 'This has been fixed. Please try again and let us know.', timestamp: '2024-06-13 10:00 AM' },
      ],
    },
    {
      id: 't3',
      ticketNumber: 'TKT-2190',
      subject: 'Request to add a new branch office',
      category: 'Account & Settings',
      priority: 'Low',
      status: 'Open',
      createdOn: '2024-06-15 05:45 PM',
      updatedOn: '2024-06-15 05:45 PM',
      messages: [
        { id: 'm1', author: 'You', authorType: 'You', message: 'We would like to add a new branch office in Surat. Please guide us on the process.', timestamp: '2024-06-15 05:45 PM' },
      ],
    },
    {
      id: 't4',
      ticketNumber: 'TKT-2175',
      subject: 'Driver unable to login to mobile app',
      category: 'Account & Settings',
      priority: 'Medium',
      status: 'Closed',
      createdOn: '2024-06-05 08:10 AM',
      updatedOn: '2024-06-06 12:00 PM',
      messages: [
        { id: 'm1', author: 'You', authorType: 'You', message: 'Driver Suresh Kumar cannot login using his registered mobile number.', timestamp: '2024-06-05 08:10 AM' },
        { id: 'm2', author: 'Anjali Nair', authorType: 'Support Agent', message: 'The number was linked to a duplicate account. We have merged the accounts, please ask the driver to try again.', timestamp: '2024-06-06 12:00 PM' },
        { id: 'm3', author: 'You', authorType: 'You', message: 'Confirmed, it is working now. Thank you!', timestamp: '2024-06-06 12:00 PM' },
      ],
    },
  ]);
  readonly tickets = this._tickets.asReadonly();
  readonly openTicketsCount = computed(() => this._tickets().filter((t) => t.status === 'Open' || t.status === 'In Progress').length);

  addTicketReply(ticketId: string, message: string) {
    const reply: TicketMessage = {
      id: 'm' + Math.random().toString(36).slice(2, 8),
      author: 'You',
      authorType: 'You',
      message,
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    this._tickets.update((list) =>
      list.map((t) => (t.id === ticketId ? { ...t, messages: [...t.messages, reply], updatedOn: reply.timestamp } : t))
    );
  }

  createTicket(subject: string, category: string, priority: 'Low' | 'Medium' | 'High', message: string) {
    const now = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const ticket: SupportTicket = {
      id: 't' + Math.random().toString(36).slice(2, 8),
      ticketNumber: 'TKT-' + Math.floor(2300 + Math.random() * 100),
      subject,
      category,
      priority,
      status: 'Open',
      createdOn: now,
      updatedOn: now,
      messages: [{ id: 'm1', author: 'You', authorType: 'You', message, timestamp: now }],
    };
    this._tickets.update((list) => [ticket, ...list]);
    return ticket;
  }
}
