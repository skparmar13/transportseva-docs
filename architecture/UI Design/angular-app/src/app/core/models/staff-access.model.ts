export interface StaffAccess {
  enforced: boolean;
  ready: boolean;
  role_code: string | null;
  role_name: string | null;
  permissions: string[];
  routes: string[];
  blocked_reason: string | null;
}

export interface StaffAccessReadiness {
  access: StaffAccess;
  approved_roles: { code: string; name: string }[];
  editing_enabled: boolean;
  activation_note: string;
}

// Display/navigation only: the API independently authorizes every request.
export function staffRouteAllowed(access: StaffAccess | null | undefined, path: string): boolean {
  if (!access?.enforced) return true;
  if (path === 'access' || path === 'notifications') return true;
  if (!access.ready || !access.routes.includes(path)) return false;
  const capability: Record<string, string> = {
    reviews: 'marketplace.reviews.view', kyc: 'marketplace.kyc.view', audit: 'admin.audit.view',
    roles: 'role.view', bookings: 'marketplace.bookings.view',
  };
  return !!capability[path] && access.permissions.includes(capability[path]);
}
