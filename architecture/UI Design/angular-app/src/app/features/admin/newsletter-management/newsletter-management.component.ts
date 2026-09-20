import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n';
import { NewsletterMockService, NewsletterSubscriber } from '../../../core/services/newsletter-mock.service';

@Component({
  selector: 'app-newsletter-management',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './newsletter-management.component.html',
})
export class NewsletterManagementComponent {
  private readonly newsletter = inject(NewsletterMockService);
  protected readonly subscribers = this.newsletter.subscribers;
  protected readonly query = signal('');
  protected readonly statusFilter = signal<'All' | NewsletterSubscriber['status']>('All');
  protected readonly activeCount = computed(() => this.subscribers().filter((subscriber) => subscriber.status === 'Subscribed').length);
  protected readonly unsubscribedCount = computed(() => this.subscribers().filter((subscriber) => subscriber.status === 'Unsubscribed').length);
  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.subscribers().filter((subscriber) => (this.statusFilter() === 'All' || subscriber.status === this.statusFilter())
      && (!query || `${subscriber.email} ${subscriber.source}`.toLowerCase().includes(query)));
  });

  protected toggleStatus(subscriber: NewsletterSubscriber): void {
    this.newsletter.setStatus(subscriber.id, subscriber.status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed');
  }
  protected remove(subscriber: NewsletterSubscriber): void {
    if (globalThis.confirm(`Permanently remove ${subscriber.email} from the prototype subscriber list?`)) this.newsletter.remove(subscriber.id);
  }
}
