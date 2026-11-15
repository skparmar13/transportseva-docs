import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { SessionService } from '../../../core/services/session.service';
import { ApplicationsComponent } from '../../marketplace/applications/applications.component';

describe('Transporter application views',()=>{
  const config=API_CONFIG as {useBackend:boolean};let previous:boolean;
  beforeEach(()=>{previous=config.useBackend;config.useBackend=true;});
  afterEach(()=>config.useBackend=previous);
  for(const sent of [true,false])it('uses the server-owned '+(sent?'sent':'received')+' query',()=>{
    const api=jasmine.createSpyObj('ApiMarketplaceService',['listMyApplicationsPage','listTransporterReceivedApplicationsPage']);
    api.listMyApplicationsPage.and.returnValue(of({rows:[],page:1,lastPage:1,total:0}));api.listTransporterReceivedApplicationsPage.and.returnValue(of({rows:[],page:1,lastPage:1,total:0}));
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:ActivatedRoute,useValue:{snapshot:{data:sent?{applicationView:'sent'}:{}}}},
      {provide:SessionService,useValue:{role:()=> 'transporter',portal:()=>({basePath:'/transporter'})}},
      {provide:ApiMarketplaceService,useValue:api}]});
    const f=TestBed.createComponent(ApplicationsComponent);f.detectChanges();
    if(sent){expect(api.listMyApplicationsPage).toHaveBeenCalledOnceWith(1);expect(api.listTransporterReceivedApplicationsPage).not.toHaveBeenCalled();}
    else {expect(api.listTransporterReceivedApplicationsPage).toHaveBeenCalledOnceWith(1);expect(api.listMyApplicationsPage).not.toHaveBeenCalled();}
  });
  for(const role of ['truck-owner','transporter']) it(role+' pages sent applications, retries the failed page and cancels pending reads',()=>{
    const api=jasmine.createSpyObj('ApiMarketplaceService',['listMyApplicationsPage']);
    const row={uuid:'app-1',load_uuid:'load-1',applicant_role:role,applicant_name:'QA',vehicle_reg_number:'QA1234',availability:'Today',status:'pending',quoted_amount:17000};
    api.listMyApplicationsPage.and.returnValue(of({rows:[row],page:1,lastPage:6,total:101}));
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:ActivatedRoute,useValue:{snapshot:{data:{applicationView:'sent'}}}},
      {provide:SessionService,useValue:{role:()=>role,portal:()=>({basePath:'/'+role})}},{provide:ApiMarketplaceService,useValue:api}]});
    const f=TestBed.createComponent(ApplicationsComponent);f.detectChanges();const el=f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Total applications: 101 · Page 1 of 6');
    expect((Array.from(el.querySelectorAll('button')).find(b=>b.textContent?.trim()==='Previous') as HTMLButtonElement).disabled).toBeTrue();
    api.listMyApplicationsPage.and.returnValue(throwError(()=>new Error('Read failed')));
    Array.from(el.querySelectorAll('button')).find(b=>b.textContent?.trim()==='Next')!.click();f.detectChanges();
    expect(api.listMyApplicationsPage).toHaveBeenCalledWith(2);expect(el.querySelector('[role=alert]')).not.toBeNull();expect(el.querySelector('tbody')).toBeNull();
    const pending=new Subject<any>();api.listMyApplicationsPage.and.returnValue(pending);
    Array.from(el.querySelectorAll('button')).find(b=>b.textContent?.trim()==='Retry')!.click();f.detectChanges();
    expect(api.listMyApplicationsPage).toHaveBeenCalledWith(2);expect(el.querySelector('[role=status]')).not.toBeNull();
    (f.componentInstance as any).reloadBackendData(3);expect(api.listMyApplicationsPage).toHaveBeenCalledTimes(3);
    pending.next({rows:[row],page:2,lastPage:6,total:101});pending.complete();f.detectChanges();
    expect(el.textContent).toContain('Page 2 of 6');
    const next=new Subject<any>();api.listMyApplicationsPage.and.returnValue(next);(f.componentInstance as any).reloadBackendData(3);
    f.destroy();expect(next.observed).toBeFalse();
  });
});
