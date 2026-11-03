import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../core/api/api-config';
import { ApiMarketplaceService } from '../../core/api/api-marketplace.service';
import { ApiReviewService } from '../../core/api/api-review.service';
import { ApiNotificationsService } from '../../core/api/api-notifications.service';
import { CommunicationMockService } from '../../core/services/communication-mock.service';
import { NotificationNavigationService } from '../../core/services/notification-navigation.service';
import { MarketplaceMockService } from '../../core/services/marketplace-mock.service';
import { SessionService } from '../../core/services/session.service';
import { formatDateTime } from '../../core/utils/date-format';
import { LanguageService } from '../../core/i18n';
import { MyLoadsComponent } from '../marketplace/my-loads/my-loads.component';
import { ApplicationsComponent } from '../marketplace/applications/applications.component';
import { MyKycComponent } from '../kyc/my-kyc/my-kyc.component';
import { MyReviewComponent } from '../reviews/my-review/my-review.component';
import { NotificationsComponent } from '../notifications/notifications.component';

const uuid='5c18b398-8a75-4017-9ecf-e268282a4852';
const load={uuid,load_id:'LD-QA-ACCEPTANCE',pickup_city:'Delhi',drop_city:'Jaipur',budget:17000,status:'open'};
const app={uuid,load_uuid:uuid,applicant_role:'truck-owner',applicant_name:'QA Owner',vehicle_reg_number:'QA1234',vehicle_type:'32ft Trailer',availability:'Today',quoted_amount:17000,current_offer_amount:18000,status:'pending',load};
const kyc={uuid,business_name:'QA business',business_type:'individual',document_name:'qa.png',status:'approved',pan_last_four:'******234F'};
const review={uuid,reviewer_name:'QA',reviewer_role:'shipper',rating:4,comment:'QA acceptance review only',status:'pending'};
const notice={id:uuid,title:'QA event',message:'Private QA message',category:'System',created_at:'2026-11-03T10:00:00Z',read_at:null};
const page={rows:[notice],page:1,lastPage:3,total:55,unreadTotal:25};
describe('Shipper acceptance fix regressions',()=>{
const config=API_CONFIG as {useBackend:boolean}; let previous=false;
beforeEach(()=>{previous=config.useBackend;config.useBackend=true;});
afterEach(()=>{config.useBackend=previous;});

describe('Shipper load/application acceptance repairs',()=>{
  let api:jasmine.SpyObj<ApiMarketplaceService>;
  beforeEach(()=>{
    api=jasmine.createSpyObj('ApiMarketplaceService',['listLoadsPage','listReceivedApplicationsPage']);
    api.listLoadsPage.and.returnValue(of({rows:[load],page:1,lastPage:2,total:21}));
    api.listReceivedApplicationsPage.and.returnValue(of({rows:[app] as any,page:1,lastPage:2,total:21}));
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:ApiMarketplaceService,useValue:api},
      {provide:SessionService,useValue:{role:()=> 'shipper',user:()=>({name:'QA',company:'QA'}),portal:()=>({basePath:'/shipper'})}},
      {provide:MarketplaceMockService,useValue:{getLoadsPostedBy:()=>()=>[],applications:()=>[],getApplicationsBy:()=>()=>[]}}]});
    TestBed.inject(LanguageService).setLang('en');
  });
  it('uses a paginated application endpoint, actual negotiated amount and server totals',()=>{
    const f=TestBed.createComponent(ApplicationsComponent);f.detectChanges();
    expect(api.listReceivedApplicationsPage).toHaveBeenCalledWith(1);expect(f.nativeElement.textContent).toContain('₹18,000');
    expect(f.nativeElement.textContent).toContain('Total applications: 21');
    (f.componentInstance as any).reloadBackendData(2);expect(api.listReceivedApplicationsPage).toHaveBeenCalledWith(2);
  });
  it('never turns failed application retrieval into an empty success',()=>{
    api.listReceivedApplicationsPage.and.returnValue(throwError(()=>new HttpErrorResponse({status:503})));
    const f=TestBed.createComponent(ApplicationsComponent);f.detectChanges();
    expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();expect(f.nativeElement.textContent).toContain('Retry');
    expect(f.nativeElement.querySelector('tbody')).toBeNull();
  });
  it('shows load pagination and retries real reads without routing away',()=>{
    const f=TestBed.createComponent(MyLoadsComponent);f.detectChanges();expect(f.nativeElement.textContent).toContain('Total loads: 21');
    expect(f.nativeElement.textContent).toContain('₹17,000');
    api.listLoadsPage.and.returnValue(throwError(()=>new HttpErrorResponse({status:503})));
    (f.componentInstance as any).load(2);f.detectChanges();expect(f.nativeElement.textContent).toContain('Retry');
    expect(f.nativeElement.textContent).not.toContain('Back to Post Load');
  });
  it('guards duplicate load and application reads while pending',()=>{
    const pending=new Subject<any>();api.listLoadsPage.and.returnValue(pending);
    const f=TestBed.createComponent(MyLoadsComponent);(f.componentInstance as any).load(2);expect(api.listLoadsPage).toHaveBeenCalledTimes(1);
    api.listReceivedApplicationsPage.and.returnValue(pending);const a=TestBed.createComponent(ApplicationsComponent);
    (a.componentInstance as any).reloadBackendData(2);expect(api.listReceivedApplicationsPage).toHaveBeenCalledTimes(1);
    f.destroy();a.destroy();expect(pending.observed).toBeFalse();
  });
});

describe('KYC and Review acceptance repairs',()=>{
  let api:jasmine.SpyObj<ApiMarketplaceService>;let reviews:jasmine.SpyObj<ApiReviewService>;
  beforeEach(()=>{
    api=jasmine.createSpyObj('ApiMarketplaceService',['getMarketplaceKyc','submitMarketplaceKyc','downloadMarketplaceKycDocument']);
    api.getMarketplaceKyc.and.returnValue(of(kyc as any));
    reviews=jasmine.createSpyObj('ApiReviewService',['listMine','submit']);reviews.listMine.and.returnValue(of(null));
    TestBed.configureTestingModule({providers:[{provide:ApiMarketplaceService,useValue:api},{provide:ApiReviewService,useValue:reviews}]});
  });
  it('KYC read errors hide the submission form and support a real retry',()=>{
    api.getMarketplaceKyc.and.returnValue(throwError(()=>new HttpErrorResponse({status:503})));
    const f=TestBed.createComponent(MyKycComponent);f.detectChanges();expect(f.nativeElement.querySelector('#kyc-business-name')).toBeNull();
    expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();
    api.getMarketplaceKyc.and.returnValue(of(null));(f.componentInstance as any).load();f.detectChanges();expect(f.nativeElement.querySelector('#kyc-business-name')).not.toBeNull();
  });
  it('Review read errors hide the writable form and support retry',()=>{
    reviews.listMine.and.returnValue(throwError(()=>new HttpErrorResponse({status:503})));
    const f=TestBed.createComponent(MyReviewComponent);f.detectChanges();expect(f.nativeElement.querySelector('#review-comment')).toBeNull();
    reviews.listMine.and.returnValue(of(null));(f.componentInstance as any).load();f.detectChanges();expect(f.nativeElement.querySelector('#review-comment')).not.toBeNull();
  });
  it('Review submission locks fields, prevents duplicates and waits for acknowledgement',()=>{
    const pending=new Subject<any>();reviews.submit.and.returnValue(pending);const f=TestBed.createComponent(MyReviewComponent);f.detectChanges();
    const c=f.componentInstance as any;c.rating.set(4);c.comment.set(review.comment);c.save();c.save();f.detectChanges();
    expect(reviews.submit).toHaveBeenCalledTimes(1);expect(f.nativeElement.querySelector('#review-comment').matches(':disabled')).toBeTrue();
    expect(c.review()).toBeNull();pending.next(review);f.detectChanges();expect(f.nativeElement.textContent).toContain('Awaiting admin moderation');
  });
  it('KYC upload guards duplicates and leaves approved/pending profiles locked',()=>{
    api.getMarketplaceKyc.and.returnValue(of(null));const pending=new Subject<any>();api.submitMarketplaceKyc.and.returnValue(pending);
    const f=TestBed.createComponent(MyKycComponent);f.detectChanges();const c=f.componentInstance as any;
    c.businessName.set('QA business');c.panNumber.set('ABCDE1234F');c.selectedFile.set(new File(['QA'],'qa.png',{type:'image/png'}));c.submit();c.submit();
    expect(api.submitMarketplaceKyc).toHaveBeenCalledTimes(1);pending.next({...kyc,status:'pending'});c.submit();expect(api.submitMarketplaceKyc).toHaveBeenCalledTimes(1);
  });
  it('KYC original download animates, guards duplicates and reports failure',()=>{
    const pending=new Subject<Blob>();api.downloadMarketplaceKycDocument.and.returnValue(pending);
    const f=TestBed.createComponent(MyKycComponent);f.detectChanges();const c=f.componentInstance as any;c.download(kyc);c.download(kyc);f.detectChanges();
    expect(api.downloadMarketplaceKycDocument).toHaveBeenCalledTimes(1);expect(f.nativeElement.querySelector('.kyc-spinner')).not.toBeNull();
    pending.error(new HttpErrorResponse({status:404}));f.detectChanges();expect(f.nativeElement.textContent).toContain('could not be downloaded');
  });
});

describe('Notification acknowledgement, account and pagination repairs',()=>{
  let api:jasmine.SpyObj<ApiNotificationsService>;let oldToken:string|null;
  beforeEach(()=>{
    oldToken=localStorage.getItem('transportseva.access_token');localStorage.setItem('transportseva.access_token','qa-notification-token');
    api=jasmine.createSpyObj('ApiNotificationsService',['page','markRead','markAllRead']);api.page.and.returnValue(of(page));
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:ApiNotificationsService,useValue:api},{provide:NotificationNavigationService,useValue:{destination:()=>null}}]});
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(()=>{if(oldToken===null)localStorage.removeItem('transportseva.access_token');else localStorage.setItem('transportseva.access_token',oldToken);TestBed.inject(LanguageService).setLang('en');});
  it('shows the full server unread count, not just the five bell entries, and formats timestamps once',()=>{
    const c=TestBed.inject(CommunicationMockService);c.refreshNotifications();
    expect(c.unreadCount()).toBe(25);expect(c.notifications().length).toBe(1);expect(c.notifications()[0].timestamp).toBe(formatDateTime(notice.created_at));
  });
  it('does not optimistically mark read and retains state after failed acknowledgement',()=>{
    const c=TestBed.inject(CommunicationMockService);c.refreshNotifications();const pending=new Subject<any>();api.markRead.and.returnValue(pending);
    c.markNotificationRead(uuid);c.markNotificationRead(uuid);expect(api.markRead).toHaveBeenCalledTimes(1);
    expect(c.notifications()[0].read).toBeFalse();pending.error(new HttpErrorResponse({status:503}));
    expect(c.notifications()[0].read).toBeFalse();expect(c.unreadCount()).toBe(25);expect(c.writeError()).toBe('read');
  });
  it('acknowledges and retries single reads only after server success',()=>{
    const c=TestBed.inject(CommunicationMockService);c.refreshNotifications();api.markRead.and.returnValue(throwError(()=>new HttpErrorResponse({status:503})));
    c.markNotificationRead(uuid);api.markRead.and.returnValue(of({id:uuid,read_at:notice.created_at}));
    api.page.and.returnValue(of({...page,rows:[{...notice,read_at:notice.created_at}],unreadTotal:24}));c.retryNotificationWrite();
    expect(c.notifications()[0].read).toBeTrue();expect(c.unreadCount()).toBe(24);expect(c.writeError()).toBeNull();
  });
  it('never marks all read on failure and guards duplicate all-read actions',()=>{
    const c=TestBed.inject(CommunicationMockService);c.refreshNotifications();const pending=new Subject<any>();api.markAllRead.and.returnValue(pending);
    c.markAllNotificationsRead();c.markAllNotificationsRead();expect(api.markAllRead).toHaveBeenCalledTimes(1);
    pending.error(new HttpErrorResponse({status:503}));expect(c.unreadCount()).toBe(25);expect(c.writeError()).toBe('all');
  });
  it('cancels pending writes on logout/account replacement and ignores their later responses',()=>{
    const c=TestBed.inject(CommunicationMockService);c.refreshNotifications();const pending=new Subject<any>();api.markRead.and.returnValue(pending);
    const done=jasmine.createSpy('done');c.markNotificationRead(uuid,done);c.clearNotifications();pending.next({id:uuid});
    expect(pending.observed).toBeFalse();expect(c.notifications()).toEqual([]);expect(done).not.toHaveBeenCalled();
  });
  it('polls with a single replaceable stream',fakeAsync(()=>{
    const c=TestBed.inject(CommunicationMockService);c.startLiveUpdates();c.startLiveUpdates();tick(1250);
    expect(api.page).toHaveBeenCalledTimes(1);tick(15000);expect(api.page).toHaveBeenCalledTimes(2);c.clearNotifications();
  }));
  it('notification page uses server unread filtering and pagination rather than filtering a capped bell cache',()=>{
    const f=TestBed.createComponent(NotificationsComponent);f.detectChanges();const c=f.componentInstance as any;c.setFilter('unread');
    expect(api.page.calls.mostRecent().args).toEqual([1,true]);c.load(2);expect(api.page.calls.mostRecent().args).toEqual([2,true]);
  });
  it('notification page has honest read-failure/retry state, not a false empty inbox',()=>{
    api.page.and.returnValue(throwError(()=>new HttpErrorResponse({status:503})));
    const f=TestBed.createComponent(NotificationsComponent);f.detectChanges();expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();
    expect(f.nativeElement.textContent).toContain('Retry');expect(f.nativeElement.textContent).not.toContain('No notifications yet');
  });
});
});
