import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { Load, LoadApplication, NegotiationMessage, NegotiationOffer, VehicleType } from '../../../core/models/marketplace.model';
import { TranslatePipe } from '../../../core/i18n';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiApplication, ApiChatMessage, ApiLoad, ApiMarketplaceBooking, ApiMarketplaceService, ApiOffer } from '../../../core/api/api-marketplace.service';
import { formatLoadReference } from '../../../core/utils/load-reference';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';
import { formatCurrencyAmount } from '../../../core/utils/currency-format';

const VEHICLE_TYPES: VehicleType[] = ['Open Body Truck', '20ft Container', '32ft Trailer', 'Mini Truck', 'Tanker', 'Trailer (Flatbed)'];

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
  private readonly router = inject(Router);
  private readonly apiMarketplace = inject(ApiMarketplaceService);

  private readonly loadId = this.route.snapshot.paramMap.get('id') ?? '';
  private readonly backendLoad = signal<ApiLoad | undefined>(undefined);
  private readonly backendApplications = signal<ApiApplication[]>([]);
  private readonly backendOffers = signal<Record<string, ApiOffer[]>>({});
  private readonly backendOfferErrors = signal<Record<string, string>>({});
  private readonly backendBookings = signal<ApiMarketplaceBooking[]>([]);
  private readonly backendChatMessages = signal<Record<string, ApiChatMessage[]>>({});
  protected readonly loading = signal(API_CONFIG.useBackend);
  protected readonly loadError = signal('');
  protected readonly applicationsError = signal('');
  protected readonly chatError = signal('');
  protected readonly chatLoading = signal(false);
  protected readonly chatSending = signal(false);
  constructor() {
    this.reloadBackendData();
  }

  private reloadBackendData(): void {
    if (!API_CONFIG.useBackend) return;
    this.apiMarketplace.getLoad(this.loadId).subscribe({
      next: (load) => { this.backendLoad.set(load); this.loading.set(false); },
      error: (error) => { this.backendLoad.set(undefined); this.loading.set(false); this.loadError.set(apiErrorMessage(error, 'We could not load this shipment.')); },
    });
    this.apiMarketplace.listApplications(this.loadId).subscribe({
      next: (applications) => {
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
      },
      error: (error) => {
        // Never convert an API failure into a misleading "No applications"
        // state. Preserve any previously loaded applications and show the
        // actual error in the section so offers/chats cannot silently vanish.
        this.applicationsError.set(apiErrorMessage(error, 'Applications could not be loaded. Please retry.'));
        this.actionInFlightApplicationId.set(null);
      },
    });
    this.apiMarketplace.listMarketplaceBookings().subscribe({
      next: (bookings) => this.backendBookings.set(bookings.filter((booking) => booking.load_uuid === this.loadId)),
      error: () => this.backendBookings.set([]),
    });
  }
  protected retryLoadData(): void {
    if (!API_CONFIG.useBackend) return;
    this.applicationsError.set('');
    this.reloadBackendData();
  }
  protected readonly load = computed<Load | undefined>(() => API_CONFIG.useBackend ? this.mapLoad(this.backendLoad()) : this.marketplace.getLoadById(this.loadId)());
  protected readonly applications = computed<LoadApplication[]>(() => API_CONFIG.useBackend ? this.backendApplications().map((app) => this.mapApplication(app)) : this.marketplace.getApplicationsForLoad(this.loadId)());
  protected readonly vehicleTypes = VEHICLE_TYPES;

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
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
    return this.marketplace.getMessagesForApplication(id)();
  });

  // Accept/reject confirm dialog
  protected readonly confirmAction = signal<{ type: 'accept' | 'acceptOffer' | 'reject'; applicationId: string; applicantName: string; amount?: string } | null>(null);
  protected readonly confirmSubmitting = signal(false);
  /** Prevents a second offer while an accept/reject request is completing. */
  protected readonly actionInFlightApplicationId = signal<string | null>(null);
  protected readonly actionError = signal('');

  protected openApply(): void {
    this.showApplyModal.set(true);
  }

  protected submitApplication(): void {
    const load = this.load();
    const amount = this.quotedAmount();
    if (!load || !this.vehicleRegNumber().trim() || !this.availability().trim() || amount === null || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount * 100)) return;
    this.applying.set(true);
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.createApplication(this.loadId, {
        applicant_role: this.session.role() === 'transporter' ? 'transporter' : 'truck-owner',
        applicant_name: this.session.user().company ?? this.session.user().name,
        vehicle_reg_number: this.vehicleRegNumber().trim(),
        vehicle_type: this.vehicleType(),
        availability: this.availability().trim(),
        quoted_amount: amount,
      }).subscribe({
        next: () => {
          this.applying.set(false);
          this.showApplyModal.set(false);
          this.reloadBackendData();
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
        vehicleRegNumber: this.vehicleRegNumber(),
        vehicleType: this.vehicleType(),
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
      postedBy: this.toPortalRole(load.posted_by_role), postedByName: load.posted_by_name ?? 'TransportSeva customer', pickupCity: load.pickup_city, dropCity: load.drop_city,
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
      appliedAgo: app.created_at ?? 'Recently',
    };
  }

  protected offersFor(applicationId: string): NegotiationOffer[] {
    if (!API_CONFIG.useBackend) return this.marketplace.getOffersForApplication(applicationId)();
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

  private mapChatMessage(message: ApiChatMessage): NegotiationMessage {
    return {
      id: message.uuid,
      loadId: message.load_uuid,
      applicationId: message.application_uuid,
      sender: message.sender_role,
      senderName: message.sender_name,
      text: message.message,
      timestamp: message.created_at ? formatDateTime(message.created_at) : 'Just now',
    };
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
