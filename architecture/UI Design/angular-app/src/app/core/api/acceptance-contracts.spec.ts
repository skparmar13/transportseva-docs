import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiMarketplaceService } from './api-marketplace.service';
import { ApiReviewService } from './api-review.service';
import { ApiNotificationsService } from './api-notifications.service';
describe('Acceptance HTTP response contracts',()=>{
  let http:HttpTestingController;
  beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});http=TestBed.inject(HttpTestingController);});
  afterEach(()=>http.verify());
  it('loads and received applications retain real pagination metadata',()=>{
    const api=TestBed.inject(ApiMarketplaceService);
    api.listLoadsPage(2).subscribe((r)=>expect(r.total).toBe(21));
    const loads=http.expectOne((r)=>r.url.endsWith('/loads'));expect(loads.request.params.get('page')).toBe('2');expect(loads.request.params.get('mine')).toBe('true');
    loads.flush({success:true,data:[],meta:{current_page:2,last_page:2,total:21}});
    api.listReceivedApplicationsPage(2).subscribe((r)=>expect(r.total).toBe(101));
    const apps=http.expectOne((r)=>r.url.endsWith('/account/applications'));expect(apps.request.params.get('page')).toBe('2');
    apps.flush({success:true,data:[],meta:{current_page:2,last_page:6,total:101}});
  });
  it('KYC and reviews distinguish a failed or malformed HTTP 200 from a genuine empty record',()=>{
    const api=TestBed.inject(ApiMarketplaceService);const reviews=TestBed.inject(ApiReviewService);
    for(const response of [{success:false,data:null},{success:true,data:{}}]){
      let bad=false;api.getMarketplaceKyc().subscribe({error:()=>bad=true});http.expectOne((r)=>r.url.endsWith('/marketplace-kyc')).flush(response);expect(bad).toBeTrue();
      bad=false;reviews.listMine().subscribe({error:()=>bad=true});http.expectOne((r)=>r.url.endsWith('/reviews/mine')).flush(response);expect(bad).toBeTrue();
    }
    api.getMarketplaceKyc().subscribe((r)=>expect(r).toBeNull());http.expectOne((r)=>r.url.endsWith('/marketplace-kyc')).flush({success:true,data:null});
  });
  it('notification pages preserve global unread counts and reject missing metadata',()=>{
    const api=TestBed.inject(ApiNotificationsService);
    api.page(2,true).subscribe((r)=>{expect(r.unreadTotal).toBe(61);expect(r.page).toBe(2);});
    const r=http.expectOne((r)=>r.url.endsWith('/notifications/unread'));expect(r.request.params.get('page')).toBe('2');
    r.flush({success:true,data:[],meta:{current_page:2,last_page:4,total:61,unread_total:61}});
    let bad=false;api.page().subscribe({error:()=>bad=true});http.expectOne((r)=>r.url.endsWith('/notifications')).flush({success:true,data:[]});expect(bad).toBeTrue();
  });
  it('notification writes require explicit success and a matching saved acknowledgement',()=>{
    const api=TestBed.inject(ApiNotificationsService);
    for(const body of [{success:false,data:{}},{success:true,data:{}},{success:true,data:{id:'foreign',read_at:'2026-11-03T10:00:00Z'}}]){
      let bad=false;api.markRead('qa-id').subscribe({error:()=>bad=true});http.expectOne((r)=>r.url.endsWith('/notifications/qa-id/read')).flush(body);expect(bad).toBeTrue();
    }
  });
});
