import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiAccountProfileService, AccountProfileView, EmailChallenge, ProfileDraft } from '../../../core/api/api-account-profile.service';
import { apiErrorMessage, apiFieldErrors } from '../../../core/api/api-error';
import { API_CONFIG } from '../../../core/api/api-config';
import { SessionService } from '../../../core/services/session.service';
import { AccountBusinessProfileComponent } from '../account-profile/account-business-profile.component';
import { LanguageService } from '../../../core/i18n';
import { personalProfileCopy } from './personal-profile-copy';

const blank = (): ProfileDraft => ({ first_name: '', last_name: '', email: '', designation: '', address: '', city: '', pincode: '', notify_email: true, notify_sms: true });
@Component({
  selector: 'app-account-profile-page', standalone: true, imports: [FormsModule, AccountBusinessProfileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './account-profile-page.component.html', styleUrl: './account-profile-page.component.scss',
})
export class AccountProfilePageComponent {
  private readonly api = inject(ApiAccountProfileService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => personalProfileCopy(this.language.lang()));
  protected readonly data = signal<AccountProfileView | null>(null);
  protected readonly state = signal<'loading' | 'error' | 'ready'>('error');
  protected readonly draft = signal<ProfileDraft>(blank());
  protected readonly password = signal('');
  protected readonly confirmation = signal('');
  protected readonly currentPassword = signal('');
  protected readonly saving = signal(false);
  protected readonly requesting = signal(false);
  protected readonly verifying = signal(false);
  protected readonly challenge = signal<EmailChallenge | null>(null);
  protected readonly otp = signal('');
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly error = signal('');
  protected readonly emailError = signal('');
  protected readonly message = signal(false);
  protected readonly conflict = signal(false);
  protected readonly pending = computed(() => this.data()?.account.status === 'pending_profile');
  protected readonly ready = computed(() => this.data()?.account.portal_access_ready === true);
  protected readonly emailChanged = computed(() => this.data()?.account.email !== this.draft().email.trim().toLowerCase());
  protected readonly fields = ['first_name', 'last_name', 'email', 'designation', 'address', 'city', 'pincode'] as const;
  constructor() { if (API_CONFIG.useBackend) this.load(); }
  protected update(field: keyof ProfileDraft, value: string | boolean): void { this.draft.update((v) => ({ ...v, [field]: value })); this.message.set(false); }
  protected load(): void {
    if (this.state() === 'loading' || this.saving()) return;
    this.state.set('loading'); this.error.set('');
    this.api.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (view) => {
      this.accept(view); this.conflict.set(false); this.errors.set({}); this.challenge.set(null); this.otp.set(''); this.state.set('ready');
      const { first_name, last_name, email } = view.account;
      this.draft.set({ ...blank(), ...view.profile, designation: view.profile.designation ?? '', address: view.profile.address ?? '', city: view.profile.city ?? '', pincode: view.profile.pincode ?? '', first_name: first_name ?? '', last_name: last_name ?? '', email: email ?? '' });
      if (view.account.status === 'pending_profile') {
        try {
          const p = JSON.parse(sessionStorage.getItem('transportseva.pending_signup') ?? '{}');
          // A draft is only a prefill, never evidence of verification/access.
          if (p.mobile && view.account.phone?.replace(/\D/g, '').endsWith(p.mobile)) {
            const names = (p.fullName ?? '').trim().split(/\s+/); const first = names.shift() ?? '';
            this.draft.update((v) => ({ ...v, first_name: first, last_name: names.join(' ') || first, email: p.email ?? '' }));
            this.password.set(p.password ?? ''); this.confirmation.set(p.password ?? '');
          }
        } catch { /* Ignore a malformed local draft; the user can fill the form. */ }
      }
    }, error: () => this.state.set('error') });
  }
  protected save(): void {
    if (this.saving() || this.verifying() || this.requesting() || !this.data()) return;
    this.error.set(''); this.errors.set({}); this.message.set(false);
    const d = this.draft(); const errors: Record<string, string> = {};
    for (const f of ['first_name', 'last_name', 'email'] as const) if (!d[f].trim()) errors[f] = this.copy().required;
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors['email'] = this.copy().invalidEmail;
    if (d.pincode && !/^[1-9][0-9]{5}$/.test(d.pincode)) errors['pincode'] = this.copy().invalidPin;
    if (this.pending() && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,128}$/.test(this.password())) errors['password'] = this.copy().passwordHint;
    if (this.pending() && this.password() !== this.confirmation()) errors['password_confirmation'] = this.copy().mismatch;
    if (!this.pending() && this.emailChanged() && !this.currentPassword()) errors['current_password'] = this.copy().required;
    if (Object.keys(errors).length) { this.errors.set(errors); return; }
    this.saving.set(true);
    this.api.save({ ...d, version: this.data()!.profile.version, ...(this.pending() ? { password: this.password(), password_confirmation: this.confirmation() } : {}), ...(!this.pending() && this.emailChanged() ? { current_password: this.currentPassword() } : {}) }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (view) => {
      this.accept(view); this.saving.set(false); this.password.set(''); this.confirmation.set(''); this.currentPassword.set('');
      this.challenge.set(null); this.otp.set(''); this.emailError.set(''); this.message.set(true);
      sessionStorage.removeItem('transportseva.pending_signup'); sessionStorage.removeItem('transportseva.pending_signup_role');
    }, error: (e) => { this.saving.set(false); this.errors.set(apiFieldErrors(e)); this.conflict.set(e instanceof HttpErrorResponse && e.status === 409); this.error.set(apiErrorMessage(e)); } });
  }
  protected requestCode(): void {
    if (this.requesting() || this.verifying() || this.saving() || this.data()?.account.profile_completion_required || this.emailChanged()) return;
    this.requesting.set(true); this.emailError.set('');
    this.api.requestEmail().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (c) => { this.challenge.set(c); this.otp.set(''); this.requesting.set(false); }, error: (e) => { this.requesting.set(false); this.emailError.set(apiErrorMessage(e)); } });
  }
  protected verify(): void {
    if (this.verifying() || this.requesting() || this.saving() || !this.challenge() || !/^\d{6}$/.test(this.otp())) return;
    this.verifying.set(true); this.emailError.set('');
    this.api.verifyEmail(this.challenge()!.challenge_id, this.otp()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (state) => {
      this.verifying.set(false); const view = this.data()!; this.accept({ ...view, account: { ...view.account, ...state } }); this.challenge.set(null); this.otp.set('');
    }, error: (e) => { this.verifying.set(false); this.emailError.set(apiErrorMessage(e)); } });
  }
  protected continue(): void { if (this.ready()) void this.router.navigate([this.session.portal().basePath, 'dashboard']); }
  private accept(view: AccountProfileView): void { this.data.set(view); this.session.setBackendUser(view.account); localStorage.setItem('transportseva.api_user', JSON.stringify(view.account)); }
}
