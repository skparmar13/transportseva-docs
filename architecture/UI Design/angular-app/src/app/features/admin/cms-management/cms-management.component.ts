import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/i18n';
import { CmsContent, CmsContentType, CmsLanguage, CmsMockService } from '../../../core/services/cms-mock.service';

@Component({ selector: 'app-cms-management', standalone: true, imports: [FormsModule, ModalComponent, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './cms-management.component.html' })
export class CmsManagementComponent {
  private readonly cms = inject(CmsMockService);
  protected readonly items = this.cms.content;
  protected readonly typeFilter = signal<'All' | CmsContentType>('All');
  protected readonly statusFilter = signal<'All' | 'Published' | 'Draft'>('All');
  protected readonly languageFilter = signal<'All' | CmsLanguage>('All');
  protected readonly searchTerm = signal('');
  protected readonly filtered = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    return this.items().filter((item) => (this.typeFilter() === 'All' || item.type === this.typeFilter())
      && (this.statusFilter() === 'All' || item.status === this.statusFilter())
      && (this.languageFilter() === 'All' || item.language === this.languageFilter())
      && (!query || `${item.title} ${item.summary} ${item.author} ${item.section}`.toLocaleLowerCase().includes(query)));
  });
  protected readonly publishedCount = computed(() => this.items().filter((item) => item.status === 'Published').length);
  protected readonly editing = signal<CmsContent | null>(null);
  protected readonly linkPanelOpen = signal(false);
  protected readonly linkUrl = signal('');
  protected readonly previewMode = signal(false);
  protected readonly form = signal({ type: 'Blog Post' as CmsContentType, language: 'English' as CmsLanguage, title: '', summary: '', body: '', author: '', attribution: '', section: 'Industry', featuredImageUrl: '', imageAlt: '', seoTitle: '', seoDescription: '' });
  protected readonly types: CmsContentType[] = ['Testimonial', 'Blog Post', 'Public Page', 'Announcement', 'Help Article'];
  protected readonly pageSections = ['About page', 'Contact page', 'Privacy policy', 'Terms & conditions', 'Refund policy'];
  protected readonly blogCategories = ['Industry', 'Guides', 'Product', 'Company News'];
  protected update(field: 'type' | 'language' | 'title' | 'summary' | 'body' | 'author' | 'attribution' | 'section' | 'featuredImageUrl' | 'imageAlt' | 'seoTitle' | 'seoDescription', value: string): void {
    this.form.update((form) => field === 'type' ? { ...form, type: value as CmsContentType, section: value === 'Public Page' ? 'About page' : value === 'Blog Post' ? 'Industry' : value === 'Testimonial' ? 'Home page' : value === 'Announcement' ? 'Announcement' : 'Guides' }
      : field === 'language' ? { ...form, language: value as CmsLanguage }
      : { ...form, [field]: value });
  }
  protected updateBody(event: Event): void { this.update('body', (event.target as HTMLElement).innerHTML); }
  protected format(command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList' | 'formatBlock', value?: string): void {
    document.execCommand(command, false, value);
  }
  protected openLinkPanel(): void { this.linkPanelOpen.set(true); }
  protected togglePreview(): void { this.previewMode.update((preview) => !preview); }
  protected insertLink(): void {
    const url = this.linkUrl().trim();
    if (!/^(https?:\/\/|mailto:)/i.test(url)) return;
    document.execCommand('createLink', false, url);
    this.linkUrl.set('');
    this.linkPanelOpen.set(false);
  }
  protected create(): void { this.previewMode.set(false); this.form.set({ type: 'Blog Post', language: 'English', title: '', summary: '', body: '', author: '', attribution: '', section: 'Industry', featuredImageUrl: '', imageAlt: '', seoTitle: '', seoDescription: '' }); this.editing.set({ id: '', type: 'Blog Post', language: 'English', title: '', summary: '', body: '', author: '', attribution: '', section: '', updated: '', status: 'Draft' }); }
  protected edit(item: CmsContent): void { this.previewMode.set(false); this.form.set({ type: item.type, language: item.language, title: item.title, summary: item.summary, body: item.body, author: item.author, attribution: item.attribution, section: item.section, featuredImageUrl: item.featuredImageUrl ?? '', imageAlt: item.imageAlt ?? '', seoTitle: item.seoTitle ?? '', seoDescription: item.seoDescription ?? '' }); this.editing.set(item); }
  protected save(): void {
    const current = this.editing(); const form = this.form();
    if (!current || !form.title.trim() || !form.body.trim()) return;
    this.cms.save({ id: current.id || `CMS-${Date.now()}`, ...form, title: form.title.trim(), summary: form.summary.trim(), body: form.body.trim(), author: form.author.trim(), attribution: form.attribution.trim(), status: current.id ? current.status : 'Draft' });
    this.editing.set(null);
    this.previewMode.set(false);
  }
  protected toggle(item: CmsContent): void { this.cms.toggle(item.id); }
  protected remove(item: CmsContent): void { this.cms.remove(item.id); }
}
