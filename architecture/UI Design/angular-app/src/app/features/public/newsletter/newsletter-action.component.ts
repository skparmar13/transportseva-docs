import {ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, computed, inject, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute,RouterLink} from '@angular/router';
import {Observable, finalize, timeout} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {API_CONFIG} from '../../../core/api/api-config';
import {ApiNewsletterService,NewsletterConfirmed,validNewsletterProof} from '../../../core/api/api-newsletter.service';
import {LanguageService} from '../../../core/i18n';
import {newsletterCopy} from './newsletter-copy';

@Component({selector:'app-newsletter-action',standalone:true,imports:[RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,
  styles:[`:host{display:block;max-width:650px;margin:55px auto;padding:24px}.card{padding:28px}.notice{line-height:1.6}.error{color:#b42318}.actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:22px}.spinner{display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:newsletter-spin .7s linear infinite;margin-right:7px}@keyframes newsletter-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spinner{animation:none}}`],
  template:`<section class="card"><h1>{{unsubscribeMode?copy().unsubscribeTitle:copy().confirmTitle}}</h1>
    @if(result();as receipt){<p role="status" class="notice">{{receipt.status==='subscribed'?copy().subscribed:copy().unsubscribed}}</p>
      @if(receipt.status==='subscribed'){<p>{{copy().saveUnsubscribe}}</p><a routerLink="/newsletter/unsubscribe" [fragment]="unsubscribeFragment()">{{copy().unsubscribe}}</a>}
    }@else if(!hasProof){<p class="notice error" role="alert">{{copy().invalidLink}}</p>}
    @else{<p class="notice">{{unsubscribeMode?copy().unsubscribeDescription:copy().confirmDescription}}</p>
      @if(error()){<p class="notice error" role="alert">{{error()}}</p>}
      <button type="button" class="btn btn-primary" [disabled]="busy()" [attr.aria-busy]="busy()" (click)="submit()">@if(busy()){<span class="spinner" aria-hidden="true"></span>}{{busy()?copy().working:unsubscribeMode?copy().unsubscribe:copy().confirm}}</button>
    }<div class="actions"><a routerLink="/">{{copy().home}}</a></div></section>`})
export class NewsletterActionComponent {
  private readonly route=inject(ActivatedRoute);private readonly api=inject(ApiNewsletterService);private readonly destroyRef=inject(DestroyRef);private readonly lang=inject(LanguageService);
  protected readonly copy=computed(()=>newsletterCopy(this.lang.lang()));protected readonly unsubscribeMode=this.route.snapshot.data['newsletterAction']==='unsubscribe';
  private readonly fragment=new URLSearchParams(this.route.snapshot.fragment??'');
  private readonly id=this.fragment.get(this.unsubscribeMode?'subscriber_id':'request_id')??'';private readonly token=this.fragment.get('token')??'';
  protected readonly hasProof=validNewsletterProof(this.id,this.token)&&this.route.snapshot.queryParamMap.keys.length===0
    &&Array.from(this.fragment.keys()).length===2&&this.fragment.has(this.unsubscribeMode?'subscriber_id':'request_id')&&this.fragment.has('token');
  protected readonly busy=signal(false);protected readonly error=signal('');protected readonly result=signal<NewsletterConfirmed|{status:'unsubscribed'}|null>(null);
  protected readonly unsubscribeFragment=computed(()=>{const r=this.result();return r?.status==='subscribed'?'subscriber_id='+r.subscriber_id+'&token='+r.unsubscribe_token:'';});
  constructor(){if(isPlatformBrowser(inject(PLATFORM_ID))&&window.location.hash)window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search);}
  protected submit():void {
    if(!this.hasProof||this.busy()||this.result())return;this.error.set('');if(!API_CONFIG.useBackend){this.error.set(this.copy().unavailable);return;}this.busy.set(true);
    const request:Observable<NewsletterConfirmed|{status:'unsubscribed'}>=this.unsubscribeMode?this.api.unsubscribe(this.id,this.token):this.api.confirm({request_id:this.id,token:this.token});
    request.pipe(timeout(30_000),takeUntilDestroyed(this.destroyRef),finalize(()=>this.busy.set(false))).subscribe({next:r=>this.result.set(r),error:e=>this.error.set(e instanceof HttpErrorResponse&&e.status===422?this.copy().invalidLink:this.copy().failed)});
  }
}
