import { Injectable, computed, inject, signal } from '@angular/core';
import { PortalRole } from '../models/nav.model';
import {
  BookingStage,
  Load,
  LoadApplication,
  MarketplaceBooking,
  NegotiationMessage,
  NegotiationOffer,
  SettlementMilestone,
  VehicleType,
} from '../models/marketplace.model';
import { PaymentMockService } from './payment-mock.service';

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

const DEPOSIT_AMOUNT = '₹1,000';
/** Default Loading Advance as a share of freight — covers diesel, toll, FASTag and driver expenses. */
const ADVANCE_SHARE = 0.4;

const parseAmount = (amount: string): number => Number(amount.replace(/[^0-9.]/g, '')) || 0;
const formatAmount = (amount: number): string => `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** Seeds the default two-milestone Settlement Plan for a newly confirmed booking: Loading Advance + Final Settlement. */
const buildDefaultSettlementPlan = (freightAmount: string): SettlementMilestone[] => {
  const freight = parseAmount(freightAmount);
  const advance = Math.round(freight * ADVANCE_SHARE);
  return [
    {
      id: nextId('sm'),
      label: 'Loading Advance',
      trigger: 'Released after loading is completed and confirmed by the shipper',
      amount: formatAmount(advance),
      status: 'Pending',
    },
    {
      id: nextId('sm'),
      label: 'Final Settlement',
      trigger: 'Released after POD is uploaded and approved',
      amount: formatAmount(freight - advance),
      status: 'Pending',
    },
  ];
};

export const BOOKING_TIMELINE_STAGES: BookingStage[] = [
  'Offer Accepted',
  'Awaiting Deposit',
  'Confirmed',
  'Vehicle Assigned',
  'Driver Assigned',
  'Loading Completed',
  'Trip Started',
  'Settlement Pending',
  'Completed',
];

const buildTimeline = (upToStage: BookingStage, timestamp = 'Just now') => {
  const upToIndex = BOOKING_TIMELINE_STAGES.indexOf(upToStage);
  return BOOKING_TIMELINE_STAGES.map((stage, i) => ({
    stage,
    completed: i <= upToIndex,
    timestamp: i <= upToIndex ? timestamp : undefined,
  }));
};


const INITIAL_LOADS: Load[] = [
  {
    id: 'l1', loadId: '#LD-3841', postedBy: 'shipper', postedByName: 'Mehta Industries',
    pickupCity: 'Delhi', dropCity: 'Mumbai', material: 'Steel Coils', weightTons: 18,
    vehicleType: '32ft Trailer', pickupDate: '12 Aug 2026', budget: '₹18,500',
    notes: 'Loading dock access available till 6 PM. Tarpaulin cover required.',
    status: 'Applications Received', applicationsCount: 3, postedAgo: '2 hours ago',
  },
  {
    id: 'l2', loadId: '#LD-3840', postedBy: 'shipper', postedByName: 'Mehta Industries',
    pickupCity: 'Pune', dropCity: 'Bengaluru', material: 'FMCG Cartons', weightTons: 9,
    vehicleType: '20ft Container', pickupDate: '10 Aug 2026', budget: '₹22,300',
    status: 'Booked', applicationsCount: 5, postedAgo: '1 day ago',
  },
  {
    id: 'l3', loadId: '#LD-3835', postedBy: 'shipper', postedByName: 'Mehta Industries',
    pickupCity: 'Ahmedabad', dropCity: 'Jaipur', material: 'Cement Bags', weightTons: 22,
    vehicleType: 'Open Body Truck', pickupDate: '14 Aug 2026', budget: '₹9,750',
    status: 'Open', applicationsCount: 0, postedAgo: '5 hours ago',
  },
  {
    id: 'l4', loadId: '#LD-3844', postedBy: 'transporter', postedByName: 'Verma Logistics',
    onBehalfOfCustomer: 'Shree Balaji Traders (offline customer)',
    pickupCity: 'Chennai', dropCity: 'Hyderabad', material: 'Electronics', weightTons: 6,
    vehicleType: 'Mini Truck', pickupDate: '13 Aug 2026', budget: '₹14,200',
    status: 'Open', applicationsCount: 1, postedAgo: '30 minutes ago',
  },
  {
    id: 'l5', loadId: '#LD-3846', postedBy: 'shipper', postedByName: 'Anita Traders',
    pickupCity: 'Kolkata', dropCity: 'Patna', material: 'Textiles', weightTons: 12,
    vehicleType: '20ft Container', pickupDate: '15 Aug 2026', budget: '₹11,600',
    status: 'Open', applicationsCount: 2, postedAgo: '3 hours ago',
  },
  {
    id: 'l6', loadId: '#LD-3848', postedBy: 'shipper', postedByName: 'Global Mining Co.',
    pickupCity: 'Nagpur', dropCity: 'Raipur', material: 'Iron Ore', weightTons: 28,
    vehicleType: 'Trailer (Flatbed)', pickupDate: '16 Aug 2026', budget: '₹26,000',
    status: 'Open', applicationsCount: 0, postedAgo: '10 minutes ago',
  },
];

const INITIAL_APPLICATIONS: LoadApplication[] = [
  { id: 'a1', loadId: 'l1', applicantRole: 'transporter', applicantName: 'Verma Logistics', vehicleRegNumber: 'DL1LT4521', vehicleType: '32ft Trailer', availability: 'Within 4 hours', quotedAmount: '₹17,500', status: 'Negotiating', appliedAgo: '1 hour ago' },
  { id: 'a2', loadId: 'l1', applicantRole: 'truck-owner', applicantName: 'Sanjay Yadav', vehicleRegNumber: 'RJ14GA1234', vehicleType: '32ft Trailer', availability: 'Today', quotedAmount: '₹18,500', message: 'Available immediately, GPS-fitted vehicle.', status: 'Pending', appliedAgo: '45 minutes ago' },
  { id: 'a3', loadId: 'l1', applicantRole: 'truck-owner', applicantName: 'Mahesh Patel Transport', vehicleRegNumber: 'GJ01AB7788', vehicleType: '32ft Trailer', availability: 'Tomorrow morning', quotedAmount: '₹17,800', status: 'Pending', appliedAgo: '20 minutes ago' },
  { id: 'a4', loadId: 'l2', applicantRole: 'truck-owner', applicantName: 'Sanjay Yadav', vehicleRegNumber: 'RJ14GB5678', vehicleType: '20ft Container', availability: 'Today', quotedAmount: '₹22,300', status: 'Accepted', appliedAgo: '1 day ago' },
  { id: 'a5', loadId: 'l4', applicantRole: 'truck-owner', applicantName: 'Sanjay Yadav', vehicleRegNumber: 'RJ14GC9012', vehicleType: 'Mini Truck', availability: 'Within 3 hours', quotedAmount: '₹13,900', status: 'Pending', appliedAgo: '15 minutes ago' },
];

const INITIAL_OFFERS: NegotiationOffer[] = [
  { id: 'o1', loadId: 'l1', applicationId: 'a1', by: 'applicant', byName: 'Verma Logistics', amount: '₹18,000', message: 'Can load today evening.', timestamp: '1 hour ago' },
  { id: 'o2', loadId: 'l1', applicationId: 'a1', by: 'owner', byName: 'Mehta Industries', amount: '₹17,000', message: 'Budget is tight, can you do 17K?', timestamp: '40 minutes ago' },
  { id: 'o3', loadId: 'l1', applicationId: 'a1', by: 'applicant', byName: 'Verma Logistics', amount: '₹17,500', message: 'Best I can do is 17,500.', timestamp: '25 minutes ago' },
  { id: 'o4', loadId: 'l2', applicationId: 'a4', by: 'applicant', byName: 'Sanjay Yadav', amount: '₹22,300', timestamp: '1 day ago' },
];

const INITIAL_MESSAGES: NegotiationMessage[] = [
  { id: 'm1', loadId: 'l2', applicationId: 'a4', sender: 'applicant', senderName: 'Sanjay Yadav', text: 'Reached the loading point, starting in 30 mins.', timestamp: '20 hours ago' },
  { id: 'm2', loadId: 'l2', applicationId: 'a4', sender: 'owner', senderName: 'Mehta Industries', text: 'Great, please share POD once delivered.', timestamp: '19 hours ago' },
];

const INITIAL_BOOKINGS: MarketplaceBooking[] = [
  {
    id: 'b1', bookingId: '#TS-48230', loadId: 'l2', applicationId: 'a4', route: 'Pune → Bengaluru', material: 'FMCG Cartons',
    ownerRole: 'shipper', ownerName: 'Mehta Industries', counterpartyRole: 'truck-owner', counterpartyName: 'Sanjay Yadav',
    vehicleRegNumber: 'RJ14GB5678', amount: '₹22,300', status: 'Trip Started',
    timeline: buildTimeline('Trip Started', '18 hours ago'),
    ownerDeposit: { role: 'shipper', partyName: 'Mehta Industries', amount: DEPOSIT_AMOUNT, status: 'Paid', paidAt: '1 day ago' },
    counterpartyDeposit: { role: 'truck-owner', partyName: 'Sanjay Yadav', amount: DEPOSIT_AMOUNT, status: 'Paid', paidAt: '1 day ago' },
    escrowStatus: 'Locked',
    vehicleAssignment: { mode: 'Own Fleet', vehicleRegNumber: 'RJ14GB5678', assignedAt: '1 day ago' },
    driverAssignment: { driverName: 'Ramesh Kumar', driverPhone: '+91 98765 43210', assignedAt: '22 hours ago' },
    settlementPlan: [
      { id: 'sm1', label: 'Loading Advance', trigger: 'Released after loading is completed and confirmed by the shipper', amount: '₹8,900', status: 'Released', releasedAt: '20 hours ago' },
      { id: 'sm2', label: 'Final Settlement', trigger: 'Released after POD is uploaded and approved', amount: '₹13,400', status: 'Pending' },
    ],
  },
];

/**
 * In-memory Marketplace store shared across the whole prototype.
 * Signals hold the "database" so actions like Post Load / Apply /
 * Negotiate / Pay Deposit / Assign Vehicle actually mutate visible
 * state during the session — making the clickable prototype feel
 * real without any backend. Reset on full page reload (by design —
 * no persistence).
 *
 * Booking flow implemented here (see marketplace.model.ts for the
 * full BookingStage/BookingDeposit shapes):
 *   Apply (structured offer, no contact reveal) → Negotiate
 *   (offer/counter-offer thread) → Accept → Booking created
 *   ("Awaiting Deposit") → both sides pay a mutual Booking Security
 *   Deposit into escrow → "Confirmed" (freeform chat unlocks) →
 *   Vehicle Assigned → Driver Assigned → Trip Started → Settlement
 *   (deposits released, commission deducted, remaining freight paid).
 */
@Injectable({ providedIn: 'root' })
export class MarketplaceMockService {
  private readonly payments = inject(PaymentMockService);
  private readonly loadsState = signal<Load[]>(INITIAL_LOADS);
  private readonly applicationsState = signal<LoadApplication[]>(INITIAL_APPLICATIONS);
  private readonly offersState = signal<NegotiationOffer[]>(INITIAL_OFFERS);
  private readonly messagesState = signal<NegotiationMessage[]>(INITIAL_MESSAGES);
  private readonly bookingsState = signal<MarketplaceBooking[]>(INITIAL_BOOKINGS);

  readonly loads = computed(() => this.loadsState());
  readonly applications = computed(() => this.applicationsState());
  readonly bookings = computed(() => this.bookingsState());

  getLoadById(id: string) {
    return computed(() => this.loadsState().find((load) => load.id === id));
  }

  getApplicationsForLoad(loadId: string) {
    return computed(() => this.applicationsState().filter((app) => app.loadId === loadId));
  }

  getOffersForApplication(applicationId: string) {
    return computed(() => this.offersState().filter((o) => o.applicationId === applicationId));
  }

  /** Latest negotiated amount for an application — the amount the next Accept/Counter acts on. */
  getLatestOffer(applicationId: string) {
    return computed(() => {
      const offers = this.offersState().filter((o) => o.applicationId === applicationId);
      return offers.length ? offers[offers.length - 1] : undefined;
    });
  }

  getMessagesForApplication(applicationId: string) {
    return computed(() => this.messagesState().filter((m) => m.applicationId === applicationId));
  }

  getBookingByApplicationId(applicationId: string) {
    return computed(() => this.bookingsState().find((b) => b.applicationId === applicationId));
  }

  /** "My Loads" — loads posted by the given portal role (Shipper / Transporter on behalf). */
  getLoadsPostedBy(role: PortalRole) {
    return computed(() => this.loadsState().filter((load) => load.postedBy === role));
  }

  /** "My Applications" — applications submitted by the given portal role (Transporter / Truck Owner). */
  getApplicationsBy(role: PortalRole) {
    return computed(() => this.applicationsState().filter((app) => app.applicantRole === role));
  }

  postLoad(input: {
    postedBy: PortalRole;
    postedByName: string;
    onBehalfOfCustomer?: string;
    pickupCity: string;
    dropCity: string;
    material: string;
    weightTons: number;
    vehicleType: VehicleType;
    pickupDate: string;
    budget: string;
    notes?: string;
  }): Load {
    const load: Load = {
      id: nextId('l'),
      loadId: nextId('#LD'),
      status: 'Open',
      applicationsCount: 0,
      postedAgo: 'Just now',
      ...input,
    };
    this.loadsState.update((loads) => [load, ...loads]);
    return load;
  }

  /** Structured application — proposed freight, vehicle availability and an optional note. No contact details are exchanged yet. */
  applyForLoad(input: {
    loadId: string;
    applicantRole: PortalRole;
    applicantName: string;
    vehicleRegNumber: string;
    vehicleType: VehicleType;
    availability: string;
    quotedAmount: string;
    message?: string;
  }): LoadApplication {
    const application: LoadApplication = {
      id: nextId('a'),
      status: 'Pending',
      appliedAgo: 'Just now',
      ...input,
    };
    this.applicationsState.update((apps) => [application, ...apps]);
    this.loadsState.update((loads) =>
      loads.map((load) =>
        load.id === input.loadId
          ? { ...load, applicationsCount: load.applicationsCount + 1, status: load.status === 'Open' ? 'Applications Received' : load.status }
          : load,
      ),
    );
    this.offersState.update((offers) => [
      ...offers,
      { id: nextId('o'), loadId: input.loadId, applicationId: application.id, by: 'applicant', byName: input.applicantName, amount: input.quotedAmount, message: input.message, timestamp: 'Just now' },
    ]);
    return application;
  }

  /** Either side proposes a counter-offer — moves the application into "Negotiating". */
  sendCounterOffer(input: { applicationId: string; loadId: string; by: 'owner' | 'applicant'; byName: string; amount: string; message?: string }): void {
    this.offersState.update((offers) => [
      ...offers,
      { id: nextId('o'), ...input, timestamp: 'Just now' },
    ]);
    this.applicationsState.update((apps) =>
      apps.map((a) => (a.id === input.applicationId ? { ...a, status: 'Negotiating', quotedAmount: input.amount } : a)),
    );
  }

  /** Accept the latest negotiated amount — creates the booking awaiting token payment. */
  acceptApplication(applicationId: string): MarketplaceBooking | undefined {
    const application = this.applicationsState().find((a) => a.id === applicationId);
    if (!application) return undefined;
    const latestOffer = this.getLatestOffer(applicationId)();
    const finalAmount = latestOffer?.amount ?? application.quotedAmount;

    this.applicationsState.update((apps) =>
      apps.map((a) => {
        if (a.id === applicationId) return { ...a, status: 'Accepted', quotedAmount: finalAmount };
        // Any other pending/negotiating application on the same load is auto-rejected once one is accepted.
        if (a.loadId === application.loadId && (a.status === 'Pending' || a.status === 'Negotiating')) return { ...a, status: 'Rejected' };
        return a;
      }),
    );

    const load = this.loadsState().find((l) => l.id === application.loadId);
    this.loadsState.update((loads) =>
      loads.map((l) => (l.id === application.loadId ? { ...l, status: 'Booked' } : l)),
    );

    const booking: MarketplaceBooking = {
      id: nextId('b'),
      bookingId: nextId('#TS'),
      loadId: application.loadId,
      applicationId: application.id,
      route: load ? `${load.pickupCity} → ${load.dropCity}` : '',
      material: load?.material ?? '',
      ownerRole: load?.postedBy ?? 'shipper',
      ownerName: load?.postedByName ?? '',
      counterpartyRole: application.applicantRole,
      counterpartyName: application.applicantName,
      vehicleRegNumber: application.vehicleRegNumber,
      amount: finalAmount,
      status: 'Awaiting Deposit',
      timeline: buildTimeline('Awaiting Deposit'),
      ownerDeposit: { role: load?.postedBy ?? 'shipper', partyName: load?.postedByName ?? '', amount: DEPOSIT_AMOUNT, status: 'Pending' },
      counterpartyDeposit: { role: application.applicantRole, partyName: application.applicantName, amount: DEPOSIT_AMOUNT, status: 'Pending' },
      escrowStatus: 'Awaiting Deposits',
      settlementPlan: buildDefaultSettlementPlan(finalAmount),
    };
    this.bookingsState.update((bookings) => [booking, ...bookings]);
    return booking;
  }

  rejectApplication(applicationId: string): void {
    this.applicationsState.update((apps) =>
      apps.map((a) => (a.id === applicationId ? { ...a, status: 'Rejected' } : a)),
    );
  }

  /** Simulated regulated-provider token payment. Advances once required commitments are received. */
  payDeposit(bookingId: string, side: 'owner' | 'counterparty'): void {
    const booking = this.bookingsState().find((b) => b.id === bookingId);
    const party = side === 'owner' ? booking?.ownerDeposit.partyName : booking?.counterpartyDeposit.partyName;
    this.bookingsState.update((bookings) =>
      bookings.map((b) => {
        if (b.id !== bookingId) return b;
        const updated: MarketplaceBooking = {
          ...b,
          ownerDeposit: side === 'owner' ? { ...b.ownerDeposit, status: 'Paid', paidAt: 'Just now' } : b.ownerDeposit,
          counterpartyDeposit: side === 'counterparty' ? { ...b.counterpartyDeposit, status: 'Paid', paidAt: 'Just now' } : b.counterpartyDeposit,
        };
        const bothPaid = updated.ownerDeposit.status === 'Paid' && updated.counterpartyDeposit.status === 'Paid';
        if (bothPaid) {
          updated.status = 'Confirmed';
          updated.escrowStatus = 'Locked';
          updated.timeline = buildTimeline('Confirmed');
        }
        return updated;
      }),
    );
    if (booking) {
      this.payments.recordLedgerEntry({
        reference: nextId('PAY'),
        bookingId: booking.bookingId,
        date: 'Just now',
        type: 'Booking Token',
        direction: 'Receivable',
        amount: side === 'owner' ? booking.ownerDeposit.amount : booking.counterpartyDeposit.amount,
        status: 'Completed',
        description: `Booking token received from ${party ?? 'booking party'} through payment provider`,
      });
    }
  }

  /** Transporter rejection before dispatch cancels the booking and records refunds for any paid token. */
  rejectBooking(bookingId: string): void {
    const booking = this.bookingsState().find((b) => b.id === bookingId);
    if (!booking || !['Awaiting Deposit', 'Confirmed'].includes(booking.status)) return;
    this.bookingsState.update((bookings) => bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'Cancelled', escrowStatus: 'Released' } : b,
    ));
    const paid = [booking.ownerDeposit, booking.counterpartyDeposit].filter((d) => d.status === 'Paid');
    for (const deposit of paid) {
      this.payments.recordLedgerEntry({
        reference: nextId('REF'), bookingId: booking.bookingId, date: 'Just now', type: 'Refund',
        direction: 'Refund', amount: deposit.amount, status: 'Processing',
        description: `Booking token refund initiated for ${deposit.partyName} after transporter rejection`,
      });
    }
  }

  /** Load owner cancellation before dispatch; paid booking tokens become refund records. */
  cancelBooking(bookingId: string): void {
    const booking = this.bookingsState().find((b) => b.id === bookingId);
    if (!booking || !['Awaiting Deposit', 'Confirmed'].includes(booking.status)) return;
    this.bookingsState.update((bookings) => bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'Cancelled', escrowStatus: 'Released' } : b,
    ));
    const paid = [booking.ownerDeposit, booking.counterpartyDeposit].filter((d) => d.status === 'Paid');
    for (const deposit of paid) {
      this.payments.recordLedgerEntry({
        reference: nextId('REF'), bookingId: booking.bookingId, date: 'Just now', type: 'Refund',
        direction: 'Refund', amount: deposit.amount, status: 'Processing',
        description: `Booking token refund initiated after customer cancellation for ${deposit.partyName}`,
      });
    }
  }

  /** Opens a support dispute without changing the commercial booking state. */
  raiseDispute(bookingId: string, reason: string, raisedBy: string): void {
    if (!reason.trim()) return;
    this.bookingsState.update((bookings) => bookings.map((b) => b.id === bookingId && !b.dispute
      ? { ...b, dispute: { reference: nextId('DSP'), reason: reason.trim(), raisedBy, status: 'Open' as const, raisedAt: 'Just now' } }
      : b,
    ));
  }

  assignVehicle(bookingId: string, input: { mode: 'Own Fleet' | 'Subcontracted'; vehicleRegNumber: string; subcontractedTo?: string }): void {
    this.bookingsState.update((bookings) =>
      bookings.map((b) =>
        b.id === bookingId
          ? { ...b, vehicleAssignment: { ...input, assignedAt: 'Just now' }, status: 'Vehicle Assigned', timeline: buildTimeline('Vehicle Assigned') }
          : b,
      ),
    );
  }

  assignDriver(bookingId: string, input: { driverName: string; driverPhone?: string }): void {
    this.bookingsState.update((bookings) =>
      bookings.map((b) =>
        b.id === bookingId
          ? { ...b, driverAssignment: { ...input, assignedAt: 'Just now' }, status: 'Driver Assigned', timeline: buildTimeline('Driver Assigned') }
          : b,
      ),
    );
  }

  /** Truck side confirms physical loading is done — this is the gate the shipper needs before releasing the Loading Advance. */
  markLoadingCompleted(bookingId: string): void {
    this.bookingsState.update((bookings) =>
      bookings.map((b) => (b.id === bookingId ? { ...b, status: 'Loading Completed', timeline: buildTimeline('Loading Completed') } : b)),
    );
  }

  /** Release a single Settlement Plan milestone (e.g. Loading Advance) — the shipper/load owner pays it out of sequence, not as one lump sum. */
  releaseMilestone(bookingId: string, milestoneId: string): void {
    this.bookingsState.update((bookings) =>
      bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              settlementPlan: b.settlementPlan.map((m) =>
                m.id === milestoneId ? { ...m, status: 'Released', releasedAt: 'Just now' } : m,
              ),
            }
          : b,
      ),
    );
  }

  /** Add an optional Mid-Trip Payment milestone (e.g. released on reaching a geofence checkpoint) — deducted from the pending Final Settlement amount. */
  addMidTripMilestone(bookingId: string, input: { amount: string; trigger: string }): void {
    this.bookingsState.update((bookings) =>
      bookings.map((b) => {
        if (b.id !== bookingId) return b;
        const finalMilestone = b.settlementPlan.find((m) => m.label === 'Final Settlement' && m.status === 'Pending');
        const midTrip: SettlementMilestone = {
          id: nextId('sm'),
          label: 'Mid-Trip Payment',
          trigger: input.trigger,
          amount: input.amount,
          status: 'Pending',
        };
        const midTripAmount = parseAmount(input.amount);
        const plan = b.settlementPlan.map((m) =>
          finalMilestone && m.id === finalMilestone.id
            ? { ...m, amount: formatAmount(Math.max(parseAmount(m.amount) - midTripAmount, 0)) }
            : m,
        );
        const finalIndex = plan.findIndex((m) => m.label === 'Final Settlement');
        const withMidTrip = finalIndex >= 0 ? [...plan.slice(0, finalIndex), midTrip, ...plan.slice(finalIndex)] : [...plan, midTrip];
        return { ...b, settlementPlan: withMidTrip };
      }),
    );
  }

  startTrip(bookingId: string): void {
    this.bookingsState.update((bookings) =>
      bookings.map((b) => (b.id === bookingId ? { ...b, status: 'Trip Started', timeline: buildTimeline('Trip Started') } : b)),
    );
  }

  /**
   * Final settlement — releases any still-pending milestones (typically just
   * "Final Settlement"), deducts TransportSeva's commission from the total
   * freight, and releases both Booking Security Deposits from escrow.
   */
  settleBooking(bookingId: string, commissionPercent = 5): void {
    const booking = this.bookingsState().find((b) => b.id === bookingId);
    if (!booking || booking.status === 'Completed' || booking.status === 'Cancelled') return;
    const freightNum = parseAmount(booking.amount);
    const commissionNum = Math.round((freightNum * commissionPercent) / 100);
    const alreadyReleased = booking.settlementPlan.filter((m) => m.status === 'Released').reduce((sum, m) => sum + parseAmount(m.amount), 0);
    const finalPayout = Math.max(freightNum - alreadyReleased - commissionNum, 0);
    const payoutNum = alreadyReleased + finalPayout;
    this.bookingsState.update((bookings) =>
      bookings.map((b) => {
        if (b.id !== bookingId) return b;
        const settlementPlan = b.settlementPlan.map((m) =>
          m.status === 'Pending' ? { ...m, amount: formatAmount(finalPayout), status: 'Released' as const, releasedAt: 'Just now' } : m,
        );
        const payoutNum = alreadyReleased + finalPayout;
        return {
          ...b,
          status: 'Completed',
          timeline: buildTimeline('Completed'),
          escrowStatus: 'Released',
          settlementPlan,
          settlement: {
            freightAmount: b.amount,
            commission: formatAmount(commissionNum),
            payoutAmount: formatAmount(payoutNum),
            depositsReleased: true,
            settledAt: 'Just now',
          },
        };
      }),
    );
    this.payments.recordLedgerEntry({
      reference: nextId('SET'), bookingId: booking.bookingId, date: 'Just now', type: 'Settlement',
      direction: 'Payable', amount: formatAmount(payoutNum), status: 'Completed',
      description: `Freight settlement released after ${commissionPercent}% TransportSeva commission`,
    });
    this.payments.recordLedgerEntry({
      reference: nextId('COM'), bookingId: booking.bookingId, date: 'Just now', type: 'Commission',
      direction: 'Receivable', amount: formatAmount(commissionNum), status: 'Completed',
      description: `TransportSeva commission assessed at ${commissionPercent}% of freight`,
    });
  }

  /** Freeform chat — only meaningful once the application is Accepted (booking exists), i.e. after negotiation closes. */
  sendMessage(input: { loadId: string; applicationId: string; sender: 'owner' | 'applicant'; senderName: string; text: string }): void {
    const message: NegotiationMessage = { id: nextId('m'), timestamp: 'Just now', ...input };
    this.messagesState.update((messages) => [...messages, message]);
  }
}

