import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { ApiAdminAccessService } from '../../../core/api/api-admin-access.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { API_CONFIG } from '../../../core/api/api-config';
import { StaffAccessReadiness } from '../../../core/models/staff-access.model';

@Component({
  selector: 'app-staff-access', standalone: true, imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './staff-access.component.html',
})
export class StaffAccessComponent implements OnInit {
  private readonly api = inject(ApiAdminAccessService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = signal<StaffAccessReadiness | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  ngOnInit(): void { this.load(); }
  protected load(): void {
    if (this.loading()) return;
    if (!API_CONFIG.useBackend) { this.error.set('Connect the backend to verify staff access. Prototype accounts do not prove permissions.'); return; }
    this.loading.set(true); this.error.set(''); this.state.set(null);
    this.api.session().pipe(timeout(15_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (state) => { this.state.set(state); this.loading.set(false); },
      error: (error) => { this.error.set(apiErrorMessage(error, 'Staff access could not be verified. Please retry.')); this.loading.set(false); },
    });
  }
}
