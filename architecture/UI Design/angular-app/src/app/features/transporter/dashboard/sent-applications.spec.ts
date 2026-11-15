import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { SessionService } from '../../../core/services/session.service';
import { ApplicationsComponent } from '../../marketplace/applications/applications.component';

describe('Transporter application views',()=>{
  const config=API_CONFIG as {useBackend:boolean};let previous:boolean;
  beforeEach(()=>{previous=config.useBackend;config.useBackend=true;});
  afterEach(()=>config.useBackend=previous);
  for(const sent of [true,false])it('uses the server-owned '+(sent?'sent':'received')+' query',()=>{
    const api=jasmine.createSpyObj('ApiMarketplaceService',['listMyApplications','listLoads']);
    api.listMyApplications.and.returnValue(of([]));api.listLoads.and.returnValue(of([]));
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:ActivatedRoute,useValue:{snapshot:{data:sent?{applicationView:'sent'}:{}}}},
      {provide:SessionService,useValue:{role:()=> 'transporter',portal:()=>({basePath:'/transporter'})}},
      {provide:ApiMarketplaceService,useValue:api}]});
    const f=TestBed.createComponent(ApplicationsComponent);f.detectChanges();
    if(sent){expect(api.listMyApplications).toHaveBeenCalledTimes(1);expect(api.listLoads).not.toHaveBeenCalled();}
    else {expect(api.listLoads).toHaveBeenCalledWith({mine:true,per_page:100});expect(api.listMyApplications).not.toHaveBeenCalled();}
  });
});
