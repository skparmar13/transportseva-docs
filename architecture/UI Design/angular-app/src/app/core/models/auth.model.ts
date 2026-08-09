export type SignupRole = 'shipper' | 'transporter' | 'truck-owner' | 'driver';

export interface RoleOption {
  role: SignupRole;
  label: string;
  icon: string;
  /** Examples shown in the tooltip, e.g. "Manufacturer, FMCG, Mining, Cement, Steel, E-commerce". */
  examples: string;
  /** Short description of what this workspace is for, shown in the tooltip. */
  description: string;
  requiresCompany: boolean;
}

export interface WorkspaceOption {
  id: string;
  name: string;
  roleTag: string;
  role: import('./nav.model').PortalRole;
  icon: string;
}
