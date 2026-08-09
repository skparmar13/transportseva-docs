import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CommunicationMockService } from '../../core/services/communication-mock.service';
import { TicketPriority, TicketStatus } from '../../core/models/communication.model';

const STATUS_CLASS: Record<TicketStatus, string> = {
  Open: 'status-pending',
  'In Progress': 'status-transit',
  Resolved: 'status-delivered',
  Closed: 'status-cancelled',
};

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  Low: 'status-pending',
  Medium: 'status-transit',
  High: 'status-cancelled',
};

/**
 * Support Tickets — Module 12. Ticket list with a detail thread view
 * (reply mock-only) plus a "New Ticket" creation modal. Voice Calls
 * is exposed here as a simple placeholder tab (no real telephony).
 */
@Component({
  selector: 'app-support',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support.component.html',
})
export class SupportComponent {
  protected readonly comms = inject(CommunicationMockService);

  protected readonly statusClass = STATUS_CLASS;
  protected readonly priorityClass = PRIORITY_CLASS;

  protected readonly view = signal<'tickets' | 'calls'>('tickets');
  protected setView(v: 'tickets' | 'calls'): void {
    this.view.set(v);
  }

  protected readonly selectedTicketId = signal<string | null>(null);
  protected readonly selectedTicket = computed(() =>
    this.comms.tickets().find((t) => t.id === this.selectedTicketId()) ?? null
  );

  protected openTicket(id: string): void {
    this.selectedTicketId.set(id);
  }

  protected closeTicket(): void {
    this.selectedTicketId.set(null);
  }

  protected readonly replyText = signal('');
  protected sendReply(): void {
    const ticket = this.selectedTicket();
    const text = this.replyText().trim();
    if (!ticket || !text) return;
    this.comms.addTicketReply(ticket.id, text);
    this.replyText.set('');
  }

  // New Ticket modal
  protected readonly showNewTicket = signal(false);
  protected readonly newSubject = signal('');
  protected readonly newCategory = signal('GPS & Tracking');
  protected readonly newPriority = signal<TicketPriority>('Medium');
  protected readonly newMessage = signal('');
  protected readonly savingTicket = signal(false);

  protected readonly ticketCategories = ['GPS & Tracking', 'Payments', 'Account & Settings', 'Fleet & Vehicles', 'Marketplace', 'Other'];

  protected openNewTicket(): void {
    this.showNewTicket.set(true);
  }

  protected closeNewTicket(): void {
    this.showNewTicket.set(false);
    this.newSubject.set('');
    this.newCategory.set('GPS & Tracking');
    this.newPriority.set('Medium');
    this.newMessage.set('');
  }

  protected submitNewTicket(): void {
    const subject = this.newSubject().trim();
    const message = this.newMessage().trim();
    if (!subject || !message) return;
    this.savingTicket.set(true);
    setTimeout(() => {
      const ticket = this.comms.createTicket(subject, this.newCategory(), this.newPriority(), message);
      this.savingTicket.set(false);
      this.closeNewTicket();
      this.selectedTicketId.set(ticket.id);
    }, 400);
  }
}
