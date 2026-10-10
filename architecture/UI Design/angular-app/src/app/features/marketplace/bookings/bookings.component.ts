import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MarketplaceMockService, BOOKING_TIMELINE_STAGES } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { BookingCommissionComponent, MarketplaceBooking, VehicleAssignmentMode } from '../../../core/models/marketplace.model';
import { TranslatePipe } from '../../../core/i18n';
import { PaymentMockService } from '../../../core/services/payment-mock.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { ApiMarketplaceBooking } from '../../../core/api/api-marketplace.service';
import { CashfreeCheckoutService } from '../../../core/api/cashfree-checkout.service';
import { switchMap } from 'rxjs';

/**
 * Bookings — confirmed bookings with the full commercial lifecycle:
 * provider-processed booking tokens → Vehicle Assignment → Driver
 * Assignment → Trip Started → Settlement (freight paid separately from
 * commission invoices). Each booking
 * shows the side the current portal represents (owner vs.
 * counterparty) so only the relevant "Pay Deposit" action appears.
 */
@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings.component.html',
})
export class BookingsComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  private readonly payments = inject(PaymentMockService);
  private readonly apiMarketplace = inject(ApiMarketplaceService);
  private readonly cashfreeCheckout = inject(CashfreeCheckoutService);
  protected readonly session = inject(SessionService);

  private readonly backendBookings = signal<ApiMarketplaceBooking[]>([]);
  constructor() {
    this.reloadBackendBookings();
  }

  private reloadBackendBookings(): void {
    if (!API_CONFIG.useBackend) return;
    this.apiMarketplace.listMarketplaceBookings().subscribe({
      next: (bookings) => this.backendBookings.set(bookings),
      error: () => this.backendBookings.set([]),
    });
  }
  protected readonly bookings = computed<MarketplaceBooking[]>(() => API_CONFIG.useBackend ? this.backendBookings().map((booking) => this.mapBackendBooking(booking)) : this.marketplace.bookings());
  protected readonly expandedId = signal<string | null>(null);
  protected readonly disputingBooking = signal<string | null>(null);
  protected readonly disputeReason = signal('');
  protected readonly offlinePaymentFor = signal<MarketplaceBooking | null>(null);
  protected readonly offlineAmount = signal<number | null>(null);
  protected readonly offlineReference = signal('');
  protected readonly offlineAmountValid = computed(() => this.isValidAmount(this.offlineAmount()));

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

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
  protected readonly paymentError = signal(false);
  protected readonly reviewedCommissionSides = signal<string[]>([]);
  protected readonly sumCommission = (total: number, fee: BookingCommissionComponent) => total + fee.totalPaise;

  protected visibleCommissionComponents(booking: MarketplaceBooking): BookingCommissionComponent[] {
    const components = booking.commissionSnapshot?.components ?? [];
    const role = this.session.role();
    if (role === 'admin') return components;
    if (role === 'transporter' && components.some((component) => component.billedToRole === 'transporter')) {
      return components.filter((component) => component.billedToRole === 'transporter');
    }
    const side = this.mySide(booking);
    return components.filter((component) => component.billedToRole === role && component.side === (side === 'owner' ? 'shipper' : 'provider'));
  }

  protected commissionDisclosureKey(booking: MarketplaceBooking): string {
    return `${booking.id}:${this.mySide(booking) ?? this.session.role()}`;
  }

  protected hasReviewedCommission(booking: MarketplaceBooking): boolean {
    return !booking.commissionSnapshot || this.reviewedCommissionSides().includes(this.commissionDisclosureKey(booking));
  }

  protected reviewCommission(booking: MarketplaceBooking, checked: boolean): void {
    const key = this.commissionDisclosureKey(booking);
    this.reviewedCommissionSides.update((keys) => checked ? [...new Set([...keys, key])] : keys.filter((item) => item !== key));
  }

  protected money(paise: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100);
  }

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
    this.paymentError.set(false);
  }

  protected confirmPayDeposit(): void {
    const target = this.payingBooking();
    if (!target) return;
    if (API_CONFIG.useBackend) {
      this.paymentError.set(false);
      this.processingPayment.set(true);
      this.apiMarketplace.createTokenOrder(target.id).pipe(
        switchMap((order) => this.apiMarketplace.createTokenCheckout(target.id, order.uuid)),
        switchMap((checkout) => API_CONFIG.paymentProvider === 'mock'
          ? this.apiMarketplace.verifyTokenPayment(target.id, checkout.order.uuid)
          : this.cashfreeCheckout.open(checkout.payment_session_id).pipe(
            switchMap(() => this.apiMarketplace.verifyTokenPayment(target.id, checkout.order.uuid)),
          )),
      ).subscribe({
        next: (result) => {
          this.processingPayment.set(false);
          const paid = result.order.status === 'paid';
          if (paid) {
            this.payingBooking.set(null);
            this.reloadBackendBookings();
          }
          else this.paymentError.set(true);
        },
        error: () => {
          this.processingPayment.set(false);
          this.paymentError.set(true);
        },
      });
      return;
    }
    const paymentInputValid = this.payMethod() === 'upi'
      ? /^[^\s@]+@[^\s@]+$/.test(this.upiId().trim())
      : /^\d[\d\s]{11,18}$/.test(this.cardNumber().trim()) && /^\d{2}\/\d{2}$/.test(this.cardExpiry().trim()) && /^\d{3,4}$/.test(this.cardCvv().trim());
    if (!paymentInputValid) {
      this.paymentError.set(true);
      return;
    }
    this.paymentError.set(false);
    this.processingPayment.set(true);
    setTimeout(() => {
      // Prototype failure simulation: use a UPI ID containing "fail" or a card
      // number beginning with 4000 to exercise the provider-error recovery path.
      const simulatedFailure = this.payMethod() === 'upi'
        ? this.upiId().toLowerCase().includes('fail')
        : this.cardNumber().replace(/\s/g, '').startsWith('4000');
      if (simulatedFailure) {
        this.processingPayment.set(false);
        this.paymentError.set(true);
        return;
      }
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
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'assign_vehicle', {
        mode: this.vehicleMode(), vehicle_reg_number: this.vehicleRegInput(),
        subcontracted_to: this.vehicleMode() === 'Subcontracted' ? this.subcontractedToInput() || undefined : undefined,
      }).subscribe({ next: () => { this.assigningVehicleFor.set(null); this.reloadBackendBookings(); } });
      return;
    }
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
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'assign_driver', {
        driver_name: this.driverNameInput(), driver_phone: this.driverPhoneInput() || undefined,
      }).subscribe({ next: () => { this.assigningDriverFor.set(null); this.reloadBackendBookings(); } });
      return;
    }
    this.marketplace.assignDriver(bookingId, { driverName: this.driverNameInput(), driverPhone: this.driverPhoneInput() || undefined });
    this.assigningDriverFor.set(null);
  }

  protected startTrip(bookingId: string): void {
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'start_trip').subscribe({ next: () => this.reloadBackendBookings() });
      return;
    }
    this.marketplace.startTrip(bookingId);
  }

  protected markLoadingCompleted(bookingId: string): void {
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'loading_completed').subscribe({ next: () => this.reloadBackendBookings() });
      return;
    }
    this.marketplace.markLoadingCompleted(bookingId);
  }

  protected releaseMilestone(bookingId: string, milestoneId: string): void {
    if (API_CONFIG.useBackend) {
      const milestone = this.bookings().find((booking) => booking.id === bookingId)?.settlementPlan.find((item) => item.id === milestoneId);
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'release_milestone', { label: milestone?.label ?? milestoneId }).subscribe({ next: () => this.reloadBackendBookings() });
      return;
    }
    this.marketplace.releaseMilestone(bookingId, milestoneId);
  }

  protected completeTrip(bookingId: string): void {
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'complete_trip').pipe(
        switchMap(() => this.apiMarketplace.createSettlement(bookingId)),
      ).subscribe({ next: () => this.reloadBackendBookings() });
      return;
    }
    this.marketplace.settleBooking(bookingId);
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
  protected readonly midTripAmount = signal<number | null>(null);
  protected readonly midTripTrigger = signal('');

  protected openAddMilestone(booking: MarketplaceBooking): void {
    this.addingMilestoneFor.set(booking.id);
    this.midTripAmount.set(null);
    this.midTripTrigger.set('On reaching the midway checkpoint');
  }

  protected confirmAddMilestone(): void {
    const bookingId = this.addingMilestoneFor();
    const amount = this.midTripAmount();
    if (!bookingId || !this.isValidAmount(amount)) return;
    this.marketplace.addMidTripMilestone(bookingId, { amount: String(amount), trigger: this.midTripTrigger() || 'Manual release' });
    this.addingMilestoneFor.set(null);
  }

  protected settle(bookingId: string): void {
    if (API_CONFIG.useBackend) {
      this.settlementError.set(false);
      this.apiMarketplace.createSettlement(bookingId).subscribe({
        next: () => this.reloadBackendBookings(),
        error: () => this.settlementError.set(true),
      });
      return;
    }
    this.marketplace.settleBooking(bookingId);
  }

  protected readonly settlementError = signal(false);

  protected rejectBooking(bookingId: string): void {
    this.marketplace.rejectBooking(bookingId);
  }

  protected cancelBooking(bookingId: string): void {
    this.marketplace.cancelBooking(bookingId);
  }

  protected openDispute(bookingId: string): void {
    this.disputingBooking.set(bookingId);
    this.disputeReason.set('');
  }

  protected resolveDispute(bookingId: string, chargeCommission: boolean): void {
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.resolveBookingDispute(bookingId, chargeCommission ? 'commission_due' : 'commission_waived').subscribe({
        next: () => this.reloadBackendBookings(),
      });
      return;
    }
    this.marketplace.resolveDispute(bookingId, chargeCommission);
  }

  protected submitDispute(): void {
    const bookingId = this.disputingBooking();
    if (!bookingId || !this.disputeReason().trim()) return;
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.raiseDispute(bookingId, this.disputeReason()).subscribe({
        next: () => {
          this.disputingBooking.set(null);
          this.reloadBackendBookings();
        },
      });
      return;
    }
    this.marketplace.raiseDispute(bookingId, this.disputeReason(), this.session.user()?.name ?? 'Portal user');
    this.disputingBooking.set(null);
  }

  protected openOfflinePayment(booking: MarketplaceBooking): void {
    this.offlinePaymentFor.set(booking);
    this.offlineAmount.set(booking.settlement?.payoutAmount ? Number(booking.settlement.payoutAmount.replace(/[^0-9.]/g, '')) : null);
    this.offlineReference.set('');
  }

  protected recordOfflinePayment(): void {
    const booking = this.offlinePaymentFor();
    const amount = this.offlineAmount();
    if (!booking || !this.isValidAmount(amount)) return;
    this.payments.recordOfflinePayment(booking.bookingId, String(amount), this.offlineReference());
    this.offlinePaymentFor.set(null);
  }

  private isValidAmount(amount: number | null): amount is number {
    return amount !== null && Number.isFinite(amount) && amount > 0 && Number.isInteger(amount * 100);
  }

  private mapBackendBooking(booking: ApiMarketplaceBooking): MarketplaceBooking {
    const owner = booking.viewer_side === 'owner';
    const workflow = booking.workflow ?? {};
    const stage: MarketplaceBooking['status'] = booking.status === 'completed'
      ? 'Completed'
      : booking.status === 'cancelled'
        ? 'Cancelled'
        : booking.status === 'in_transit'
          ? 'Trip Started'
          : workflow.loading_completed_at
            ? 'Loading Completed'
            : workflow.driver_assignment
              ? 'Driver Assigned'
              : workflow.vehicle_assignment
                ? 'Vehicle Assigned'
                : booking.status === 'confirmed' ? 'Confirmed' : 'Awaiting Deposit';
    const amount = `₹${Number(booking.gross_freight).toLocaleString('en-IN')}`;
    const freight = Number(booking.gross_freight) || 0;
    const loadingAdvance = Math.round(freight * 0.4);
    const releasedAt = workflow.released_milestones?.['Loading Advance'];
    const settlementPlan = [
      { id: `${booking.uuid}-loading`, label: 'Loading Advance', trigger: 'Released after loading is completed and confirmed by the shipper', amount: `₹${loadingAdvance.toLocaleString('en-IN')}`, status: releasedAt ? 'Released' as const : 'Pending' as const, ...(releasedAt ? { releasedAt } : {}) },
      { id: `${booking.uuid}-final`, label: 'Final Settlement', trigger: 'Released after POD is uploaded and approved', amount: `₹${Math.max(freight - loadingAdvance, 0).toLocaleString('en-IN')}`, status: 'Pending' as const },
    ];
    const timelineIndex = BOOKING_TIMELINE_STAGES.indexOf(stage as typeof BOOKING_TIMELINE_STAGES[number]);
    return {
      id: booking.uuid, bookingId: booking.booking_reference, loadId: booking.load_uuid, applicationId: booking.application_uuid,
      route: 'Marketplace booking', material: 'General Cargo', ownerRole: owner ? this.session.role() : 'shipper', ownerName: owner ? this.session.user().name : 'Shipper',
      counterpartyRole: owner ? 'transporter' : this.session.role(), counterpartyName: owner ? 'Transport provider' : this.session.user().name,
      vehicleRegNumber: workflow.vehicle_assignment?.vehicle_reg_number ?? '—', amount, status: stage,
      timeline: BOOKING_TIMELINE_STAGES.map((timelineStage, index) => ({ stage: timelineStage, completed: index <= timelineIndex, timestamp: index <= timelineIndex ? booking.created_at : undefined })),
      ownerDeposit: { role: owner ? this.session.role() : 'shipper', partyName: owner ? this.session.user().name : 'Shipper', amount: '₹1,000', status: booking.owner_token_status === 'paid' ? 'Paid' : 'Pending' },
      counterpartyDeposit: { role: owner ? 'transporter' : this.session.role(), partyName: owner ? 'Transport provider' : this.session.user().name, amount: '₹1,000', status: booking.provider_token_status === 'paid' ? 'Paid' : 'Pending' },
      escrowStatus: booking.status === 'completed' ? 'Released' : booking.status === 'confirmed' || booking.status === 'in_transit' ? 'Locked' : 'Awaiting Deposits', settlementPlan,
      vehicleAssignment: workflow.vehicle_assignment ? { mode: workflow.vehicle_assignment.mode, vehicleRegNumber: workflow.vehicle_assignment.vehicle_reg_number, subcontractedTo: workflow.vehicle_assignment.subcontracted_to, assignedAt: workflow.vehicle_assignment.assigned_at ?? booking.created_at ?? 'Just now' } : undefined,
      driverAssignment: workflow.driver_assignment ? { driverName: workflow.driver_assignment.driver_name, driverPhone: workflow.driver_assignment.driver_phone, assignedAt: workflow.driver_assignment.assigned_at ?? booking.created_at ?? 'Just now' } : undefined,
      settlement: booking.settlement ? {
        freightAmount: amount, grossFreightAmount: amount,
        commissionDeducted: `₹${Number(booking.provider_fee ?? 0).toLocaleString('en-IN')}`,
        shipperCommission: `₹${Number(booking.shipper_fee ?? 0).toLocaleString('en-IN')}`,
        shipperPayable: `₹${Number(booking.settlement.shipper_payable ?? 0).toLocaleString('en-IN')}`,
        totalCommission: `₹${Number((booking.settlement.shipper_fee ?? 0) + (booking.settlement.provider_fee ?? 0)).toLocaleString('en-IN')}`,
        payoutAmount: `₹${Number(booking.settlement.provider_payout ?? 0).toLocaleString('en-IN')}`,
        depositsReleased: true, settledAt: booking.settlement.settled_at,
      } : undefined,
    };
  }
}
