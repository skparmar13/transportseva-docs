import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { ApiAuthService, RecoveryChallenge } from '../../../core/api/api-auth.service';
import { API_CONFIG } from '../../../core/api/api-config';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('Backend password recovery', () => {
  let api: jasmine.SpyObj<ApiAuthService>;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let screen: any;
  const config = API_CONFIG as unknown as { useBackend: boolean };
  const previous = config.useBackend;
  const challenge: RecoveryChallenge = { challenge_id: 'challenge-1', expires_in: 600, resend_after: 60, debug_otp: '123456' };
  beforeEach(() => {
    config.useBackend = true;
    api = jasmine.createSpyObj('ApiAuthService', ['requestPasswordRecovery', 'verifyPasswordRecovery', 'resetPassword', 'clearTokens']);
    api.requestPasswordRecovery.and.returnValue(of(challenge));
    api.verifyPasswordRecovery.and.returnValue(of({ reset_token: 'proof', expires_in: 300 }));
    api.resetPassword.and.returnValue(of({ success: true }));
    TestBed.configureTestingModule({ imports: [ForgotPasswordComponent], providers: [provideRouter([]), { provide: ApiAuthService, useValue: api }] });
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    screen = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => { fixture.destroy(); config.useBackend = previous; localStorage.clear(); });

  it('validates the identifier without sending a request', () => {
    screen.identifier.set('not an email'); screen.sendOtp(); fixture.detectChanges();
    expect(api.requestPasswordRecovery).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.field-error').textContent).toContain('valid email');
  });

  it('does not simulate recovery when the backend is disabled', () => {
    config.useBackend = false; screen.identifier.set('qa@example.test'); screen.sendOtp();
    expect(api.requestPasswordRecovery).not.toHaveBeenCalled();
    expect(screen.step()).toBe(1); expect(screen.error()).toContain('connected backend');
  });

  it('shows a spinner and suppresses duplicate clicks until the real request finishes', () => {
    const pending = new Subject<RecoveryChallenge>(); api.requestPasswordRecovery.and.returnValue(pending);
    screen.identifier.set('qa@example.test'); screen.sendOtp(); screen.sendOtp(); fixture.detectChanges();
    expect(api.requestPasswordRecovery).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('.action-spinner')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBeTrue();
    pending.next(challenge); pending.complete(); fixture.detectChanges();
    expect(screen.step()).toBe(2); expect(screen.busy()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Local sandbox OTP (no message sent)');
    expect(fixture.nativeElement.textContent).toContain('If an active account matches');
  });

  it('enforces the resend countdown and supports a fresh challenge after it expires', fakeAsync(() => {
    // Start the timer inside fakeAsync, not the outer beforeEach zone.
    fixture.destroy(); fixture = TestBed.createComponent(ForgotPasswordComponent);
    screen = fixture.componentInstance; fixture.detectChanges();
    screen.identifier.set('qa@example.test'); screen.sendOtp(); screen.resend();
    expect(api.requestPasswordRecovery).toHaveBeenCalledTimes(1);
    tick(61_000); screen.resend();
    expect(api.requestPasswordRecovery).toHaveBeenCalledTimes(2);
    expect(screen.cooldown()).toBe(60);
  }));

  it('supports numeric OTP paste and advances only after successful verification', () => {
    screen.identifier.set('qa@example.test'); screen.sendOtp(); fixture.detectChanges();
    screen.verifyOtp(); expect(api.verifyPasswordRecovery).not.toHaveBeenCalled();
    const clipboard = new DataTransfer(); clipboard.setData('text', '12 34-56');
    screen.onOtpPaste(new ClipboardEvent('paste', { clipboardData: clipboard }));
    expect(screen.digits().join('')).toBe('123456');
    screen.verifyOtp(); fixture.detectChanges();
    expect(api.verifyPasswordRecovery).toHaveBeenCalledWith('challenge-1', '123456');
    expect(screen.step()).toBe(3); expect(screen.debugOtp()).toBe('');
    expect(localStorage.getItem('transportseva.reset_token')).toBeNull();
  });

  it('keeps verification available after an invalid code response', () => {
    screen.identifier.set('qa@example.test'); screen.sendOtp(); screen.digits.set(['0','0','0','0','0','0']);
    api.verifyPasswordRecovery.and.returnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { message: 'Invalid or expired code.' } })));
    screen.verifyOtp(); expect(screen.step()).toBe(2); expect(screen.busy()).toBeFalse();
    expect(screen.error()).toBe('Invalid or expired code.');
  });

  it('requires matching strong passwords and shows success only after the backend accepts the reset', () => {
    screen.identifier.set('qa@example.test'); screen.sendOtp(); screen.digits.set(['1','2','3','4','5','6']); screen.verifyOtp();
    screen.newPassword.set('weak'); screen.confirmPassword.set('different'); screen.resetPassword();
    expect(api.resetPassword).not.toHaveBeenCalled(); expect(screen.fields()['password']).toBeTruthy();
    screen.newPassword.set('NewPassword@123'); screen.confirmPassword.set('NewPassword@123'); screen.resetPassword(); fixture.detectChanges();
    expect(api.resetPassword).toHaveBeenCalledWith('challenge-1', 'proof', 'NewPassword@123', 'NewPassword@123');
    expect(api.clearTokens).toHaveBeenCalled(); expect(screen.step()).toBe(4); expect(screen.newPassword()).toBe('');
    expect(fixture.nativeElement.querySelector('.recovery-success').textContent).toContain('Password reset successfully');
  });

  it('allows retry after a reset network failure without claiming completion', () => {
    screen.identifier.set('qa@example.test'); screen.sendOtp(); screen.digits.set(['1','2','3','4','5','6']); screen.verifyOtp();
    screen.newPassword.set('NewPassword@123'); screen.confirmPassword.set('NewPassword@123');
    api.resetPassword.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    screen.resetPassword(); expect(screen.step()).toBe(3); expect(screen.busy()).toBeFalse(); expect(screen.error()).toContain('connection');
    expect(api.clearTokens).not.toHaveBeenCalled();
  });

  it('shows a clear rate-limit message and permits starting over', () => {
    screen.identifier.set('qa@example.test');
    api.requestPasswordRecovery.and.returnValue(throwError(() => new HttpErrorResponse({ status: 429 })));
    screen.sendOtp(); expect(screen.error()).toContain('Too many requests');
    screen.restart(); expect(screen.error()).toBe(''); expect(screen.step()).toBe(1);
  });
});
