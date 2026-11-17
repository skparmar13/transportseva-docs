import {TestBed,fakeAsync,tick} from '@angular/core/testing';
import {ActivatedRoute,convertToParamMap,provideRouter} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {Subject,of,throwError} from 'rxjs';
import {ApiNewsletterService} from '../../../core/api/api-newsletter.service';
import {API_CONFIG} from '../../../core/api/api-config';
import {NewsletterSignupComponent} from './newsletter-signup.component';
import {NewsletterActionComponent} from './newsletter-action.component';
describe('Newsletter form and deliberate capability actions',()=>{
  const config=API_CONFIG as {useBackend:boolean};let old:boolean;let api:jasmine.SpyObj<ApiNewsletterService>;
  const id='5c18b398-8a75-4017-9ecf-e268282a4852';const token='a'.repeat(64);let route:any;
  beforeEach(()=>{old=config.useBackend;config.useBackend=true;localStorage.setItem('ts_lang','en');
    api=jasmine.createSpyObj('ApiNewsletterService',['subscribe','confirm','unsubscribe']);api.subscribe.and.returnValue(of({recorded:true,delivery_status:'unavailable'}));api.confirm.and.returnValue(of({status:'subscribed',subscriber_id:id,unsubscribe_token:token}));api.unsubscribe.and.returnValue(of({status:'unsubscribed'}));
    route={snapshot:{fragment:'request_id='+id+'&token='+token,data:{newsletterAction:'confirm'},queryParamMap:convertToParamMap({})}};
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:ApiNewsletterService,useValue:api},{provide:ActivatedRoute,useValue:route}]});});
  afterEach(()=>{TestBed.resetTestingModule();config.useBackend=old;});
  function form(){const f=TestBed.createComponent(NewsletterSignupComponent);f.detectChanges();return {f,c:f.componentInstance as any};}
  function action(){const f=TestBed.createComponent(NewsletterActionComponent);f.detectChanges();return {f,c:f.componentInstance as any};}
  it('requires a real email and explicit consent without touching prototype subscribers',()=>{
    localStorage.setItem('transportseva.newsletter.v1','unchanged');const {c}=form();c.submit();expect(c.error()).toContain('valid email');c.email.set('qa@example.test');c.submit();expect(c.error()).toContain('agree');expect(api.subscribe).not.toHaveBeenCalled();expect(localStorage.getItem('transportseva.newsletter.v1')).toBe('unchanged');
  });
  it('locks repeated clicks and fields until storage acknowledgement, then shows pending delivery honestly',fakeAsync(()=>{
    const pending=new Subject<any>();api.subscribe.and.returnValue(pending);const {c,f}=form();c.email.set(' QA@EXAMPLE.TEST ');c.consent.set(true);c.submit();c.submit();f.detectChanges();tick();f.detectChanges();
    expect(api.subscribe).toHaveBeenCalledTimes(1);expect(api.subscribe.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({email:'qa@example.test',consent:true}));expect(f.nativeElement.querySelector('.spinner')).not.toBeNull();expect(f.nativeElement.querySelector('input[type=email]').disabled).toBeTrue();expect(c.receipt()).toBeNull();
    pending.next({recorded:true,delivery_status:'unavailable'});pending.complete();f.detectChanges();expect(f.nativeElement.textContent).toContain('has not changed your subscription');expect(c.email()).toBe('');
  }));
  it('retains the draft and request identifier after failure but uses a new identifier for changed email',()=>{
    api.subscribe.and.returnValue(throwError(()=>new HttpErrorResponse({status:503})));const {c}=form();c.email.set('qa@example.test');c.consent.set(true);c.submit();const first=api.subscribe.calls.mostRecent().args[0].submission_id;c.submit();expect(api.subscribe.calls.mostRecent().args[0].submission_id).toBe(first);expect(c.email()).toBe('qa@example.test');
    c.updateEmail('other@example.test');c.submit();expect(api.subscribe.calls.mostRecent().args[0].submission_id).not.toBe(first);
  });
  it('shows throttling and bounds requests with cancellation on navigation',fakeAsync(()=>{
    api.subscribe.and.returnValue(throwError(()=>new HttpErrorResponse({status:429})));const {c,f}=form();c.email.set('qa@example.test');c.consent.set(true);c.submit();expect(c.error()).toContain('wait');
    const pending=new Subject<any>();api.subscribe.and.returnValue(pending);c.submit();tick(60_001);expect(c.busy()).toBeFalse();expect(pending.observed).toBeFalse();c.submit();expect(pending.observed).toBeTrue();f.destroy();expect(pending.observed).toBeFalse();
  }));
  it('renders a local confirmation link only after a sandbox receipt',()=>{
    api.subscribe.and.returnValue(of({recorded:true,delivery_status:'sandbox',debug_confirmation:{request_id:id,token}}));const {c,f}=form();c.email.set('qa@example.test');c.consent.set(true);c.submit();f.detectChanges();expect(f.nativeElement.textContent).toContain('no email was sent');expect(f.nativeElement.querySelector('a').getAttribute('href')).toContain('/newsletter/confirm#request_id='+id);expect(api.confirm).not.toHaveBeenCalled();
  });
  it('does not simulate a saved subscription with the backend disabled',()=>{
    config.useBackend=false;const {c}=form();c.email.set('qa@example.test');c.consent.set(true);c.submit();expect(api.subscribe).not.toHaveBeenCalled();expect(c.receipt()).toBeNull();
  });
  it('does not mutate on opening a confirmation link and suppresses double confirmation clicks',()=>{
    const pending=new Subject<any>();api.confirm.and.returnValue(pending);const {c,f}=action();expect(api.confirm).not.toHaveBeenCalled();c.submit();c.submit();expect(api.confirm).toHaveBeenCalledOnceWith({request_id:id,token});pending.next({status:'subscribed',subscriber_id:id,unsubscribe_token:token});pending.complete();f.detectChanges();expect(f.nativeElement.textContent).toContain('subscription is confirmed');expect(f.nativeElement.querySelector('a').getAttribute('href')).toContain('/newsletter/unsubscribe#');
  });
  it('requires a valid capability and rejects query credentials and extra fragment fields',()=>{
    for(const fragment of ['', 'request_id='+id+'&token=bad','request_id='+id+'&token='+token+'&role=admin']){
      route.snapshot.fragment=fragment;const {c,f}=action();c.submit();expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();f.destroy();
    }
    route.snapshot.fragment='request_id='+id+'&token='+token;route.snapshot.queryParamMap=convertToParamMap({token});const {c}=action();c.submit();expect(api.confirm).not.toHaveBeenCalled();
  });
  it('retries a network error with the same proof and distinguishes an expired link',()=>{
    api.confirm.and.returnValue(throwError(()=>new HttpErrorResponse({status:503})));const {c}=action();c.submit();expect(c.error()).toContain('Please retry');expect(c.result()).toBeNull();
    api.confirm.and.returnValue(throwError(()=>new HttpErrorResponse({status:422})));c.submit();expect(c.error()).toContain('invalid or expired');expect(api.confirm).toHaveBeenCalledTimes(2);
  });
  it('unsubscribes only after an explicit click and cancels a pending action when destroyed',()=>{
    route.snapshot.data.newsletterAction='unsubscribe';route.snapshot.fragment='subscriber_id='+id+'&token='+token;const pending=new Subject<any>();api.unsubscribe.and.returnValue(pending);const {c,f}=action();expect(api.unsubscribe).not.toHaveBeenCalled();c.submit();expect(api.unsubscribe).toHaveBeenCalledOnceWith(id,token);f.destroy();expect(pending.observed).toBeFalse();
  });
});
