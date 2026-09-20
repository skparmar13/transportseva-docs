import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: 'Public website';
  status: 'Subscribed' | 'Unsubscribed';
}

@Injectable({ providedIn: 'root' })
export class NewsletterMockService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = signal<NewsletterSubscriber[]>([]);
  readonly subscribers = this.state.asReadonly();
  readonly activeSubscribers = computed(() => this.state().filter((subscriber) => subscriber.status === 'Subscribed'));

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem('transportseva.newsletter.v1');
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.every((item) => this.isSubscriber(item))) this.state.set(parsed);
        }
      } catch { /* fall back to an empty list if browser storage is unavailable */ }
    }
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      try { localStorage.setItem('transportseva.newsletter.v1', JSON.stringify(this.state())); } catch { /* preserve in-memory prototype behavior */ }
    });
  }

  subscribe(email: string): 'added' | 'exists' {
    const normalized = email.trim().toLowerCase();
    const existing = this.state().find((subscriber) => subscriber.email.toLowerCase() === normalized);
    if (existing) {
      if (existing.status === 'Unsubscribed') {
        this.state.update((items) => items.map((item) => item.id === existing.id ? { ...item, status: 'Subscribed', subscribedAt: new Date().toLocaleString() } : item));
        return 'added';
      }
      return 'exists';
    }
    this.state.update((items) => [{ id: `NEWS-${Date.now()}`, email: normalized, subscribedAt: new Date().toLocaleString(), source: 'Public website', status: 'Subscribed' }, ...items]);
    return 'added';
  }

  setStatus(id: string, status: NewsletterSubscriber['status']): void { this.state.update((items) => items.map((item) => item.id === id ? { ...item, status } : item)); }
  remove(id: string): void { this.state.update((items) => items.filter((item) => item.id !== id)); }

  private isSubscriber(value: unknown): value is NewsletterSubscriber {
    if (!value || typeof value !== 'object') return false;
    const item = value as NewsletterSubscriber;
    return typeof item.id === 'string' && typeof item.email === 'string' && typeof item.subscribedAt === 'string'
      && item.source === 'Public website' && ['Subscribed', 'Unsubscribed'].includes(item.status);
  }
}
