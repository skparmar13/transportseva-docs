import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n';
import { DashboardMockService } from '../../../core/services/dashboard-mock.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-transporter-dashboard',
  standalone: true,
  imports: [IconComponent, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transporter-dashboard.component.html',
})
export class TransporterDashboardComponent {
  private readonly mock = inject(DashboardMockService);
  protected readonly session = inject(SessionService);

  protected readonly kpis = toSignal(this.mock.getTransporterKpis(), { initialValue: [] });
  protected readonly requests = toSignal(this.mock.getTransporterRequests(), { initialValue: [] });
  protected readonly quickActions = toSignal(this.mock.getTransporterQuickActions(), { initialValue: [] });
}
