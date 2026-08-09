import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MarketplaceMockService, BOOKING_TIMELINE_STAGES } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { MarketplaceBooking, VehicleAssignmentMode } from '../../../core/models/marketplace.model';

/**
 * Bookings — confirmed bookings with the full commercial lifecycle:
 * mutual Booking Security Deposit (escrow) → Vehicle Assignment →
 * Driver Assignment → Trip Started → Settlement (deposits released,
 * commission deducted, remaining freight paid out). Each booking
 * shows the side the current portal represents (owner vs.
 * counterparty) so only the relevant "Pay Deposit" action appears.
 */
@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings.component.html',
})
export class BookingsComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);

  protected readonly bookings = this.marketplace.bookings;
  protected readonly expandedId = signal<string | null>(null);

  protected mySide(booking: MarketplaceBooking): 'owner' | 'counterparty' | null {
    const role = this.session.role();
    if (booking.ownerRole === role) return 'owner';
    if (booking.counterpartyRole === role) return 'counterparty';
    return null;
  }

  protected toggle(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  // Deposit payment modal (simulated payment)
  protected readonly payingBooking = signal<{ id: string; side: 'owner' | 'counterparty'; amount: string } | null>(null);
  protected readonly payMethod = signal<'upi' | 'card'>('upi');
  protected readonly upiId = signal('');
  protected readonly cardNumber = signal('');
  protected readonly cardExpiry = signal('');
  protected readonly cardCvv = signal('');
  protected readonly processingPayment = signal(false);

  protected openPayDeposit(booking: MarketplaceBooking): void {
    const side = this.mySide(booking);
    if (!side) return;
    const amount = side === 'owner' ? booking.ownerDeposit.amount : booking.counterpartyDeposit.amount;
    this.payingBooking.set({ id: booking.id, side, amount });
    this.payMethod.set('upi');
    this.upiId.set('');
    this.cardNumber.set('');
    this.cardExpiry.set('');
    this.cardCvv.set('');
  }

  protected confirmPayDeposit(): void {
    const target = this.payingBooking();
    if (!target) return;
    this.processingPayment.set(true);
    setTimeout(() => {
      this.marketplace.payDeposit(target.id, target.side);
      this.processingPayment.set(false);
      this.payingBooking.set(null);
    }, 700);
  }

  // Vehicle assignment
  protected readonly assigningVehicleFor = signal<string | null>(null);
  protected readonly vehicleMode = signal<VehicleAssignmentMode>('Own Fleet');
  protected readonly vehicleRegInput = signal('');
  protected readonly subcontractedToInput = signal('');

  protected openAssignVehicle(booking: MarketplaceBooking): void {
    this.assigningVehicleFor.set(booking.id);
    this.vehicleMode.set('Own Fleet');
    this.vehicleRegInput.set(booking.vehicleRegNumber);
    this.subcontractedToInput.set('');
  }

  protected confirmAssignVehicle(): void {
    const bookingId = this.assigningVehicleFor();
    if (!bookingId || !this.vehicleRegInput()) return;
    this.marketplace.assignVehicle(bookingId, {
      mode: this.vehicleMode(),
      vehicleRegNumber: this.vehicleRegInput(),
      subcontractedTo: this.vehicleMode() === 'Subcontracted' ? this.subcontractedToInput() || undefined : undefined,
    });
    this.assigningVehicleFor.set(null);
  }

  // Driver assignment
  protected readonly assigningDriverFor = signal<string | null>(null);
  protected readonly driverNameInput = signal('');
  protected readonly driverPhoneInput = signal('');

  protected openAssignDriver(booking: MarketplaceBooking): void {
    this.assigningDriverFor.set(booking.id);
    this.driverNameInput.set('');
    this.driverPhoneInput.set('');
  }

  protected confirmAssignDriver(): void {
    const bookingId = this.assigningDriverFor();
    if (!bookingId || !this.driverNameInput()) return;
    this.marketplace.assignDriver(bookingId, { driverName: this.driverNameInput(), driverPhone: this.driverPhoneInput() || undefined });
    this.assigningDriverFor.set(null);
  }

  protected startTrip(bookingId: string): void {
    this.marketplace.startTrip(bookingId);
  }

  protected markLoadingCompleted(bookingId: string): void {
    this.marketplace.markLoadingCompleted(bookingId);
  }

  protected releaseMilestone(bookingId: string, milestoneId: string): void {
    this.marketplace.releaseMilestone(bookingId, milestoneId);
  }

  /** A milestone can only be released once its trigger condition is actually met. Loading Advance needs "Loading Completed"+; everything else (Mid-Trip Payment) can be released any time it's pending. */
  protected canReleaseMilestone(booking: MarketplaceBooking, milestoneLabel: string): boolean {
    if (milestoneLabel === 'Final Settlement') return false; // released only via full settlement
    if (milestoneLabel === 'Loading Advance') {
      const loadingIndex = BOOKING_TIMELINE_STAGES.indexOf('Loading Completed');
      const currentIndex = BOOKING_TIMELINE_STAGES.indexOf(booking.status);
      return currentIndex >= loadingIndex;
    }
    return true;
  }

  // Add Mid-Trip Payment milestone
  protected readonly addingMilestoneFor = signal<string | null>(null);
  protected readonly midTripAmount = signal('');
  protected readonly midTripTrigger = signal('');

  protected openAddMilestone(booking: MarketplaceBooking): void {
    this.addingMilestoneFor.set(booking.id);
    this.midTripAmount.set('');
    this.midTripTrigger.set('On reaching the midway checkpoint');
  }

  protected confirmAddMilestone(): void {
    const bookingId = this.addingMilestoneFor();
    if (!bookingId || !this.midTripAmount()) return;
    this.marketplace.addMidTripMilestone(bookingId, { amount: this.midTripAmount(), trigger: this.midTripTrigger() || 'Manual release' });
    this.addingMilestoneFor.set(null);
  }

  protected settle(bookingId: string): void {
    this.marketplace.settleBooking(bookingId);
  }
}
