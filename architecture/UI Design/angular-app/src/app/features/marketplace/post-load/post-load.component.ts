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
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { formatLoadReference } from '../../../core/utils/load-reference';
import { apiErrorMessage, apiFieldErrors } from '../../../core/api/api-error';

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
  imports: [IconComponent, FormsModule, TranslatePipe, LocationPickerComponent, DatePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-load.component.html',
})
export class PostLoadComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly apiMarketplace = inject(ApiMarketplaceService);

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
  protected readonly submissionError = signal('');
  protected readonly fieldErrors = signal<Record<string, string>>({});
  protected readonly formValid = computed(() => !!this.pickupCity().trim() && !!this.dropCity().trim() && !!this.material().trim() && this.isValidAmount(this.weightTons()) && this.isValidAmount(this.budget()));

  protected submit(): void {
    this.submissionError.set('');
    this.fieldErrors.set({});
    const budget = this.budget();
    const weight = this.weightTons();
    const errors: Record<string, string> = {};
    if (!this.pickupCity().trim()) errors['pickup_city'] = 'Pickup city is required.';
    if (!this.dropCity().trim()) errors['drop_city'] = 'Drop city is required.';
    if (!this.material().trim()) errors['material'] = 'Material or goods description is required.';
    if (budget === null || !Number.isFinite(budget) || budget <= 0) errors['budget'] = 'Enter a valid budget greater than zero.';
    else if (!this.hasAtMostTwoDecimals(budget)) errors['budget'] = 'Budget can have up to two decimal places.';
    if (!this.isValidAmount(weight)) errors['weight_tons'] = 'Enter a valid weight greater than zero.';
    else if (!this.hasAtMostTwoDecimals(weight!)) errors['weight_tons'] = 'Weight can have up to two decimal places.';
    if (Object.keys(errors).length) { this.fieldErrors.set(errors); return; }
    this.submitting.set(true);
    if (API_CONFIG.useBackend) {
      this.apiMarketplace.createLoad({
        pickup_city: this.pickupLocation()?.city ?? this.pickupCity().trim(),
        drop_city: this.dropLocation()?.city ?? this.dropCity().trim(),
        pickup_address: this.pickupLocation()?.label ?? this.pickupCity().trim(),
        drop_address: this.dropLocation()?.label ?? this.dropCity().trim(),
        material: this.material().trim(),
        weight_tons: weight ?? 0,
        vehicle_type: this.vehicleType(),
        pickup_date: this.pickupDate() || null,
        budget: budget ?? 0,
        notes: this.notes().trim() || null,
        on_behalf_of_customer: this.isTransporter() ? this.onBehalfOfCustomer().trim() || null : null,
      }).subscribe({
        next: (load) => {
          this.postedLoadId.set(formatLoadReference(load, { pickupCity: this.pickupCity(), dropCity: this.dropCity(), pickupDate: this.pickupDate() }));
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: (error) => {
          this.submitting.set(false);
          this.fieldErrors.set(apiFieldErrors(error));
          this.submissionError.set(apiErrorMessage(error, 'We could not post this load. Please review the highlighted fields.'));
        },
      });
      return;
    }
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
        budget: budget ?? 0,
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

  private isValidAmount(value: number | null): boolean {
    return value !== null && Number.isFinite(value) && value > 0 && this.hasAtMostTwoDecimals(value);
  }

  protected validateField(field: string): void {
    const next = { ...this.fieldErrors() };
    const messages: Record<string, string> = {};
    if (field === 'pickup_city' && !this.pickupCity().trim()) messages[field] = 'Pickup city is required.';
    if (field === 'drop_city' && !this.dropCity().trim()) messages[field] = 'Drop city is required.';
    if (field === 'material' && !this.material().trim()) messages[field] = 'Material or goods description is required.';
    if (field === 'budget' && !this.isValidAmount(this.budget())) messages[field] = 'Enter a valid budget greater than zero.';
    if (field === 'weight_tons' && !this.isValidAmount(this.weightTons())) messages[field] = 'Enter a valid weight greater than zero.';
    if (messages[field]) next[field] = messages[field]; else delete next[field];
    this.fieldErrors.set(next);
  }

  protected goToMyLoads(): void {
    this.router.navigate([this.session.portal().basePath, 'my-loads']);
  }

  protected postAnother(): void {
    this.submissionError.set('');
    this.fieldErrors.set({});
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

  protected errorFor(...keys: string[]): string {
    const errors = this.fieldErrors();
    return keys.map((key) => errors[key]).find(Boolean) ?? '';
  }
}
