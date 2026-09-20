import { PortalRole } from './nav.model';
import { GeoLocation } from './location.model';

/**
 * TransportSeva Marketplace — core domain model for the UX/UI
 * prototype. Mirrors the real business rules:
 *   - A Load has an OWNER (who benefits) and a CREATOR (who posted
 *     it) — these can differ when a Transporter posts a load on
 *     behalf of an offline/unregistered customer.
 *   - Transporters and Truck Owners APPLY to loads; the load owner
 *     ACCEPTS one application, which becomes a BOOKING.
 */
export type VehicleType = 'Open Body Truck' | '20ft Container' | '32ft Trailer' | 'Mini Truck' | 'Tanker' | 'Trailer (Flatbed)';

export type LoadStatus = 'Open' | 'Applications Received' | 'Booked' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface Load {
  id: string;
  loadId: string;
  postedBy: PortalRole;
  postedByName: string;
  /** Set only when a Transporter posts on behalf of an offline/unregistered customer. */
  onBehalfOfCustomer?: string;
  pickupCity: string;
  dropCity: string;
  pickupLocation?: GeoLocation;
  dropLocation?: GeoLocation;
  material: string;
  weightTons: number;
  vehicleType: VehicleType;
  pickupDate: string;
  budget: string;
  notes?: string;
  status: LoadStatus;
  applicationsCount: number;
  postedAgo: string;
}

/**
 * Application lifecycle now models a structured negotiation instead
 * of an instant accept:
 *   Pending → (either side counters) → Negotiating → Accepted / Rejected / Withdrawn
 * Freeform chat only unlocks once an application reaches "Accepted"
 * (i.e. a booking exists) — before that, only structured Offers are
 * exchanged so there is a clean, auditable negotiation trail.
 */
export type ApplicationStatus = 'Pending' | 'Negotiating' | 'Accepted' | 'Rejected' | 'Withdrawn';

export interface LoadApplication {
  id: string;
  loadId: string;
  applicantRole: PortalRole;
  applicantName: string;
  vehicleRegNumber: string;
  vehicleType: VehicleType;
  /** Vehicle availability the applicant committed to at the time of applying. */
  availability: string;
  quotedAmount: string;
  message?: string;
  status: ApplicationStatus;
  appliedAgo: string;
}

/** A single offer/counter-offer in the structured negotiation thread for an application. */
export interface NegotiationOffer {
  id: string;
  loadId: string;
  applicationId: string;
  by: 'owner' | 'applicant';
  byName: string;
  amount: string;
  message?: string;
  timestamp: string;
}

export interface NegotiationMessage {
  id: string;
  loadId: string;
  applicationId: string;
  sender: 'owner' | 'applicant';
  senderName: string;
  text: string;
  timestamp: string;
}

/**
 * Consolidated visual booking stages shown in timelines. The full
 * business state machine is more granular (Draft → Published →
 * Matched → Applied → Negotiating → Offer Accepted → Awaiting
 * Deposit → Confirmed → Vehicle Assigned → Driver Assigned → Loading
 * Completed → Trip Started → In Transit → Delivered → POD Uploaded →
 * Settlement Pending → Completed → Closed) but is grouped here into
 * stages so the prototype stays readable. Note that "Loading
 * Completed" sits before "Trip Started" — this is the real-world
 * gate for releasing the Loading Advance milestone (see
 * SettlementMilestone) before the driver departs.
 */
export type BookingStage =
  | 'Offer Accepted'
  | 'Awaiting Deposit'
  | 'Confirmed'
  | 'Vehicle Assigned'
  | 'Driver Assigned'
  | 'Loading Completed'
  | 'Trip Started'
  | 'Settlement Pending'
  | 'Completed'
  | 'Cancelled';

export interface BookingTimelineEvent {
  stage: BookingStage;
  completed: boolean;
  timestamp?: string;
}

export type DepositPartyStatus = 'Pending' | 'Paid';

/** One side's mutual Booking Security Deposit, held in TransportSeva's escrow. */
export interface BookingDeposit {
  role: PortalRole;
  partyName: string;
  amount: string;
  status: DepositPartyStatus;
  paidAt?: string;
}

export type EscrowStatus = 'Awaiting Deposits' | 'Locked' | 'Released';

export type VehicleAssignmentMode = 'Own Fleet' | 'Subcontracted';

export interface BookingVehicleAssignment {
  mode: VehicleAssignmentMode;
  vehicleRegNumber: string;
  subcontractedTo?: string;
  assignedAt: string;
}

export interface BookingDriverAssignment {
  driverName: string;
  driverPhone?: string;
  assignedAt: string;
}

export interface BookingSettlement {
  freightAmount: string;
  commission: string;
  payoutAmount: string;
  depositsReleased: boolean;
  settledAt?: string;
}

export type SettlementMilestoneStatus = 'Pending' | 'Released';

/**
 * A single payment milestone in a booking's Settlement Plan.
 * TransportSeva does not model payments as one lump sum — real
 * transport deals commonly split freight into a Loading Advance
 * (diesel/toll/driver expenses, released once loading is confirmed),
 * an optional Mid-Trip Payment (e.g. on reaching a geofence
 * checkpoint), and a Final Settlement (released once POD is
 * approved). The Booking Security Deposit (see BookingDeposit) is
 * separate — it is a mutual commitment deposit, not part of the
 * freight itself.
 */
export interface SettlementMilestone {
  id: string;
  label: string;
  /** Human-readable description of what unlocks this milestone, e.g. "Released after loading is completed and confirmed". */
  trigger: string;
  amount: string;
  status: SettlementMilestoneStatus;
  releasedAt?: string;
}

export interface MarketplaceBooking {
  id: string;
  bookingId: string;
  loadId: string;
  applicationId: string;
  route: string;
  material: string;
  ownerRole: PortalRole;
  ownerName: string;
  counterpartyRole: PortalRole;
  counterpartyName: string;
  vehicleRegNumber: string;
  /** Final freight amount agreed through negotiation. */
  amount: string;
  status: BookingStage;
  timeline: BookingTimelineEvent[];
  ownerDeposit: BookingDeposit;
  counterpartyDeposit: BookingDeposit;
  escrowStatus: EscrowStatus;
  vehicleAssignment?: BookingVehicleAssignment;
  driverAssignment?: BookingDriverAssignment;
  /** The freight Settlement Plan — Loading Advance, optional Mid-Trip Payment(s), Final Settlement. */
  settlementPlan: SettlementMilestone[];
  settlement?: BookingSettlement;
  dispute?: BookingDispute;
}

export interface BookingDispute {
  reference: string;
  reason: string;
  raisedBy: string;
  status: 'Open' | 'Under Review' | 'Resolved';
  raisedAt: string;
}
