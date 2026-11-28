import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiFleetComplianceService, DispatchChecks, FleetEvidenceKind } from '../../../core/api/api-fleet-compliance.service';
import { ApiMarketplaceBooking, ApiMarketplaceDriver, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { AssetComplianceComponent } from './asset-compliance.component';
import { SessionService } from '../../../core/services/session.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { LanguageService } from '../../../core/i18n';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';

@Component({ selector: 'app-booking-dispatch', standalone: true, imports: [FormsModule, RouterLink, AssetComplianceComponent], templateUrl: './booking-dispatch.component.html', styleUrl: './compliance.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class BookingDispatchComponent {
  readonly bookingUuid = input.required<string>(); readonly revision = input(''); readonly providerSide = input(false); readonly canStart = input(false);
  readonly started = output<ApiMarketplaceBooking>(); private readonly api = inject(ApiFleetComplianceService); private readonly marketplace = inject(ApiMarketplaceService);
  private readonly destroy = inject(DestroyRef); private readonly session = inject(SessionService); private readonly lang = inject(LanguageService);
  readonly checks = signal<DispatchChecks | null>(null); readonly busy = signal(''); readonly error = signal(''); attested = false; routeNote = ''; private refreshQueued = false;
  readonly legacyDrivers = signal<ApiMarketplaceDriver[]>([]); legacyDriver = ''; legacyNote = '';
  readonly date = formatDate; readonly dateTime = formatDateTime;
  tr(en: string, hi: string) { return this.lang.lang() === 'hi' ? hi : en; }
  constructor() { effect(() => { this.bookingUuid(); this.revision(); untracked(() => this.load()); }); }
  load() {
    if (this.busy()) { this.refreshQueued = true; return; }
    this.busy.set('load'); this.error.set('');
    this.api.checks(this.bookingUuid()).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.finish())).subscribe({ next: c => { this.checks.set(c); this.attested = false; if (c.legacy_driver_link_required && this.providerSide()) this.marketplace.listMarketplaceDrivers().pipe(takeUntilDestroyed(this.destroy)).subscribe({ next: d => this.legacyDrivers.set(d), error: e => this.error.set(apiErrorMessage(e)) }); }, error: e => this.error.set(apiErrorMessage(e, 'Dispatch checks could not be loaded. Please retry.')) });
  }
  private finish() { this.busy.set(''); if (this.refreshQueued && !this.destroy.destroyed) { this.refreshQueued = false; this.load(); } }
  path(kind: FleetEvidenceKind, id: string): string[] {
    const base = this.session.portal().basePath;
    if (kind === 'booking_vehicle') return [base, this.session.role() === 'transporter' ? 'requests' : 'bookings'];
    const segment = kind === 'driver' ? 'drivers' : 'vehicles';
    return [base, ...(this.session.role() === 'transporter' ? ['fleet', segment] : [segment]), id];
  }
  start() {
    if (!this.canStart() || !this.providerSide() || !this.checks()?.ready || !this.attested || this.routeNote.trim().length < 10 || this.busy()) return;
    this.busy.set('start'); this.error.set('');
    this.marketplace.updateMarketplaceWorkflow(this.bookingUuid(),'start_trip',{ operator_attested: true, route_check_note: this.routeNote.trim() }).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.finish())).subscribe({ next: b => { this.started.emit(b); this.attested = false; this.routeNote = ''; this.load(); }, error: e => this.error.set(apiErrorMessage(e,'Departure was blocked. Refresh the checks and resolve the listed requirements.')) });
  }
  linkDriver() {
    if (this.busy() || !this.providerSide() || !this.legacyDriver || this.legacyNote.trim().length < 10) return;
    this.busy.set('link'); this.error.set(''); this.api.linkDriver(this.bookingUuid(),this.legacyDriver,this.legacyNote.trim()).pipe(takeUntilDestroyed(this.destroy),finalize(() => this.finish())).subscribe({ next: b => { this.started.emit(b); this.load(); }, error: e => this.error.set(apiErrorMessage(e)) });
  }
}
