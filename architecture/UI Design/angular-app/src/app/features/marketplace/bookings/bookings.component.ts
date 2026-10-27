import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MarketplaceMockService, BOOKING_TIMELINE_STAGES } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { BookingCommissionComponent, MarketplaceBooking, SettlementMilestone, VehicleAssignmentMode } from '../../../core/models/marketplace.model';
import { TranslatePipe } from '../../../core/i18n';
import { PaymentMockService } from '../../../core/services/payment-mock.service';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { DriverMockService } from '../../../core/services/driver-mock.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceBooking, ApiMarketplaceDriver, ApiMarketplaceService, ApiMarketplaceVehicle, DisputeDecision } from '../../../core/api/api-marketplace.service';
import { CashfreeCheckoutService } from '../../../core/api/cashfree-checkout.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDateTime } from '../../../core/utils/date-format';
import { switchMap, timeout, TimeoutError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** A provider vehicle shown in the booking-assignment selector. */
interface AssignmentVehicleOption {
  id: string;
  regNumber: string;
  vehicleType: string;
  /** Reuses the legacy labels so the mock and API paths share the same UI. */
  status: 'Idle' | 'Offline' | 'Inactive' | 'Reserved' | 'On Trip' | 'Maintenance';
}

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
  private readonly fleet = inject(FleetMockService);
  private readonly drivers = inject(DriverMockService);
  private readonly apiMarketplace = inject(ApiMarketplaceService);
  private readonly cashfreeCheckout = inject(CashfreeCheckoutService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);

  private readonly backendBookings = signal<ApiMarketplaceBooking[]>([]);
  /** API-backed fleet records belonging to the signed-in provider only. */
  private readonly backendVehicles = signal<ApiMarketplaceVehicle[]>([]);
  // Retained only for backwards-compatible in-memory bookings; API bookings
  // now persist their own milestones in the workflow payload.
  private readonly backendMidTripMilestones = signal<Record<string, SettlementMilestone[]>>({});
  protected readonly backendEnabled = API_CONFIG.useBackend;
  protected readonly loading = signal(API_CONFIG.useBackend);
  protected readonly loadError = signal('');
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const booking = params.get('booking');
      this.focusedBookingId.set(booking);
      if (booking) this.expandedId.set(booking);
    });
    this.reloadBackendBookings();
  }

  private reloadBackendBookings(): void {
    if (!API_CONFIG.useBackend) return;
    this.loading.set(true);
    this.loadError.set('');
    this.apiMarketplace.listMarketplaceBookings().pipe(timeout(30_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (bookings) => {
        this.backendBookings.set(bookings);
        this.loading.set(false);
      },
      error: (error) => {
        this.backendBookings.set([]);
        this.loading.set(false);
        this.loadError.set(error instanceof TimeoutError
          ? 'Loading bookings took too long. Please retry.'
          : apiErrorMessage(error, 'Bookings could not be loaded. Please retry.'));
      },
    });
  }
  protected retryBookings(): void {
    this.reloadBackendBookings();
  }

  /** Render the authoritative mutation response without refetching the list. */
  private applyBackendBooking(updatedBooking: ApiMarketplaceBooking): void {
    this.backendBookings.update((bookings) => bookings.map((booking) => booking.uuid === updatedBooking.uuid ? updatedBooking : booking));
  }

  private reloadBackendVehicles(): void {
    if (!API_CONFIG.useBackend) return;
    this.apiMarketplace.listMarketplaceVehicles().pipe(timeout(30_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (vehicles) => this.backendVehicles.set(vehicles),
      // The booking page still renders an explicit empty-state message in the
      // selector if the provider has not registered a vehicle yet.
      error: () => this.backendVehicles.set([]),
    });
  }
  protected readonly focusedBookingId = signal<string | null>(null);
  protected readonly bookings = computed<MarketplaceBooking[]>(() => {
    const list = API_CONFIG.useBackend
      ? this.backendBookings().map((booking) => this.mapBackendBooking(booking))
      : this.marketplace.bookings().map((booking) => this.formatBookingDates(booking));
    const focus = this.focusedBookingId();
    return focus ? list.sort((a, b) => Number(b.id === focus) - Number(a.id === focus)) : list;
  });
  protected readonly expandedId = signal<string | null>(null);
  protected readonly disputingBooking = signal<string | null>(null);
  protected readonly disputeReason = signal('');
  protected readonly cancellingBooking = signal<string | null>(null);
  protected readonly cancellationReason = signal('');
  protected readonly resolvingDispute = signal<string | null>(null);
  protected readonly disputeResolution = signal<DisputeDecision['resolution'] | ''>('');
  protected readonly ownerTokenDecision = signal<DisputeDecision['owner_token_decision'] | ''>('');
  protected readonly providerTokenDecision = signal<DisputeDecision['provider_token_decision'] | ''>('');
  protected readonly commissionDecision = signal<DisputeDecision['commission_decision'] | ''>('');
  protected readonly decisionSummary = signal('');
  protected readonly offlinePaymentFor = signal<MarketplaceBooking | null>(null);
  protected readonly offlineAmount = signal<number | null>(null);
  protected readonly offlineReference = signal('');
  protected readonly offlineAmountValid = computed(() => this.isValidAmount(this.offlineAmount()));
  protected readonly uploadingPodFor = signal<MarketplaceBooking | null>(null);
  protected readonly podNumber = signal('');
  protected readonly podReceivedBy = signal('');
  protected readonly podRemarks = signal('');
  protected readonly podFile = signal<File | null>(null);
  protected readonly reviewingPodFor = signal<MarketplaceBooking | null>(null);
  protected readonly podReviewDecision = signal<'approved' | 'rejected'>('approved');
  protected readonly podReviewNote = signal('');

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  protected disputeOutcomeKey(outcome: NonNullable<MarketplaceBooking['dispute']>['outcome']): string {
    switch (outcome) {
      case 'Refunded': return 'bookings.dispute.outcomeRefundRequested';
      case 'Forfeited': return 'bookings.dispute.outcomeForfeitureRequested';
      case 'Commission Waived': return 'bookings.dispute.outcomeWaiverRecorded';
      case 'Commission Due': return 'bookings.dispute.outcomeCommissionRecorded';
      case 'Continue': return 'bookings.dispute.outcomeContinue';
      case 'Cancel': return 'bookings.dispute.outcomeCancel';
      default: return 'bookings.dispute.outcome';
    }
  }

  protected dateTime(value: string | undefined): string {
    return formatDateTime(value);
  }

  protected mySide(booking: MarketplaceBooking): 'owner' | 'counterparty' | null {
    const role = this.session.role();
    if (role === 'admin') return null;
    if (booking.ownerRole === role) return 'owner';
    if (booking.counterpartyRole === role) return 'counterparty';
    return null;
  }

  protected toggle(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  /** Opens tracking in the current portal and limits it to this booking's assigned vehicle. */
  protected trackVehicle(booking: MarketplaceBooking): void {
    const vehicleRegNumber = (booking.vehicleAssignment?.vehicleRegNumber ?? booking.vehicleRegNumber).trim().toUpperCase();
    if (!vehicleRegNumber || vehicleRegNumber === '—') return;
    this.router.navigate([this.session.portal().basePath, 'tracking'], {
      queryParams: { vehicle: vehicleRegNumber, booking: booking.id },
    });
  }

  protected remainingFreightBalance(booking: MarketplaceBooking): string {
    return booking.settlementPlan.find((milestone) => milestone.label === 'Final Settlement')?.amount ?? '₹0';
  }

  protected freightNotRecordedReleased(booking: MarketplaceBooking): string {
    const released = this.releasedMilestones(booking).reduce((total, milestone) => total + this.amountNumber(milestone.amount), 0);
    return this.currency(Math.max(this.amountNumber(booking.amount) - released, 0));
  }

  protected finalSettlementPayable(booking: MarketplaceBooking): string {
    const freight = this.amountNumber(this.remainingFreightBalance(booking));
    const shipperFee = this.amountNumber(booking.settlement?.shipperCommission ?? '₹0');
    return this.currency(freight + shipperFee);
  }

  protected platformCommission(booking: MarketplaceBooking): string {
    const shipperFee = this.amountNumber(booking.settlement?.shipperCommission ?? '₹0');
    const providerFee = this.amountNumber(booking.settlement?.commissionDeducted ?? '₹0');
    return this.currency(shipperFee + providerFee);
  }

  protected releasedMilestones(booking: MarketplaceBooking) {
    return booking.settlementPlan.filter((milestone) => milestone.label !== 'Final Settlement' && milestone.status === 'Released');
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
  protected readonly activeWorkflowAction = signal<string | null>(null);
  protected readonly workflowActionError = signal<{ key: string; message: string } | null>(null);

  protected workflowActionKey(bookingId: string, action: string, detail = ''): string {
    return `${bookingId}:${action}:${detail}`;
  }

  protected isWorkflowActionPending(bookingId: string, action: string, detail = ''): boolean {
    return this.activeWorkflowAction() === this.workflowActionKey(bookingId, action, detail);
  }

  protected workflowActionErrorFor(bookingId: string, action: string, detail = ''): string {
    const key = this.workflowActionKey(bookingId, action, detail);
    return this.workflowActionError()?.key === key ? this.workflowActionError()?.message ?? '' : '';
  }

  private beginWorkflowAction(key: string): boolean {
    if (this.activeWorkflowAction()) return false;
    this.workflowActionError.set(null);
    this.activeWorkflowAction.set(key);
    return true;
  }

  private finishWorkflowAction(key: string): void {
    if (this.activeWorkflowAction() === key) this.activeWorkflowAction.set(null);
  }

  private failWorkflowAction(key: string, message: string): void {
    this.finishWorkflowAction(key);
    this.workflowActionError.set({ key, message });
  }

  private formatBookingDates(booking: MarketplaceBooking): MarketplaceBooking {
    return {
      ...booking,
      timeline: booking.timeline.map((event) => ({ ...event, timestamp: event.timestamp ? formatDateTime(event.timestamp) : undefined })),
      settlementPlan: booking.settlementPlan.map((milestone) => ({ ...milestone, ...(milestone.releasedAt ? { releasedAt: formatDateTime(milestone.releasedAt) } : {}) })),
      vehicleAssignment: booking.vehicleAssignment ? { ...booking.vehicleAssignment, assignedAt: formatDateTime(booking.vehicleAssignment.assignedAt) } : undefined,
      driverAssignment: booking.driverAssignment ? { ...booking.driverAssignment, assignedAt: formatDateTime(booking.driverAssignment.assignedAt) } : undefined,
      settlement: booking.settlement ? { ...booking.settlement, settledAt: formatDateTime(booking.settlement.settledAt) } : undefined,
    };
  }

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
  protected readonly registeredVehicles = computed<AssignmentVehicleOption[]>(() => {
    if (!API_CONFIG.useBackend) {
      return this.fleet.vehicles()
        .filter((vehicle) => vehicle.ownerRole === this.session.role())
        .map((vehicle) => ({
          id: vehicle.id,
          regNumber: vehicle.regNumber,
          vehicleType: vehicle.vehicleType,
          status: vehicle.status === 'Offline' ? 'Offline' : vehicle.status === 'On Trip' ? 'On Trip' : vehicle.status === 'Maintenance' ? 'Maintenance' : 'Idle',
        }));
    }
    return this.backendVehicles().map((vehicle) => ({
      id: vehicle.uuid,
      regNumber: vehicle.registration_number,
      vehicleType: vehicle.vehicle_type,
      status: vehicle.is_busy ? (vehicle.availability_status === 'on_trip' ? 'On Trip' : 'Reserved')
        : vehicle.status === 'available' ? 'Idle'
        : vehicle.status === 'inactive' ? 'Inactive'
          : vehicle.status === 'on_trip' ? 'On Trip' : 'Maintenance',
    }));
  });
  protected readonly assignableVehicles = computed(() => this.registeredVehicles().filter((vehicle) => vehicle.status === 'Idle' || vehicle.status === 'Offline'));

  protected canAssignSelectedVehicle(): boolean {
    return this.vehicleMode() === 'Subcontracted'
      || this.assignableVehicles().some((vehicle) => vehicle.regNumber === this.vehicleRegInput());
  }

  protected openAssignVehicle(booking: MarketplaceBooking): void {
    this.reloadBackendVehicles();
    this.assigningVehicleFor.set(booking.id);
    this.vehicleMode.set('Own Fleet');
    const currentVehicle = this.registeredVehicles().find((vehicle) => vehicle.regNumber === booking.vehicleRegNumber);
    this.vehicleRegInput.set(currentVehicle?.regNumber ?? this.assignableVehicles()[0]?.regNumber ?? '');
    this.subcontractedToInput.set('');
  }

  protected confirmAssignVehicle(): void {
    const bookingId = this.assigningVehicleFor();
    if (!bookingId || !this.vehicleRegInput()) return;
    if (this.vehicleMode() === 'Own Fleet' && !this.assignableVehicles().some((vehicle) => vehicle.regNumber === this.vehicleRegInput())) return;
    const actionKey = this.workflowActionKey(bookingId, 'assign-vehicle');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'assign_vehicle', {
        mode: this.vehicleMode(), vehicle_reg_number: this.vehicleRegInput(),
        subcontracted_to: this.vehicleMode() === 'Subcontracted' ? this.subcontractedToInput() || undefined : undefined,
      }).subscribe({
        next: (updatedBooking) => { this.applyBackendBooking(updatedBooking); this.finishWorkflowAction(actionKey); this.assigningVehicleFor.set(null); },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Vehicle could not be assigned. Please retry.')),
      });
      return;
    }
    setTimeout(() => {
      this.marketplace.assignVehicle(bookingId, {
        mode: this.vehicleMode(),
        vehicleRegNumber: this.vehicleRegInput(),
        subcontractedTo: this.vehicleMode() === 'Subcontracted' ? this.subcontractedToInput() || undefined : undefined,
      });
      this.finishWorkflowAction(actionKey);
      this.assigningVehicleFor.set(null);
    }, 450);
  }

  // Driver assignment
  protected readonly assigningDriverFor = signal<string | null>(null);
  protected readonly assigningDriver = signal(false);
  protected readonly driverAssignmentError = signal('');
  protected readonly loadingRegisteredDrivers = signal(false);
  protected readonly registeredDriversError = signal('');
  private readonly backendDrivers = signal<ApiMarketplaceDriver[]>([]);
  protected readonly registeredDrivers = computed(() => this.backendEnabled
    ? this.backendDrivers().map((driver) => ({ id: driver.uuid, name: driver.name, phone: driver.phone, status: driver.status !== 'available' ? 'Off Duty' : driver.is_busy ? 'Assigned' : 'Available', assignedVehicleRegNumber: driver.assigned_vehicle_reg_number || undefined }))
    : this.drivers.drivers().filter((driver) => driver.employerRole === this.session.role()));
  protected readonly assignableDrivers = computed(() => this.registeredDrivers().filter((driver) => driver.status === 'Available' && !driver.assignedVehicleRegNumber));
  protected readonly driverIdInput = signal('');
  protected readonly driverNameInput = signal('');
  protected readonly driverPhoneInput = signal('');

  protected openAssignDriver(booking: MarketplaceBooking): void {
    this.assigningDriverFor.set(booking.id);
    this.assigningDriver.set(false);
    this.driverAssignmentError.set('');
    if (this.backendEnabled) {
      this.driverIdInput.set('');
      this.driverNameInput.set('');
      this.driverPhoneInput.set('');
      this.reloadRegisteredDrivers();
      return;
    }
    const driver = this.assignableDrivers()[0];
    this.driverIdInput.set(driver?.id ?? '');
    this.driverNameInput.set(driver?.name ?? '');
    this.driverPhoneInput.set(driver?.phone ?? '');
  }

  protected reloadRegisteredDrivers(): void {
    this.loadingRegisteredDrivers.set(true);
    this.registeredDriversError.set('');
    this.apiMarketplace.listMarketplaceDrivers().subscribe({
      next: (drivers) => { this.backendDrivers.set(drivers); this.loadingRegisteredDrivers.set(false); },
      error: (error) => { this.backendDrivers.set([]); this.loadingRegisteredDrivers.set(false); this.registeredDriversError.set(apiErrorMessage(error, 'Drivers could not be loaded. Please retry.')); },
    });
  }

  protected selectDriver(driverId: string): void {
    const driver = this.registeredDrivers().find((item) => item.id === driverId);
    this.driverIdInput.set(driverId);
    this.driverNameInput.set(driver?.name ?? '');
    this.driverPhoneInput.set(driver?.phone ?? '');
  }

  protected canAssignSelectedDriver(): boolean {
    return this.assignableDrivers().some((driver) => driver.id === this.driverIdInput());
  }

  protected confirmAssignDriver(): void {
    const bookingId = this.assigningDriverFor();
    if (!bookingId || !this.canAssignSelectedDriver() || this.assigningDriver()) return;
    this.driverAssignmentError.set('');
    this.assigningDriver.set(true);
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'assign_driver', {
        driver_uuid: this.driverIdInput(),
      }).subscribe({
        next: (updatedBooking) => { this.applyBackendBooking(updatedBooking); this.assigningDriver.set(false); this.assigningDriverFor.set(null); },
        error: (error) => { this.assigningDriver.set(false); this.driverAssignmentError.set(apiErrorMessage(error, 'Driver could not be assigned. Please retry.')); },
      });
      return;
    }
    setTimeout(() => {
      this.marketplace.assignDriver(bookingId, { driverName: this.driverNameInput(), driverPhone: this.driverPhoneInput() || undefined });
      this.assigningDriver.set(false);
      this.assigningDriverFor.set(null);
    }, 450);
  }

  protected startTrip(bookingId: string): void {
    const actionKey = this.workflowActionKey(bookingId, 'start-trip');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'start_trip').subscribe({
        next: (updatedBooking) => { this.applyBackendBooking(updatedBooking); this.finishWorkflowAction(actionKey); },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Trip could not be started. Please retry.')),
      });
      return;
    }
    setTimeout(() => { this.marketplace.startTrip(bookingId); this.finishWorkflowAction(actionKey); }, 450);
  }

  protected readonly markingLoadingFor = signal<string | null>(null);
  protected readonly loadingCompletionErrorFor = signal<string | null>(null);

  protected isMarkingLoading(bookingId: string): boolean {
    return this.markingLoadingFor() === bookingId;
  }

  protected markLoadingCompleted(bookingId: string): void {
    if (!bookingId || this.isMarkingLoading(bookingId)) return;
    this.loadingCompletionErrorFor.set(null);
    this.markingLoadingFor.set(bookingId);
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'loading_completed').subscribe({
        next: (updatedBooking) => {
          this.applyBackendBooking(updatedBooking);
          this.markingLoadingFor.set(null);
        },
        error: (error) => {
          this.markingLoadingFor.set(null);
          this.loadingCompletionErrorFor.set(apiErrorMessage(error, 'Loading could not be marked complete. Please retry.'));
        },
      });
      return;
    }
    // Keep the prototype path visually consistent with the API path so the
    // user always gets feedback instead of a button that appears inert.
    setTimeout(() => {
      this.marketplace.markLoadingCompleted(bookingId);
      this.markingLoadingFor.set(null);
    }, 450);
  }

  /** The shipper verifies loading before the advance or departure can proceed. */
  protected confirmLoading(bookingId: string): void {
    const actionKey = this.workflowActionKey(bookingId, 'confirm-loading');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'confirm_loading').subscribe({
        next: (updatedBooking) => { this.applyBackendBooking(updatedBooking); this.finishWorkflowAction(actionKey); },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Loading confirmation could not be saved. Please retry.')),
      });
      return;
    }
    this.failWorkflowAction(actionKey, 'Loading confirmation requires the backend.');
  }

  protected releaseMilestone(bookingId: string, milestoneId: string): void {
    const actionKey = this.workflowActionKey(bookingId, 'release', milestoneId);
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      const milestone = this.bookings().find((booking) => booking.id === bookingId)?.settlementPlan.find((item) => item.id === milestoneId);
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'release_milestone', {
        label: milestone?.label ?? milestoneId,
        ...(milestone?.label === 'Mid-Trip Payment' ? { milestone_id: milestone.id } : {}),
      }).subscribe({
        next: (updatedBooking) => { this.applyBackendBooking(updatedBooking); this.finishWorkflowAction(actionKey); },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Payment could not be released. Please retry.')),
      });
      return;
    }
    setTimeout(() => { this.marketplace.releaseMilestone(bookingId, milestoneId); this.finishWorkflowAction(actionKey); }, 450);
  }

  protected completeTrip(bookingId: string): void {
    const actionKey = this.workflowActionKey(bookingId, 'complete-trip');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      // Settlement is intentionally a separate, POD-gated step. Completing the
      // trip must remain successful even though the final payment cannot yet be
      // prepared until the shipper has approved the submitted POD.
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'complete_trip').subscribe({
        next: (updatedBooking) => { this.applyBackendBooking(updatedBooking); this.finishWorkflowAction(actionKey); },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Trip could not be completed. Please retry.')),
      });
      return;
    }
    setTimeout(() => { this.marketplace.settleBooking(bookingId); this.finishWorkflowAction(actionKey); }, 450);
  }

  protected openPodUpload(booking: MarketplaceBooking): void {
    this.uploadingPodFor.set(booking);
    this.podNumber.set('');
    this.podReceivedBy.set('');
    this.podRemarks.set('');
    this.podFile.set(null);
  }

  protected downloadPod(booking: MarketplaceBooking): void {
    const actionKey = this.workflowActionKey(booking.id, 'download-pod');
    if (!this.beginWorkflowAction(actionKey)) return;
    this.apiMarketplace.downloadMarketplacePod(booking.id).subscribe({
      next: (file) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = booking.pod?.fileName || 'proof-of-delivery';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.finishWorkflowAction(actionKey);
      },
      error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'The POD document could not be downloaded. Please retry.')),
    });
  }

  protected onPodFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.podFile.set(input.files?.item(0) ?? null);
  }

  protected submitPod(): void {
    const booking = this.uploadingPodFor();
    const file = this.podFile();
    if (!booking || !file || !this.podNumber().trim() || !this.podReceivedBy().trim()) return;
    const actionKey = this.workflowActionKey(booking.id, 'upload-pod');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (!API_CONFIG.useBackend) {
      this.failWorkflowAction(actionKey, 'POD upload requires the backend.');
      return;
    }
    const payload = new FormData();
    payload.set('pod_number', this.podNumber().trim());
    payload.set('received_by_name', this.podReceivedBy().trim());
    if (this.podRemarks().trim()) payload.set('remarks', this.podRemarks().trim());
    payload.set('file', file);
    this.apiMarketplace.uploadMarketplacePod(booking.id, payload).subscribe({
      next: (updatedBooking) => { this.applyBackendBooking(updatedBooking); this.finishWorkflowAction(actionKey); this.uploadingPodFor.set(null); },
      error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'POD could not be submitted. Please retry.')),
    });
  }

  protected openPodReview(booking: MarketplaceBooking, decision: 'approved' | 'rejected'): void {
    this.reviewingPodFor.set(booking);
    this.podReviewDecision.set(decision);
    this.podReviewNote.set('');
  }

  protected submitPodReview(): void {
    const booking = this.reviewingPodFor();
    const decision = this.podReviewDecision();
    if (!booking || (decision === 'rejected' && !this.podReviewNote().trim())) return;
    const actionKey = this.workflowActionKey(booking.id, 'review-pod');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (!API_CONFIG.useBackend) {
      this.failWorkflowAction(actionKey, 'POD review requires the backend.');
      return;
    }
    this.apiMarketplace.reviewMarketplacePod(booking.id, decision, this.podReviewNote()).subscribe({
      next: (updatedBooking) => { this.applyBackendBooking(updatedBooking); this.finishWorkflowAction(actionKey); this.reviewingPodFor.set(null); },
      error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'POD review could not be saved. Please retry.')),
    });
  }

  /** A milestone can only be released once its trigger condition is actually met. Loading Advance needs "Loading Completed"+; everything else (Mid-Trip Payment) can be released any time it's pending. */
  protected canReleaseMilestone(booking: MarketplaceBooking, milestoneLabel: string): boolean {
    if (milestoneLabel === 'Final Settlement') return false; // released only via full settlement
    if (milestoneLabel === 'Loading Advance') {
      return !!booking.loadingConfirmedAt;
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
    const actionKey = this.workflowActionKey(bookingId, 'add-milestone');
    if (!this.beginWorkflowAction(actionKey)) return;
    const trigger = this.midTripTrigger().trim() || 'Manual release';
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(bookingId, 'add_mid_trip_milestone', { amount, trigger }).subscribe({
        next: (updatedBooking) => {
          this.applyBackendBooking(updatedBooking);
          this.finishWorkflowAction(actionKey);
          this.addingMilestoneFor.set(null);
        },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Mid-trip payment could not be added. Please retry.')),
      });
      return;
    }
    setTimeout(() => {
      this.marketplace.addMidTripMilestone(bookingId, { amount: String(amount), trigger });
      this.finishWorkflowAction(actionKey);
      this.addingMilestoneFor.set(null);
    }, 450);
  }

  private addBackendMidTripMilestone(bookingId: string, amount: number, trigger: string): void {
    const milestone: SettlementMilestone = {
      id: `${bookingId}-mid-${Date.now()}`,
      label: 'Mid-Trip Payment',
      trigger,
      amount: `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      status: 'Pending',
    };
    this.backendMidTripMilestones.update((entries) => ({
      ...entries,
      [bookingId]: [...(entries[bookingId] ?? []), milestone],
    }));
  }

  private withBackendMidTripMilestones(booking: MarketplaceBooking): MarketplaceBooking {
    const midTripMilestones = this.backendMidTripMilestones()[booking.id] ?? [];
    if (!midTripMilestones.length) return booking;
    const totalMidTrip = midTripMilestones.reduce((total, milestone) => total + this.amountNumber(milestone.amount), 0);
    const settlementPlan = booking.settlementPlan.flatMap((milestone) => milestone.label === 'Final Settlement'
      ? [...midTripMilestones, { ...milestone, amount: this.currency(Math.max(this.amountNumber(milestone.amount) - totalMidTrip, 0)) }]
      : [milestone]);
    return { ...booking, settlementPlan };
  }

  private amountNumber(amount: string): number {
    const value = Number(amount.replace(/[^0-9.]/g, ''));
    return Number.isFinite(value) ? value : 0;
  }

  private currency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }

  protected settle(bookingId: string): void {
    const actionKey = this.workflowActionKey(bookingId, 'settle');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      this.settlementError.set(false);
      this.apiMarketplace.createSettlement(bookingId).subscribe({
        next: () => { this.finishWorkflowAction(actionKey); this.reloadBackendBookings(); },
        error: (error) => { this.settlementError.set(true); this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Settlement could not be created. Please retry.')); },
      });
      return;
    }
    setTimeout(() => { this.marketplace.settleBooking(bookingId); this.finishWorkflowAction(actionKey); }, 450);
  }

  protected readonly settlementError = signal(false);

  protected rejectBooking(bookingId: string): void {
    const actionKey = this.workflowActionKey(bookingId, 'reject');
    if (!this.beginWorkflowAction(actionKey)) return;
    setTimeout(() => { this.marketplace.rejectBooking(bookingId); this.finishWorkflowAction(actionKey); }, 350);
  }

  protected cancelBooking(bookingId: string): void {
    const actionKey = this.workflowActionKey(bookingId, 'cancel');
    if (!this.beginWorkflowAction(actionKey)) return;
    setTimeout(() => { this.marketplace.cancelBooking(bookingId); this.finishWorkflowAction(actionKey); }, 350);
  }

  protected openDispute(bookingId: string): void {
    this.disputingBooking.set(bookingId);
    this.disputeReason.set('');
  }

  protected openCancellationRequest(bookingId: string): void {
    this.cancellingBooking.set(bookingId);
    this.cancellationReason.set('');
  }

  protected openDisputeDecision(bookingId: string): void {
    this.disputeResolution.set(''); this.ownerTokenDecision.set(''); this.providerTokenDecision.set('');
    this.commissionDecision.set(''); this.decisionSummary.set(''); this.resolvingDispute.set(bookingId);
  }

  protected resolveDispute(): void {
    const bookingId = this.resolvingDispute();
    const resolution = this.disputeResolution();
    const owner = this.ownerTokenDecision();
    const provider = this.providerTokenDecision();
    const commission = this.commissionDecision();
    if (!bookingId || !resolution || !owner || !provider || !commission || this.decisionSummary().trim().length < 3) return;
    const actionKey = this.workflowActionKey(bookingId, 'resolve-dispute');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.resolveBookingDispute(bookingId, { resolution, owner_token_decision: owner, provider_token_decision: provider, commission_decision: commission, summary: this.decisionSummary().trim() }).subscribe({
        next: () => { this.finishWorkflowAction(actionKey); this.resolvingDispute.set(null); this.reloadBackendBookings(); },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Dispute could not be resolved. Please retry.')),
      });
      return;
    }
    this.failWorkflowAction(actionKey, 'Dispute decisions require the backend.');
  }

  protected submitDispute(): void {
    const bookingId = this.disputingBooking();
    if (!bookingId || !this.disputeReason().trim()) return;
    const actionKey = this.workflowActionKey(bookingId, 'submit-dispute');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.raiseDispute(bookingId, this.disputeReason()).subscribe({
        next: () => {
          this.finishWorkflowAction(actionKey);
          this.disputingBooking.set(null);
          this.reloadBackendBookings();
        },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Dispute could not be submitted. Please retry.')),
      });
      return;
    }
    setTimeout(() => {
      this.marketplace.raiseDispute(bookingId, this.disputeReason(), this.session.user()?.name ?? 'Portal user');
      this.finishWorkflowAction(actionKey);
      this.disputingBooking.set(null);
    }, 350);
  }

  protected submitCancellationRequest(): void {
    const bookingId = this.cancellingBooking();
    const reason = this.cancellationReason().trim();
    if (!bookingId || reason.length < 10) return;
    const actionKey = this.workflowActionKey(bookingId, 'request-cancellation');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.requestMarketplaceCancellation(bookingId, reason).subscribe({
        next: () => {
          this.finishWorkflowAction(actionKey);
          this.cancellingBooking.set(null);
          this.reloadBackendBookings();
        },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Cancellation request could not be submitted. Please retry.')),
      });
      return;
    }
    this.failWorkflowAction(actionKey, 'Cancellation requests require the backend.');
  }

  protected openOfflinePayment(booking: MarketplaceBooking): void {
    this.offlinePaymentFor.set(booking);
    this.offlineAmount.set(Number(this.finalSettlementPayable(booking).replace(/[^0-9.]/g, '')) || null);
    this.offlineReference.set('');
  }

  protected recordOfflinePayment(): void {
    const booking = this.offlinePaymentFor();
    const amount = this.offlineAmount();
    if (!booking || !this.isValidAmount(amount)) return;
    const actionKey = this.workflowActionKey(booking.id, 'record-payment');
    if (!this.beginWorkflowAction(actionKey)) return;
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.updateMarketplaceWorkflow(booking.id, 'settle_final_payment', { amount, reference: this.offlineReference().trim() || undefined }).subscribe({
        next: (updatedBooking) => {
          this.applyBackendBooking(updatedBooking);
          this.finishWorkflowAction(actionKey);
          this.offlinePaymentFor.set(null);
        },
        error: (error) => this.failWorkflowAction(actionKey, apiErrorMessage(error, 'Final payment could not be settled. Please retry.')),
      });
      return;
    }
    setTimeout(() => {
      this.payments.recordOfflinePayment(booking.bookingId, String(amount), this.offlineReference());
      this.finishWorkflowAction(actionKey);
      this.offlinePaymentFor.set(null);
    }, 450);
  }

  private isValidAmount(amount: number | null): amount is number {
    return amount !== null && Number.isFinite(amount) && amount > 0 && Number.isInteger(amount * 100);
  }

  private mapBackendBooking(booking: ApiMarketplaceBooking): MarketplaceBooking {
    const owner = booking.viewer_side === 'owner';
    const workflow = booking.workflow ?? {};
    const disputeOutcomes: Record<string, NonNullable<MarketplaceBooking['dispute']>['outcome']> = {
      refunded: 'Refunded', forfeited: 'Forfeited', commission_waived: 'Commission Waived', commission_due: 'Commission Due', continue: 'Continue', cancel: 'Cancel',
    };
    const stage: MarketplaceBooking['status'] = booking.status === 'completed' && booking.settlement?.status === 'settled'
      ? 'Completed'
      : workflow.trip_completed_at || booking.status === 'completed'
        ? 'Settlement Pending'
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
    const loadingAdvance = Math.round(freight * 0.4 * 100) / 100;
    const releasedAt = workflow.released_milestones?.['Loading Advance'];
    const displayReleasedAt = releasedAt ? formatDateTime(releasedAt) : undefined;
    const midTripMilestones = (workflow.mid_trip_milestones ?? []).map((milestone) => ({
      id: milestone.id,
      label: 'Mid-Trip Payment',
      trigger: milestone.trigger,
      amount: `₹${Number(milestone.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      status: milestone.released_at ? 'Released' as const : 'Pending' as const,
      ...(milestone.released_at ? { releasedAt: milestone.released_at } : {}),
    }));
    const midTripTotal = (workflow.mid_trip_milestones ?? []).reduce((total, milestone) => total + Number(milestone.amount || 0), 0);
    const settlementPlan = [
      { id: `${booking.uuid}-loading`, label: 'Loading Advance', trigger: 'Released after the shipper confirms loading', amount: `₹${loadingAdvance.toLocaleString('en-IN')}`, status: releasedAt ? 'Released' as const : 'Pending' as const, ...(releasedAt ? { releasedAt } : {}) },
      ...midTripMilestones,
      { id: `${booking.uuid}-final`, label: 'Final Settlement', trigger: 'Released after POD is uploaded and approved', amount: `₹${Math.max(freight - loadingAdvance - midTripTotal, 0).toLocaleString('en-IN')}`, status: 'Pending' as const },
    ];
    const timelineIndex = BOOKING_TIMELINE_STAGES.indexOf(stage as typeof BOOKING_TIMELINE_STAGES[number]);
    const timelineTimestamps: Partial<Record<MarketplaceBooking['status'], string | undefined>> = {
      'Awaiting Deposit': booking.created_at,
      Confirmed: booking.created_at,
      'Vehicle Assigned': workflow.vehicle_assignment?.assigned_at,
      'Driver Assigned': workflow.driver_assignment?.assigned_at,
      'Loading Completed': workflow.loading_completed_at,
      'Trip Started': workflow.trip_started_at,
      'Settlement Pending': workflow.trip_completed_at,
      Completed: booking.settlement?.settled_at ?? workflow.trip_completed_at,
    };
    return {
      id: booking.uuid, bookingId: booking.booking_reference, loadId: booking.load_uuid, applicationId: booking.application_uuid,
      route: 'Marketplace booking', material: 'General Cargo', ownerRole: owner ? this.session.role() : 'shipper', ownerName: owner ? this.session.user().name : 'Shipper',
      counterpartyRole: owner ? 'transporter' : this.session.role(), counterpartyName: owner ? 'Transport provider' : this.session.user().name,
      vehicleRegNumber: workflow.vehicle_assignment?.vehicle_reg_number ?? '—', amount, status: stage,
      timeline: BOOKING_TIMELINE_STAGES.map((timelineStage, index) => ({ stage: timelineStage, completed: index <= timelineIndex, timestamp: index <= timelineIndex && timelineTimestamps[timelineStage] ? formatDateTime(timelineTimestamps[timelineStage]) : undefined })),
      ownerDeposit: { role: owner ? this.session.role() : 'shipper', partyName: owner ? this.session.user().name : 'Shipper', amount: '₹1,000', status: booking.owner_token_status === 'paid' ? 'Paid' : 'Pending' },
      counterpartyDeposit: { role: owner ? 'transporter' : this.session.role(), partyName: owner ? 'Transport provider' : this.session.user().name, amount: '₹1,000', status: booking.provider_token_status === 'paid' ? 'Paid' : 'Pending' },
      escrowStatus: booking.status === 'completed' ? 'Released' : booking.status === 'confirmed' || booking.status === 'in_transit' ? 'Locked' : 'Awaiting Deposits', settlementPlan,
      vehicleAssignment: workflow.vehicle_assignment ? { mode: workflow.vehicle_assignment.mode, vehicleRegNumber: workflow.vehicle_assignment.vehicle_reg_number, subcontractedTo: workflow.vehicle_assignment.subcontracted_to, assignedAt: formatDateTime(workflow.vehicle_assignment.assigned_at ?? booking.created_at ?? 'Just now') } : undefined,
      driverAssignment: workflow.driver_assignment ? { driverName: workflow.driver_assignment.driver_name, driverPhone: workflow.driver_assignment.driver_phone, assignedAt: formatDateTime(workflow.driver_assignment.assigned_at ?? booking.created_at ?? 'Just now') } : undefined,
      loadingConfirmedAt: workflow.loading_confirmed_at,
      pod: workflow.pod ? {
        status: workflow.pod.status === 'approved' ? 'Approved' : workflow.pod.status === 'rejected' ? 'Rejected' : 'Pending Approval',
        podNumber: workflow.pod.pod_number,
        receivedByName: workflow.pod.received_by_name,
        remarks: workflow.pod.remarks ?? undefined,
        fileName: workflow.pod.file_name,
        uploadedAt: workflow.pod.uploaded_at ? formatDateTime(workflow.pod.uploaded_at) : undefined,
        reviewNote: workflow.pod.review_note ?? workflow.pod.rejection_reason ?? undefined,
        reviewedAt: workflow.pod.reviewed_at ? formatDateTime(workflow.pod.reviewed_at) : undefined,
      } : undefined,
      dispute: booking.dispute ? {
        reference: booking.dispute.uuid,
        reason: booking.dispute.reason,
        raisedBy: 'Booking participant',
        status: booking.dispute.status === 'resolved' ? 'Resolved' : booking.dispute.status === 'under_review' ? 'Under Review' : 'Open',
        outcome: booking.dispute.resolution ? disputeOutcomes[booking.dispute.resolution] : undefined,
        decision: workflow.dispute_decisions?.[booking.dispute.uuid] ? {
          ownerToken: workflow.dispute_decisions[booking.dispute.uuid].owner_token_decision,
          providerToken: workflow.dispute_decisions[booking.dispute.uuid].provider_token_decision,
          commission: workflow.dispute_decisions[booking.dispute.uuid].commission_decision,
          summary: workflow.dispute_decisions[booking.dispute.uuid].summary,
        } : undefined,
        raisedAt: formatDateTime(booking.dispute.created_at),
      } : undefined,
      settlement: booking.settlement ? {
        status: booking.settlement.status,
        freightAmount: amount, grossFreightAmount: amount,
        commissionDeducted: `₹${Number(booking.provider_fee ?? 0).toLocaleString('en-IN')}`,
        shipperCommission: `₹${Number(booking.shipper_fee ?? 0).toLocaleString('en-IN')}`,
        shipperPayable: `₹${Number(booking.settlement.shipper_payable ?? 0).toLocaleString('en-IN')}`,
        totalCommission: `₹${Number((booking.settlement.shipper_fee ?? 0) + (booking.settlement.provider_fee ?? 0)).toLocaleString('en-IN')}`,
        payoutAmount: `₹${Number(booking.settlement.provider_payout ?? 0).toLocaleString('en-IN')}`,
        depositsReleased: true, settledAt: formatDateTime(booking.settlement.settled_at),
      } : undefined,
    };
  }
}
