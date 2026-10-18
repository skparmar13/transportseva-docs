import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { Load, LoadApplication, NegotiationMessage, NegotiationOffer, VehicleType } from '../../../core/models/marketplace.model';
import { TranslatePipe } from '../../../core/i18n';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiApplication, ApiChatMessage, ApiLoad, ApiMarketplaceBooking, ApiMarketplaceService, ApiMarketplaceVehicle, ApiOffer, ApiTokenOrder } from '../../../core/api/api-marketplace.service';
import { CashfreeCheckoutService } from '../../../core/api/cashfree-checkout.service';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { formatLoadReference } from '../../../core/utils/load-reference';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';
import { formatCurrencyAmount } from '../../../core/utils/currency-format';

interface ApplicationVehicle {
  id: string;
  regNumber: string;
  vehicleType: VehicleType;
  status: string;
}

/**
 * Load Details — role-aware single screen:
 *   - Load owner (Shipper / Transporter who posted it): sees the
 *     applications list with a structured negotiation thread
 *     (Accept / Counter-Offer / Reject), and the booking timeline
 *     once one application is accepted.
 *   - Applicant role (Transporter / Truck Owner not the owner): sees
 *     an "Apply for Load" form if not yet applied, or their own
 *     application + negotiation thread if already applied.
 * Freeform chat only unlocks once the application is Accepted (a
 * booking exists) — before that, only structured offers are
 * exchanged so there is a clean negotiation trail, per the revised
 * TransportSeva booking flow (Apply → Offer → Counter-Offer →
 * Accept → Booking → Chat Opens).
 */
@Component({
  selector: 'app-load-details',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './load-details.component.html',
})
export class LoadDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);
  private readonly fleet = inject(FleetMockService);
  private readonly router = inject(Router);
  private readonly apiMarketplace = inject(ApiMarketplaceService);
  private readonly cashfreeCheckout = inject(CashfreeCheckoutService);
  private readonly destroyRef = inject(DestroyRef);
  private chatPollInFlight = false;

  private readonly loadId = this.route.snapshot.paramMap.get('id') ?? '';
  private readonly backendLoad = signal<ApiLoad | undefined>(undefined);
  private readonly backendApplications = signal<ApiApplication[]>([]);
  private readonly backendOffers = signal<Record<string, ApiOffer[]>>({});
  private readonly backendOfferErrors = signal<Record<string, string>>({});
  private readonly backendBookings = signal<ApiMarketplaceBooking[]>([]);
  private readonly backendTokenOrders = signal<Record<string, ApiTokenOrder[]>>({});
  private readonly backendChatMessages = signal<Record<string, ApiChatMessage[]>>({});
  private readonly backendRegisteredVehicles = signal<ApiMarketplaceVehicle[]>([]);
  protected readonly loading = signal(API_CONFIG.useBackend);
  protected readonly applicationsLoading = signal(API_CONFIG.useBackend);
  protected readonly loadError = signal('');
  protected readonly applicationsError = signal('');
  protected readonly registeredVehiclesError = signal('');
  protected readonly applicationsOutOfSync = computed(() =>
    API_CONFIG.useBackend
      && this.isOwner()
      && !this.applicationsLoading()
      && !this.applicationsError()
      && this.applications().length === 0
      && Number(this.backendLoad()?.applications_count ?? 0) > 0,
  );
  protected readonly chatError = signal('');
  protected readonly chatLoading = signal(false);
  protected readonly chatSending = signal(false);
  constructor() {
    this.reloadBackendData();
    if (API_CONFIG.useBackend) {
      interval(4000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshActiveChat());
    }
  }

  private reloadBackendData(): void {
    if (!API_CONFIG.useBackend) return;
    this.loading.set(true);
    this.applicationsLoading.set(true);
    this.apiMarketplace.getLoad(this.loadId).subscribe({
      next: (load) => {
        this.backendLoad.set(load);
        this.loading.set(false);
        this.loadError.set('');
        // Only an applicant needs a selectable vehicle list. Avoid placing
        // needless provider-only work in front of a shipper's applications.
        if (!this.isOwner()) this.loadRegisteredVehicles();
        this.loadBackendApplications();
      },
      error: (error) => {
        this.backendLoad.set(undefined);
        this.loading.set(false);
        this.applicationsLoading.set(false);
        this.loadError.set(apiErrorMessage(error, 'We could not load this shipment.'));
      },
    });
  }

  /**
   * Request dependent data after the load is available instead of firing four
   * requests at once. This keeps the page responsive with the single-process
   * local PHP server and makes the actual failure state visible to the user.
   */
  private loadBackendApplications(): void {
    this.apiMarketplace.listApplications(this.loadId).subscribe({
      next: (applications) => {
        this.applicationsLoading.set(false);
        this.applicationsError.set('');
        this.backendApplications.set(applications);
        this.actionInFlightApplicationId.set(null);
        for (const application of applications) {
          this.apiMarketplace.listOffers(application.uuid).subscribe({
            next: (offers) => {
              this.backendOfferErrors.update((current) => {
                const next = { ...current };
                delete next[application.uuid];
                return next;
              });
              this.backendOffers.update((current) => ({ ...current, [application.uuid]: offers }));
            },
            error: (error) => this.backendOfferErrors.update((current) => ({
              ...current,
              [application.uuid]: apiErrorMessage(error, 'Offers could not be loaded. Please retry.'),
            })),
          });
        }
        this.loadBookingsForAcceptedApplications(applications);
      },
      error: (error) => {
        this.applicationsLoading.set(false);
        // Never convert an API failure into a misleading "No applications"
        // state. Preserve any previously loaded applications and show the
        // actual error in the section so offers/chats cannot silently vanish.
        this.applicationsError.set(apiErrorMessage(error, 'Applications could not be loaded. Please retry.'));
        this.actionInFlightApplicationId.set(null);
      },
    });
  }

  private loadBookingsForAcceptedApplications(applications: ApiApplication[]): void {
    if (!applications.some((application) => application.status === 'accepted')) {
      this.backendBookings.set([]);
      return;
    }
    this.apiMarketplace.listMarketplaceBookings().subscribe({
      next: (bookings) => {
        const loadBookings = bookings.filter((booking) => booking.load_uuid === this.loadId);
        this.backendBookings.set(loadBookings);
        // Token orders are scoped to the signed-in party. Fetch them with the
        // booking so the accepted application always exposes the next action
        // instead of forcing users to discover it from the Bookings screen.
        for (const booking of loadBookings) this.loadTokenOrders(booking.uuid);
      },
      error: () => this.backendBookings.set([]),
    });
  }

  private loadRegisteredVehicles(): void {
    if (!API_CONFIG.useBackend) return;
    this.apiMarketplace.listMarketplaceVehicles().subscribe({
      next: (vehicles) => {
        this.backendRegisteredVehicles.set(vehicles);
        this.registeredVehiclesError.set('');
      },
      error: (error) => this.registeredVehiclesError.set(apiErrorMessage(error, 'Your registered vehicles could not be loaded.')),
    });
  }
  protected retryLoadData(): void {
    if (!API_CONFIG.useBackend) return;
    this.applicationsLoading.set(true);
    this.applicationsError.set('');
    this.reloadBackendData();
  }

  private loadTokenOrders(bookingUuid: string): void {
    if (!API_CONFIG.useBackend) return;
    this.apiMarketplace.listTokenOrders(bookingUuid).subscribe({
      next: (orders) => this.backendTokenOrders.update((current) => ({ ...current, [bookingUuid]: orders })),
      // A token order is created lazily when the user starts payment. An
      // empty response is therefore expected for a newly accepted booking;
      // only transport/API errors need to be surfaced at payment time.
      error: () => this.backendTokenOrders.update((current) => ({ ...current, [bookingUuid]: current[bookingUuid] ?? [] })),
    });
  }
  protected readonly load = computed<Load | undefined>(() => API_CONFIG.useBackend ? this.mapLoad(this.backendLoad()) : this.formatLoad(this.marketplace.getLoadById(this.loadId)()));
  protected readonly applications = computed<LoadApplication[]>(() => API_CONFIG.useBackend ? this.backendApplications().map((app) => this.mapApplication(app)) : this.marketplace.getApplicationsForLoad(this.loadId)().map((app) => this.formatApplication(app)));
  /** A load application must be tied to a vehicle registered by this signed-in provider. */
  protected readonly registeredVehicles = computed<ApplicationVehicle[]>(() => {
    if (API_CONFIG.useBackend) {
      return this.backendRegisteredVehicles()
        .map((vehicle) => ({
          id: vehicle.uuid,
          regNumber: vehicle.registration_number,
          vehicleType: vehicle.vehicle_type as VehicleType,
          status: vehicle.status.replace(/_/g, ' '),
        }))
        .sort((left, right) => left.regNumber.localeCompare(right.regNumber));
    }
    return this.fleet.getVehiclesByOwner(this.session.role())()
      .map((vehicle) => ({ id: vehicle.id, regNumber: vehicle.regNumber, vehicleType: vehicle.vehicleType, status: vehicle.status }))
      .sort((left, right) => left.regNumber.localeCompare(right.regNumber));
  });

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  protected dateTime(value: string | undefined): string {
    return formatDateTime(value);
  }

  protected displayStatus(load: Load): Load['status'] | 'Applied' {
    if (this.isOwner()) return load.status;
    if (this.myApplication()) return 'Applied';
    return load.status === 'Applications Received' ? 'Open' : load.status;
  }

  protected readonly isOwner = computed(() => this.load()?.postedBy === this.session.role());
  protected readonly myApplication = computed(() =>
    this.applications().find((app) => app.applicantRole === this.session.role()),
  );
  protected readonly booking = computed(() =>
    this.marketplace.bookings().find((b) => b.loadId === this.loadId),
  );

  /** Backend booking created when an offer is accepted, matched to its application. */
  protected backendBookingForApplication(applicationId: string): ApiMarketplaceBooking | undefined {
    return this.backendBookings().find((booking) => booking.application_uuid === applicationId);
  }

  protected tokenOrderForApplication(applicationId: string): ApiTokenOrder | undefined {
    const booking = this.backendBookingForApplication(applicationId);
    if (!booking) return undefined;
    const orders = this.backendTokenOrders()[booking.uuid] ?? [];
    return orders[0];
  }

  protected tokenPaymentState(applicationId: string): 'due' | 'paid' | 'waiting' | 'unavailable' {
    const booking = this.backendBookingForApplication(applicationId);
    if (!booking) return 'unavailable';
    const order = this.tokenOrderForApplication(applicationId);
    if (order?.status === 'paid' || booking.status === 'confirmed') return 'paid';
    if (['awaiting_tokens', 'awaiting_deposit', 'Awaiting Deposit'].includes(String(booking.status))) return 'due';
    return 'waiting';
  }

  protected tokenAmountForApplication(applicationId: string): string {
    const order = this.tokenOrderForApplication(applicationId);
    return formatCurrencyAmount(order?.amount ?? 1000);
  }

  protected readonly tokenSubmittingApplicationId = signal<string | null>(null);
  protected readonly tokenErrors = signal<Record<string, string>>({});
  protected readonly tokenNotices = signal<Record<string, string>>({});

  protected tokenErrorFor(applicationId: string): string {
    return this.tokenErrors()[applicationId] ?? '';
  }

  protected tokenNoticeFor(applicationId: string): string {
    return this.tokenNotices()[applicationId] ?? '';
  }

  /** Route the accepted party to the booking workflow for its portal. */
  protected bookingWorkflowPath(): string[] {
    const basePath = this.session.portal().basePath;
    return [basePath, this.session.role() === 'transporter' ? 'requests' : 'bookings'];
  }

  protected payBookingToken(applicationId: string): void {
    const booking = this.backendBookingForApplication(applicationId);
    if (!booking || this.tokenSubmittingApplicationId() === applicationId) return;
    if (this.tokenPaymentState(applicationId) !== 'due') return;

    this.tokenErrors.update((current) => ({ ...current, [applicationId]: '' }));
    this.tokenNotices.update((current) => ({ ...current, [applicationId]: '' }));
    this.tokenSubmittingApplicationId.set(applicationId);
    const existingOrder = this.tokenOrderForApplication(applicationId);
    const orderRequest = existingOrder ? of(existingOrder) : this.apiMarketplace.createTokenOrder(booking.uuid);
    orderRequest.pipe(
      switchMap((order) => this.apiMarketplace.createTokenCheckout(booking.uuid, order.uuid)),
      switchMap((checkout) => API_CONFIG.paymentProvider === 'mock'
        ? this.apiMarketplace.verifyTokenPayment(booking.uuid, checkout.order.uuid)
        : this.cashfreeCheckout.open(checkout.payment_session_id).pipe(
          switchMap(() => this.apiMarketplace.verifyTokenPayment(booking.uuid, checkout.order.uuid)),
        )),
    ).subscribe({
      next: (result) => {
        this.backendTokenOrders.update((current) => ({ ...current, [booking.uuid]: [result.order] }));
        this.tokenSubmittingApplicationId.set(null);
        if (result.order.status === 'paid') {
          this.tokenNotices.update((current) => ({ ...current, [applicationId]: `Booking token paid successfully (${formatCurrencyAmount(result.order.amount)}).` }));
          this.reloadBackendData();
        } else {
          this.tokenErrors.update((current) => ({ ...current, [applicationId]: 'Payment was not completed. You can safely retry the booking token.' }));
        }
      },
      error: (error) => {
        this.tokenSubmittingApplicationId.set(null);
        this.tokenErrors.update((current) => ({ ...current, [applicationId]: apiErrorMessage(error, 'We could not start the token payment. Please retry.' ) }));
      },
    });
  }

  // Apply form state
  protected readonly showApplyModal = signal(false);
  protected readonly vehicleRegNumber = signal('');
  protected readonly vehicleType = signal<VehicleType>('Open Body Truck');
  protected readonly availability = signal('');
  protected readonly quotedAmount = signal<number | null>(null);
  protected readonly applying = signal(false);

  // Negotiation (offer/counter-offer) state — keyed by applicationId being negotiated
  protected readonly negotiatingApplicationId = signal<string | null>(null);
  protected readonly counterAmount = signal<number | null>(null);
  protected readonly counterSubmitting = signal(false);
  protected readonly counterError = signal('');
  protected readonly counterNotice = signal('');

  // Chat state (unlocked only after the application is Accepted)
  protected readonly chatText = signal('');
  protected readonly activeChatApplicationId = signal<string | null>(null);
  protected readonly activeChatMessages = computed(() => {
    const id = this.activeChatApplicationId();
    if (!id) return [];
    if (API_CONFIG.useBackend) {
      return (this.backendChatMessages()[id] ?? []).map((message) => this.mapChatMessage(message));
    }
    return this.marketplace.getMessagesForApplication(id)().map((message) => ({ ...message, timestamp: formatDateTime(message.timestamp) }));
  });

  // Accept/reject confirm dialog
  protected readonly confirmAction = signal<{ type: 'accept' | 'acceptOffer' | 'reject'; applicationId: string; applicantName: string; amount?: string } | null>(null);
  protected readonly confirmSubmitting = signal(false);
  /** Prevents a second offer while an accept/reject request is completing. */
  protected readonly actionInFlightApplicationId = signal<string | null>(null);
  protected readonly actionError = signal('');

  protected openApply(): void {
    const selected = this.registeredVehicles().find((vehicle) => vehicle.regNumber === this.vehicleRegNumber())
      ?? this.registeredVehicles()[0];
    this.vehicleRegNumber.set(selected?.regNumber ?? '');
    if (selected) this.vehicleType.set(selected.vehicleType);
    this.showApplyModal.set(true);
  }

  /** Keeps registration and type inseparable: the registered vehicle is the source of truth. */
  protected selectApplicationVehicle(registrationNumber: string): void {
    const vehicle = this.registeredVehicles().find((item) => item.regNumber === registrationNumber);
    this.vehicleRegNumber.set(vehicle?.regNumber ?? '');
    if (vehicle) this.vehicleType.set(vehicle.vehicleType);
  }

  protected submitApplication(): void {
    const load = this.load();
    const amount = this.quotedAmount();
    const selectedVehicle = this.registeredVehicles().find((vehicle) => vehicle.regNumber === this.vehicleRegNumber());
    if (!load || !selectedVehicle || !this.availability().trim() || amount === null || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount * 100)) return;
    const selectedVehicleType = selectedVehicle.vehicleType as VehicleType;
    this.applying.set(true);
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.createApplication(this.loadId, {
        applicant_role: this.session.role() === 'transporter' ? 'transporter' : 'truck-owner',
        applicant_name: this.session.user().company ?? this.session.user().name,
        vehicle_reg_number: selectedVehicle.regNumber,
        vehicle_type: selectedVehicleType,
        availability: this.availability().trim(),
        quoted_amount: amount,
      }).subscribe({
        next: (application) => {
          // Keep the applicant view responsive even when the local PHP server
          // is processing other requests. The API has already confirmed the
          // application (201), so there is no need to leave the user behind a
          // second, queued reload just to show their own submission.
          this.backendApplications.update((applications) => [...applications, application]);
          this.backendLoad.update((current) => current
            ? { ...current, applications_count: Number(current.applications_count ?? 0) + 1, viewer_application_status: application.status }
            : current);
          this.applicationsLoading.set(false);
          this.applicationsError.set('');
          this.applying.set(false);
          this.showApplyModal.set(false);
        },
        error: () => this.applying.set(false),
      });
      return;
    }
    setTimeout(() => {
      this.marketplace.applyForLoad({
        loadId: this.loadId,
        applicantRole: this.session.role(),
        applicantName: this.session.user().company ?? this.session.user().name,
        vehicleRegNumber: selectedVehicle.regNumber,
        vehicleType: selectedVehicleType,
        availability: this.availability(),
        quotedAmount: String(amount),
      });
      this.applying.set(false);
      this.showApplyModal.set(false);
    }, 500);
  }

  protected openNegotiation(applicationId: string): void {
    const application = this.applications().find((item) => item.id === applicationId);
    if (!application || !this.canNegotiate(application)) return;
    const current = this.negotiatingApplicationId();
    this.negotiatingApplicationId.set(current === applicationId ? null : applicationId);
    const offers = this.offersFor(applicationId);
    const latest = offers[offers.length - 1];
    this.counterAmount.set(latest?.amount ? Number(latest.amount.replace(/[^0-9.]/g, '')) : null);
    this.counterError.set('');
    this.counterNotice.set('');
  }

  protected sendCounterOffer(applicationId: string): void {
    const application = this.applications().find((item) => item.id === applicationId);
    if (!application || !this.canNegotiate(application)) return;
    const amount = this.counterAmount();
    this.counterError.set('');
    this.counterNotice.set('');
    if (amount === null || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount * 100)) {
      this.counterError.set('Enter a valid positive amount with up to two decimal places.');
      return;
    }
    if (this.counterSubmitting()) return;
    this.counterSubmitting.set(true);
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.createOffer(applicationId, {
        by_role: this.isOwner() ? 'owner' : 'applicant',
        by_name: this.session.user().company ?? this.session.user().name,
        amount,
      }).subscribe({
        next: () => {
          this.counterSubmitting.set(false);
          this.counterNotice.set('Counter-offer sent successfully.');
          this.reloadBackendData();
        },
        error: (error) => {
          this.counterSubmitting.set(false);
          this.counterError.set(apiErrorMessage(error, 'We could not send the counter-offer. Please try again.'));
        },
      });
      return;
    }
    this.marketplace.sendCounterOffer({
      applicationId,
      loadId: this.loadId,
      by: this.isOwner() ? 'owner' : 'applicant',
      byName: this.session.user().company ?? this.session.user().name,
      amount: String(amount),
    });
    // Keep the pending state visible long enough for the user to understand that
    // the offer was submitted, even when using the in-memory demo service.
    setTimeout(() => {
      this.counterSubmitting.set(false);
      this.counterNotice.set('Counter-offer sent successfully.');
    }, 350);
  }

  protected openChat(applicationId: string): void {
    const closing = this.activeChatApplicationId() === applicationId;
    this.activeChatApplicationId.set(closing ? null : applicationId);
    this.chatError.set('');
    if (closing || !API_CONFIG.useBackend) return;
    this.loadChatMessages(applicationId);
  }

  protected sendChat(applicationId: string): void {
    const text = this.chatText().trim();
    if (!text) return;
    if (API_CONFIG.useBackend) {
      const booking = this.backendBookings().find((item) => item.application_uuid === applicationId);
      if (!booking) {
        this.chatError.set('Chat is unavailable until the accepted booking is ready. Please retry shortly.');
        return;
      }
      if (this.chatSending()) return;
      this.chatSending.set(true);
      this.chatError.set('');
      this.apiMarketplace.sendChatMessage(booking.uuid, text).subscribe({
        next: (message) => {
          this.backendChatMessages.update((current) => ({
            ...current,
            [applicationId]: [...(current[applicationId] ?? []), message],
          }));
          this.chatSending.set(false);
          this.chatText.set('');
        },
        error: (error) => {
          this.chatSending.set(false);
          this.chatError.set(apiErrorMessage(error, 'We could not send your message. Please retry.'));
        },
      });
      return;
    }
    this.marketplace.sendMessage({
      loadId: this.loadId,
      applicationId,
      sender: this.isOwner() ? 'owner' : 'applicant',
      senderName: this.session.user().company ?? this.session.user().name,
      text,
    });
    this.chatText.set('');
  }

  protected askAccept(applicationId: string, applicantName: string): void {
    this.actionError.set('');
    const application = this.applications().find((item) => item.id === applicationId);
    if (!application || !this.canAcceptLatestOffer(application)) return;
    this.confirmAction.set({ type: 'accept', applicationId, applicantName, amount: this.latestOfferAmount(application) });
  }

  /** Applicant-side acceptance of the owner's latest counter-offer. */
  protected askAcceptOffer(applicationId: string): void {
    const application = this.applications().find((item) => item.id === applicationId);
    const latest = this.latestOfferFor(applicationId);
    if (!application || !this.canAcceptLatestOffer(application) || !latest || latest.by !== 'owner') return;
    this.actionError.set('');
    this.confirmAction.set({ type: 'acceptOffer', applicationId, applicantName: latest.byName, amount: latest.amount });
  }

  protected askReject(applicationId: string, applicantName: string): void {
    const application = this.applications().find((item) => item.id === applicationId);
    if (!application || !this.canNegotiate(application)) return;
    this.actionError.set('');
    this.confirmAction.set({ type: 'reject', applicationId, applicantName });
  }

  protected confirmActionRun(): void {
    const action = this.confirmAction();
    if (!action || this.confirmSubmitting()) return;
    const application = this.applications().find((item) => item.id === action.applicationId);
    if (!application || (action.type !== 'reject' && !this.canAcceptLatestOffer(application)) || (action.type === 'reject' && !this.canNegotiate(application))) {
      this.actionError.set('This offer is no longer available. Refresh the page to see the latest negotiation status.');
      return;
    }
    this.actionError.set('');
    this.confirmSubmitting.set(true);
    this.actionInFlightApplicationId.set(action.applicationId);
    const accepting = action.type === 'accept' || action.type === 'acceptOffer';
    if (API_CONFIG.useBackend) {
      const request = accepting
        ? this.apiMarketplace.acceptApplication(this.loadId, action.applicationId)
        : this.apiMarketplace.rejectApplication(this.loadId, action.applicationId);
      request.subscribe({
        next: () => {
          if (accepting) {
            this.apiMarketplace.createMarketplaceBooking(this.loadId, action.applicationId).subscribe({
              next: () => { this.confirmSubmitting.set(false); this.confirmAction.set(null); this.reloadBackendData(); },
              error: (error) => { this.confirmSubmitting.set(false); this.actionError.set(apiErrorMessage(error, 'The offer was accepted, but we could not create the booking. Please retry.')); this.reloadBackendData(); },
            });
          } else {
            this.confirmSubmitting.set(false);
            this.confirmAction.set(null);
            this.reloadBackendData();
          }
        },
        error: (error) => { this.confirmSubmitting.set(false); this.actionInFlightApplicationId.set(null); this.actionError.set(apiErrorMessage(error, 'This offer can no longer be accepted. Please refresh and try again.')); },
      });
      return;
    }
    setTimeout(() => {
      if (accepting) {
        this.marketplace.acceptApplication(action.applicationId, this.isOwner() ? 'owner' : 'applicant');
      } else {
        this.marketplace.rejectApplication(action.applicationId);
      }
      this.confirmSubmitting.set(false);
      this.actionInFlightApplicationId.set(null);
      this.confirmAction.set(null);
    }, 350);
  }

  protected viewBooking(): void {
    this.router.navigate([this.session.portal().basePath, 'bookings']);
  }

  private mapLoad(load: ApiLoad | undefined): Load | undefined {
    if (!load) return undefined;
    return {
      id: load.uuid, loadId: formatLoadReference(load),
      postedBy: this.toPortalRole(load.posted_by_role), postedByName: load.posted_by_name ?? 'Shipper', pickupCity: load.pickup_city, dropCity: load.drop_city,
      material: load.material ?? 'General Cargo', weightTons: load.weight_tons ?? 0,
      vehicleType: (load.vehicle_type ?? 'Open Body Truck') as VehicleType, pickupDate: formatDate(load.pickup_date),
      budget: formatCurrencyAmount(load.budget),
      status: String(load.status).toLowerCase().includes('application') ? 'Applications Received' : 'Open',
      applicationsCount: load.applications_count ?? 0, postedAgo: load.created_at ? formatDateTime(load.created_at) : 'Recently posted',
    };
  }

  private toPortalRole(role: string | undefined): Load['postedBy'] {
    const normalized = String(role ?? 'shipper').toLowerCase().replace(/[_\s]/g, '-');
    if (normalized.includes('transporter')) return 'transporter';
    if (normalized.includes('truck') || normalized.includes('fleet')) return 'truck-owner';
    if (normalized.includes('company')) return 'company';
    return 'shipper';
  }

  private mapApplication(app: ApiApplication): LoadApplication {
    return {
      id: app.uuid, loadId: app.load_uuid, applicantRole: app.applicant_role, applicantName: app.applicant_name,
      vehicleRegNumber: app.vehicle_reg_number, vehicleType: (app.vehicle_type || 'Open Body Truck') as VehicleType,
      availability: app.availability, quotedAmount: `₹${Number(app.quoted_amount).toLocaleString('en-IN')}`,
      acceptedAmount: app.accepted_amount === null || app.accepted_amount === undefined
        ? undefined
        : formatCurrencyAmount(app.accepted_amount),
      status: (app.status.charAt(0).toUpperCase() + app.status.slice(1)) as LoadApplication['status'],
      appliedAgo: app.created_at ? formatDateTime(app.created_at) : 'Recently',
    };
  }

  private formatApplication(app: LoadApplication): LoadApplication {
    return { ...app, appliedAgo: formatDateTime(app.appliedAgo) };
  }

  private formatLoad(load: Load | undefined): Load | undefined {
    return load ? { ...load, pickupDate: formatDate(load.pickupDate), postedAgo: formatDateTime(load.postedAgo) } : undefined;
  }

  protected offersFor(applicationId: string): NegotiationOffer[] {
    if (!API_CONFIG.useBackend) return this.marketplace.getOffersForApplication(applicationId)().map((offer) => ({ ...offer, timestamp: formatDateTime(offer.timestamp) }));
    return (this.backendOffers()[applicationId] ?? []).map((offer) => ({
      id: offer.uuid,
      loadId: offer.load_uuid,
      applicationId: offer.application_uuid,
      by: offer.by_role,
      byName: offer.by_name,
      amount: formatCurrencyAmount(offer.amount),
      timestamp: offer.created_at ? formatDateTime(offer.created_at) : 'Just now',
    }));
  }

  protected offerErrorFor(applicationId: string): string {
    return this.backendOfferErrors()[applicationId] ?? '';
  }

  private loadChatMessages(applicationId: string): void {
    const existingBooking = this.backendBookings().find((item) => item.application_uuid === applicationId);
    if (existingBooking) {
      this.fetchChatMessages(applicationId, existingBooking.uuid);
      return;
    }
    this.chatLoading.set(true);
    this.apiMarketplace.listMarketplaceBookings().subscribe({
      next: (bookings) => {
        const matching = bookings.find((item) => item.application_uuid === applicationId);
        this.backendBookings.set(bookings.filter((booking) => booking.load_uuid === this.loadId));
        if (matching) this.fetchChatMessages(applicationId, matching.uuid);
        else {
          this.chatLoading.set(false);
          this.chatError.set('Chat is unavailable until the accepted booking is ready. Please retry shortly.');
        }
      },
      error: (error) => {
        this.chatLoading.set(false);
        this.chatError.set(apiErrorMessage(error, 'We could not load the conversation. Please retry.'));
      },
    });
  }

  private fetchChatMessages(applicationId: string, bookingUuid: string): void {
    this.chatLoading.set(true);
    this.apiMarketplace.listChatMessages(bookingUuid).subscribe({
      next: (messages) => {
        this.backendChatMessages.update((current) => ({ ...current, [applicationId]: messages }));
        this.chatError.set('');
        this.chatLoading.set(false);
      },
      error: (error) => {
        this.chatLoading.set(false);
        this.chatError.set(apiErrorMessage(error, 'We could not load the conversation. Please retry.'));
      },
    });
  }

  /** Poll only the open conversation so a second participant sees new messages without a reload. */
  private refreshActiveChat(): void {
    const applicationId = this.activeChatApplicationId();
    if (!applicationId || this.chatPollInFlight) return;
    const booking = this.backendBookings().find((item) => item.application_uuid === applicationId);
    if (!booking) return;
    this.chatPollInFlight = true;
    this.apiMarketplace.listChatMessages(booking.uuid).subscribe({
      next: (messages) => {
        this.backendChatMessages.update((current) => ({ ...current, [applicationId]: messages }));
        this.chatPollInFlight = false;
      },
      error: () => { this.chatPollInFlight = false; },
    });
  }

  private mapChatMessage(message: ApiChatMessage): NegotiationMessage {
    const storedName = message.sender_name?.trim();
    const senderName = storedName && !/^transportseva user$/i.test(storedName)
      ? storedName
      : (message.sender_role === 'owner' ? 'Load owner' : 'Provider');
    return {
      id: message.uuid,
      loadId: message.load_uuid,
      applicationId: message.application_uuid,
      sender: message.sender_role,
      senderName,
      senderRoleLabel: message.sender_role_label || (message.sender_role === 'owner' ? 'Load Owner' : 'Provider'),
      text: message.message,
      timestamp: message.created_at ? formatDateTime(message.created_at) : 'Just now',
    };
  }

  protected chatParticipantRole(sender: NegotiationMessage['sender']): string {
    return sender === 'owner' ? 'Load owner' : 'Provider';
  }

  protected latestOfferFor(applicationId: string): NegotiationOffer | undefined {
    const offers = this.offersFor(applicationId);
    return offers.length ? offers[offers.length - 1] : undefined;
  }

  protected latestOfferAmount(application: LoadApplication): string {
    if (application.acceptedAmount) return application.acceptedAmount;
    return this.latestOfferFor(application.id)?.amount ?? application.quotedAmount;
  }

  protected canAcceptLatestOffer(application: LoadApplication): boolean {
    if (!this.canNegotiate(application)) return false;
    const latest = this.latestOfferFor(application.id);
    return !!latest && latest.by === (this.isOwner() ? 'applicant' : 'owner');
  }

  /** Structured negotiation is closed as soon as either party accepts or rejects. */
  protected canNegotiate(application: LoadApplication): boolean {
    return (application.status === 'Pending' || application.status === 'Negotiating') && this.actionInFlightApplicationId() !== application.id;
  }
}
