import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/i18n';
import { GeoLocation } from '../../../core/models/location.model';
import { LocationPickerComponent } from '../../../shared/components/location-picker/location-picker.component';

interface ManagedRoute { id: string; origin: string; destination: string; originLocation?: GeoLocation; destinationLocation?: GeoLocation; distance: number; transit: string; status: 'Active' | 'Archived'; }

@Component({ selector: 'app-route-management', standalone: true, imports: [FormsModule, ModalComponent, TranslatePipe, LocationPickerComponent], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './route-management.component.html' })
export class RouteManagementComponent {
  protected readonly routes = signal<ManagedRoute[]>([
    { id: 'RT-101', origin: 'Jaipur', destination: 'Ahmedabad', distance: 675, transit: '12–14 hrs', status: 'Active' },
    { id: 'RT-102', origin: 'Mumbai', destination: 'Pune', distance: 150, transit: '3–4 hrs', status: 'Active' },
    { id: 'RT-103', origin: 'Delhi', destination: 'Lucknow', distance: 555, transit: '9–11 hrs', status: 'Active' },
    { id: 'RT-104', origin: 'Kota', destination: 'Indore', distance: 390, transit: '7–8 hrs', status: 'Archived' },
  ]);
  protected readonly query = signal('');
  protected readonly activeCount = computed(() => this.routes().filter((route) => route.status === 'Active').length);
  protected readonly filtered = computed(() => this.routes().filter((route) => `${route.origin} ${route.destination} ${route.id}`.toLowerCase().includes(this.query().toLowerCase())));
  protected readonly editing = signal<ManagedRoute | null>(null);
  protected readonly form = signal({ origin: '', destination: '', distance: '0', transit: '' });
  protected readonly originLocation = signal<GeoLocation | null>(null);
  protected readonly destinationLocation = signal<GeoLocation | null>(null);
  protected update(field: 'origin' | 'destination' | 'distance' | 'transit', value: string): void { this.form.update((form) => ({ ...form, [field]: value })); }
  protected create(): void { this.form.set({ origin: '', destination: '', distance: '', transit: '' }); this.originLocation.set(null); this.destinationLocation.set(null); this.editing.set({ id: '', origin: '', destination: '', distance: 0, transit: '', status: 'Active' }); }
  protected edit(route: ManagedRoute): void { this.form.set({ origin: route.originLocation?.label ?? route.origin, destination: route.destinationLocation?.label ?? route.destination, distance: String(route.distance), transit: route.transit }); this.originLocation.set(route.originLocation ?? null); this.destinationLocation.set(route.destinationLocation ?? null); this.editing.set(route); }
  protected save(): void {
    const current = this.editing(); const form = this.form(); const distance = Number(form.distance);
    if (!current || !form.origin.trim() || !form.destination.trim() || !Number.isFinite(distance) || distance <= 0) return;
    const origin = this.originLocation()?.city ?? form.origin.trim(); const destination = this.destinationLocation()?.city ?? form.destination.trim();
    this.routes.update((routes) => current.id ? routes.map((route) => route.id === current.id ? { ...route, origin, destination, originLocation: this.originLocation() ?? undefined, destinationLocation: this.destinationLocation() ?? undefined, distance, transit: form.transit.trim() } : route) : [{ id: `RT-${100 + routes.length + 1}`, origin, destination, originLocation: this.originLocation() ?? undefined, destinationLocation: this.destinationLocation() ?? undefined, distance, transit: form.transit.trim() || 'Not set', status: 'Active' }, ...routes]);
    this.editing.set(null);
  }
  protected toggle(route: ManagedRoute): void { this.routes.update((routes) => routes.map((item) => item.id === route.id ? { ...item, status: item.status === 'Active' ? 'Archived' : 'Active' } : item)); }
  protected remove(route: ManagedRoute): void { this.routes.update((routes) => routes.filter((item) => item.id !== route.id)); }
}
