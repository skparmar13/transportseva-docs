import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthMockService, MockPlatformStaff } from '../../../core/services/auth-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { TranslatePipe } from '../../../core/i18n';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

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
    this.invalid.set(false);
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
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
