import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { LanguageService, TranslatePipe } from '../../../core/i18n';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { NewsletterMockService } from '../../../core/services/newsletter-mock.service';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.scss',
})
export class PublicShellComponent {
  protected readonly language = inject(LanguageService);
  private readonly cms = inject(CmsMockService);
  private readonly newsletter = inject(NewsletterMockService);
  protected readonly dismissedAnnouncementId = signal<string | null>(null);
  protected readonly announcement = computed(() => {
    const selectedLanguage = this.language.lang() === 'hi' ? 'Hindi' : 'English';
    return this.cms.publishedAnnouncements().find((item) => item.language === selectedLanguage && item.id !== this.dismissedAnnouncementId());
  });
  protected readonly mobileMenuOpen = signal(false);
  protected readonly newsletterEmail = signal('');
  protected readonly newsletterSubscribed = signal(false);
  protected readonly newsletterMessage = signal('');

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected submitNewsletter(): void {
    const result = this.newsletter.subscribe(this.newsletterEmail());
    this.newsletterSubscribed.set(true);
    this.newsletterMessage.set(result === 'added' ? 'footer.newsletter.success' : 'footer.newsletter.exists');
    this.newsletterEmail.set('');
  }
}
