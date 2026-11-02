import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiShipperDocumentService, PodDocumentStatus } from '../../../core/api/api-shipper-document.service';
import { LanguageService } from '../../../core/i18n';
import { formatDateTime } from '../../../core/utils/date-format';
import { DOCUMENT_COPY } from './document-copy';

@Component({
  selector: 'app-shipper-documents', standalone: true, imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './shipper-documents.component.html',
  styleUrl: './shipper-documents.scss',
})
export class ShipperDocumentsComponent {
  private readonly api = inject(ApiShipperDocumentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => DOCUMENT_COPY[this.language.lang()]);
  protected readonly dateTime = formatDateTime;
  protected readonly data = signal<AwaitedDocumentPage | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly downloading = signal('');
  protected readonly downloadError = signal('');
  protected readonly tab = signal<'pods' | 'kyc'>(inject(ActivatedRoute).snapshot.queryParamMap.get('tab') === 'kyc' ? 'kyc' : 'pods');
  protected readonly status = signal<PodDocumentStatus | 'all'>('all');
  protected readonly search = signal('');
  protected readonly page = signal(1);
  protected readonly statuses = ['all', 'pending_approval', 'approved', 'rejected', 'other'] as const;
  constructor() { this.load(); }

  protected load(page = 1): void {
    if (this.loading() || this.downloading()) return;
    this.page.set(page); this.loading.set(true); this.error.set(''); this.data.set(null); this.downloadError.set('');
    if (!API_CONFIG.useBackend) { this.loading.set(false); this.error.set(this.copy().offline); return; }
    this.api.list(page, this.status(), this.search().trim()).pipe(timeout(25_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.data.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set(this.copy().failed); },
    });
  }

  protected download(kind: 'pod' | 'kyc', uuid: string, name: string | null, available: boolean): void {
    if (!available || this.downloading() || this.loading()) return;
    this.downloading.set(kind + ':' + uuid); this.downloadError.set('');
    this.api.download(kind, uuid).pipe(timeout(45_000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob); const link = this.document.createElement('a');
        link.href = url; link.download = (name || 'document').replace(/[\\/\u0000-\u001f\u007f]/g, '_').slice(0, 180);
        link.click(); URL.revokeObjectURL(url); this.downloading.set('');
      },
      error: () => { this.downloading.set(''); this.downloadError.set(this.copy().downloadFailed); },
    });
  }
}
type AwaitedDocumentPage = ReturnType<ApiShipperDocumentService['list']> extends import('rxjs').Observable<infer T> ? T : never;
