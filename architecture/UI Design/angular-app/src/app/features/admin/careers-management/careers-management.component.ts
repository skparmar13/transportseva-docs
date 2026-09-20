import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n';
import { CareerJob, CareerStatus, CareersMockService } from '../../../core/services/careers-mock.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

type CareerForm = Omit<CareerJob, 'id' | 'status' | 'updatedAt'>;
const emptyForm = (): CareerForm => ({ title: { en: '', hi: '' }, department: '', location: '', employmentType: 'Full-time', summary: { en: '', hi: '' }, description: { en: '', hi: '' }, requirements: { en: '', hi: '' }, applicationUrl: '', closingDate: '' });

@Component({
  selector: 'app-careers-management',
  standalone: true,
  imports: [FormsModule, ModalComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './careers-management.component.html',
})
export class CareersManagementComponent {
  private readonly careers = inject(CareersMockService);
  protected readonly jobs = this.careers.jobs;
  protected readonly editingId = signal<string | null>(null);
  protected readonly form = signal<CareerForm>(emptyForm());
  protected readonly formError = signal('');
  protected readonly statusFilter = signal<'All' | CareerStatus>('All');
  protected readonly query = signal('');
  protected readonly publishedCount = computed(() => this.jobs().filter((job) => job.status === 'Published').length);
  protected readonly filteredJobs = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.jobs().filter((job) => (this.statusFilter() === 'All' || job.status === this.statusFilter())
      && (!query || `${job.title.en} ${job.title.hi} ${job.department} ${job.location}`.toLowerCase().includes(query)));
  });

  protected update<K extends keyof CareerForm>(key: K, value: CareerForm[K]): void { this.form.update((form) => ({ ...form, [key]: value })); }
  protected updateLocalized(key: 'title' | 'summary' | 'description' | 'requirements', language: 'en' | 'hi', value: string): void {
    this.form.update((form) => ({ ...form, [key]: { ...form[key], [language]: value } }));
  }
  protected create(): void { this.form.set(emptyForm()); this.formError.set(''); this.editingId.set(''); }
  protected edit(job: CareerJob): void {
    const { id, status: _status, updatedAt: _updatedAt, ...form } = job;
    this.form.set(structuredClone(form)); this.formError.set(''); this.editingId.set(id);
  }
  protected cancel(): void { this.editingId.set(null); this.formError.set(''); }
  protected save(): void {
    const form = this.form();
    if (!form.title.en.trim() || !form.department.trim() || !form.location.trim() || !form.summary.en.trim() || !form.description.en.trim()) {
      this.formError.set('admin.careers.validationRequired'); return;
    }
    const current = this.jobs().find((job) => job.id === this.editingId());
    this.careers.save({ ...form, id: current?.id ?? `JOB-${Date.now()}`, status: current?.status ?? 'Draft', updatedAt: current?.updatedAt ?? 'Today' });
    this.cancel();
  }
  protected publish(job: CareerJob): void {
    if (!job.applicationUrl || !/^https?:\/\//i.test(job.applicationUrl)) { this.edit(job); this.formError.set('admin.careers.publishRequiresUrl'); return; }
    this.careers.setStatus(job.id, 'Published');
  }
  protected unpublish(job: CareerJob): void { this.careers.setStatus(job.id, 'Draft'); }
  protected closeJob(job: CareerJob): void { this.careers.setStatus(job.id, 'Closed'); }
  protected reopen(job: CareerJob): void { this.careers.setStatus(job.id, 'Draft'); }
  protected remove(job: CareerJob): void { if (globalThis.confirm('Remove this job opening?')) this.careers.remove(job.id); }
}
