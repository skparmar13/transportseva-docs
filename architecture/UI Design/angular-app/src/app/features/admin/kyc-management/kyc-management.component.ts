import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiMarketplaceKycProfile, ApiMarketplaceService, MarketplaceKycStatus } from '../../../core/api/api-marketplace.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDateTime } from '../../../core/utils/date-format';

type KycFilter = MarketplaceKycStatus | 'all';

@Component({
  selector: 'app-kyc-management',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc-management.component.html',
  styleUrl: './kyc-management.component.scss',
})
export class KycManagementComponent implements OnInit {
  private readonly api = inject(ApiMarketplaceService);
  protected readonly filter = signal<KycFilter>('pending');
  protected readonly profiles = signal<ApiMarketplaceKycProfile[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly actionUuid = signal<string | null>(null);
  protected readonly rejecting = signal<ApiMarketplaceKycProfile | null>(null);
  protected readonly rejectionNote = signal('');

  ngOnInit(): void { this.load(); }
  protected setFilter(filter: KycFilter): void { this.filter.set(filter); this.rejecting.set(null); this.load(); }
  protected displayDate(value?: string | null): string { return value ? formatDateTime(value) : '—'; }
  protected roleLabel(value?: string | null): string { return value === 'customer' || value === 'shipper' ? 'Shipper' : 'Fleet owner'; }
  protected openReject(profile: ApiMarketplaceKycProfile): void { this.rejectionNote.set(''); this.rejecting.set(profile); }
  protected cancelReject(): void { this.rejecting.set(null); this.rejectionNote.set(''); }
  protected approve(profile: ApiMarketplaceKycProfile): void { this.moderate(profile, 'approved'); }
  protected reject(): void {
    const profile = this.rejecting();
    if (!profile) return;
    if (this.rejectionNote().trim().length < 3) { this.error.set('Give the business a short reason for requesting changes.'); return; }
    this.moderate(profile, 'rejected', this.rejectionNote().trim());
  }
  protected download(profile: ApiMarketplaceKycProfile): void {
    this.error.set('');
    this.api.downloadMarketplaceKycDocument(profile.uuid).subscribe({
      next: (file) => { const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = profile.document_name; link.click(); URL.revokeObjectURL(url); },
      error: (error) => this.error.set(apiErrorMessage(error, 'The KYC document could not be downloaded.')),
    });
  }

  private load(): void {
    this.loading.set(true); this.error.set('');
    const filter = this.filter();
    this.api.listMarketplaceKyc(filter === 'all' ? undefined : filter).subscribe({
      next: (profiles) => { this.profiles.set(profiles); this.loading.set(false); },
      error: (error) => { this.loading.set(false); this.error.set(apiErrorMessage(error, 'KYC submissions could not be loaded. Please retry.')); },
    });
  }

  private moderate(profile: ApiMarketplaceKycProfile, status: 'approved' | 'rejected', note = ''): void {
    this.actionUuid.set(profile.uuid); this.error.set('');
    this.api.moderateMarketplaceKyc(profile.uuid, status, note).subscribe({
      next: () => { this.actionUuid.set(null); this.cancelReject(); this.load(); },
      error: (error) => { this.actionUuid.set(null); this.error.set(apiErrorMessage(error, 'The KYC decision could not be saved. Please retry.')); },
    });
  }
}
