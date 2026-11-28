import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiFleetComplianceService, EvidenceVersion } from '../../../core/api/api-fleet-compliance.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { SessionService } from '../../../core/services/session.service';
import { LanguageService } from '../../../core/i18n';
import { formatDateTime } from '../../../core/utils/date-format';

@Component({ selector: 'app-fleet-compliance-review', standalone: true, imports: [FormsModule], templateUrl: './fleet-compliance-review.component.html', styleUrl: './compliance.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class FleetComplianceReviewComponent {
  private readonly api = inject(ApiFleetComplianceService); private readonly destroy = inject(DestroyRef); private readonly route = inject(ActivatedRoute); private readonly lang = inject(LanguageService);
  readonly session = inject(SessionService); readonly rows = signal<EvidenceVersion[]>([]); readonly selected = signal<EvidenceVersion | null>(null);
  readonly busy = signal(''); readonly error = signal(''); readonly notice = signal(''); filter = 'pending'; page = 1; lastPage = 1;
  note = ''; evidenceReference = ''; attested = false; payload: number | null = null; gvw: number | null = null; unladen: number | null = null; vehicleType = '32ft Trailer';
  readonly vehicleTypes = ['Open Body Truck','20ft Container','32ft Trailer','Mini Truck','Tanker','Trailer (Flatbed)']; licenceTypes: Record<string, boolean> = {};
  reviewedDocs: Record<string, { valid_until: string; exempt: boolean; reason: string }> = {};
  readonly dateTime = formatDateTime;
  tr(en: string, hi: string) { return this.lang.lang() === 'hi' ? hi : en; }
  keys(v: EvidenceVersion) { return Object.keys(v.documents); }
  constructor() {
    this.load();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(p => { const id = p.get('fleet'); if (id && /^[a-f0-9-]{36}$/i.test(id)) this.api.item(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({ next: v => this.open(v), error: e => this.error.set(apiErrorMessage(e)) }); });
  }
  load() {
    if (!this.session.canStaffAction('marketplace.kyc.view') || this.busy()) return;
    this.busy.set('load'); this.error.set('');
    this.api.queue(this.filter, this.page).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(''))).subscribe({ next: r => { this.rows.set(r.rows); this.page = r.page; this.lastPage = r.last_page; }, error: e => this.error.set(apiErrorMessage(e, 'Could not load fleet review queue.')) });
  }
  setFilter() { this.page = 1; this.selected.set(null); this.load(); }
  open(v: EvidenceVersion) {
    this.selected.set(v); this.notice.set(''); this.error.set(''); this.attested = false; this.note = ''; this.evidenceReference = '';
    this.payload = v.review?.verified_payload_tons ?? null; this.gvw = v.review?.gvw_kg ?? null; this.unladen = v.review?.unladen_kg ?? null; this.vehicleType = String(v.subject['vehicle_type'] ?? v.review?.vehicle_type ?? '32ft Trailer');
    this.licenceTypes = Object.fromEntries(this.vehicleTypes.map(t => [t, v.review?.vehicle_types?.includes(t) ?? false]));
    this.reviewedDocs = Object.fromEntries(this.keys(v).map(key => [key, { valid_until: v.documents[key].declared_valid_until ?? '', exempt: v.documents[key].exception_requested, reason: v.documents[key].reason ?? '' }]));
  }
  download(key: string) {
    const v = this.selected(); if (!v || this.busy() || !this.session.canStaffAction('marketplace.kyc.document')) return;
    this.busy.set('download'); this.error.set(''); this.api.download(v.uuid,key).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(''))).subscribe({ next: blob => { const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${key}-v${v.version}`;a.click();setTimeout(() => URL.revokeObjectURL(url),1000); }, error: e => this.error.set(apiErrorMessage(e,'Document could not be downloaded.')) });
  }
  review(decision: 'approved' | 'rejected') {
    const v = this.selected(); if (!v || this.busy() || !this.session.canStaffAction('marketplace.kyc.moderate')) return;
    if (!this.attested || this.note.trim().length < 10 || this.evidenceReference.trim().length < 8) { this.error.set('Record your review note, evidence reference and attestation.'); return; }
    const body = { version: v.version, fingerprint: v.fingerprint, decision, documents: this.reviewedDocs, note: this.note.trim(), evidence_reference: this.evidenceReference.trim(), attested: this.attested,
      verified_payload_tons: this.payload, gvw_kg: this.gvw, unladen_kg: this.unladen, vehicle_type: this.vehicleType, vehicle_types: this.vehicleTypes.filter(t => this.licenceTypes[t]) };
    this.busy.set('review'); this.error.set(''); this.api.review(v.uuid,body).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(''))).subscribe({ next: r => { this.selected.set(r); this.rows.update(rows => rows.map(x => x.uuid === r.uuid ? r : x)); this.notice.set('Manual review recorded. No government verification is implied.'); }, error: e => this.error.set(apiErrorMessage(e, 'Review failed. Refresh the latest evidence before retrying.')) });
  }
  revoke() {
    const v = this.selected(); if (!v || this.busy() || !this.session.canStaffAction('marketplace.kyc.moderate')) return;
    if (this.note.trim().length < 10) { this.error.set('Provide the reason for revoking approval.'); return; }
    this.busy.set('revoke'); this.error.set(''); this.api.revoke(v.uuid,{ version: v.version, fingerprint: v.fingerprint, note: this.note.trim() }).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(''))).subscribe({ next: r => { this.selected.set(r); this.rows.update(rows => rows.map(x => x.uuid === r.uuid ? r : x)); this.notice.set('Approval revoked for future departures. Earlier evidence is preserved.'); }, error: e => this.error.set(apiErrorMessage(e)) });
  }
  changePage(delta: number) { this.page += delta; this.load(); }
}
