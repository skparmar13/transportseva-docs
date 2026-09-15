import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { SignupRole } from '../../../core/models/auth.model';
import { PlanTier } from '../../../core/data/subscription-plans';
import { LanguageService, TranslatePipe } from '../../../core/i18n';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly auth = inject(AuthMockService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);

  protected readonly roleOptions = this.auth.roleOptions;
  protected readonly selectedRole = signal<SignupRole>('shipper');
  protected readonly fullName = signal('');
  protected readonly mobile = signal('');
  protected readonly email = signal('');
  protected readonly companyName = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly agreeTerms = signal(true);
  protected readonly submitting = signal(false);

  // Which plan this signup is for — driven by the CTA the user clicked (Pricing page
  // "Get Started Free" → starter, "Upgrade to Professional" → professional). Falls back
  // to Starter for the generic header/footer "Sign Up" link so nobody is billed by default.
  protected readonly planTier = signal<Exclude<PlanTier, 'enterprise'>>('starter');

  /** Translated label for the plan the user is signing up for, used inside the plan banner. */
  protected readonly planLabel = computed(() => {
    // Read `lang()` so this recomputes when the language toggles.
    this.language.lang();
    return this.language.translate(
      this.planTier() === 'professional' ? 'signup.plan.professional' : 'signup.plan.starter',
    );
  });

  constructor() {
    const requestedPlan = this.route.snapshot.queryParamMap.get('plan');
    this.planTier.set(requestedPlan === 'professional' ? 'professional' : 'starter');
  }

  protected selectRole(role: SignupRole): void {
    this.selectedRole.set(role);
  }

  protected requiresCompany(): boolean {
    return this.roleOptions.find((r) => r.role === this.selectedRole())?.requiresCompany ?? false;
  }

  /** Maps a SignupRole to its translation-key stem under `signup.role.*`. Kept in
   * sync with the keys added to `translations.en.ts`/`translations.hi.ts`. */
  protected roleKey(role: SignupRole): string {
    switch (role) {
      case 'truck-owner':
        return 'truckOwner';
      default:
        return role;
    }
  }

  protected submit(): void {
    this.submitting.set(true);
    const identifier = this.email() || `+91${this.mobile()}`;
    this.auth.signup(identifier, this.selectedRole(), this.planTier()).subscribe(() => {
      this.submitting.set(false);
      this.router.navigate(['/auth/otp-verification'], { queryParams: { next: 'signup' } });
    });
  }
}
