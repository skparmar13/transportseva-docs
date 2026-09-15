import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { SUBSCRIPTION_PLANS, type PlanTier } from '../../../core/data/subscription-plans';

interface DisplayPlan {
  tier: PlanTier;
  nameKey: string;
  taglineKey: string;
  price: string;
  priceKey?: string;
  priceNoteKey: string;
  suitableKeys: string[];
  featureKeys: string[];
  limitKeys: string[];
  inheritsFrom?: PlanTier;
  highlighted?: boolean;
  ctaKey: string;
  showPeriod: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'TransportSeva Pricing | Free Starter, Pro & Enterprise Plans',
      description:
        'Start free and pay commission only when you get a booking. Upgrade to Professional for GPS tracking and fleet tools, or contact us for Enterprise pricing.',
      url: '/pricing',
    });
  }

  protected readonly plans = signal<DisplayPlan[]>([
    {
      tier: 'starter',
      nameKey: 'pricing.plan.starter.name',
      taglineKey: 'pricing.plan.starter.tagline',
      price: '₹0',
      priceNoteKey: 'pricing.plan.starter.priceNote',
      suitableKeys: [
        'pricing.suitable.shippers',
        'pricing.suitable.transporters',
        'pricing.suitable.truckOwners',
        'pricing.suitable.fleetOwners',
      ],
      featureKeys: Array.from({ length: 12 }, (_, i) => `pricing.feat.starter.${i + 1}`),
      limitKeys: Array.from({ length: 7 }, (_, i) => `pricing.limit.starter.${i + 1}`),
      ctaKey: 'pricing.plan.starter.cta',
      showPeriod: false,
    },
    {
      tier: 'professional',
      nameKey: 'pricing.plan.professional.name',
      taglineKey: 'pricing.plan.professional.tagline',
      price: '₹2,499',
      priceNoteKey: 'pricing.plan.professional.priceNote',
      suitableKeys: [
        'pricing.suitable.growingFleetOwners',
        'pricing.suitable.transportCompanies',
        'pricing.suitable.mediumBusinesses',
      ],
      featureKeys: Array.from({ length: 14 }, (_, i) => `pricing.feat.pro.${i + 1}`),
      limitKeys: [],
      inheritsFrom: 'starter',
      highlighted: true,
      ctaKey: 'pricing.plan.professional.cta',
      showPeriod: true,
    },
    {
      tier: 'enterprise',
      nameKey: 'pricing.plan.enterprise.name',
      taglineKey: 'pricing.plan.enterprise.tagline',
      price: 'Custom',
      priceKey: 'pricing.plan.enterprise.price',
      priceNoteKey: 'pricing.plan.enterprise.priceNote',
      suitableKeys: ['Tata Steel', 'Ultratech', 'JK Cement', 'Amazon', 'Delhivery'],
      featureKeys: Array.from({ length: 11 }, (_, i) => `pricing.feat.ent.${i + 1}`),
      limitKeys: [],
      inheritsFrom: 'professional',
      ctaKey: 'pricing.plan.enterprise.cta',
      showPeriod: false,
    },
  ]);

  /** Kept only so any external consumer of SUBSCRIPTION_PLANS stays type-referenced. */
  protected readonly _rawPlans = SUBSCRIPTION_PLANS;

  protected readonly earningLayers = signal([
    { icon: 'i-percent', titleKey: 'pricing.earning.marketplace.title', descKey: 'pricing.earning.marketplace.desc' },
    { icon: 'i-map', titleKey: 'pricing.earning.operations.title', descKey: 'pricing.earning.operations.desc' },
    { icon: 'i-wallet', titleKey: 'pricing.earning.financial.title', descKey: 'pricing.earning.financial.desc' },
  ]);

  protected readonly faqs = signal([
    { qKey: 'pricing.faq.q1', aKey: 'pricing.faq.a1', open: true },
    { qKey: 'pricing.faq.q2', aKey: 'pricing.faq.a2', open: false },
    { qKey: 'pricing.faq.q3', aKey: 'pricing.faq.a3', open: false },
    { qKey: 'pricing.faq.q4', aKey: 'pricing.faq.a4', open: false },
    { qKey: 'pricing.faq.q5', aKey: 'pricing.faq.a5', open: false },
  ]);

  protected inheritsFromKey(tier: PlanTier | undefined): string {
    return tier === 'starter' ? 'pricing.planName.starter' : 'pricing.planName.professional';
  }
}
