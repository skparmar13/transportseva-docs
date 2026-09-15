import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { TranslatePipe } from '../../../core/i18n';

@Component({
  selector: 'app-business-registration',
  standalone: true,
  imports: [FormsModule, AuthShellComponent, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './business-registration.component.html',
  styleUrl: './business-registration.component.scss',
})
export class BusinessRegistrationComponent implements OnInit {
  private readonly auth = inject(AuthMockService);
  private readonly router = inject(Router);

  protected readonly businessType = signal<'transporter' | 'truck-owner' | 'company'>('transporter');
  protected readonly companyName = signal('');
  protected readonly gstNumber = signal('');
  protected readonly panNumber = signal('');
  protected readonly fleetSize = signal('');
  protected readonly address = signal('');
  protected readonly city = signal('');
  protected readonly state = signal('');
  protected readonly pincode = signal('');
  protected readonly submitting = signal(false);

  protected readonly businessTypes = [
    { value: 'transporter' as const, labelKey: 'businessReg.type.transporter' },
    { value: 'truck-owner' as const, labelKey: 'businessReg.type.truckOwner' },
    { value: 'company' as const, labelKey: 'businessReg.type.company' },
  ];

  ngOnInit(): void {
    // Pre-select the business type based on the role chosen during signup
    // (shipper businesses register as "Company / Enterprise Shipper").
    const role = this.auth.pendingRole();
    if (role === 'shipper') {
      this.businessType.set('company');
    } else if (role === 'truck-owner') {
      this.businessType.set('truck-owner');
    } else {
      this.businessType.set('transporter');
    }
  }

  protected submit(): void {
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
