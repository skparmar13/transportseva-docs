import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { LanguageService } from '../../../core/i18n/language.service';

interface BlogPostView {
  id?: string;
  tagKey: string;
  date: string;
  authorKey: string;
  readKey: string;
  titleKey: string;
  descKey: string;
  imageUrl?: string;
  imageAlt?: string;
}

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
  private readonly cms = inject(CmsMockService);
  private readonly language = inject(LanguageService);
  protected readonly categories = [
    { value: 'All', labelKey: 'blog.filterAll' },
    { value: 'Industry', labelKey: 'blog.filterIndustry' },
    { value: 'Guides', labelKey: 'blog.filterGuides' },
    { value: 'Product', labelKey: 'blog.filterProduct' },
    { value: 'Company News', labelKey: 'blog.filterCompanyNews' },
  ];
  protected readonly activeCategory = signal('All');
  protected readonly currentPage = signal(1);

  ngOnInit(): void {
    this.seo.update({
      title: 'TransportSeva Blog | Logistics, Freight & Technology Insights',
      description:
        'News, guides and stories on Indian road freight, GST invoicing, GPS tracking, AI route optimization and product updates from the TransportSeva team.',
      url: '/blog',
    });
  }

  private readonly defaultPosts = signal<BlogPostView[]>([
    { tagKey: 'blog.post1.tag', date: '12 Jan 2026', authorKey: 'blog.author.neha', readKey: 'blog.readTime.6', titleKey: 'blog.post1.title', descKey: 'blog.post1.desc' },
    { tagKey: 'blog.post2.tag', date: '02 Jan 2026', authorKey: 'blog.author.rajesh', readKey: 'blog.readTime.4', titleKey: 'blog.post2.title', descKey: 'blog.post2.desc' },
    { tagKey: 'blog.post3.tag', date: '27 Dec 2025', authorKey: 'blog.author.aman', readKey: 'blog.readTime.8', titleKey: 'blog.post3.title', descKey: 'blog.post3.desc' },
    { tagKey: 'blog.post4.tag', date: '18 Dec 2025', authorKey: 'blog.author.sunita', readKey: 'blog.readTime.3', titleKey: 'blog.post4.title', descKey: 'blog.post4.desc' },
    { tagKey: 'blog.post5.tag', date: '05 Dec 2025', authorKey: 'blog.author.neha', readKey: 'blog.readTime.5', titleKey: 'blog.post5.title', descKey: 'blog.post5.desc' },
    { tagKey: 'blog.post6.tag', date: '22 Nov 2025', authorKey: 'blog.author.rajesh', readKey: 'blog.readTime.6', titleKey: 'blog.post6.title', descKey: 'blog.post6.desc' },
  ]);
  protected readonly posts = computed<BlogPostView[]>(() => {
    const selectedLanguage = this.language.lang() === 'hi' ? 'Hindi' : 'English';
    const managed = this.cms.publishedBlogPosts().filter((post) => post.language === selectedLanguage);
    if (!managed.length && selectedLanguage === 'Hindi') return this.defaultPosts();
    return managed.map((post) => ({ id: post.id, tagKey: post.section, date: post.updated, authorKey: post.author, readKey: '5 min read', titleKey: post.title, descKey: post.summary || post.body, imageUrl: post.featuredImageUrl, imageAlt: post.imageAlt }));
  });
  protected readonly filteredPosts = computed(() => {
    const category = this.activeCategory();
    return category === 'All' ? this.posts() : this.posts().filter((post) => this.language.translate(post.tagKey).toLowerCase() === category.toLowerCase());
  });
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredPosts().length / 6)));
  protected readonly pageNumbers = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index + 1));
  protected readonly visiblePosts = computed(() => this.filteredPosts().slice((this.currentPage() - 1) * 6, this.currentPage() * 6));

  protected setCategory(category: string): void { this.activeCategory.set(category); this.currentPage.set(1); }
  protected setPage(page: number): void { if (page >= 1 && page <= this.pageCount()) this.currentPage.set(page); }
}
