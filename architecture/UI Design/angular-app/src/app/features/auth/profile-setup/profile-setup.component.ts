import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { BusinessSettingsMockService } from '../../../core/services/business-settings-mock.service';
import { TranslatePipe } from '../../../core/i18n';
import { LocationPickerComponent } from '../../../shared/components/location-picker/location-picker.component';
import { GeoLocation } from '../../../core/models/location.model';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiAuthService } from '../../../core/api/api-auth.service';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [FormsModule, AuthShellComponent, IconComponent, TranslatePipe, LocationPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-setup.component.html',
  styleUrl: './profile-setup.component.scss',
})
export class ProfileSetupComponent {
  private readonly auth = inject(AuthMockService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly businessSettings = inject(BusinessSettingsMockService);
  private readonly apiAuth = inject(ApiAuthService);

  protected readonly designation = signal('');
  protected readonly address = signal('');
  protected readonly city = signal('');
  protected readonly pincode = signal('');
  protected readonly notifyEmail = signal(true);
  protected readonly notifySms = signal(true);
  protected readonly submitting = signal(false);

  protected setProfileCity(location: GeoLocation | null): void {
    if (location) this.city.set(location.city);
  }

  protected skip(): void {
    this.goToDashboard();
  }

  protected submit(): void {
    this.submitting.set(true);
    if (API_CONFIG.useBackend) {
      const pending = JSON.parse(sessionStorage.getItem('transportseva.pending_signup') ?? '{}') as { fullName?: string; email?: string; password?: string };
      const parts = (pending.fullName ?? '').trim().split(/\s+/).filter(Boolean);
      const first_name = parts.shift() ?? '';
      const last_name = parts.join(' ') || first_name;
      this.apiAuth.completeProfile({
        first_name, last_name, email: pending.email ?? '', password: pending.password ?? '',
        password_confirmation: pending.password ?? '',
      }).subscribe({
        next: () => {
          this.submitting.set(false);
          sessionStorage.removeItem('transportseva.pending_signup');
          this.goToDashboard();
          sessionStorage.removeItem('transportseva.pending_signup_role');
        },
        error: () => this.submitting.set(false),
      });
      return;
    }
    this.auth
      .completeProfileSetup({
        designation: this.designation(),
        address: this.address(),
        city: this.city(),
        pincode: this.pincode(),
        notifyEmail: this.notifyEmail(),
        notifySms: this.notifySms(),
      })
      .subscribe(() => {
        this.submitting.set(false);
        this.goToDashboard();
      });
  }

  private goToDashboard(): void {
    // SignupRole values map 1:1 onto PortalRole ('shipper' | 'transporter' | 'truck-owner' | 'driver')
    // so the shared shell renders the right portal after onboarding completes.
    const backendRole = sessionStorage.getItem('transportseva.pending_signup_role') as 'shipper' | 'transporter' | 'truck-owner' | null;
    this.session.setRole(API_CONFIG.useBackend && backendRole ? backendRole : this.auth.pendingRole());
    // Apply whichever plan the user signed up for (Starter by default, or Professional if they
    // came from the Pricing page's "Upgrade to Professional" CTA) to their new Business Settings.
    this.businessSettings.initializePlanFromSignup(this.auth.pendingPlanTier());
    this.router.navigate([this.session.portal().basePath, 'dashboard']);
  }
}
