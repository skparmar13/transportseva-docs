import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { VehicleType } from '../../../core/models/marketplace.model';
import { TranslatePipe } from '../../../core/i18n';

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

  private readonly loadId = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly load = this.marketplace.getLoadById(this.loadId);
  protected readonly applications = this.marketplace.getApplicationsForLoad(this.loadId);
  protected readonly vehicleTypes = VEHICLE_TYPES;

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
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
  protected readonly applyMessage = signal('');
  protected readonly applying = signal(false);

  // Negotiation (offer/counter-offer) state — keyed by applicationId being negotiated
  protected readonly negotiatingApplicationId = signal<string | null>(null);
  protected readonly counterAmount = signal<number | null>(null);
  protected readonly counterMessage = signal('');

  // Chat state (unlocked only after the application is Accepted)
  protected readonly chatText = signal('');
  protected readonly activeChatApplicationId = signal<string | null>(null);
  protected readonly activeChatMessages = computed(() => {
    const id = this.activeChatApplicationId();
    return id ? this.marketplace.getMessagesForApplication(id)() : [];
  });

  // Accept/reject confirm dialog
  protected readonly confirmAction = signal<{ type: 'accept' | 'reject'; applicationId: string; applicantName: string } | null>(null);

  protected openApply(): void {
    this.showApplyModal.set(true);
  }

  protected submitApplication(): void {
    const load = this.load();
    const amount = this.quotedAmount();
    if (!load || !this.vehicleRegNumber().trim() || !this.availability().trim() || amount === null || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount * 100)) return;
    this.applying.set(true);
    setTimeout(() => {
      this.marketplace.applyForLoad({
        loadId: this.loadId,
        applicantRole: this.session.role(),
        applicantName: this.session.user().company ?? this.session.user().name,
        vehicleRegNumber: this.vehicleRegNumber(),
        vehicleType: this.vehicleType(),
        availability: this.availability(),
        quotedAmount: String(amount),
        message: this.applyMessage() || undefined,
      });
      this.applying.set(false);
      this.showApplyModal.set(false);
    }, 500);
  }

  protected openNegotiation(applicationId: string): void {
    const current = this.negotiatingApplicationId();
    this.negotiatingApplicationId.set(current === applicationId ? null : applicationId);
    const latest = this.marketplace.getLatestOffer(applicationId)();
    this.counterAmount.set(latest?.amount ? Number(latest.amount.replace(/[^0-9.]/g, '')) : null);
    this.counterMessage.set('');
  }

  protected sendCounterOffer(applicationId: string): void {
    const amount = this.counterAmount();
    if (amount === null || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount * 100)) return;
    this.marketplace.sendCounterOffer({
      applicationId,
      loadId: this.loadId,
      by: this.isOwner() ? 'owner' : 'applicant',
      byName: this.session.user().company ?? this.session.user().name,
      amount: String(amount),
      message: this.counterMessage() || undefined,
    });
    this.counterMessage.set('');
  }

  protected openChat(applicationId: string): void {
    this.activeChatApplicationId.set(this.activeChatApplicationId() === applicationId ? null : applicationId);
  }

  protected sendChat(applicationId: string): void {
    const text = this.chatText().trim();
    if (!text) return;
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
    this.confirmAction.set({ type: 'accept', applicationId, applicantName });
  }

  protected askReject(applicationId: string, applicantName: string): void {
    this.confirmAction.set({ type: 'reject', applicationId, applicantName });
  }

  protected confirmActionRun(): void {
    const action = this.confirmAction();
    if (!action) return;
    if (action.type === 'accept') {
      this.marketplace.acceptApplication(action.applicationId);
    } else {
      this.marketplace.rejectApplication(action.applicationId);
    }
    this.confirmAction.set(null);
  }

  protected viewBooking(): void {
    this.router.navigate([this.session.portal().basePath, 'bookings']);
  }
}
