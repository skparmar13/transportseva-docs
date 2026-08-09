/**
 * TransportSeva Business Settings — Module 13 domain model. Covers
 * self-service tenant settings: Company Profile, Branches, Users
 * (staff), Roles & Permissions, and Billing. Distinct from Module 14
 * (Super Admin), which manages ALL tenants platform-wide.
 */
export interface CompanyProfile {
  companyName: string;
  businessType: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logoInitials: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  contactPerson: string;
  phone: string;
  isHeadOffice: boolean;
}

export type StaffUserStatus = 'Active' | 'Invited' | 'Suspended';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleName: string;
  branch: string;
  status: StaffUserStatus;
  lastActive: string;
}

export interface Permission {
  key: string;
  label: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissionKeys: string[];
}

export type BillingInvoiceStatus = 'Paid' | 'Due' | 'Overdue';

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  planName: string;
  period: string;
  amount: string;
  dueDate: string;
  status: BillingInvoiceStatus;
}
