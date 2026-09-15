import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { LanguageService, TranslatePipe } from '../../../core/i18n';

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
  protected readonly mobileMenuOpen = signal(false);
  protected readonly newsletterEmail = signal('');
  protected readonly newsletterSubscribed = signal(false);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected submitNewsletter(): void {
    this.newsletterSubscribed.set(true);
    this.newsletterEmail.set('');
  }
}
