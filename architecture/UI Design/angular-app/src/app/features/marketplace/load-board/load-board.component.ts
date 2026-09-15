import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { TranslatePipe } from '../../../core/i18n';

/**
 * Load Board — the open marketplace where Transporters and Truck
 * Owners discover loads posted by Shippers (or by Transporters on
 * behalf of offline customers) and apply. Excludes the viewer's own
 * posted loads and anything already booked/closed.
 */
@Component({
  selector: 'app-load-board',
  standalone: true,
  imports: [IconComponent, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './load-board.component.html',
})
export class LoadBoardComponent {
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly search = signal('');
  protected readonly vehicleFilter = signal('');

  protected readonly openLoads = computed(() =>
    this.marketplace.loads().filter((load) => load.status === 'Open' || load.status === 'Applications Received'),
  );

  protected readonly filteredLoads = computed(() => {
    const term = this.search().trim().toLowerCase();
    const vehicle = this.vehicleFilter();
    return this.openLoads().filter((load) => {
      const matchesTerm =
        !term ||
        load.pickupCity.toLowerCase().includes(term) ||
        load.dropCity.toLowerCase().includes(term) ||
        load.material.toLowerCase().includes(term);
      const matchesVehicle = !vehicle || load.vehicleType === vehicle;
      return matchesTerm && matchesVehicle;
    });
  });

  protected readonly vehicleTypes = ['Open Body Truck', '20ft Container', '32ft Trailer', 'Mini Truck', 'Tanker', 'Trailer (Flatbed)'];

  protected statusKey(s: string): string {
    return 'status.' + s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');
  }

  protected viewLoad(loadId: string): void {
    this.router.navigate([this.session.portal().basePath, 'load-board', loadId]);
  }
}
