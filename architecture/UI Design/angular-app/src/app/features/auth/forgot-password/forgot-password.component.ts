import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, finalize, interval, timeout } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LanguageService, TranslatePipe } from '../../../core/i18n';
import { ApiAuthService } from '../../../core/api/api-auth.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { apiErrorMessage, apiFieldErrors } from '../../../core/api/api-error';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly auth = inject(ApiAuthService);
  private readonly session = inject(SessionService);
  private readonly language = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  // Proof is memory-only: never place it in URLs or browser storage.
  private challenge = '';
  private proof = '';
  private resendAt = 0;

  @ViewChildren('otpInput') private otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected readonly step = signal(1);
  protected readonly identifier = signal('');
  protected readonly digits = signal<string[]>(['', '', '', '', '', '']);
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly fields = signal<Record<string, string>>({});
  protected readonly cooldown = signal(0);
  protected readonly debugOtp = signal('');

  constructor() {
    interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() =>
      this.cooldown.set(Math.max(0, Math.ceil((this.resendAt - Date.now()) / 1000))));
  }

  protected onDigitInput(index: number, value: string): void {
    const next = [...this.digits()];
    next[index] = value.replace(/\D/g, '').slice(-1);
    this.digits.set(next);
    if (next[index] && index < 5) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  protected onDigitKey(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) this.otpInputs.get(index - 1)?.nativeElement.focus();
  }

  protected onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const code = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    this.digits.set(Array.from({ length: 6 }, (_, index) => code[index] ?? ''));
    this.otpInputs.get(Math.min(code.length, 5))?.nativeElement.focus();
  }

  protected sendOtp(): void {
    if (this.busy()) return;
    this.error.set(''); this.fields.set({});
    const identifier = this.identifier().trim();
    const digits = identifier.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
      && !(/^[+0-9 ()-]+$/.test(identifier) && /^[6-9]\d{9}$/.test(digits))) {
      this.fields.set({ identifier: this.language.translate('forgotPassword.invalidIdentifier') }); return;
    }
    if (!API_CONFIG.useBackend) { this.error.set(this.language.translate('forgotPassword.backendRequired')); return; }
    this.perform(this.auth.requestPasswordRecovery(identifier), (data) => {
      this.challenge = data.challenge_id; this.proof = '';
      this.debugOtp.set(data.debug_otp ?? '');
      this.digits.set(['', '', '', '', '', '']);
      this.resendAt = Date.now() + data.resend_after * 1000;
      this.cooldown.set(data.resend_after); this.step.set(2);
    });
  }

  protected verifyOtp(): void {
    if (this.busy()) return;
    this.error.set(''); this.fields.set({});
    const code = this.digits().join('');
    if (!/^\d{6}$/.test(code)) { this.fields.set({ otp: this.language.translate('forgotPassword.invalidOtp') }); return; }
    this.perform(this.auth.verifyPasswordRecovery(this.challenge, code), (data) => {
      this.proof = data.reset_token; this.debugOtp.set(''); this.step.set(3);
    });
  }

  protected resend(): void {
    if (!this.busy() && this.cooldown() === 0) this.sendOtp();
  }

  protected restart(): void {
    if (this.busy()) return;
    this.challenge = ''; this.proof = ''; this.debugOtp.set('');
    this.newPassword.set(''); this.confirmPassword.set('');
    this.fields.set({}); this.error.set(''); this.step.set(1);
  }

  protected resetPassword(): void {
    if (this.busy()) return;
    this.error.set(''); this.fields.set({});
    const password = this.newPassword();
    const fields: Record<string, string> = {};
    if (password.length > 128 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/s.test(password))
      fields['password'] = this.language.translate('forgotPassword.passwordRules');
    if (password !== this.confirmPassword()) fields['password_confirmation'] = this.language.translate('forgotPassword.passwordMismatch');
    if (Object.keys(fields).length) { this.fields.set(fields); return; }
    this.perform(this.auth.resetPassword(this.challenge, this.proof, password, this.confirmPassword()), () => {
      this.auth.clearTokens(); this.session.clearBackendUser(); this.session.clearPlatformStaff();
      this.proof = ''; this.challenge = ''; this.newPassword.set(''); this.confirmPassword.set('');
      this.step.set(4);
    });
  }

  private perform<T>(operation: Observable<T>, success: (value: T) => void): void {
    this.busy.set(true);
    operation.pipe(timeout(30_000), takeUntilDestroyed(this.destroyRef), finalize(() => this.busy.set(false))).subscribe({
      next: success,
      error: (error: unknown) => {
        this.fields.set(apiFieldErrors(error));
        this.error.set(error instanceof HttpErrorResponse && error.status === 429
          ? this.language.translate('forgotPassword.rateLimit')
          : apiErrorMessage(error, this.language.translate('forgotPassword.requestFailed')));
      },
    });
  }
}
