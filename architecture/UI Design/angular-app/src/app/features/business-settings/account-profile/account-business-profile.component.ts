import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiBusinessProfileService, BusinessProfileFields, BusinessProfileView, BusinessType, SaveBusinessProfile } from '../../../core/api/api-business-profile.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { apiFieldErrors } from '../../../core/api/api-error';
import { LanguageService } from '../../../core/i18n/language.service';
import { formatDateTime } from '../../../core/utils/date-format';
import { profileCopy } from './profile-copy';

type Field = keyof BusinessProfileFields;
type Draft = Record<Field, string>;
const FIELDS: Field[] = ['business_name', 'business_type', 'contact_email', 'contact_phone', 'address', 'city', 'state', 'pincode'];
const blankDraft = (): Draft => ({ business_name: '', business_type: '', contact_email: '', contact_phone: '', address: '', city: '', state: '', pincode: '' });

@Component({
  selector: 'app-account-business-profile', standalone: true, imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-business-profile.component.html', styleUrl: './account-business-profile.component.scss',
})
export class AccountBusinessProfileComponent {
  private readonly api = inject(ApiBusinessProfileService);
  private readonly language = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly copy = computed(() => profileCopy(this.language.lang()));
  protected readonly state = signal<'loading' | 'ready' | 'error' | 'forbidden'>('error');
  protected readonly data = signal<BusinessProfileView | null>(null);
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly draft = signal<Draft>(blankDraft());
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly message = signal<'saved' | 'unchanged' | ''>('');
  protected readonly saveError = signal<'saveError' | 'fixErrors' | 'conflict' | ''>('');
  protected readonly fields = FIELDS;
  protected readonly types: BusinessType[] = ['sole_proprietor', 'partnership', 'pvt_ltd', 'llp', 'public_ltd', 'other'];
  protected readonly dateTime = formatDateTime;

  constructor() { this.load(); }

  protected load(discardDraft = false): void {
    if (this.state() === 'loading' || this.saving() || (this.editing() && !discardDraft)) return;
    if (!API_CONFIG.useBackend) { this.state.set('forbidden'); return; }
    this.editing.set(false); this.message.set(''); this.saveError.set(''); this.errors.set({});
    this.state.set('loading'); this.data.set(null);
    this.api.get().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.data.set(data); this.state.set('ready'); },
      error: (error: HttpErrorResponse) => this.state.set(error.status === 403 ? 'forbidden' : 'error'),
    });
  }

  protected edit(): void {
    const data = this.data(); if (!data || this.saving()) return;
    const draft = blankDraft();
    for (const field of FIELDS) draft[field] = data.profile[field] ?? '';
    this.draft.set(draft); this.errors.set({}); this.saveError.set(''); this.message.set(''); this.editing.set(true);
  }
  protected cancel(): void {
    if (this.saving()) return;
    this.editing.set(false); this.draft.set(blankDraft()); this.errors.set({}); this.saveError.set('');
  }
  protected update(field: Field, value: string): void {
    this.draft.update((draft) => ({ ...draft, [field]: value }));
    this.errors.update((errors) => ({ ...errors, [field]: undefined }));
  }
  protected save(): void {
    const current = this.data(); if (this.saving() || !this.editing() || !current) return;
    this.saveError.set(''); this.message.set('');
    const draft = this.draft(); const c = this.copy(); const errors: Partial<Record<Field, string>> = {};
    if (draft.business_name.trim().length < 2 || draft.business_name.trim().length > 160) errors.business_name = c.nameLength;
    if (!this.types.includes(draft.business_type as BusinessType)) errors.business_type = c.required;
    if (draft.contact_email.trim() && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact_email.trim()) || draft.contact_email.trim().length > 150)) errors.contact_email = c.emailInvalid;
    if (draft.contact_phone.trim() && !/^\+?[0-9]{10,15}$/.test(draft.contact_phone.replace(/[\s()-]+/g, ''))) errors.contact_phone = c.phoneInvalid;
    if (draft.pincode.trim() && !/^[1-9][0-9]{5}$/.test(draft.pincode.trim())) errors.pincode = c.pinInvalid;
    for (const field of ['address', 'city', 'state'] as const) if (draft[field].trim().length > (field === 'address' ? 500 : 100)) errors[field] = c.tooLong;
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      this.saveError.set('fixErrors'); this.focusError(); return;
    }
    const payload: SaveBusinessProfile = { ...draft, business_type: draft.business_type as BusinessType, version: current.profile.version };
    this.saving.set(true);
    this.api.save(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.data.set(data); this.saving.set(false); this.editing.set(false); this.draft.set(blankDraft());
        this.message.set(data.changed ? 'saved' : 'unchanged');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        if (error.status === 409) { this.saveError.set('conflict'); return; }
        const fields = apiFieldErrors(error); const safeErrors: Partial<Record<Field, string>> = {};
        for (const field of FIELDS) if (fields[field]) safeErrors[field] = fields[field];
        this.errors.set(safeErrors); this.saveError.set(Object.keys(safeErrors).length ? 'fixErrors' : 'saveError');
        this.focusError();
      },
    });
  }
  protected value(field: Field): string {
    const value = this.data()?.profile[field];
    return field === 'business_type' && value ? this.copy().types[value as BusinessType] : value || this.copy().notSet;
  }
  private focusError(): void {
    const field = FIELDS.find((key) => this.errors()[key]);
    if (field) this.host.nativeElement.querySelector<HTMLElement>('#business-' + field)?.focus();
  }
}
