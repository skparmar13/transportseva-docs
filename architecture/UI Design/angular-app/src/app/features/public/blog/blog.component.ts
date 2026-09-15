import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'TransportSeva Blog | Logistics, Freight & Technology Insights',
      description:
        'News, guides and stories on Indian road freight, GST invoicing, GPS tracking, AI route optimization and product updates from the TransportSeva team.',
      url: '/blog',
    });
  }

  protected readonly posts = signal([
    { tagKey: 'blog.post1.tag', date: '12 Jan 2026', authorKey: 'blog.author.neha', readKey: 'blog.readTime.6', titleKey: 'blog.post1.title', descKey: 'blog.post1.desc' },
    { tagKey: 'blog.post2.tag', date: '02 Jan 2026', authorKey: 'blog.author.rajesh', readKey: 'blog.readTime.4', titleKey: 'blog.post2.title', descKey: 'blog.post2.desc' },
    { tagKey: 'blog.post3.tag', date: '27 Dec 2025', authorKey: 'blog.author.aman', readKey: 'blog.readTime.8', titleKey: 'blog.post3.title', descKey: 'blog.post3.desc' },
    { tagKey: 'blog.post4.tag', date: '18 Dec 2025', authorKey: 'blog.author.sunita', readKey: 'blog.readTime.3', titleKey: 'blog.post4.title', descKey: 'blog.post4.desc' },
    { tagKey: 'blog.post5.tag', date: '05 Dec 2025', authorKey: 'blog.author.neha', readKey: 'blog.readTime.5', titleKey: 'blog.post5.title', descKey: 'blog.post5.desc' },
    { tagKey: 'blog.post6.tag', date: '22 Nov 2025', authorKey: 'blog.author.rajesh', readKey: 'blog.readTime.6', titleKey: 'blog.post6.title', descKey: 'blog.post6.desc' },
  ]);
}
