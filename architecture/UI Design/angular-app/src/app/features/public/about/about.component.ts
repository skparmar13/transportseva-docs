import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly cms = inject(CmsMockService);
  private readonly language = inject(LanguageService);
  protected readonly managedPage = computed(() => this.cms.publishedPage('About page', this.language.lang() === 'hi' ? 'Hindi' : 'English'));

  ngOnInit(): void {
    this.seo.update({
      title: 'About TransportSeva | Building India\'s Trusted Freight Network',
      description:
        'Learn how TransportSeva connects shippers, transporters and drivers across 28 states with live tracking, digital PODs and 24x7 support since 2019.',
      url: '/about',
    });
  }

  protected readonly values = signal([
    { icon: 'i-target', titleKey: 'about.value1.title', descKey: 'about.value1.desc' },
    { icon: 'i-shield', titleKey: 'about.value2.title', descKey: 'about.value2.desc' },
    { icon: 'i-users', titleKey: 'about.value3.title', descKey: 'about.value3.desc' },
    { icon: 'i-trending-up', titleKey: 'about.value4.title', descKey: 'about.value4.desc' },
  ]);
  protected readonly team = signal([
    { initials: 'RK', name: 'Rajesh Kumar', roleKey: 'about.team.ceo' },
    { initials: 'SP', name: 'Sunita Pillai', roleKey: 'about.team.coo' },
    { initials: 'AV', name: 'Aman Verma', roleKey: 'about.team.cto' },
    { initials: 'NM', name: 'Neha Mehta', roleKey: 'about.team.chead' },
  ]);
}
