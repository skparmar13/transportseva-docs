import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/i18n';

interface ApiCredential { id: string; name: string; prefix: string; environment: 'Sandbox' | 'Production'; created: string; lastUsed: string; status: 'Active' | 'Revoked'; }

@Component({ selector: 'app-api-management', standalone: true, imports: [FormsModule, ModalComponent, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './api-management.component.html' })
export class ApiManagementComponent {
  protected readonly keys = signal<ApiCredential[]>([
    { id: 'key-1', name: 'ERP Integration', prefix: 'ts_sbx_••••9a42', environment: 'Sandbox', created: '12 Sep 2026', lastUsed: 'Today, 9:45 AM', status: 'Active' },
    { id: 'key-2', name: 'Fleet Analytics', prefix: 'ts_prd_••••71bd', environment: 'Production', created: '2 Sep 2026', lastUsed: 'Yesterday', status: 'Active' },
    { id: 'key-3', name: 'Legacy TMS', prefix: 'ts_sbx_••••003e', environment: 'Sandbox', created: '18 Aug 2026', lastUsed: 'Never', status: 'Revoked' },
  ]);
  protected readonly activeCount = computed(() => this.keys().filter((key) => key.status === 'Active').length);
  protected readonly creating = signal(false);
  protected readonly name = signal('');
  protected readonly environment = signal<'Sandbox' | 'Production'>('Sandbox');
  protected readonly issuedSecret = signal<string | null>(null);
  protected openCreate(): void { this.name.set(''); this.environment.set('Sandbox'); this.creating.set(true); }
  protected create(): void { const name = this.name().trim(); if (!name) return; const id = `key-${Date.now()}`; const fragment = Math.random().toString(36).slice(2, 10); const prefix = this.environment() === 'Sandbox' ? 'ts_sbx' : 'ts_prd'; this.keys.update((keys) => [{ id, name, prefix: `${prefix}_••••${fragment.slice(-4)}`, environment: this.environment(), created: 'Today', lastUsed: 'Never', status: 'Active' }, ...keys]); this.issuedSecret.set(`${prefix}_${fragment}`); this.creating.set(false); }
  protected rotate(key: ApiCredential): void { const fragment = Math.random().toString(36).slice(2, 10); const prefix = key.environment === 'Sandbox' ? 'ts_sbx' : 'ts_prd'; this.keys.update((keys) => keys.map((item) => item.id === key.id ? { ...item, prefix: `${prefix}_••••${fragment.slice(-4)}`, created: 'Today' } : item)); this.issuedSecret.set(`${prefix}_${fragment}`); }
  protected revoke(key: ApiCredential): void { this.keys.update((keys) => keys.map((item) => item.id === key.id ? { ...item, status: 'Revoked' } : item)); }
}
