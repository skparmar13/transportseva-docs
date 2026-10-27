import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthMockService, MockPlatformStaff } from '../../../core/services/auth-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { TranslatePipe } from '../../../core/i18n';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiAuthService } from '../../../core/api/api-auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [FormsModule, AuthShellComponent, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './staff-login.component.html',
  styleUrl: './staff-login.component.scss',
})
export class StaffLoginComponent {
  private readonly auth = inject(AuthMockService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly apiAuth = inject(ApiAuthService);
  protected readonly backendEnabled = API_CONFIG.useBackend;
  protected readonly error = signal('');

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly invalid = signal(false);
  protected readonly demoEmails = [
    'admin@transportseva.in',
    'operations@transportseva.in',
    'kyc@transportseva.in',
    'finance@transportseva.in',
    'support@transportseva.in',
  ];

  protected useDemoAccount(email: string): void {
    this.email.set(email);
    this.invalid.set(false);
  }

  protected submit(form: NgForm): void {
    if (this.submitting()) return;
    this.error.set('');
    this.invalid.set(false);
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    if (API_CONFIG.useBackend) {
      this.apiAuth.login(this.email(), this.password()).subscribe({
        next: ({ user }) => {
          this.submitting.set(false);
          if (user.role !== 'admin') {
            this.apiAuth.clearTokens();
            this.error.set('This account does not have administrator access. Please use the regular login.');
            return;
          }
          this.session.clearPlatformStaff();
          this.session.setBackendUser(user);
          this.session.setRole('admin');
          this.router.navigateByUrl('/admin/dashboard');
        },
        error: (error) => { this.submitting.set(false); this.error.set(apiErrorMessage(error, 'Staff sign-in could not be completed. Please retry.')); },
      });
      return;
    }
    this.auth.loginPlatformStaff(this.email(), this.password()).subscribe((staff: MockPlatformStaff | null) => {
      this.submitting.set(false);
      if (!staff) {
        this.invalid.set(true);
        return;
      }
      this.session.setPlatformStaff(staff);
      this.router.navigateByUrl(staff.destination);
    });
  }
}
