import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language.service';
import { SeoService } from '../../../core/seo/seo.service';

interface LoadedPost {
  tagKey: string;
  date: string;
  authorKey: string;
  readKey: string;
  titleKey: string;
  descKey: string;
  image?: string;
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss',
})
export class BlogPostComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly language = inject(LanguageService);

  /** The active post being displayed on this route. In production this would come
   * from a route param + API/CMS lookup; today we hardcode "post 1" but keep the
   * SEO wiring dynamic so title/description/image trace back to the loaded post. */
  protected readonly post = signal<LoadedPost>({
    tagKey: 'blog.post1.tag',
    date: '12 Jan 2026',
    authorKey: 'blog.author.neha',
    readKey: 'blog.readTime.6',
    titleKey: 'blog.post1.title',
    descKey: 'blog.post1.desc',
    image: '/images/blog/post-1-hero.jpg',
  });

  ngOnInit(): void {
    const p = this.post();
    const title = this.language.translate(p.titleKey);
    const description = this.language.translate(p.descKey);
    this.seo.update({
      title: `${title} | TransportSeva Blog`,
      description,
      url: '/blog-post',
      image: p.image,
      type: 'article',
    });
  }

  protected readonly relatedPosts = signal([
    { tagKey: 'blog.post3.tag', date: '27 Dec 2025', titleKey: 'blog.post3.title' },
    { tagKey: 'blog.post4.tag', date: '18 Dec 2025', titleKey: 'blog.post4.title' },
    { tagKey: 'blog.post5.tag', date: '05 Dec 2025', titleKey: 'blog.post5.title' },
  ]);
}
