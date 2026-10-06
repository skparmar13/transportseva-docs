import { ChangeDetectionStrategy, Component, ElementRef, inject, QueryList, ViewChildren, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { TranslatePipe } from '../../../core/i18n';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiAuthService } from '../../../core/api/api-auth.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.scss',
})
export class OtpVerificationComponent {
  private readonly auth = inject(AuthMockService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly apiAuth = inject(ApiAuthService);

  @ViewChildren('otpInput') private otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected readonly digits = signal<string[]>(['', '', '', '', '', '']);
  protected readonly verifying = signal(false);
  protected readonly identifier = this.auth.pendingIdentifier;

  protected onDigitInput(index: number, value: string): void {
    const next = [...this.digits()];
    next[index] = value.replace(/\D/g, '').slice(-1);
    this.digits.set(next);
    if (next[index] && index < 5) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  protected isOtpComplete(): boolean {
    return this.digits().every((digit) => /^\d$/.test(digit));
  }

  protected verify(): void {
    if (!this.isOtpComplete()) return;
    this.verifying.set(true);
    if (API_CONFIG.useBackend && this.route.snapshot.queryParamMap.get('next') === 'signup') {
      const pending = JSON.parse(sessionStorage.getItem('transportseva.pending_signup') ?? '{}') as { mobile?: string };
      this.apiAuth.verifySignupOtp('+91' + (pending.mobile ?? ''), this.digits().join('')).subscribe({
        next: () => {
          this.verifying.set(false);
          this.router.navigate(['/auth/profile-setup']);
        },
        error: () => this.verifying.set(false),
      });
      return;
    }
    this.auth.verifyOtp(this.digits().join('')).subscribe(() => {
      this.verifying.set(false);
      const next = this.route.snapshot.queryParamMap.get('next');
      if (next === 'signup') {
        const roleOption = this.auth.roleOptions.find((r) => r.role === this.auth.pendingRole());
        this.router.navigate([roleOption?.requiresCompany ? '/auth/business-registration' : '/auth/profile-setup']);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  protected resend(): void {
    if (API_CONFIG.useBackend) {
      const pending = JSON.parse(sessionStorage.getItem('transportseva.pending_signup') ?? '{}') as { mobile?: string };
      this.apiAuth.requestSignupOtp('+91' + (pending.mobile ?? '')).subscribe();
      return;
    }
    this.auth.sendOtp(this.identifier()).subscribe();
  }
}
