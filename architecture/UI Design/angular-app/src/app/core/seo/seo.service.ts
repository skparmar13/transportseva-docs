import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoData {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
}

const SITE_URL = 'https://www.transportseva.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-cover.png`;

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly doc: Document,
  ) {}

  update(data: SeoData): void {
    const url = data.url ? this.absolute(data.url) : SITE_URL;
    const image = data.image ? this.absolute(data.image) : DEFAULT_IMAGE;
    const type = data.type ?? 'website';

    this.title.setTitle(data.title);
    this.meta.updateTag({ name: 'description', content: data.description });

    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
  }

  setJsonLd(id: string, payload: Record<string, unknown>): void {
    const head = this.doc.head;
    if (!head) {
      return;
    }
    let script = this.doc.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script') as HTMLScriptElement;
      script.type = 'application/ld+json';
      script.id = id;
      head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload);
  }

  private setCanonical(url: string): void {
    const head = this.doc.head;
    if (!head) {
      return;
    }
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private absolute(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
