import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, QueryList, ViewChildren, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, finalize, interval, timeout } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { LanguageService, TranslatePipe } from '../../../core/i18n';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiAuthService } from '../../../core/api/api-auth.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { SessionService } from '../../../core/services/session.service';
import { clearSignupOtpWait, pendingSignupContact, rememberSignupOtpWait, signupOtpWait } from '../../../core/utils/signup-otp-session';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './otp-verification.component.html',
  styles: [`
    .otp-invalid { border-color:#d32f2f !important; box-shadow:0 0 0 3px rgba(211,47,47,.10); }
    .otp-error { color:#c62828; font-size:12px; margin:8px 0 0; }
    .otp-debug { color:#8a4b08; font-size:12px; margin:8px 0 0; }
    .otp-resend-message { color:#2e7d32; font-size:12px; margin:8px 0 0; }
    .otp-back-link { display:flex; justify-content:center; margin-top:30px; }
    .otp-spinner { display:inline-block; vertical-align:middle; flex-shrink:0; width:14px; height:14px; margin-right:8px; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation:otp-spin .7s linear infinite; }
    @keyframes otp-spin { to { transform:rotate(360deg); } }
    @media (prefers-reduced-motion:reduce) { .otp-spinner { animation:none; } }
  `],
})
export class OtpVerificationComponent {
  private readonly auth = inject(AuthMockService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly apiAuth = inject(ApiAuthService);
  private readonly session = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  private readonly pending = pendingSignupContact();
  protected profilePath = '';
  protected readonly validFlow = !API_CONFIG.useBackend || (this.route.snapshot.queryParamMap.get('next') === 'signup' && this.pending !== null);
  protected readonly navigating = signal(false);
  protected readonly cooldown = signal(this.pending ? signupOtpWait(this.pending.phone) : 0);

  @ViewChildren('otpInput') private otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected readonly digits = signal<string[]>(['', '', '', '', '', '']);
  protected readonly verifying = signal(false);
  protected readonly verified = signal(false);
  protected readonly apiError = signal('');
  protected readonly debugOtp = signal(this.validFlow ? sessionStorage.getItem('transportseva.debug_otp') ?? '' : '');
  protected readonly resending = signal(false);
  protected readonly resendMessage = signal('');
  protected readonly identifier = API_CONFIG.useBackend ? signal(this.pending?.phone ?? '') : this.auth.pendingIdentifier;

  constructor() {
    interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.pending) this.cooldown.set(signupOtpWait(this.pending.phone));
    });
  }

  protected onDigitInput(index: number, value: string): void {
    if (this.verifying() || this.resending() || this.verified()) return;
    this.apiError.set('');
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
    if (!this.validFlow || this.verified() || this.verifying() || this.resending() || !this.isOtpComplete()) return;
    this.apiError.set(''); this.resendMessage.set('');
    this.verifying.set(true);
    if (API_CONFIG.useBackend) {
      this.apiAuth.verifySignupOtp(this.pending!.phone, this.digits().join(''), this.pending!.role)
        .pipe(timeout(30_000), takeUntilDestroyed(this.destroyRef), finalize(() => this.verifying.set(false))).subscribe({
        next: (data) => {
          this.verified.set(true);
          this.session.setBackendUser(data.user);
          sessionStorage.removeItem('transportseva.debug_otp'); this.debugOtp.set(''); clearSignupOtpWait();
          const role = data.user.role === 'customer' ? 'shipper' : data.user.role;
          if (!['shipper', 'transporter', 'truck-owner', 'driver'].includes(role ?? '')) {
            this.apiError.set(this.language.translate('otp.sessionUnavailable')); return;
          }
          this.profilePath = `/${role}/profile`; this.continueProfile();
        },
        error: (error) => {
          this.apiError.set(this.requestError(error));
        },
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
    if (!this.validFlow || this.resending() || this.verifying() || this.verified() || this.cooldown() > 0) return;
    if (API_CONFIG.useBackend) {
      this.resending.set(true); this.apiError.set(''); this.resendMessage.set('');
      this.apiAuth.requestSignupOtp(this.pending!.phone)
        .pipe(timeout(30_000), takeUntilDestroyed(this.destroyRef), finalize(() => this.resending.set(false))).subscribe({
        next: (data) => {
          rememberSignupOtpWait(this.pending!.phone); this.cooldown.set(signupOtpWait(this.pending!.phone));
          this.debugOtp.set(data?.debug_otp ?? ''); this.digits.set(['', '', '', '', '', '']);
          this.resendMessage.set(this.language.translate(data?.debug_otp ? 'otp.sandboxReady' : 'otp.codeRequested'));
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse && error.status === 429) {
            const seconds = Number(error.headers.get('Retry-After') ?? 60);
            rememberSignupOtpWait(this.pending!.phone, seconds); this.cooldown.set(signupOtpWait(this.pending!.phone));
          }
          this.apiError.set(this.requestError(error));
        },
      });
      return;
    }
    this.auth.sendOtp(this.identifier()).subscribe();
  }

  protected continueProfile(): void {
    if (!this.verified() || !this.profilePath || this.navigating()) return;
    this.navigating.set(true); this.apiError.set('');
    this.router.navigateByUrl(this.profilePath).then((opened) => {
      if (!opened && !this.destroyRef.destroyed) this.apiError.set(this.language.translate('otp.navigationFailed'));
    }).catch(() => {
      if (!this.destroyRef.destroyed) this.apiError.set(this.language.translate('otp.navigationFailed'));
    }).finally(() => { if (!this.destroyRef.destroyed) this.navigating.set(false); });
  }

  private requestError(error: unknown): string {
    const fallback = this.language.translate('otp.requestFailed');
    return error instanceof TimeoutError ? fallback : apiErrorMessage(error, fallback);
  }

  protected onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (this.verifying() || this.resending() || this.verified()) return;
    const code = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    this.digits.set(Array.from({ length: 6 }, (_, i) => code[i] ?? ''));
    this.otpInputs.get(Math.min(code.length, 5))?.nativeElement.focus();
  }

  protected onDigitKey(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) this.otpInputs.get(index - 1)?.nativeElement.focus();
  }
}
