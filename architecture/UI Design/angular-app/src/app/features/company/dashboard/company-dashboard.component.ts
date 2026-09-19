import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n';
import { BusinessSettingsMockService } from '../../../core/services/business-settings-mock.service';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { TripMockService } from '../../../core/services/trip-mock.service';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [IconComponent, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>{{ 'companyDashboard.welcome' | t:{ name: settings.company().companyName } }}</h1>
    <p class="desc">{{ 'companyDashboard.subtitle' | t }}</p>
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-top"><div class="kpi-icon"><app-icon name="i-car" /></div></div><div class="kpi-value">{{ fleet.vehicles().length }}</div><div class="kpi-label">{{ 'companyDashboard.fleet' | t }}</div></div>
      <div class="kpi-card"><div class="kpi-top"><div class="kpi-icon"><app-icon name="i-route" /></div></div><div class="kpi-value">{{ trips.activeTrips().length }}</div><div class="kpi-label">{{ 'companyDashboard.activeTrips' | t }}</div></div>
      <div class="kpi-card"><div class="kpi-top"><div class="kpi-icon"><app-icon name="i-users" /></div></div><div class="kpi-value">{{ settings.staff().length }}</div><div class="kpi-label">{{ 'companyDashboard.teamMembers' | t }}</div></div>
      <div class="kpi-card"><div class="kpi-top"><div class="kpi-icon"><app-icon name="i-building" /></div></div><div class="kpi-value">{{ settings.branches().length }}</div><div class="kpi-label">{{ 'companyDashboard.branches' | t }}</div></div>
    </div>
    <div class="card">
      <div class="card-head"><h3>{{ 'companyDashboard.quickLinks' | t }}</h3></div>
      <div class="qa-list">
        <a class="qa-item" routerLink="/company/bookings"><app-icon name="i-box" /><span>{{ 'nav.bookings' | t }}</span></a>
        <a class="qa-item" routerLink="/company/fleet"><app-icon name="i-car" /><span>{{ 'nav.fleetDrivers' | t }}</span></a>
        <a class="qa-item" routerLink="/company/trips"><app-icon name="i-route" /><span>{{ 'nav.trips' | t }}</span></a>
        <a class="qa-item" routerLink="/company/staff"><app-icon name="i-users" /><span>{{ 'nav.staffManagement' | t }}</span></a>
      </div>
    </div>
  `,
})
export class CompanyDashboardComponent {
  protected readonly settings = inject(BusinessSettingsMockService);
  protected readonly fleet = inject(FleetMockService);
  protected readonly trips = inject(TripMockService);
}
