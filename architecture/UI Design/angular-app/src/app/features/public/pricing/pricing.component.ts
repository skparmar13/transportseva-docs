import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SUBSCRIPTION_PLANS } from '../../../core/data/subscription-plans';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  protected readonly plans = signal(SUBSCRIPTION_PLANS);

  /** "How You Actually Earn" — TransportSeva's layered revenue model, shown as a trust/transparency section. */
  protected readonly earningLayers = signal([
    {
      icon: 'i-percent',
      title: 'Marketplace',
      desc: 'Booking commission, featured loads and featured applicants — this is where the free Starter plan pays for itself.',
    },
    {
      icon: 'i-map',
      title: 'Operations',
      desc: 'GPS subscription, fleet management, driver management and advanced reports — unlocked on Professional and above.',
    },
    {
      icon: 'i-wallet',
      title: 'Financial',
      desc: 'Wallet, escrow, settlements, insurance, FASTag, fuel cards and financing — coming soon across all plans.',
    },
  ]);

  protected readonly faqs = signal([
    { question: 'Is the Starter plan really free forever?', answer: 'Yes. There is no time limit and no card is required. TransportSeva earns a small commission only when your booking succeeds — so we only make money when you do.', open: true },
    { question: 'Why is GPS tracking not included in Starter?', answer: 'AIS-140 GPS integration, live tracking, trip replay and geofencing require dedicated device connectivity and infrastructure, so they are part of the Professional plan and above. Starter still supports manual trip status updates.', open: false },
    { question: 'Can I upgrade or downgrade anytime?', answer: 'Yes. You can move between Starter and Professional anytime from Business Settings → Billing. Enterprise plans are set up with our sales team based on your scale and requirements.', open: false },
    { question: 'Is the Professional price per company or per vehicle?', answer: 'Professional is billed per branch, not per vehicle or driver — so you can add unlimited vehicles and drivers under one branch without extra cost.', open: false },
    { question: 'What does Enterprise pricing include?', answer: 'Enterprise is volume-based and tailored to organizations with multiple branches or business units — it includes a dedicated account manager, SLAs, custom/ERP integrations, SSO and advanced analytics.', open: false },
  ]);
}
