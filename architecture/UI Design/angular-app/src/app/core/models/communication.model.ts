/**
 * TransportSeva Communication — Module 12 domain model. Covers
 * Notifications (system-wide alerts) and Support Tickets. Chat/
 * negotiation already exists per-load in Module 3 (Marketplace);
 * Voice Calls is a UI placeholder only (no real telephony backend).
 */
export type NotificationCategory = 'Booking' | 'Payment' | 'Trip' | 'Document' | 'System';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface TicketMessage {
  id: string;
  author: string;
  authorType: 'You' | 'Support Agent';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdOn: string;
  updatedOn: string;
  messages: TicketMessage[];
}
