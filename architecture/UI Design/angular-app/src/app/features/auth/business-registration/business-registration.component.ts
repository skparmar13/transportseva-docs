import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { TranslatePipe } from '../../../core/i18n';
import { LocationPickerComponent } from '../../../shared/components/location-picker/location-picker.component';
import { GeoLocation } from '../../../core/models/location.model';

@Component({
  selector: 'app-business-registration',
  standalone: true,
  imports: [FormsModule, AuthShellComponent, IconComponent, TranslatePipe, LocationPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './business-registration.component.html',
  styleUrl: './business-registration.component.scss',
})
export class BusinessRegistrationComponent {
  private readonly auth = inject(AuthMockService);
  private readonly router = inject(Router);

  protected readonly businessType = computed<'transporter' | 'truck-owner' | 'company'>(() => {
    const role = this.auth.pendingRole();
    return role === 'shipper' ? 'company' : role === 'truck-owner' ? 'truck-owner' : 'transporter';
  });
  protected readonly companyName = signal('');
  protected readonly gstNumber = signal('');
  protected readonly panNumber = signal('');
  protected readonly fleetSize = signal('');
  protected readonly address = signal('');
  protected readonly city = signal('');
  protected readonly state = signal('');
  protected readonly pincode = signal('');
  protected readonly submitting = signal(false);
  protected readonly validationError = signal('');

  protected setBusinessLocation(location: GeoLocation | null): void {
    if (!location) return;
    this.city.set(location.city);
    this.state.set(location.state ?? '');
  }

  protected submit(form: NgForm): void {
    this.validationError.set('');
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }
    if (!this.city().trim()) {
      this.validationError.set('businessReg.validation.cityRequired');
      return;
    }
    if (this.businessType() === 'truck-owner' && (!Number.isInteger(Number(this.fleetSize())) || Number(this.fleetSize()) < 1)) {
      this.validationError.set('businessReg.validation.fleetRequired');
      return;
    }
    this.submitting.set(true);
    this.auth
      .completeBusinessRegistration({
        businessType: this.businessType(),
        companyName: this.companyName(),
        gstNumber: this.gstNumber(),
        panNumber: this.panNumber(),
        fleetSize: this.fleetSize(),
        address: this.address(),
        city: this.city(),
        state: this.state(),
        pincode: this.pincode(),
      })
      .subscribe(() => {
        this.submitting.set(false);
        this.router.navigate(['/auth/profile-setup']);
      });
  }
}
