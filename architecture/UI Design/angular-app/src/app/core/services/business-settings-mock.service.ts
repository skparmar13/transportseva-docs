import { Injectable, computed, signal } from '@angular/core';
import {
  Branch,
  BillingInvoice,
  CompanyProfile,
  Permission,
  Role,
  StaffUser,
} from '../models/business-settings.model';
import { PLAN_BY_TIER, PlanTier } from '../data/subscription-plans';

const ALL_PERMISSIONS: Permission[] = [
  { key: 'loads.manage', label: 'Manage Loads' },
  { key: 'bookings.manage', label: 'Manage Bookings' },
  { key: 'fleet.manage', label: 'Manage Fleet & Drivers' },
  { key: 'trips.view', label: 'View Trips' },
  { key: 'wallet.manage', label: 'Manage Wallet' },
  { key: 'payments.manage', label: 'Manage Payments' },
  { key: 'reports.view', label: 'View Reports' },
  { key: 'documents.manage', label: 'Manage Documents' },
  { key: 'users.manage', label: 'Manage Users & Roles' },
  { key: 'settings.manage', label: 'Manage Company Settings' },
];

/**
 * Business Settings — Module 13 shared mock store (tenant self-
 * service, distinct from Module 14 platform-wide Super Admin). Holds
 * one company profile, its branches, staff users, roles and billing
 * history for the currently signed-in business.
 */
@Injectable({ providedIn: 'root' })
export class BusinessSettingsMockService {
  readonly permissions = ALL_PERMISSIONS;

  private readonly _company = signal<CompanyProfile>({
    companyName: 'Yadav Road Carriers Pvt. Ltd.',
    businessType: 'Truck / Fleet Owner',
    gstNumber: '08ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    email: 'accounts@yadavroadcarriers.in',
    phone: '+91 98765 43210',
    address: '221, Transport Nagar, Sitapura Industrial Area',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302022',
    logoInitials: 'YR',
  });
  readonly company = this._company.asReadonly();

  updateCompany(patch: Partial<CompanyProfile>) {
    this._company.update((c) => ({ ...c, ...patch }));
  }

  private readonly _branches = signal<Branch[]>([
    { id: 'b1', name: 'Jaipur Head Office', city: 'Jaipur', address: '221, Transport Nagar, Sitapura', contactPerson: 'Sanjay Yadav', phone: '+91 98765 43210', isHeadOffice: true },
    { id: 'b2', name: 'Ahmedabad Branch', city: 'Ahmedabad', address: '14, GIDC Transport Hub, Vatva', contactPerson: 'Ritu Shah', phone: '+91 98220 11223', isHeadOffice: false },
    { id: 'b3', name: 'Delhi Branch', city: 'Delhi', address: 'Plot 9, Mundka Transport Nagar', contactPerson: 'Vikas Sharma', phone: '+91 98111 22334', isHeadOffice: false },
  ]);
  readonly branches = this._branches.asReadonly();

  addBranch(branch: Omit<Branch, 'id' | 'isHeadOffice'>) {
    this._branches.update((list) => [...list, { ...branch, id: 'b' + Math.random().toString(36).slice(2, 8), isHeadOffice: false }]);
  }

  private readonly _staff = signal<StaffUser[]>([
    { id: 'u1', name: 'Sanjay Yadav', email: 'sanjay@yadavroadcarriers.in', phone: '+91 98765 43210', roleName: 'Owner / Admin', branch: 'Jaipur Head Office', status: 'Active', lastActive: '2024-06-18 10:15 AM' },
    { id: 'u2', name: 'Ritu Shah', email: 'ritu@yadavroadcarriers.in', phone: '+91 98220 11223', roleName: 'Branch Manager', branch: 'Ahmedabad Branch', status: 'Active', lastActive: '2024-06-17 06:40 PM' },
    { id: 'u3', name: 'Vikas Sharma', email: 'vikas@yadavroadcarriers.in', phone: '+91 98111 22334', roleName: 'Branch Manager', branch: 'Delhi Branch', status: 'Active', lastActive: '2024-06-16 04:10 PM' },
    { id: 'u4', name: 'Meena Kumari', email: 'meena@yadavroadcarriers.in', phone: '+91 90011 22556', roleName: 'Dispatcher', branch: 'Jaipur Head Office', status: 'Invited', lastActive: '—' },
    { id: 'u5', name: 'Ashok Rathi', email: 'ashok@yadavroadcarriers.in', phone: '+91 90099 88776', roleName: 'Accountant', branch: 'Jaipur Head Office', status: 'Suspended', lastActive: '2024-05-30 11:00 AM' },
  ]);
  readonly staff = this._staff.asReadonly();

  inviteStaff(name: string, email: string, roleName: string, branch: string) {
    this._staff.update((list) => [
      ...list,
      { id: 'u' + Math.random().toString(36).slice(2, 8), name, email, phone: '—', roleName, branch, status: 'Invited', lastActive: '—' },
    ]);
  }

  toggleStaffStatus(id: string) {
    this._staff.update((list) =>
      list.map((u) => (u.id === id ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u))
    );
  }

  private readonly _roles = signal<Role[]>([
    { id: 'r1', name: 'Owner / Admin', description: 'Full access to all modules and settings.', usersCount: 1, permissionKeys: ALL_PERMISSIONS.map((p) => p.key) },
    { id: 'r2', name: 'Branch Manager', description: 'Manage bookings, fleet and trips for their branch.', usersCount: 2, permissionKeys: ['bookings.manage', 'fleet.manage', 'trips.view', 'documents.manage', 'reports.view'] },
    { id: 'r3', name: 'Dispatcher', description: 'Create bookings and assign vehicles/drivers.', usersCount: 1, permissionKeys: ['bookings.manage', 'fleet.manage', 'trips.view'] },
    { id: 'r4', name: 'Accountant', description: 'Manage wallet, payments and view financial reports.', usersCount: 1, permissionKeys: ['wallet.manage', 'payments.manage', 'reports.view'] },
  ]);
  readonly roles = this._roles.asReadonly();

  private readonly _invoices = signal<BillingInvoice[]>([
    { id: 'bi1', invoiceNumber: 'BILL-1042', planName: 'Professional', period: 'Jun 2024', amount: '₹2,499', dueDate: '2024-06-25', status: 'Due' },
    { id: 'bi2', invoiceNumber: 'BILL-1039', planName: 'Professional', period: 'May 2024', amount: '₹2,499', dueDate: '2024-05-25', status: 'Paid' },
    { id: 'bi3', invoiceNumber: 'BILL-1035', planName: 'Professional', period: 'Apr 2024', amount: '₹2,499', dueDate: '2024-04-25', status: 'Paid' },
    { id: 'bi4', invoiceNumber: 'BILL-1030', planName: 'Starter', period: 'Mar 2024', amount: '₹0', dueDate: '2024-03-25', status: 'Paid' },
  ]);
  readonly invoices = this._invoices.asReadonly();

  /** The tenant's active subscription tier — drives the Billing → Plans comparison and what's shown as "Current Plan". */
  private readonly _currentPlanTier = signal<PlanTier>('professional');
  readonly currentPlanTier = this._currentPlanTier.asReadonly();
  readonly currentPlan = computed(() => PLAN_BY_TIER[this._currentPlanTier()]);
  readonly currentPlanName = computed(() => this.currentPlan().name);
  readonly amountDue = computed(() => this._invoices().find((i) => i.status !== 'Paid')?.amount ?? '₹0');

  /** Sets the tenant's plan right after signup, based on which CTA (Starter/Professional) the user signed up with.
   * Replaces the seeded demo invoice history with a single "first billing cycle" line for the new tenant, so a
   * brand-new Starter signup doesn't show a stale ₹2,499 "Amount Due" left over from the pre-seeded company. */
  initializePlanFromSignup(tier: Exclude<PlanTier, 'enterprise'>) {
    this._currentPlanTier.set(tier);
    const plan = PLAN_BY_TIER[tier];
    this._invoices.set([
      {
        id: 'bi' + Math.random().toString(36).slice(2, 8),
        invoiceNumber: 'BILL-' + Math.floor(1000 + Math.random() * 9000),
        planName: plan.name.replace('TransportSeva ', ''),
        period: 'First Billing Cycle',
        amount: plan.price === '₹0' ? '₹0' : plan.price,
        dueDate: new Date().toISOString().slice(0, 10),
        status: 'Paid',
      },
    ]);
  }

  /** Switch plans (mock) — Enterprise is sales-assisted so it isn't self-serve here; Starter/Professional toggle instantly and log a ₹0/prorated invoice line. */
  changePlan(tier: Exclude<PlanTier, 'enterprise'>) {
    if (tier === this._currentPlanTier()) return;
    const plan = PLAN_BY_TIER[tier];
    this._currentPlanTier.set(tier);
    this._invoices.update((list) => [
      {
        id: 'bi' + Math.random().toString(36).slice(2, 8),
        invoiceNumber: 'BILL-' + Math.floor(1000 + Math.random() * 9000),
        planName: plan.name.replace('TransportSeva ', ''),
        period: 'Plan Change',
        amount: plan.price === '₹0' ? '₹0' : plan.price,
        dueDate: new Date().toISOString().slice(0, 10),
        status: plan.price === '₹0' ? 'Paid' : 'Due',
      },
      ...list,
    ]);
  }

  markInvoicePaid(id: string) {
    this._invoices.update((list) => list.map((i) => (i.id === id ? { ...i, status: 'Paid' } : i)));
  }
}
