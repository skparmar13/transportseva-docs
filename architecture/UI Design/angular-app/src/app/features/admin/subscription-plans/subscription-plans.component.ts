import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/i18n';

interface AdminPlan { tier: string; name: string; price: string; billing: string; subscribers: number; status: 'Available' | 'Archived'; }

@Component({ selector: 'app-subscription-plans', standalone: true, imports: [FormsModule, ModalComponent, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './subscription-plans.component.html' })
export class SubscriptionPlansComponent {
  protected readonly plans = signal<AdminPlan[]>([
    { tier: 'Starter', name: 'TransportSeva Starter', price: '₹0', billing: 'Free', subscribers: 2840, status: 'Available' },
    { tier: 'Professional', name: 'TransportSeva Professional', price: '₹2,499', billing: 'Monthly · annual billing', subscribers: 386, status: 'Available' },
    { tier: 'Enterprise', name: 'TransportSeva Enterprise', price: 'Custom', billing: 'Contact sales', subscribers: 24, status: 'Available' },
  ]);
  protected readonly editing = signal<AdminPlan | null>(null);
  protected readonly price = signal('');
  protected readonly availableCount = computed(() => this.plans().filter((plan) => plan.status === 'Available').length);
  protected readonly subscriberCount = computed(() => this.plans().reduce((sum, plan) => sum + plan.subscribers, 0).toLocaleString());
  protected openEdit(plan: AdminPlan): void { this.editing.set(plan); this.price.set(plan.price); }
  protected save(): void { const current = this.editing(); if (!current || !this.price().trim()) return; this.plans.update((plans) => plans.map((plan) => plan.tier === current.tier ? { ...plan, price: this.price().trim() } : plan)); this.editing.set(null); }
  protected toggle(plan: AdminPlan): void { this.plans.update((plans) => plans.map((item) => item.tier === plan.tier ? { ...item, status: item.status === 'Archived' ? 'Available' : 'Archived' } : item)); }
}
