import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';

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
  protected readonly jobs = signal([
    { titleKey: 'careers.job1.title', deptKey: 'careers.dept.engineering', locKey: 'careers.location.noida', typeKey: 'careers.type.fullTime' },
    { titleKey: 'careers.job2.title', deptKey: 'careers.dept.product', locKey: 'careers.location.noida', typeKey: 'careers.type.fullTime' },
    { titleKey: 'careers.job3.title', deptKey: 'careers.dept.sales', locKey: 'careers.location.delhi', typeKey: 'careers.type.fullTime' },
    { titleKey: 'careers.job4.title', deptKey: 'careers.dept.operations', locKey: 'careers.location.remote', typeKey: 'careers.type.fullTime' },
    { titleKey: 'careers.job5.title', deptKey: 'careers.dept.design', locKey: 'careers.location.noida', typeKey: 'careers.type.fullTime' },
    { titleKey: 'careers.job6.title', deptKey: 'careers.dept.data', locKey: 'careers.location.bengaluru', typeKey: 'careers.type.fullTime' },
  ]);
}
