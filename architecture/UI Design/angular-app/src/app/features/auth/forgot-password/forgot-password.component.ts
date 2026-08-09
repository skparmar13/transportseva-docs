import { ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthMockService);
  private readonly router = inject(Router);

  @ViewChildren('otpInput') private otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected readonly step = signal(1);
  protected readonly identifier = signal('');
  protected readonly digits = signal<string[]>(['', '', '', '', '', '']);
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly busy = signal(false);

  protected onDigitInput(index: number, value: string): void {
    const next = [...this.digits()];
    next[index] = value.slice(-1);
    this.digits.set(next);
    if (value && index < 5) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  protected sendOtp(): void {
    this.busy.set(true);
    this.auth.sendOtp(this.identifier()).subscribe(() => {
      this.busy.set(false);
      this.step.set(2);
    });
  }

  protected verifyOtp(): void {
    this.busy.set(true);
    this.auth.verifyOtp(this.digits().join('')).subscribe(() => {
      this.busy.set(false);
      this.step.set(3);
    });
  }

  protected resend(): void {
    this.auth.sendOtp(this.identifier()).subscribe();
  }

  protected resetPassword(): void {
    this.busy.set(true);
    this.auth.resetPassword(this.newPassword()).subscribe(() => {
      this.busy.set(false);
      this.router.navigate(['/auth/login']);
    });
  }
}
