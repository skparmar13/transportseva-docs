import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.scss',
})
export class HelpCenterComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'TransportSeva Help Center | Bookings, Payments & Support FAQs',
      description:
        'Find answers on booking shipments, live tracking, payments, becoming a transporter partner, cancellations and transit insurance on the TransportSeva Help Center.',
      url: '/help-center',
    });
  }

  protected readonly categories = signal([
    { id: 'track-card', icon: 'i-box', titleKey: 'helpCenter.cat1.title', countKey: 'helpCenter.cat1.count' },
    { id: 'rate-card', icon: 'i-credit-card', titleKey: 'helpCenter.cat2.title', countKey: 'helpCenter.cat2.count' },
    { id: 'toll-card', icon: 'i-truck', titleKey: 'helpCenter.cat3.title', countKey: 'helpCenter.cat3.count' },
    { id: 'api-card', icon: 'i-headphones', titleKey: 'helpCenter.cat4.title', countKey: 'helpCenter.cat4.count' },
  ]);
  protected readonly faqs = signal([
    { qKey: 'helpCenter.faq.q1', aKey: 'helpCenter.faq.a1', open: true },
    { qKey: 'helpCenter.faq.q2', aKey: 'helpCenter.faq.a2', open: false },
    { qKey: 'helpCenter.faq.q3', aKey: 'helpCenter.faq.a3', open: false },
    { qKey: 'helpCenter.faq.q4', aKey: 'helpCenter.faq.a4', open: false },
    { qKey: 'helpCenter.faq.q5', aKey: 'helpCenter.faq.a5', open: false },
    { qKey: 'helpCenter.faq.q6', aKey: 'helpCenter.faq.a6', open: false },
  ]);
}
