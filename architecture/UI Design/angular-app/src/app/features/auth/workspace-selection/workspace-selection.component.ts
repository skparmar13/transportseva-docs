import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { WorkspaceOption } from '../../../core/models/auth.model';
import { TranslatePipe } from '../../../core/i18n';

@Component({
  selector: 'app-workspace-selection',
  standalone: true,
  imports: [AuthShellComponent, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace-selection.component.html',
  styleUrl: './workspace-selection.component.scss',
})
export class WorkspaceSelectionComponent {
  private readonly auth = inject(AuthMockService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly workspaces = toSignal(this.auth.getWorkspaces(), { initialValue: [] });

  /** Maps a workspace role onto its translation-key stem under `workspaceSelection.role.*`. */
  protected roleTagKey(role: WorkspaceOption['role']): string {
    switch (role) {
      case 'truck-owner':
        return 'workspaceSelection.role.truckOwner';
      case 'transporter':
        return 'workspaceSelection.role.transporter';
      case 'driver':
        return 'workspaceSelection.role.driver';
      default:
        return 'workspaceSelection.role.shipper';
    }
  }

  protected selectWorkspace(workspace: WorkspaceOption): void {
    this.session.setRole(workspace.role);
    this.router.navigate([this.session.portal().basePath, 'dashboard']);
  }
}
