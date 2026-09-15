import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { LanguageService, TranslatePipe } from '../../../core/i18n';

/**
 * Split-screen auth layout reused by Login / Signup / OTP /
 * Forgot Password / Business Registration / Workspace Selection /
 * Profile Setup — mirrors `.auth-shell` / `.auth-visual` /
 * `.auth-form-side` from the HTML prototype (theme.css) 1:1.
 * The form itself is projected via <ng-content>.
 */
@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss',
})
export class AuthShellComponent {
  protected readonly language = inject(LanguageService);

  @Input() backLink = '/';
  @Input() backLabel = 'Back to Home';
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() sub = '';
  @Input() visualHeadingLine1 = 'Track every shipment,';
  @Input() visualHeadingLine2 = 'in real time.';
  @Input() visualDescription =
    "Join 50,000+ businesses and drivers who trust TransportSeva for fast, transparent and reliable logistics across India.";
  @Input() visualImage = 'images/hero-truck.png';
  @Input() showStats = true;
  @Input() wide = false;
}
