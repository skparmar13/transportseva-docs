import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly cms = inject(CmsMockService);
  private readonly language = inject(LanguageService);
  protected readonly managedPage = computed(() => this.cms.publishedPage('Privacy policy', this.language.lang() === 'hi' ? 'Hindi' : 'English'));

  ngOnInit(): void {
    this.seo.update({
      title: 'Privacy Policy | TransportSeva',
      description:
        'How TransportSeva collects, uses, shares and protects your personal data — including account info, shipment details, location data, cookies and your rights.',
      url: '/privacy-policy',
    });
  }
}
