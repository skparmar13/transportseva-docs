import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { VehicleType } from '../../../core/models/marketplace.model';
import { TranslatePipe } from '../../../core/i18n';
import { GeoLocation } from '../../../core/models/location.model';
import { LocationPickerComponent } from '../../../shared/components/location-picker/location-picker.component';

const VEHICLE_TYPES: VehicleType[] = ['Open Body Truck', '20ft Container', '32ft Trailer', 'Mini Truck', 'Tanker', 'Trailer (Flatbed)'];

/**
 * Post a Load — used by Shippers (posting their own load) and by
 * Transporters (posting on behalf of an offline/unregistered
 * customer, per the business rule that Load Owner/Creator can
 * differ). The "On behalf of" field only shows for Transporters.
 */
@Component({
  selector: 'app-post-load',
  standalone: true,
  imports: [IconComponent, FormsModule, TranslatePipe, LocationPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-load.component.html',
})
export class PostLoadComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly vehicleTypes = VEHICLE_TYPES;
  protected readonly isTransporter = computed(() => this.session.role() === 'transporter');

  protected readonly onBehalfOfCustomer = signal('');
  protected readonly pickupCity = signal('');
  protected readonly dropCity = signal('');
  protected readonly pickupLocation = signal<GeoLocation | null>(null);
  protected readonly dropLocation = signal<GeoLocation | null>(null);
  protected readonly material = signal('');
  protected readonly weightTons = signal<number | null>(null);
  protected readonly vehicleType = signal<VehicleType>('Open Body Truck');
  protected readonly pickupDate = signal('');
  protected readonly budget = signal<number | null>(null);
  protected readonly notes = signal('');
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly postedLoadId = signal('');

  protected submit(): void {
    const budget = this.budget();
    const weight = this.weightTons();
    if (!this.pickupCity().trim() || !this.dropCity().trim() || !this.material().trim()) return;
    if (budget === null || !Number.isFinite(budget) || budget <= 0 || !this.hasAtMostTwoDecimals(budget)) return;
    if (weight !== null && (!Number.isFinite(weight) || weight <= 0 || !this.hasAtMostTwoDecimals(weight))) return;
    this.submitting.set(true);
    setTimeout(() => {
      const load = this.marketplace.postLoad({
        postedBy: this.session.role(),
        postedByName: this.session.user().company ?? this.session.user().name,
        onBehalfOfCustomer: this.isTransporter() && this.onBehalfOfCustomer() ? this.onBehalfOfCustomer() : undefined,
        pickupCity: this.pickupLocation()?.city ?? this.pickupCity(),
        dropCity: this.dropLocation()?.city ?? this.dropCity(),
        pickupLocation: this.pickupLocation() ?? undefined,
        dropLocation: this.dropLocation() ?? undefined,
        material: this.material(),
        weightTons: this.weightTons() ?? 0,
        vehicleType: this.vehicleType(),
        pickupDate: this.pickupDate() || 'To be confirmed',
        budget,
        notes: this.notes() || undefined,
      });
      this.postedLoadId.set(load.loadId);
      this.submitting.set(false);
      this.submitted.set(true);
    }, 500);
  }

  private hasAtMostTwoDecimals(value: number): boolean {
    return Number.isInteger(value * 100);
  }

  protected goToMyLoads(): void {
    this.router.navigate([this.session.portal().basePath, 'my-loads']);
  }

  protected postAnother(): void {
    this.submitted.set(false);
    this.onBehalfOfCustomer.set('');
    this.pickupCity.set('');
    this.dropCity.set('');
    this.pickupLocation.set(null);
    this.dropLocation.set(null);
    this.material.set('');
    this.weightTons.set(null);
    this.pickupDate.set('');
    this.budget.set(null);
    this.notes.set('');
  }
}
