import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiMarketplaceKycProfile, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { formatDateTime } from '../../../core/utils/date-format';

@Component({
  selector: 'app-my-kyc',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-kyc.component.html',
  styleUrl: './my-kyc.component.scss',
})
export class MyKycComponent implements OnInit {
  private readonly api = inject(ApiMarketplaceService);
  protected readonly profile = signal<ApiMarketplaceKycProfile | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly businessName = signal('');
  protected readonly businessType = signal<ApiMarketplaceKycProfile['business_type']>('individual');
  protected readonly panNumber = signal('');
  protected readonly gstin = signal('');
  protected readonly selectedFile = signal<File | null>(null);

  ngOnInit(): void { this.load(); }

  protected statusLabel(status: ApiMarketplaceKycProfile['status']): string {
    return status === 'approved' ? 'KYC approved' : status === 'rejected' ? 'Changes requested' : 'Awaiting verification';
  }

  protected displayDate(value?: string | null): string { return value ? formatDateTime(value) : '—'; }

  protected onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.item(0) ?? null);
    this.error.set('');
  }

  protected submit(): void {
    const file = this.selectedFile();
    if (!this.businessName().trim() || !this.panNumber().trim() || !file) {
      this.error.set('Enter the business name and PAN, then select a supporting document.');
      return;
    }
    this.saving.set(true); this.error.set(''); this.success.set('');
    const data = new FormData();
    data.set('business_name', this.businessName().trim());
    data.set('business_type', this.businessType());
    data.set('pan_number', this.panNumber().trim().toUpperCase());
    if (this.gstin().trim()) data.set('gstin', this.gstin().trim().toUpperCase());
    data.set('document', file);
    this.api.submitMarketplaceKyc(data).subscribe({
      next: (profile) => {
        this.profile.set(profile); this.selectedFile.set(null); this.panNumber.set(''); this.gstin.set('');
        this.saving.set(false); this.success.set('Your KYC has been submitted for review.');
      },
      error: (error) => { this.saving.set(false); this.error.set(apiErrorMessage(error, 'KYC could not be submitted. Please check the form and try again.')); },
    });
  }

  protected download(profile: ApiMarketplaceKycProfile): void {
    this.error.set('');
    this.api.downloadMarketplaceKycDocument(profile.uuid).subscribe({
      next: (file) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url; link.download = profile.document_name; link.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => this.error.set(apiErrorMessage(error, 'The KYC document could not be downloaded.')),
    });
  }

  private load(): void {
    this.loading.set(true); this.error.set('');
    this.api.getMarketplaceKyc().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        if (profile) { this.businessName.set(profile.business_name); this.businessType.set(profile.business_type); }
        this.loading.set(false);
      },
      error: (error) => { this.loading.set(false); this.error.set(apiErrorMessage(error, 'KYC details could not be loaded. Please refresh the page.')); },
    });
  }
}
