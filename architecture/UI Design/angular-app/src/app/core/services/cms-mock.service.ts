import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type CmsContentType = 'Testimonial' | 'Blog Post' | 'Public Page' | 'Announcement' | 'Help Article';
export type CmsLanguage = 'English' | 'Hindi';
export interface CmsContent {
  id: string; type: CmsContentType; language: CmsLanguage; title: string; summary: string; body: string;
  author: string; attribution: string; section: string; updated: string; status: 'Published' | 'Draft';
  featuredImageUrl?: string; imageAlt?: string;
  seoTitle?: string; seoDescription?: string;
}

@Injectable({ providedIn: 'root' })
export class CmsMockService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly contentState = signal<CmsContent[]>([
    { id: 'CMS-T01', type: 'Testimonial', language: 'English', title: 'Rakesh Sharma', summary: 'Logistics Manager, ABC Pvt. Ltd.', body: 'TransportSeva has simplified our logistics operations. Real-time tracking and transparent pricing help us serve our customers better.', author: 'Rakesh Sharma', attribution: 'Logistics Manager, ABC Pvt. Ltd.', section: 'Home page', updated: '16 Sep 2026', status: 'Published' },
    { id: 'CMS-T02', type: 'Testimonial', language: 'English', title: 'Vikram Singh', summary: 'Fleet Owner', body: 'A great platform for transporters. We regularly get good loads and payments are always on time.', author: 'Vikram Singh', attribution: 'Fleet Owner', section: 'Home page', updated: '16 Sep 2026', status: 'Published' },
    { id: 'CMS-T03', type: 'Testimonial', language: 'English', title: 'Neha Verma', summary: 'Supply Chain Head, XYZ Corp.', body: 'The best part is live tracking and digital POD. It gives us complete visibility and peace of mind.', author: 'Neha Verma', attribution: 'Supply Chain Head, XYZ Corp.', section: 'Home page', updated: '16 Sep 2026', status: 'Published' },
    { id: 'CMS-B01', type: 'Blog Post', language: 'English', title: 'How AI is Transforming Freight Route Optimization in India', summary: 'Discover how machine learning models help transporters cut fuel costs and delivery times across major freight corridors.', body: 'Route optimization is changing how India moves goods. Transporters can use demand, traffic, and vehicle data to plan more reliable journeys and reduce empty kilometres.', author: 'Neha Mehta', attribution: 'Neha Mehta', section: 'Industry', updated: '12 Jan 2026', status: 'Published' },
    { id: 'CMS-B02', type: 'Blog Post', language: 'English', title: 'TransportSeva Crosses 12 Lakh Shipments Milestone', summary: 'A look at the journey from a small Noida-based startup to a pan-India logistics platform.', body: 'The milestone reflects the work of shippers, transporters, truck owners, and drivers building a more connected freight network.', author: 'Rajesh Kumar', attribution: 'Rajesh Kumar', section: 'Company News', updated: '2 Jan 2026', status: 'Published' },
    { id: 'CMS-P01', type: 'Public Page', language: 'English', title: 'About TransportSeva', summary: 'Building India’s trusted freight network.', body: 'TransportSeva connects shippers, transporters, truck owners and drivers on one transparent platform.', author: 'Content Team', attribution: '', section: 'About page', updated: '16 Sep 2026', status: 'Published' },
    { id: 'CMS-A01', type: 'Announcement', language: 'English', title: 'Monsoon service notice', summary: 'Service advisory for affected freight corridors.', body: 'Please allow additional transit time on routes affected by heavy rainfall and check live trip updates.', author: 'Operations', attribution: '', section: 'Announcement', updated: 'Today', status: 'Draft' },
  ]);
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem('transportseva.cms.v1');
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (this.isCmsContentList(parsed)) this.contentState.set(parsed);
        }
      } catch {
        // Ignore malformed or unavailable browser storage and use the seed data.
      }
    }
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      try {
        localStorage.setItem('transportseva.cms.v1', JSON.stringify(this.contentState()));
      } catch {
        // The in-memory prototype remains usable when storage is blocked or full.
      }
    });
  }

  private isCmsContentList(value: unknown): value is CmsContent[] {
    return Array.isArray(value) && value.every((item) => !!item && typeof item === 'object'
      && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.summary === 'string'
      && typeof item.body === 'string' && typeof item.author === 'string' && typeof item.attribution === 'string'
      && typeof item.section === 'string' && typeof item.updated === 'string'
      && (item.featuredImageUrl === undefined || typeof item.featuredImageUrl === 'string')
      && (item.imageAlt === undefined || typeof item.imageAlt === 'string')
      && (item.seoTitle === undefined || typeof item.seoTitle === 'string')
      && (item.seoDescription === undefined || typeof item.seoDescription === 'string')
      && ['Testimonial', 'Blog Post', 'Public Page', 'Announcement', 'Help Article'].includes(item.type)
      && ['English', 'Hindi'].includes(item.language)
      && ['Published', 'Draft'].includes(item.status));
  }
  readonly content = this.contentState.asReadonly();
  readonly publishedTestimonials = computed(() => this.contentState().filter((item) => item.type === 'Testimonial' && item.status === 'Published'));
  readonly publishedBlogPosts = computed(() => this.contentState().filter((item) => item.type === 'Blog Post' && item.status === 'Published'));
  readonly publishedHelpArticles = computed(() => this.contentState().filter((item) => item.type === 'Help Article' && item.status === 'Published'));
  readonly publishedAnnouncements = computed(() => this.contentState().filter((item) => item.type === 'Announcement' && item.status === 'Published'));
  readonly publishedAboutPage = computed(() => this.contentState().find((item) => item.type === 'Public Page' && item.section === 'About page' && item.status === 'Published'));

  publishedPage(section: string, language: CmsLanguage): CmsContent | undefined {
    return this.contentState().find((item) => item.type === 'Public Page' && item.section === section && item.status === 'Published' && item.language === language);
  }

  save(item: Omit<CmsContent, 'updated'> & { updated?: string }): void {
    const saved: CmsContent = { ...item, updated: item.updated ?? 'Today' };
    this.contentState.update((items) => items.some((current) => current.id === saved.id)
      ? items.map((current) => current.id === saved.id ? saved : current)
      : [saved, ...items]);
  }
  toggle(id: string): void { this.contentState.update((items) => items.map((item) => item.id === id ? { ...item, status: item.status === 'Published' ? 'Draft' : 'Published', updated: 'Today' } : item)); }
  remove(id: string): void { this.contentState.update((items) => items.filter((item) => item.id !== id)); }
}
