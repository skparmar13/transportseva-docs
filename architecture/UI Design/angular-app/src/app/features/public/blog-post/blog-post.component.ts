import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageService } from '../../../core/i18n/language.service';
import { SeoService } from '../../../core/seo/seo.service';
import { CmsMockService } from '../../../core/services/cms-mock.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly cms = inject(CmsMockService);

  protected shareLink(network: 'facebook' | 'x' | 'linkedin'): string {
    const pageUrl = typeof window === 'undefined' ? '' : encodeURIComponent(window.location.href);
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
      x: `https://twitter.com/intent/tweet?url=${pageUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
    };
    return shareUrls[network];
  }
  private readonly selectedPostId = signal(this.route.snapshot.queryParamMap.get('id'));
  protected readonly managedPost = computed(() => {
    const selectedLanguage = this.language.lang() === 'hi' ? 'Hindi' : 'English';
    return this.cms.publishedBlogPosts().find((post) => post.id === this.selectedPostId() && post.language === selectedLanguage) ?? null;
  });
  private readonly managedPostSeo = effect(() => {
    const post = this.managedPost();
    if (post) this.seo.update({ title: post.seoTitle?.trim() || `${post.title} | TransportSeva Blog`, description: post.seoDescription?.trim() || post.summary, url: `/blog-post?id=${post.id}`, type: 'article' });
  });

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
    this.route.queryParamMap.subscribe((params) => this.selectedPostId.set(params.get('id')));
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
