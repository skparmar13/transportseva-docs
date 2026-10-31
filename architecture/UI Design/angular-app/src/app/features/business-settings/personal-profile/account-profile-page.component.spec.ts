import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { AccountProfilePageComponent } from './account-profile-page.component';
import { AccountProfileView, ApiAccountProfileService } from '../../../core/api/api-account-profile.service';
import { LanguageService } from '../../../core/i18n';
import { SessionService } from '../../../core/services/session.service';
import { API_CONFIG } from '../../../core/api/api-config';

describe('Dashboard profile completion', () => {
  const config = API_CONFIG as { useBackend: boolean }; let original: boolean;
  const view: AccountProfileView = { account: { uuid: 'profile-user', role: 'shipper', full_name: 'QA User', first_name: 'QA', last_name: 'User', email: 'qa@example.test', phone: '+919000011223', status: 'active', profile_completion_required: true, email_verification_required: true, portal_access_ready: false }, profile: { version: 0, designation: 'Manager', address: null, city: null, pincode: null, notify_email: false, notify_sms: true } };
  let api: jasmine.SpyObj<ApiAccountProfileService>;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true; sessionStorage.clear();
    api = jasmine.createSpyObj('ApiAccountProfileService', ['get', 'save', 'requestEmail', 'verifyEmail']);
    api.get.and.returnValue(of(structuredClone(view)));
    api.save.and.returnValue(of({ ...view, account: { ...view.account, profile_completion_required: false }, profile: { ...view.profile, version: 1 } }));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiAccountProfileService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; localStorage.removeItem('transportseva.api_user'); sessionStorage.clear(); TestBed.inject(LanguageService).setLang('en'); });
  const create = () => { const f = TestBed.createComponent(AccountProfilePageComponent); f.detectChanges(); return f; };
  it('loads persisted optional details and false preferences, hiding business data and skip/dashboard actions until ready', async () => {
    const f = create(); await f.whenStable(); expect(f.nativeElement.querySelector('#personal-designation').value).toBe('Manager');
    expect(f.nativeElement.querySelector('input[name=notify_email]').checked).toBeFalse();
    expect(f.nativeElement.querySelector('app-account-business-profile')).toBeNull();
    expect(f.nativeElement.textContent).not.toContain('Skip for now'); expect(f.nativeElement.textContent).not.toContain('Continue to dashboard');
    expect(TestBed.inject(SessionService).onboardingRequired()).toBeTrue();
  });
  it('shows a loading state, retries failed reads and never displays sample data', async () => {
    api.get.and.returnValues(throwError(() => new Error('offline')), of(view)); const f = create();
    expect(f.nativeElement.textContent).toContain('could not be loaded'); (f.componentInstance as any).load(); f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('#personal-email').value).toBe('qa@example.test');
  });
  it('blocks duplicate saves and displays success only after persistence', () => {
    const pending = new Subject<AccountProfileView>(); api.save.and.returnValue(pending);
    const f = create(); const c = f.componentInstance as any; c.save(); c.save(); f.detectChanges();
    expect(api.save).toHaveBeenCalledTimes(1); expect(f.nativeElement.textContent).not.toContain('Profile saved.');
    expect(f.nativeElement.querySelector('.profile-spinner')).not.toBeNull();
    pending.next({ ...view, profile: { ...view.profile, version: 1 } }); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Profile saved.');
    expect(api.save.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ version: 0, notify_email: false, designation: 'Manager' }));
  });
  it('retains drafts on server failure and requires explicit reload after stale-version conflict', () => {
    api.save.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Stale profile' } })));
    const f = create(); const c = f.componentInstance as any; c.update('city', 'Unsaved city'); c.save(); f.detectChanges();
    expect(c.draft().city).toBe('Unsaved city'); expect(f.nativeElement.textContent).toContain('Load latest profile');
    expect(f.nativeElement.textContent).not.toContain('Profile saved.');
  });
  it('requires identity and a valid pincode before writing', () => {
    const f = create(); const c = f.componentInstance as any; c.update('first_name', ''); c.update('pincode', '000000'); c.save(); f.detectChanges();
    expect(api.save).not.toHaveBeenCalled(); expect(f.nativeElement.querySelector('#personal-first_name').getAttribute('aria-invalid')).toBe('true');
  });
  it('prefills only the matching pending phone draft and submits password only for pending signup', () => {
    api.get.and.returnValue(of({ ...view, account: { ...view.account, status: 'pending_profile' } }));
    sessionStorage.setItem('transportseva.pending_signup', JSON.stringify({ fullName: 'Fresh Signup', mobile: '9000011223', email: 'fresh@example.test', password: 'SignupTest@2026!' }));
    const f = create(); const c = f.componentInstance as any; expect(c.draft().first_name).toBe('Fresh'); c.save();
    expect(api.save.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ password: 'SignupTest@2026!', email: 'fresh@example.test' }));
    expect(sessionStorage.getItem('transportseva.pending_signup')).toBeNull();
  });
  it('does not request verification until the email and identity have been saved', () => {
    const f = create(); (f.componentInstance as any).requestCode(); expect(api.requestEmail).not.toHaveBeenCalled();
  });
  it('shows honest sandbox status and verification errors without unlocking the portal', () => {
    api.get.and.returnValue(of({ ...view, account: { ...view.account, profile_completion_required: false } }));
    api.requestEmail.and.returnValue(of({ challenge_id: 'local-challenge', expires_in: 600, resend_after: 60, delivery_status: 'sandbox', debug_otp: '654321' }));
    api.verifyEmail.and.returnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { message: 'Invalid or expired verification code.' } })));
    const f = create(); const c = f.componentInstance as any; c.requestCode(); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('no email was sent'); c.otp.set('111111'); c.verify(); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Invalid or expired'); expect(TestBed.inject(SessionService).onboardingRequired()).toBeTrue();
  });
  it('does not navigate to the dashboard while required checks are missing', () => {
    const go = spyOn(TestBed.inject(Router), 'navigate'); const f = create(); (f.componentInstance as any).continue(); expect(go).not.toHaveBeenCalled();
  });
  it('provides Hindi profile labels', () => {
    TestBed.inject(LanguageService).setLang('hi'); const f = create(); expect(f.nativeElement.textContent).toContain('मेरी प्रोफ़ाइल');
  });
});
