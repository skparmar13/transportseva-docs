import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { CareersMockService } from '../../../core/services/careers-mock.service';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './careers.component.html',
  styleUrl: './careers.component.scss',
})
export class CareersComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly careers = inject(CareersMockService);
  protected readonly language = inject(LanguageService);
  protected readonly jobs = this.careers.publishedJobs;
  protected readonly departmentFilter = signal('All');
  protected readonly locationFilter = signal('All');
  protected readonly departments = computed(() => [...new Set(this.jobs().map((job) => job.department))].sort());
  protected readonly locations = computed(() => [...new Set(this.jobs().map((job) => job.location))].sort());
  protected readonly visibleJobs = computed(() => this.jobs().filter((job) => (this.departmentFilter() === 'All' || job.department === this.departmentFilter()) && (this.locationFilter() === 'All' || job.location === this.locationFilter())));

  ngOnInit(): void {
    this.seo.update({
      title: 'Careers at TransportSeva | Build the Future of Indian Freight',
      description:
        'Join TransportSeva as an engineer, product manager, designer or operator. Open roles across Noida, Delhi NCR, Bengaluru and remote — with great perks and growth.',
      url: '/careers',
    });
  }

  protected readonly perks = signal([
    { icon: 'i-heart', titleKey: 'careers.perk1.title', descKey: 'careers.perk1.desc' },
    { icon: 'i-award', titleKey: 'careers.perk2.title', descKey: 'careers.perk2.desc' },
    { icon: 'i-coffee', titleKey: 'careers.perk3.title', descKey: 'careers.perk3.desc' },
    { icon: 'i-trending-up', titleKey: 'careers.perk4.title', descKey: 'careers.perk4.desc' },
  ]);
  protected localized(value: { en: string; hi: string }): string { return value[this.language.lang()] || value.en; }
}
