import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiContactInquiryService, ContactDraft, InquiryReceipt, InquirySubject } from '../../../core/api/api-contact-inquiry.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { apiFieldErrors } from '../../../core/api/api-error';
import { LanguageService } from '../../../core/i18n';
import { SeoService } from '../../../core/seo/seo.service';
import { formatDateTime } from '../../../core/utils/date-format';
import { contactCopy } from './contact-copy';

const blank = (): ContactDraft => ({ full_name: '', phone: '', email: '', subject: 'general', message: '', website: '' });
@Component({ selector: 'app-contact', standalone: true, imports: [FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './contact.component.html', styleUrl: './contact.component.scss' })
export class ContactComponent {
  private readonly api = inject(ApiContactInquiryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  protected readonly copy = computed(() => contactCopy(this.language.lang()));
  protected readonly draft = signal<ContactDraft>(blank());
  protected readonly saving = signal(false);
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly error = signal('');
  protected readonly receipt = signal<InquiryReceipt | null>(null);
  protected readonly conflict = signal(false);
  protected readonly subjects: InquirySubject[] = ['general', 'booking', 'partnership', 'billing'];
  protected readonly dateTime = formatDateTime;
  private submissionId: string | null = null;
  constructor() { inject(SeoService).update({ title: 'Contact TransportSeva | Enquiries', description: 'Contact TransportSeva about shipments, your account or a partnership.', url: '/contact' }); }
  protected update(field: keyof ContactDraft, value: string): void { this.draft.update((draft) => ({ ...draft, [field]: value })); }
  protected newEnquiry(): void { if (this.saving()) return; this.submissionId = null; this.receipt.set(null); this.error.set(''); this.errors.set({}); this.conflict.set(false); }
  protected submit(): void {
    if (this.saving() || this.receipt() || this.conflict()) return;
    this.error.set(''); this.errors.set({});
    if (!API_CONFIG.useBackend) { this.error.set(this.copy().unavailable); return; }
    const d = this.draft(); const errors: Record<string, string> = {};
    if (d.full_name.trim().length < 2 || d.full_name.trim().length > 100) errors['full_name'] = this.copy().invalidName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()) || d.email.length > 150) errors['email'] = this.copy().invalidEmail;
    if (!/^\+?[1-9][0-9]{9,14}$/.test(d.phone.trim().replace(/[\s()-]/g, ''))) errors['phone'] = this.copy().invalidPhone;
    if (d.message.trim().length < 10 || d.message.length > 5000) errors['message'] = this.copy().invalidMessage;
    if (!this.subjects.includes(d.subject)) errors['subject'] = this.copy().required;
    if (Object.keys(errors).length) { this.errors.set(errors); return; }
    this.submissionId ??= crypto.randomUUID(); this.saving.set(true);
    this.api.submit({ ...d, submission_id: this.submissionId }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (receipt) => { this.receipt.set(receipt); this.draft.set(blank()); this.saving.set(false); },
      error: (e) => { this.saving.set(false); this.errors.set(apiFieldErrors(e)); this.conflict.set(e instanceof HttpErrorResponse && e.status === 409); this.error.set(e instanceof HttpErrorResponse && e.status === 429 ? this.copy().rate : this.conflict() ? this.copy().conflictMessage : this.copy().failed); },
    });
  }
}
