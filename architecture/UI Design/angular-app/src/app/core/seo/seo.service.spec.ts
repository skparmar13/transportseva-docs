import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let meta: Meta;
  let title: Title;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    seo = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
    title = TestBed.inject(Title);
    document = TestBed.inject(DOCUMENT);
  });

  it('sets page title, description, social metadata, and a page-specific canonical URL', () => {
    seo.update({ title: 'Freight Pricing | TransportSeva', description: 'Compare freight plans.', url: '/pricing' });

    expect(title.getTitle()).toBe('Freight Pricing | TransportSeva');
    expect(meta.getTag('name="description"')?.content).toBe('Compare freight plans.');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://www.transportseva.com/pricing');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.transportseva.com/pricing');
    expect(meta.getTag('property="og:image"')?.content).toBe('https://www.transportseva.com/images/hero-truck.png');
    expect(meta.getTag('name="robots"')?.content).toBe('index,follow');
  });

  it('can keep private routes out of search results', () => {
    seo.setIndexable(false);
    expect(meta.getTag('name="robots"')?.content).toBe('noindex,nofollow');
  });
});
