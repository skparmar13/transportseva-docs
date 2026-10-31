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
  protected readonly useBackend = API_CONFIG.useBackend;
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
  protected readonly apiError = signal('');

  constructor() {
    if (API_CONFIG.useBackend) this.apiAuth.me().subscribe({
      next: (user) => {
        const role = user.role === 'customer' ? 'shipper' : user.role;
        void this.router.navigateByUrl(`/${['shipper', 'transporter', 'truck-owner', 'driver'].includes(role ?? '') ? role : 'shipper'}/profile`, { replaceUrl: true });
      },
      error: () => void this.router.navigateByUrl('/auth/login', { replaceUrl: true }),
    });
  }

  protected setProfileCity(location: GeoLocation | null): void {
    if (location) this.city.set(location.city);
  }

  protected setProfileAddress(location: GeoLocation | null): void {
    if (!location) return;
    this.address.set(location.label);
    this.city.set(location.city);
    if (location.postcode) this.pincode.set(location.postcode);
  }

  protected skip(): void {
    if (API_CONFIG.useBackend) return;
    this.goToDashboard();
  }

  protected submit(): void {
    if (API_CONFIG.useBackend) return;
    this.apiError.set('');
    this.submitting.set(true);
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
