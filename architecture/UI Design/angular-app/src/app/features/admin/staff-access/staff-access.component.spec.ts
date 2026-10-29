import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ApiAdminAccessService } from '../../../core/api/api-admin-access.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { StaffAccessReadiness } from '../../../core/models/staff-access.model';
import { StaffAccessComponent } from './staff-access.component';

describe('Verified staff access screen', () => {
  const config = API_CONFIG as unknown as { useBackend: boolean };
  const originalBackend = config.useBackend;
  const state: StaffAccessReadiness = { access: { enforced: true, ready: true, role_code: 'KYC_OFFICER', role_name: 'KYC Officer',
    permissions: ['marketplace.kyc.view'], routes: ['access', 'notifications', 'kyc'], blocked_reason: null },
    approved_roles: [{ code: 'KYC_OFFICER', name: 'KYC Officer' }], editing_enabled: false, activation_note: 'Pending safeguards' };
  let api: jasmine.SpyObj<ApiAdminAccessService>;
  beforeEach(() => {
    config.useBackend = true;
    api = jasmine.createSpyObj('ApiAdminAccessService', ['session']); api.session.and.returnValue(of(state));
    TestBed.configureTestingModule({ imports: [StaffAccessComponent], providers: [provideRouter([]), { provide: ApiAdminAccessService, useValue: api }] });
  });
  afterEach(() => { config.useBackend = originalBackend; });
  it('shows the actual role/capabilities without staff editing or fake saves', () => {
    const fixture = TestBed.createComponent(StaffAccessComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('KYC Officer');
    expect(fixture.nativeElement.textContent).toContain('marketplace.kyc.view');
    expect(fixture.nativeElement.textContent).toContain('role editing remain disabled');
    expect([...fixture.nativeElement.querySelectorAll('button')].some((node: any) => /save|invite|assign/i.test(node.textContent))).toBeFalse();
  });
  it('shows pending activation honestly', () => {
    api.session.and.returnValue(of({ ...state, access: { ...state.access, enforced: false } }));
    const fixture = TestBed.createComponent(StaffAccessComponent); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('prepared but not activated');
  });
  it('shows request activity and prevents duplicate refresh while pending', () => {
    const pending = new Subject<StaffAccessReadiness>(); api.session.and.returnValue(pending);
    const fixture = TestBed.createComponent(StaffAccessComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue(); button.click(); expect(api.session).toHaveBeenCalledTimes(1);
    pending.next(state); pending.complete(); fixture.detectChanges(); expect(button.disabled).toBeFalse();
  });
  it('shows failure without inventing staff roles from the browser cache', () => {
    api.session.and.returnValue(throwError(() => new Error('Access service unavailable')));
    const fixture = TestBed.createComponent(StaffAccessComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('KYC Officer');
  });
});
