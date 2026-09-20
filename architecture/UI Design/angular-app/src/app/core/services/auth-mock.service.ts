import { Injectable, signal } from '@angular/core';
import { of, delay } from 'rxjs';
import { RoleOption, WorkspaceOption } from '../models/auth.model';
import { PlanTier } from '../data/subscription-plans';
import { SignupRole } from '../models/auth.model';

export interface MockSignupPayload {
  identifier: string;
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  role: SignupRole;
  planTier: Exclude<PlanTier, 'enterprise'>;
}

export interface MockPlatformStaff {
  name: string;
  email: string;
  role: 'Super Admin' | 'Operations Manager' | 'KYC Officer' | 'Finance Manager' | 'Support Agent';
  destination: string;
}

/**
 * Mock auth flow — NO real authentication/backend. Simulates
 * network latency with `delay()` so loading states feel real, and
 * holds transient in-memory state (e.g. which identifier OTP was
 * "sent" to) needed to move between the Login/Signup/OTP/Business
 * Registration/Workspace Selection/Profile Setup screens.
 */
@Injectable({ providedIn: 'root' })
export class AuthMockService {
  /** Identifier (email/mobile) currently going through OTP / reset, kept for display on the OTP screen. */
  readonly pendingIdentifier = signal<string>('');
  /** Role chosen during signup — drives whether Business Registration step is shown. */
  readonly pendingRole = signal<import('../models/auth.model').SignupRole>('shipper');
  /** Subscription plan chosen on the way into signup (via the Pricing page CTA, or 'starter' by default for the generic Sign Up button). Applied to the new tenant once onboarding finishes. */
  readonly pendingPlanTier = signal<Exclude<PlanTier, 'enterprise'>>('starter');
  /** Transient onboarding data only; deliberately excludes the submitted password. */
  readonly pendingSignup = signal<Omit<MockSignupPayload, 'password'> | null>(null);

  readonly roleOptions: RoleOption[] = [
    {
      role: 'shipper',
      label: 'Shipper',
      icon: 'i-box',
      description: 'You have goods that need to be moved and want to book verified transporters.',
      examples: 'e.g. Manufacturer, FMCG, Mining, Cement, Steel, E-commerce',
      requiresCompany: true,
    },
    {
      role: 'transporter',
      label: 'Transporter',
      icon: 'i-truck2',
      description: 'You arrange trucks — your own fleet or hired vehicles — and can post loads for offline customers too.',
      examples: 'Apply for loads · Fleet & driver management · GPS · Transport ERP',
      requiresCompany: true,
    },
    {
      role: 'truck-owner',
      label: 'Truck / Fleet Owner',
      icon: 'i-car',
      description: 'You own one or more trucks and want to apply for loads directly and manage your drivers.',
      examples: 'Apply for loads · GPS tracking · Driver management · Earnings & maintenance',
      requiresCompany: true,
    },
  ];

  private readonly mockWorkspaces: WorkspaceOption[] = [
    { id: 'ws-shipper', name: 'Priya Mehta', roleTag: 'Shipper Workspace', role: 'shipper', icon: 'i-user' },
    { id: 'ws-transporter', name: 'Verma Logistics', roleTag: 'Transporter Workspace', role: 'transporter', icon: 'i-building' },
    { id: 'ws-truck-owner', name: 'Sanjay Fleet Co.', roleTag: 'Truck Owner Workspace', role: 'truck-owner', icon: 'i-car' },
  ];

  private readonly mockPlatformStaff: MockPlatformStaff[] = [
    { name: 'Aarav Shah', email: 'admin@transportseva.in', role: 'Super Admin', destination: '/admin/dashboard' },
    { name: 'Priya Nair', email: 'operations@transportseva.in', role: 'Operations Manager', destination: '/admin/companies' },
    { name: 'Arjun Rao', email: 'kyc@transportseva.in', role: 'KYC Officer', destination: '/admin/documents' },
    { name: 'Meera Iyer', email: 'finance@transportseva.in', role: 'Finance Manager', destination: '/admin/financials' },
    { name: 'Kabir Das', email: 'support@transportseva.in', role: 'Support Agent', destination: '/admin/support' },
  ];

  login(_identifier: string, _password: string) {
    // Always "succeeds" in the prototype — returns the workspaces this mock user belongs to.
    return of(this.mockWorkspaces).pipe(delay(400));
  }

  loginPlatformStaff(email: string, _password: string) {
    const staff = this.mockPlatformStaff.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
    return of(staff).pipe(delay(400));
  }

  signup(payload: MockSignupPayload) {
    const { password: _password, ...safePayload } = payload;
    this.pendingIdentifier.set(payload.identifier);
    this.pendingRole.set(payload.role);
    this.pendingPlanTier.set(payload.planTier);
    this.pendingSignup.set(safePayload);
    return of({ ok: true }).pipe(delay(400));
  }

  sendOtp(identifier: string) {
    this.pendingIdentifier.set(identifier);
    return of({ ok: true }).pipe(delay(500));
  }

  verifyOtp(_code: string) {
    return of({ ok: true }).pipe(delay(500));
  }

  resetPassword(_newPassword: string) {
    return of({ ok: true }).pipe(delay(400));
  }

  getWorkspaces() {
    return of(this.mockWorkspaces).pipe(delay(300));
  }

  completeBusinessRegistration(_payload: unknown) {
    return of({ ok: true }).pipe(delay(500));
  }

  completeProfileSetup(_payload: unknown) {
    return of({ ok: true }).pipe(delay(500));
  }
}
