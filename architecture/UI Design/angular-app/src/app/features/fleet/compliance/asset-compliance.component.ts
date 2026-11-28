import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { ApiFleetComplianceService, AssetEvidence, FleetEvidenceKind, EvidenceVersion } from '../../../core/api/api-fleet-compliance.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { LanguageService } from '../../../core/i18n';
import { formatDate, formatDateTime } from '../../../core/utils/date-format';

@Component({ selector: 'app-asset-compliance', standalone: true, imports: [FormsModule], templateUrl: './asset-compliance.component.html', styleUrl: './compliance.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class AssetComplianceComponent {
  readonly kind = input.required<FleetEvidenceKind>(); readonly assetUuid = input.required<string>();
  readonly metadataChanged = output<void>();
  private readonly api = inject(ApiFleetComplianceService); private readonly destroy = inject(DestroyRef); private readonly lang = inject(LanguageService);
  readonly view = signal<AssetEvidence | null>(null); readonly busy = signal(''); readonly error = signal(''); readonly notice = signal(''); editing = false;
  declarations: Record<string, { valid_until: string; exception_requested: boolean; reason: string; reuse_previous: boolean }> = {};
  files: Record<string, File> = {};
  capacityDeclaration: number | null = null; private operation?: Subscription;
  readonly date = formatDate; readonly dateTime = formatDateTime;
  private readonly today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  expired(value?: string | null) { return !!value && value < this.today; }
  tr(en: string, hi: string) { return this.lang.lang() === 'hi' ? hi : en; }
  label(key: string) { return ({ rc: 'Registration certificate (RC)', insurance: 'Motor insurance', fitness: 'Fitness certificate', permit: 'Permit / authorisation', puc: 'Pollution certificate (PUC)', licence: 'Driving licence' } as Record<string, string>)[key] ?? key; }
  constructor() { effect(cleanup => { this.kind(); this.assetUuid(); untracked(() => { this.operation?.unsubscribe(); this.busy.set(''); this.view.set(null); this.load(); }); cleanup(() => this.operation?.unsubscribe()); }); }
  private accept(v: AssetEvidence) {
    this.view.set(v); this.editing = false; this.files = {}; this.capacityDeclaration = Number(v.subject['declared_capacity_tons']) || null;
    this.declarations = Object.fromEntries(v.keys.map(k => [k, { valid_until: v.current?.documents[k]?.declared_valid_until ?? '', exception_requested: v.current?.documents[k]?.exception_requested ?? false, reason: v.current?.documents[k]?.reason ?? '', reuse_previous: v.current?.documents[k]?.has_file ?? false }]));
  }
  load() {
    if (this.busy()) return; this.busy.set('load'); this.error.set('');
    this.operation = this.api.get(this.kind(), this.assetUuid()).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(''))).subscribe({
      next: v => this.accept(v),
      error: e => this.error.set(apiErrorMessage(e, 'Could not load fleet evidence. Please retry.')),
    });
  }
  choose(key: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.item(0); if (!file) return;
    delete this.files[key];
    if (file.size > 2 * 1024 * 1024 || !['application/pdf','image/png','image/jpeg'].includes(file.type)) { (event.target as HTMLInputElement).value = ''; this.error.set('Select a PDF, JPG or PNG up to 2 MB.'); return; }
    this.files[key] = file; this.declarations[key].reuse_previous = false; this.error.set('');
  }
  submit() {
    const v = this.view(); if (!v || this.busy()) return;
    for (const key of v.keys) {
      const d = this.declarations[key];
      if ((!d.exception_requested && !d.valid_until) || (!d.exception_requested && !d.reuse_previous && !this.files[key]) || (d.exception_requested && d.reason.trim().length < 10)) { this.error.set('Provide the evidence, expiry dates and any applicability reason for each document.'); return; }
    }
    const body = new FormData(); body.set('expected_version', String(v.current?.version ?? 0)); body.set('declarations', JSON.stringify(this.declarations));
    if (this.kind() === 'vehicle' && this.capacityDeclaration !== null) body.set('declared_capacity_tons', String(this.capacityDeclaration));
    for (const [key, file] of Object.entries(this.files)) if (!this.declarations[key].reuse_previous) body.set(`files[${key}]`, file);
    this.busy.set('submit'); this.error.set(''); this.notice.set('');
    this.operation = this.api.submit(this.kind(), this.assetUuid(), body).pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(''))).subscribe({
      next: current => { const changed = this.kind() === 'vehicle' && Number(current.subject['declared_capacity_tons']) !== Number(v.subject['declared_capacity_tons']); this.accept({ ...v, subject: current.subject as AssetEvidence['subject'], current, history: [current, ...v.history].slice(0,15) }); this.notice.set('Documents submitted. Manual approval is required before a new departure.'); if (changed) this.metadataChanged.emit(); },
      error: e => this.error.set(apiErrorMessage(e, 'Submission failed. Refresh the evidence before retrying.')),
    });
  }
  download(v: EvidenceVersion, key: string) {
    if (this.busy()) return; this.busy.set('download'); this.error.set('');
    this.api.download(v.uuid,key).pipe(takeUntilDestroyed(this.destroy),finalize(() => this.busy.set(''))).subscribe({ next: blob => { const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${key}-v${v.version}`; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000); }, error: e => this.error.set(apiErrorMessage(e,'Document download failed.')) });
  }
}
