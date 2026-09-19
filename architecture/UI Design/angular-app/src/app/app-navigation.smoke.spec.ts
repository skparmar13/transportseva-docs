import { routes } from './app.routes';
import { PORTAL_CONFIGS } from './core/data/nav-config';
import { PortalRole } from './core/models/nav.model';

describe('portal navigation smoke coverage', () => {
  it('maps every active sidebar item to a registered route', () => {
    const missing: string[] = [];
    for (const role of Object.keys(PORTAL_CONFIGS) as PortalRole[]) {
      const portalRoute = routes.find((route) => route.path === role);
      const routePaths = new Set((portalRoute?.children ?? []).map((route) => route.path));
      for (const section of PORTAL_CONFIGS[role].nav) {
        for (const item of section.items) {
          if (!item.planned && !routePaths.has(item.path)) missing.push(`${role}: ${item.path} (${item.label})`);
        }
      }
    }
    expect(missing).withContext('Active navigation items must not fall through to Coming Soon').toEqual([]);
  });
});
