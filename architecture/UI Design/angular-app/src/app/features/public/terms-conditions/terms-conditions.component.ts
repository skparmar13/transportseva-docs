import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.scss',
})
export class TermsConditionsComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly cms = inject(CmsMockService);
  private readonly language = inject(LanguageService);
  protected readonly managedPage = computed(() => this.cms.publishedPage('Terms & conditions', this.language.lang() === 'hi' ? 'Hindi' : 'English'));

  ngOnInit(): void {
    this.seo.update({
      title: 'Terms & Conditions | TransportSeva',
      description:
        'The terms governing use of the TransportSeva platform: eligibility, bookings, payments, user responsibilities, liability, termination and governing law.',
      url: '/terms-conditions',
    });
  }
}
