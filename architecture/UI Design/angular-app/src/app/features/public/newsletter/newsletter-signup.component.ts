import {ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {HttpErrorResponse} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {finalize, timeout} from 'rxjs';
import {ApiNewsletterService, NewsletterReceipt} from '../../../core/api/api-newsletter.service';
import {API_CONFIG} from '../../../core/api/api-config';
import {LanguageService} from '../../../core/i18n';
import {newsletterCopy} from './newsletter-copy';

@Component({selector:'app-newsletter-signup',standalone:true,imports:[FormsModule,RouterLink],changeDetection:ChangeDetectionStrategy.OnPush,
  styles:[`.consent {display:flex;gap:8px;font-size:12px;margin:10px 0;color:#ddd}.consent input{width:auto}.notice{font-size:12px;color:#ddd;line-height:1.5}.error{color:#ffb4b4}.trap{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}.spinner{display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:newsletter-spin .7s linear infinite;margin-right:6px}@keyframes newsletter-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spinner{animation:none}}`],
  template:`
    @if(receipt();as result){
      <div class="notice" role="status" data-newsletter-receipt><b>{{copy().saved}}</b>
        <p>{{ result.delivery_status==='sandbox'?copy().sandbox:result.delivery_status==='unavailable'?copy().pending:result.delivery_status==='sending'?copy().sending:copy().sent }}</p>
        @if(result.debug_confirmation){<a routerLink="/newsletter/confirm" [fragment]="debugFragment()">{{copy().testLink}}</a>}
      </div>
      <button type="button" class="link-button" (click)="restart()">{{copy().another}}</button>
    }@else{
      <form (ngSubmit)="submit()" data-newsletter-form>
        <div class="newsletter-row"><input type="email" name="newsletterEmail" [attr.aria-label]="copy().email" [placeholder]="copy().email" maxlength="254" required [disabled]="busy()" [ngModel]="email()" (ngModelChange)="updateEmail($event)">
          <button type="submit" [disabled]="busy()" [attr.aria-busy]="busy()">@if(busy()){<span class="spinner" aria-hidden="true"></span>}{{busy()?copy().busy:copy().subscribe}}</button></div>
        <label class="consent"><input type="checkbox" name="newsletterConsent" required [disabled]="busy()" [ngModel]="consent()" (ngModelChange)="consent.set($event)"><span>{{copy().consent}} <a routerLink="/privacy-policy">{{copy().privacy}}</a></span></label>
        <div class="trap" aria-hidden="true"><label>Website<input name="newsletterWebsite" tabindex="-1" autocomplete="off" [ngModel]="website()" (ngModelChange)="website.set($event)"></label></div>
        @if(error()){<p class="notice error" role="alert">{{error()}}</p>}
      </form>
    }
  `})
export class NewsletterSignupComponent {
  private readonly api=inject(ApiNewsletterService);private readonly destroyRef=inject(DestroyRef);private readonly lang=inject(LanguageService);
  protected readonly copy=computed(()=>newsletterCopy(this.lang.lang()));
  protected readonly email=signal('');protected readonly consent=signal(false);protected readonly website=signal('');protected readonly busy=signal(false);protected readonly error=signal('');
  protected readonly receipt=signal<NewsletterReceipt|null>(null);private submissionId:string|null=null;
  protected readonly debugFragment=computed(()=>{const p=this.receipt()?.debug_confirmation;return p?'request_id='+p.request_id+'&token='+p.token:'';});
  protected updateEmail(value:string):void {if(this.busy())return;if(value.trim().toLowerCase()!==this.email().trim().toLowerCase())this.submissionId=null;this.email.set(value);this.error.set('');}
  protected restart():void {if(this.busy())return;this.receipt.set(null);this.submissionId=null;this.email.set('');this.consent.set(false);this.website.set('');this.error.set('');}
  protected submit():void {
    if(this.busy()||this.receipt())return;this.error.set('');
    if(!API_CONFIG.useBackend){this.error.set(this.copy().unavailable);return;}
    const email=this.email().trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254){this.error.set(this.copy().invalidEmail);return;}
    if(!this.consent()){this.error.set(this.copy().requiredConsent);return;}
    this.submissionId??=crypto.randomUUID();this.busy.set(true);
    // Acknowledgement may queue behind public feeds and confirmation delivery.
    // Preserve the request ID on uncertainty so a retry cannot duplicate consent.
    this.api.subscribe({submission_id:this.submissionId,email,consent:true,website:this.website()}).pipe(timeout(60_000),takeUntilDestroyed(this.destroyRef),finalize(()=>this.busy.set(false))).subscribe({
      next:result=>{this.receipt.set(result);this.email.set('');this.consent.set(false);},
      error:e=>this.error.set(e instanceof HttpErrorResponse&&e.status===429?this.copy().rate:this.copy().failed),
    });
  }
}
