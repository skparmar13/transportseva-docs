import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { BusinessSettingsMockService } from '../../../core/services/business-settings-mock.service';
import { TranslatePipe } from '../../../core/i18n';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [FormsModule, AuthShellComponent, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-setup.component.html',
  styleUrl: './profile-setup.component.scss',
})
export class ProfileSetupComponent {
  private readonly auth = inject(AuthMockService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly businessSettings = inject(BusinessSettingsMockService);

  protected readonly designation = signal('');
  protected readonly address = signal('');
  protected readonly city = signal('');
  protected readonly pincode = signal('');
  protected readonly notifyEmail = signal(true);
  protected readonly notifySms = signal(true);
  protected readonly submitting = signal(false);

  protected skip(): void {
    this.goToDashboard();
  }

  protected submit(): void {
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
    this.session.setRole(this.auth.pendingRole());
    // Apply whichever plan the user signed up for (Starter by default, or Professional if they
    // came from the Pricing page's "Upgrade to Professional" CTA) to their new Business Settings.
    this.businessSettings.initializePlanFromSignup(this.auth.pendingPlanTier());
    this.router.navigate([this.session.portal().basePath, 'dashboard']);
  }
}
