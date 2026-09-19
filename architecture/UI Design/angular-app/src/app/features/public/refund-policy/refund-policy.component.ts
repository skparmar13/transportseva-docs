import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-refund-policy',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './refund-policy.component.html',
  styleUrl: './refund-policy.component.scss',
})
export class RefundPolicyComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly cms = inject(CmsMockService);
  private readonly language = inject(LanguageService);
  protected readonly managedPage = computed(() => this.cms.publishedPage('Refund policy', this.language.lang() === 'hi' ? 'Hindi' : 'English'));

  ngOnInit(): void {
    this.seo.update({
      title: 'Refund & Cancellation Policy | TransportSeva',
      description:
        'Learn how TransportSeva handles booking cancellations, refund timelines, non-refundable charges and payment disputes for Full Truck Load, Part Load and Parcel bookings.',
      url: '/refund-policy',
    });
  }
}
