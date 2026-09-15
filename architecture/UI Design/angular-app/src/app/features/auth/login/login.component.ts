import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { TranslatePipe } from '../../../core/i18n';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthMockService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly identifier = signal('');
  protected readonly password = signal('');
  protected readonly rememberMe = signal(true);
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected submit(): void {
    this.submitting.set(true);
    this.auth.login(this.identifier(), this.password()).subscribe((workspaces) => {
      this.submitting.set(false);
      if (workspaces.length > 1) {
        this.router.navigate(['/auth/workspace-selection']);
      } else {
        this.session.setRole(workspaces[0].role);
        this.router.navigate([this.session.portal().basePath, 'dashboard']);
      }
    });
  }
}
