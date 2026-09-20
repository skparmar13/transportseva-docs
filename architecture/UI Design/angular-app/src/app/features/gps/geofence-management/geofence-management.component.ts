import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GpsMockService } from '../../../core/services/gps-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LocationPickerComponent } from '../../../shared/components/location-picker/location-picker.component';
import { TranslatePipe } from '../../../core/i18n';
import { GeoLocation } from '../../../core/models/location.model';

@Component({
  selector: 'app-geofence-management',
  standalone: true,
  imports: [FormsModule, IconComponent, LocationPickerComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './geofence-management.component.html',
})
export class GeofenceManagementComponent {
  private readonly router = inject(Router);
  protected readonly session = inject(SessionService);
  private readonly gps = inject(GpsMockService);
  protected readonly zones = this.gps.geofences;
  protected readonly vehicles = this.gps.liveVehicles;
  protected readonly showForm = signal(false);
  protected readonly name = signal('');
  protected readonly center = signal('');
  protected readonly centerVerified = signal(false);
  protected readonly radius = signal<number | null>(2);
  protected readonly vehicleReg = signal('');
  protected readonly formError = signal('');

  protected readonly canSave = computed(() => !!this.name().trim() && this.centerVerified() && !!this.vehicleReg() && this.radius() !== null && Number.isFinite(this.radius()) && this.radius()! > 0 && this.radius()! <= 500 && Number.isInteger(this.radius()! * 10));

  protected onCenterChange(value: string): void {
    this.center.set(value);
    this.centerVerified.set(false);
  }

  protected onCenterSelected(location: GeoLocation | null): void {
    this.centerVerified.set(!!location);
  }

  protected backToTracking(): void {
    this.router.navigate([this.session.portal().basePath, 'tracking']);
  }

  protected toggleZone(id: string): void {
    this.gps.toggleGeofence(id);
  }

  protected openForm(): void {
    this.formError.set('');
    this.showForm.set(true);
  }

  protected cancelForm(): void {
    this.showForm.set(false);
    this.name.set('');
    this.center.set('');
    this.centerVerified.set(false);
    this.radius.set(2);
    this.vehicleReg.set('');
    this.formError.set('');
  }

  protected saveZone(): void {
    if (!this.canSave()) {
      this.formError.set('geofences.validation');
      return;
    }
    this.gps.addGeofence({
      name: this.name().trim(),
      type: 'Circle',
      centerLabel: this.center().trim(),
      radiusKm: this.radius()!,
      assignedVehicles: [this.vehicleReg()],
    });
    this.cancelForm();
  }
}
