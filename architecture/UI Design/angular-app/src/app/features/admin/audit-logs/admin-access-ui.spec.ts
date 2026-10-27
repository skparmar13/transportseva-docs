import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiAdminAccessService } from '../../../core/api/api-admin-access.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { AuditLogsComponent } from './audit-logs.component';
import { RolesPermissionsComponent } from '../roles-permissions/roles-permissions.component';

describe('Recorded admin screens', () => {
  const config = API_CONFIG as unknown as { useBackend: boolean };
  const original = config.useBackend;
  let api: jasmine.SpyObj<ApiAdminAccessService>;
  beforeEach(() => {
    config.useBackend = true;
    api = jasmine.createSpyObj<ApiAdminAccessService>('ApiAdminAccessService', ['activity', 'roles']);
    api.activity.and.returnValue(of({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } }));
    api.roles.and.returnValue(of({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } }));
    TestBed.configureTestingModule({ imports: [AuditLogsComponent, RolesPermissionsComponent], providers: [
      { provide: ApiAdminAccessService, useValue: api },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
    ] });
  });
  afterEach(() => { config.useBackend = original; });
  it('shows an honest empty state instead of sample audit records', () => {
    const fixture = TestBed.createComponent(AuditLogsComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No recorded activity matches these filters.');
    expect(fixture.nativeElement.textContent).not.toContain('Priya Nair');
    expect(fixture.nativeElement.textContent).not.toContain('Payment webhook reconciled');
  });
  it('requests the selected category from the server', () => {
    const fixture = TestBed.createComponent(AuditLogsComponent); fixture.detectChanges();
    const button = [...fixture.nativeElement.querySelectorAll('button')].find((node: any) => node.textContent.trim() === 'Review');
    button.click(); fixture.detectChanges();
    expect(api.activity).toHaveBeenCalledWith(1, 'Review', undefined);
  });
  it('renders an error without falling back to invented records', () => {
    api.activity.and.returnValue(throwError(() => ({ message: 'Administrator access required.' })));
    const fixture = TestBed.createComponent(AuditLogsComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Administrator access required.');
    expect(fixture.nativeElement.querySelectorAll('[data-event-id]').length).toBe(0);
  });
  it('renders stored grants as read-only and has no fake save control', () => {
    api.roles.and.returnValue(of({ data: [{ uuid: 'role', name: 'Stored administrator', code: 'STORED', status: true,
      permissions: [{ uuid: 'permission', name: 'Stored grant', slug: 'stored', status: true }] }], meta: { current_page: 1, last_page: 1, total: 1 } }));
    const fixture = TestBed.createComponent(RolesPermissionsComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Stored administrator');
    expect(fixture.nativeElement.textContent).toContain('Stored grant');
    expect(fixture.nativeElement.textContent).toContain('Read-only inspection');
    expect(fixture.nativeElement.querySelectorAll('input[type="checkbox"]').length).toBe(0);
    expect([...fixture.nativeElement.querySelectorAll('button')].some((node: any) => /save/i.test(node.textContent))).toBeFalse();
  });
});
