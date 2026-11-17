import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { LanguageService, TranslatePipe } from '../../../core/i18n';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { NewsletterSignupComponent } from '../../../features/public/newsletter/newsletter-signup.component';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent, TranslatePipe, NewsletterSignupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.scss',
})
export class PublicShellComponent {
  protected readonly language = inject(LanguageService);
  private readonly cms = inject(CmsMockService);
  protected readonly dismissedAnnouncementId = signal<string | null>(null);
  protected readonly announcement = computed(() => {
    const selectedLanguage = this.language.lang() === 'hi' ? 'Hindi' : 'English';
    return this.cms.publishedAnnouncements().find((item) => item.language === selectedLanguage && item.id !== this.dismissedAnnouncementId());
  });
  protected readonly mobileMenuOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

}
