import {inject, Injectable} from '@angular/core';
import {map} from 'rxjs';
import {ApiClientService} from './api-client.service';

export interface NewsletterProof { request_id: string; token: string; }
export interface NewsletterReceipt { recorded: true; delivery_status: 'sandbox'|'sent'|'unavailable'|'sending'; debug_confirmation?: NewsletterProof; }
export interface NewsletterConfirmed { status: 'subscribed'; subscriber_id: string; unsubscribe_token: string; }
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const TOKEN=/^[a-f0-9]{64}$/;
export const validNewsletterProof=(id:string,token:string)=>UUID.test(id)&&TOKEN.test(token);

@Injectable({providedIn:'root'})
export class ApiNewsletterService {
  private readonly api=inject(ApiClientService);
  subscribe(payload:{submission_id:string;email:string;consent:boolean;website:string}) {
    return this.api.post<NewsletterReceipt>('public/newsletter/subscriptions',payload).pipe(map(r=>{
      const d=r.data;if(!r.success||d?.recorded!==true||!['sandbox','sent','unavailable','sending'].includes(d.delivery_status)
        ||(d.debug_confirmation&&(!validNewsletterProof(d.debug_confirmation.request_id,d.debug_confirmation.token)||d.delivery_status!=='sandbox')))throw new Error('Invalid newsletter receipt');
      return d;
    }));
  }
  confirm(proof:NewsletterProof) {
    return this.api.post<NewsletterConfirmed>('public/newsletter/confirm',proof).pipe(map(r=>{
      const d=r.data;if(!r.success||d?.status!=='subscribed'||!validNewsletterProof(d.subscriber_id,d.unsubscribe_token))throw new Error('Invalid confirmation receipt');return d;
    }));
  }
  unsubscribe(subscriber_id:string,token:string) {
    return this.api.post<{status:'unsubscribed'}>('public/newsletter/unsubscribe',{subscriber_id,token}).pipe(map(r=>{
      if(!r.success||r.data?.status!=='unsubscribed')throw new Error('Invalid unsubscribe receipt');return r.data;
    }));
  }
}
