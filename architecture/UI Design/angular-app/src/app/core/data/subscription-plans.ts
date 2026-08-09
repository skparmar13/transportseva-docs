export type PlanTier = 'starter' | 'professional' | 'enterprise';

export interface SubscriptionPlan {
  tier: PlanTier;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  suitableFor: string[];
  /** Own features for this tier. Professional/Enterprise also inherit everything from the tier below (see inheritsFrom). */
  features: string[];
  limits: string[];
  inheritsFrom?: PlanTier;
  highlighted?: boolean;
  ctaLabel: string;
}

/**
 * TransportSeva's commission-first pricing model — shared by the
 * public Pricing page and the Business Settings → Billing "Change
 * Plan" screen, so both surfaces always stay in sync. Starter is
 * free forever; TransportSeva earns via booking commission instead.
 * GPS/AIS-140, live tracking and geofencing are deliberately reserved
 * for Professional+ to create a clear reason to upgrade.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'starter',
    name: 'TransportSeva Starter',
    tagline: 'Start transporting. Pay only when you earn.',
    price: '₹0',
    priceNote: 'Free forever · No card required',
    suitableFor: ['Shippers', 'Transporters', 'Truck Owners', 'Fleet Owners'],
    features: [
      'Free registration',
      'Create business profile',
      'Browse marketplace',
      'Post loads',
      'Apply for loads',
      'Basic in-app chat',
      'Booking management',
      'Basic notifications',
      'Document management',
      'Driver management (limited)',
      'Vehicle management (limited)',
      'Commission only on successful bookings',
    ],
    limits: [
      'Up to 5 vehicles',
      'Up to 5 drivers',
      'Basic dashboard',
      '30-day booking history',
      'Basic reports',
      'Community support',
      'Manual trip tracking (no GPS)',
    ],
    ctaLabel: 'Get Started Free',
  },
  {
    tier: 'professional',
    name: 'TransportSeva Professional',
    tagline: 'Scale your transport business.',
    price: '₹2,499',
    priceNote: 'per month, billed annually · per branch',
    suitableFor: ['Growing fleet owners', 'Transport companies', 'Medium businesses'],
    features: [
      'Unlimited vehicles',
      'Unlimited drivers',
      'AIS-140 GPS integration',
      'Live tracking',
      'Trip replay',
      'Geofencing & alerts',
      'Advanced reports',
      'Route optimization',
      'Team management',
      'Branch management',
      'API access (coming soon)',
      'Priority support',
      'Custom notifications',
      'Export reports',
    ],
    limits: [],
    inheritsFrom: 'starter',
    highlighted: true,
    ctaLabel: 'Upgrade to Professional',
  },
  {
    tier: 'enterprise',
    name: 'TransportSeva Enterprise',
    tagline: 'For large-scale logistics operations.',
    price: 'Custom',
    priceNote: 'Volume-based pricing · Talk to Sales',
    suitableFor: ['Tata Steel', 'Ultratech', 'JK Cement', 'Amazon', 'Delhivery'],
    features: [
      'Multiple branches',
      'Multiple business units',
      'Dedicated account manager',
      'SLA-backed uptime',
      'Custom integrations',
      'ERP integration',
      'Single Sign-On (SSO)',
      'White-label reports',
      'Advanced analytics',
      'AI insights',
      'Audit logs',
    ],
    limits: [],
    inheritsFrom: 'professional',
    ctaLabel: 'Talk to Sales',
  },
];

export const PLAN_BY_TIER: Record<PlanTier, SubscriptionPlan> = {
  starter: SUBSCRIPTION_PLANS[0],
  professional: SUBSCRIPTION_PLANS[1],
  enterprise: SUBSCRIPTION_PLANS[2],
};
