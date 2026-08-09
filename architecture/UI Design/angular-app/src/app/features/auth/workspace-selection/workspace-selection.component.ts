import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthShellComponent } from '../../../shared/layouts/auth-shell/auth-shell.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { WorkspaceOption } from '../../../core/models/auth.model';

@Component({
  selector: 'app-workspace-selection',
  standalone: true,
  imports: [AuthShellComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace-selection.component.html',
  styleUrl: './workspace-selection.component.scss',
})
export class WorkspaceSelectionComponent {
  private readonly auth = inject(AuthMockService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly workspaces = toSignal(this.auth.getWorkspaces(), { initialValue: [] });

  protected selectWorkspace(workspace: WorkspaceOption): void {
    this.session.setRole(workspace.role);
    this.router.navigate([this.session.portal().basePath, 'dashboard']);
  }
}
