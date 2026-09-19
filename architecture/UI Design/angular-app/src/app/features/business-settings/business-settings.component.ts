import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../core/i18n';
import { BusinessSettingsMockService } from '../../core/services/business-settings-mock.service';
import { BillingInvoice, BillingInvoiceStatus, CompanyProfile, StaffUserStatus } from '../../core/models/business-settings.model';
import { PlanTier, SUBSCRIPTION_PLANS } from '../../core/data/subscription-plans';

type SettingsTab = 'company' | 'branches' | 'users' | 'roles' | 'billing';

const STAFF_STATUS_CLASS: Record<StaffUserStatus, string> = {
  Active: 'status-delivered',
  Invited: 'status-pending',
  Suspended: 'status-cancelled',
};

const BILLING_STATUS_CLASS: Record<BillingInvoiceStatus, string> = {
  Paid: 'status-delivered',
  Due: 'status-pending',
  Overdue: 'status-cancelled',
};

/**
 * Business Settings — Module 13. Tenant self-service settings:
 * Company Profile, Branches, Users, Roles & Permissions, Billing.
 * Editable fields mutate the shared mock store only (no persistence
 * beyond the session, consistent with the rest of the prototype).
 */
@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './business-settings.component.html',
})
export class BusinessSettingsComponent {
  protected readonly settings = inject(BusinessSettingsMockService);

  protected readonly staffStatusClass = STAFF_STATUS_CLASS;
  protected readonly billingStatusClass = BILLING_STATUS_CLASS;

  protected readonly activeTab = signal<SettingsTab>('company');
  protected setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  // Company profile edit
  protected readonly editingCompany = signal(false);
  protected readonly companyDraft = signal(this.settings.company());

  protected startEditCompany(): void {
    this.companyDraft.set({ ...this.settings.company() });
    this.editingCompany.set(true);
  }

  protected cancelEditCompany(): void {
    this.editingCompany.set(false);
  }

  protected saveCompany(): void {
    this.settings.updateCompany(this.companyDraft());
    this.editingCompany.set(false);
  }

  protected updateDraft<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]): void {
    this.companyDraft.update((draft) => ({ ...draft, [key]: value }));
  }

  // Add branch modal
  protected readonly showAddBranch = signal(false);
  protected readonly branchName = signal('');
  protected readonly branchCity = signal('');
  protected readonly branchAddress = signal('');
  protected readonly branchContact = signal('');
  protected readonly branchPhone = signal('');
  protected readonly savingBranch = signal(false);

  protected openAddBranch(): void {
    this.showAddBranch.set(true);
  }

  protected closeAddBranch(): void {
    this.showAddBranch.set(false);
    this.branchName.set('');
    this.branchCity.set('');
    this.branchAddress.set('');
    this.branchContact.set('');
    this.branchPhone.set('');
  }

  protected submitAddBranch(): void {
    if (!this.branchName().trim() || !this.branchCity().trim()) return;
    this.savingBranch.set(true);
    setTimeout(() => {
      this.settings.addBranch({
        name: this.branchName().trim(),
        city: this.branchCity().trim(),
        address: this.branchAddress().trim(),
        contactPerson: this.branchContact().trim(),
        phone: this.branchPhone().trim(),
      });
      this.savingBranch.set(false);
      this.closeAddBranch();
    }, 400);
  }

  // Invite staff modal
  protected readonly showInviteStaff = signal(false);
  protected readonly staffName = signal('');
  protected readonly staffEmail = signal('');
  protected readonly staffRole = signal('Dispatcher');
  protected readonly staffBranch = signal('Jaipur Head Office');
  protected readonly savingStaff = signal(false);

  protected openInviteStaff(): void {
    this.showInviteStaff.set(true);
  }

  protected closeInviteStaff(): void {
    this.showInviteStaff.set(false);
    this.staffName.set('');
    this.staffEmail.set('');
    this.staffRole.set('Dispatcher');
    this.staffBranch.set('Jaipur Head Office');
  }

  protected submitInviteStaff(): void {
    if (!this.staffName().trim() || !this.staffEmail().trim()) return;
    this.savingStaff.set(true);
    setTimeout(() => {
      this.settings.inviteStaff(this.staffName().trim(), this.staffEmail().trim(), this.staffRole(), this.staffBranch());
      this.savingStaff.set(false);
      this.closeInviteStaff();
    }, 400);
  }

  protected toggleStaffStatus(id: string): void {
    this.settings.toggleStaffStatus(id);
  }

  protected markInvoicePaid(id: string): void {
    this.settings.markInvoicePaid(id);
  }

  protected downloadInvoice(invoice: BillingInvoice): void {
    const lines = ['TransportSeva subscription invoice', `Invoice: ${invoice.invoiceNumber}`, `Plan: ${invoice.planName}`, `Period: ${invoice.period}`, `Amount: ${invoice.amount}`, `Due date: ${invoice.dueDate}`, `Status: ${invoice.status}`];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Change plan
  protected readonly plans = SUBSCRIPTION_PLANS;
  protected readonly changingToPlan = signal<PlanTier | null>(null);

  protected requestPlanChange(tier: PlanTier): void {
    if (tier === this.settings.currentPlanTier()) return;
    if (tier === 'enterprise') return; // sales-assisted — handled via the "Talk to Sales" link in the template
    this.changingToPlan.set(tier);
  }

  protected confirmPlanChange(): void {
    const tier = this.changingToPlan();
    if (!tier || tier === 'enterprise') return;
    this.settings.changePlan(tier);
    this.changingToPlan.set(null);
  }
}
