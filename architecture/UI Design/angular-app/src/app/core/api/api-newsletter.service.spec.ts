import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting,HttpTestingController} from '@angular/common/http/testing';
import {ApiNewsletterService} from './api-newsletter.service';
import {API_CONFIG} from './api-config';
describe('Private newsletter capabilities and public consent receipts',()=>{
  let api:ApiNewsletterService;let http:HttpTestingController;const id='5c18b398-8a75-4017-9ecf-e268282a4852';const token='a'.repeat(64);
  beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});api=TestBed.inject(ApiNewsletterService);http=TestBed.inject(HttpTestingController);});
  afterEach(()=>http.verify());
  it('requires an acknowledged receipt and posts explicit consent without URL credentials',()=>{
    const body={submission_id:id,email:'qa@example.test',consent:true,website:''};let saved:unknown;api.subscribe(body).subscribe(r=>saved=r);
    const req=http.expectOne(API_CONFIG.baseUrl+'/public/newsletter/subscriptions');expect(req.request.method).toBe('POST');expect(req.request.body).toEqual(body);
    req.flush({success:true,data:{recorded:true,delivery_status:'unavailable'}});expect(saved).toEqual({recorded:true,delivery_status:'unavailable'});
  });
  it('rejects missing receipts and malformed or mislabelled sandbox capabilities',()=>{
    for(const data of [null,{recorded:false,delivery_status:'sent'},{recorded:true,delivery_status:'sandbox',debug_confirmation:{request_id:id,token:'bad'}},{recorded:true,delivery_status:'sent',debug_confirmation:{request_id:id,token}}]){
      let rejected=false;api.subscribe({submission_id:id,email:'qa@example.test',consent:true,website:''}).subscribe({next:()=>fail('Malformed receipt accepted'),error:()=>rejected=true});
      http.expectOne(API_CONFIG.baseUrl+'/public/newsletter/subscriptions').flush({success:true,data});expect(rejected).toBeTrue();
    }
  });
  it('sends confirmation and unsubscribe capabilities only in POST bodies',()=>{
    api.confirm({request_id:id,token}).subscribe();const confirm=http.expectOne(API_CONFIG.baseUrl+'/public/newsletter/confirm');expect(confirm.request.method).toBe('POST');expect(confirm.request.body).toEqual({request_id:id,token});
    confirm.flush({success:true,data:{status:'subscribed',subscriber_id:id,unsubscribe_token:token}});
    api.unsubscribe(id,token).subscribe();const stop=http.expectOne(API_CONFIG.baseUrl+'/public/newsletter/unsubscribe');expect(stop.request.body).toEqual({subscriber_id:id,token});stop.flush({success:true,data:{status:'unsubscribed'}});
  });
  it('does not treat incomplete action receipts as success',()=>{
    let failed=0;api.confirm({request_id:id,token}).subscribe({error:()=>failed++});http.expectOne(API_CONFIG.baseUrl+'/public/newsletter/confirm').flush({success:true,data:{status:'subscribed'}});
    api.unsubscribe(id,token).subscribe({error:()=>failed++});http.expectOne(API_CONFIG.baseUrl+'/public/newsletter/unsubscribe').flush({success:false,data:{status:'unsubscribed'}});expect(failed).toBe(2);
  });
});
