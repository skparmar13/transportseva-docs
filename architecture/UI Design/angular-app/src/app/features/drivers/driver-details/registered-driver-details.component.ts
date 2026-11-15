import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { ApiMarketplaceDriver, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { SessionService } from '../../../core/services/session.service';
import { LanguageService } from '../../../core/i18n';
import { formatDate } from '../../../core/utils/date-format';

type State = { status: 'loading' | 'ready' | 'not-found' | 'forbidden' | 'error'; driver?: ApiMarketplaceDriver };

@Component({
  selector: 'app-registered-driver-details', standalone: true, imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registered-driver-details.component.html',
})
export class RegisteredDriverDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiMarketplaceService);
  protected readonly session = inject(SessionService);
  private readonly language = inject(LanguageService);
  private readonly refresh = new Subject<void>();
  protected readonly listPath = computed(() => this.session.role() === 'truck-owner' ? 'drivers' : 'fleet/drivers');
  protected readonly state = toSignal(combineLatest([this.route.paramMap, this.refresh.pipe(startWith(undefined))]).pipe(
    switchMap(([params]) => {
      const uuid = params.get('id') ?? '';
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(uuid)) return of<State>({ status: 'not-found' });
      // The existing directory API enforces authenticated employer ownership.
      return this.api.listMarketplaceDrivers().pipe(
        map((drivers): State => {
          if (!Array.isArray(drivers)) throw new Error('Invalid driver directory');
          const driver = drivers.find((d) => d.uuid === uuid);
          return driver ? { status: 'ready', driver } : { status: 'not-found' };
        }),
        startWith<State>({ status: 'loading' }),
        catchError((error: HttpErrorResponse) => of<State>({ status: error.status === 403 ? 'forbidden' : 'error' })),
      );
    }),
  ), { initialValue: { status: 'loading' } as State });
  protected readonly date = formatDate;
  protected text(en: string, hi: string): string { return this.language.lang() === 'hi' ? hi : en; }
  protected reload(): void { if (this.state().status !== 'loading') this.refresh.next(); }
}
