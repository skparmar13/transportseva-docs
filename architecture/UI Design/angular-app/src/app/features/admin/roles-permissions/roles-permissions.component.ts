import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout } from 'rxjs';
import { ApiAdminAccessService, StoredAdminRole } from '../../../core/api/api-admin-access.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { apiErrorMessage } from '../../../core/api/api-error';
import { TranslatePipe } from '../../../core/i18n';

@Component({ selector: 'app-roles-permissions', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './roles-permissions.component.html' })
export class RolesPermissionsComponent implements OnInit {
  private readonly api = inject(ApiAdminAccessService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly roles = signal<StoredAdminRole[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly page = signal(1);
  protected readonly lastPage = signal(1);
  ngOnInit(): void { this.load(); }
  protected changePage(page: number): void { this.page.set(page); this.load(); }
  protected load(): void {
    if (!API_CONFIG.useBackend) { this.error.set('Connect the backend to inspect stored roles and permissions.'); return; }
    this.loading.set(true); this.error.set('');
    this.api.roles(this.page()).pipe(timeout(15_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data, meta }) => { this.roles.set(data); this.page.set(meta.current_page); this.lastPage.set(meta.last_page); this.loading.set(false); },
      error: (error) => { this.loading.set(false); this.roles.set([]); this.error.set(apiErrorMessage(error, 'Stored roles could not be loaded. Please retry.')); },
    });
  }
}
