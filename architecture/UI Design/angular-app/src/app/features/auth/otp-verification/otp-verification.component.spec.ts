import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {signal} from '@angular/core';
import {ActivatedRoute, Router, convertToParamMap, provideRouter} from '@angular/router';
import {HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Subject, of, throwError} from 'rxjs';
import {API_CONFIG} from '../../../core/api/api-config';
import {ApiAuthService} from '../../../core/api/api-auth.service';
import {AuthMockService} from '../../../core/services/auth-mock.service';
import {SessionService} from '../../../core/services/session.service';
import {rememberSignupOtpWait, signupOtpWait} from '../../../core/utils/signup-otp-session';
import {OtpVerificationComponent} from './otp-verification.component';

describe('Connected signup OTP flow',()=>{
  const config=API_CONFIG as {useBackend:boolean};let oldBackend:boolean;
  let api:jasmine.SpyObj<ApiAuthService>;let mock:jasmine.SpyObj<AuthMockService>;let session:jasmine.SpyObj<SessionService>;let nav:jasmine.Spy;
  const phone='+919876543210';const pending={mobile:'9876543210',role:'truck-owner'};
  const user={uuid:'qa-user',email:'qa@example.test',full_name:'QA',role:'truck-owner'};
  beforeEach(()=>{
    oldBackend=config.useBackend;config.useBackend=true;sessionStorage.clear();sessionStorage.setItem('transportseva.pending_signup',JSON.stringify(pending));
    api=jasmine.createSpyObj('ApiAuthService',['verifySignupOtp','requestSignupOtp']);api.verifySignupOtp.and.returnValue(of({user,access_token:'qa-token',refresh_token:'qa-refresh',expires_in:3600}));api.requestSignupOtp.and.returnValue(of({debug_otp:'654321'}));
    mock=jasmine.createSpyObj('AuthMockService',['verifyOtp','sendOtp'],{pendingIdentifier:signal('')});session=jasmine.createSpyObj('SessionService',['setBackendUser']);
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:ActivatedRoute,useValue:{snapshot:{queryParamMap:convertToParamMap({next:'signup'})}}},{provide:ApiAuthService,useValue:api},{provide:AuthMockService,useValue:mock},{provide:SessionService,useValue:session}]});
    nav=spyOn(TestBed.inject(Router),'navigateByUrl').and.returnValue(Promise.resolve(true));
  });
  afterEach(()=>{TestBed.resetTestingModule();config.useBackend=oldBackend;sessionStorage.clear();});
  function create(){const f=TestBed.createComponent(OtpVerificationComponent);f.detectChanges();return {f,c:f.componentInstance as any};}

  for(const raw of ['broken','null','{}','[]',JSON.stringify({...pending,mobile:'123'}),JSON.stringify({...pending,role:'admin'})])it('rejects incomplete signup storage '+raw,()=>{
    sessionStorage.setItem('transportseva.pending_signup',raw);const {f,c}=create();c.digits.set(['1','2','3','4','5','6']);c.verify();c.resend();
    expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();expect(f.nativeElement.querySelector('form')).toBeNull();expect(api.verifySignupOtp).not.toHaveBeenCalled();expect(api.requestSignupOtp).not.toHaveBeenCalled();expect(mock.verifyOtp).not.toHaveBeenCalled();
  });
  it('does not use prototype verification for non-signup routes',()=>{
    (TestBed.inject(ActivatedRoute).snapshot as any).queryParamMap=convertToParamMap({next:'reset'});const {c,f}=create();c.digits.set(['1','2','3','4','5','6']);c.verify();c.resend();
    expect(mock.verifyOtp).not.toHaveBeenCalled();expect(mock.sendOtp).not.toHaveBeenCalled();expect(f.nativeElement.querySelector('a[href="/auth/forgot-password"]')).not.toBeNull();
  });
  it('locks both actions and fields while verifying, then navigates once using the returned role',fakeAsync(()=>{
    const response=new Subject<any>();api.verifySignupOtp.and.returnValue(response);const {f,c}=create();c.digits.set(['1','2','3','4','5','6']);c.verify();c.verify();c.resend();f.detectChanges();tick();f.detectChanges();
    expect(api.verifySignupOtp).toHaveBeenCalledOnceWith(phone,'123456','truck-owner');expect(api.requestSignupOtp).not.toHaveBeenCalled();expect(f.nativeElement.querySelector('.otp-spinner')).not.toBeNull();expect(f.nativeElement.querySelector('input').disabled).toBeTrue();
    response.next({user});response.complete();tick();c.verify();
    expect(session.setBackendUser).toHaveBeenCalledWith(user);expect(nav).toHaveBeenCalledOnceWith('/truck-owner/profile');expect(api.verifySignupOtp).toHaveBeenCalledTimes(1);expect(c.verified()).toBeTrue();
  }));
  for(const result of ['false','reject'])it('retries navigation after '+result+' without consuming another OTP',fakeAsync(()=>{
    nav.and.callFake(()=>result==='false'?Promise.resolve(false):Promise.reject(new Error('Blocked')));const {f,c}=create();c.digits.set(['1','2','3','4','5','6']);c.verify();tick();f.detectChanges();
    expect(c.verified()).toBeTrue();expect(c.apiError()).toContain('code was verified');expect(f.nativeElement.textContent).toContain('Continue to profile');
    nav.and.returnValue(Promise.resolve(true));c.continueProfile();c.continueProfile();tick();c.verify();c.resend();
    expect(nav).toHaveBeenCalledTimes(2);expect(api.verifySignupOtp).toHaveBeenCalledTimes(1);expect(api.requestSignupOtp).not.toHaveBeenCalled();
  }));
  it('retains the initial resend countdown across component recreation and allows it to expire',fakeAsync(()=>{
    rememberSignupOtpWait(phone,60);let {f,c}=create();c.resend();expect(api.requestSignupOtp).not.toHaveBeenCalled();tick(30_000);expect(c.cooldown()).toBe(30);f.destroy();
    ({f,c}=create());expect(c.cooldown()).toBe(30);tick(30_000);c.resend();expect(api.requestSignupOtp).toHaveBeenCalledOnceWith(phone);expect(c.cooldown()).toBe(60);expect(c.resendMessage()).toContain('No message was sent');
  }));
  it('resend suppresses duplicates, locks verification and clears old digits only after acknowledgement',()=>{
    const response=new Subject<any>();api.requestSignupOtp.and.returnValue(response);const {f,c}=create();c.digits.set(['1','2','3','4','5','6']);c.resend();c.resend();c.verify();f.detectChanges();
    expect(api.requestSignupOtp).toHaveBeenCalledTimes(1);expect(api.verifySignupOtp).not.toHaveBeenCalled();expect(c.digits().join('')).toBe('123456');
    response.next(null);response.complete();expect(c.digits().join('')).toBe('');expect(c.debugOtp()).toBe('');expect(c.resendMessage()).toContain('new code was requested');
  });
  it('uses Retry-After on throttling and presents an error without a success notice',()=>{
    api.requestSignupOtp.and.returnValue(throwError(()=>new HttpErrorResponse({status:429,headers:new HttpHeaders({'Retry-After':'120'}),error:{message:'Please wait before retrying.'}})));
    const {c,f}=create();c.resend();f.detectChanges();expect(c.cooldown()).toBe(120);expect(signupOtpWait(phone)).toBe(120);expect(c.resendMessage()).toBe('');expect(f.nativeElement.querySelector('[role=alert]').textContent).toContain('Please wait');
  });
  it('preserves digits on rejected verification and permits a corrected retry',fakeAsync(()=>{
    api.verifySignupOtp.and.returnValue(throwError(()=>new HttpErrorResponse({status:422,error:{message:'Invalid or expired OTP'}})));
    const {c}=create();c.digits.set(['1','2','3','4','5','6']);c.verify();expect(c.verifying()).toBeFalse();expect(c.verified()).toBeFalse();expect(c.digits().join('')).toBe('123456');
    api.verifySignupOtp.and.returnValue(of({user} as any));c.verify();tick();expect(nav).toHaveBeenCalledWith('/truck-owner/profile');
  }));
  it('bounds requests and cancels subscriptions when leaving the page',fakeAsync(()=>{
    const response=new Subject<any>();api.verifySignupOtp.and.returnValue(response);const {f,c}=create();c.digits.set(['1','2','3','4','5','6']);c.verify();tick(30_001);expect(c.verifying()).toBeFalse();expect(c.apiError()).toBeTruthy();expect(response.observed).toBeFalse();
    const resend=new Subject<any>();api.requestSignupOtp.and.returnValue(resend);c.resend();expect(resend.observed).toBeTrue();f.destroy();expect(resend.observed).toBeFalse();
  }));
  it('pastes a full code and moves back on Backspace',()=>{
    const {f,c}=create();const prevented=jasmine.createSpy('preventDefault');c.onOtpPaste({preventDefault:prevented,clipboardData:{getData:()=> '12 34-56'}});expect(c.digits().join('')).toBe('123456');expect(prevented).toHaveBeenCalled();
    c.onDigitInput(5,'');c.onDigitKey(5,{key:'Backspace'});expect(document.activeElement).toBe(f.nativeElement.querySelectorAll('input')[4]);
  });
  for(const [role,portal] of [['customer','shipper'],['transporter','transporter']])it('uses the verified '+role+' profile route',fakeAsync(()=>{
    api.verifySignupOtp.and.returnValue(of({user:{...user,role}} as any));const {c}=create();c.digits.set(['1','2','3','4','5','6']);c.verify();tick();expect(nav).toHaveBeenCalledOnceWith('/'+portal+'/profile');
  }));
  it('does not offer an inactive continuation when the returned account role is unsupported',fakeAsync(()=>{
    api.verifySignupOtp.and.returnValue(of({user:{...user,role:'admin'}} as any));const {c,f}=create();c.digits.set(['1','2','3','4','5','6']);c.verify();tick();f.detectChanges();
    expect(nav).not.toHaveBeenCalled();expect(c.apiError()).toContain('Please log in again');expect(f.nativeElement.textContent).not.toContain('Continue to profile');
  }));
});
