import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ADMIN_REPORT_STATES, AdminReportFilter, ApiAdminReportService } from './api-admin-report.service';
import { API_CONFIG } from './api-config';

describe('Admin aggregate report adapter', () => {
  let api: ApiAdminReportService; let http: HttpTestingController;
  const path=API_CONFIG.baseUrl+'/admin/reports'; const filters: AdminReportFilter={table:'loads',from:'2026-11-01',to:null,status:'open'};
  const data=()=>({table:'loads',filters:{from:'2026-11-01',to:null,status:'open',timezone:'Asia/Kolkata',basis:'created_at'},summary:{total:2,statuses:Object.fromEntries(ADMIN_REPORT_STATES.loads.map(s=>[s,s==='open'?2:0]))},rows:[{date:'2026-11-02',status:'open',records:2}],generated_at:'2026-11-19T10:00:00Z'});
  beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});api=TestBed.inject(ApiAdminReportService);http=TestBed.inject(HttpTestingController);});afterEach(()=>http.verify());
  it('requests bounded server paging with only date/table/status filters',()=>{
    let result:any;api.list(filters,2).subscribe(v=>result=v);const r=http.expectOne(req=>req.url===path);
    expect(r.request.method).toBe('GET');expect(r.request.params.get('page')).toBe('2');expect(r.request.params.get('per_page')).toBe('25');expect(r.request.params.get('from')).toBe('2026-11-01');expect(r.request.params.has('owner_uuid')).toBeFalse();
    r.flush({success:true,data:data(),meta:{current_page:2,last_page:2,total:26}});expect(result.summary.total).toBe(2);
  });
  it('rejects mismatched applied filters, missing counts and contradictory summaries',()=>{
    const base=data();for(const value of [{...base,filters:{...base.filters,status:'all'}},{...base,summary:{total:3,statuses:base.summary.statuses}},{...base,summary:{total:0,statuses:{}}}]){
      let failed=false;api.list(filters,1).subscribe({next:()=>fail('Malformed report accepted'),error:()=>failed=true});http.expectOne(req=>req.url===path).flush({success:true,data:value,meta:{current_page:1,last_page:1,total:1}});expect(failed).toBeTrue();
    }
  });
  it('exports applied filters without a page parameter and returns a real CSV blob',()=>{
    let result:Blob|undefined;api.export(filters).subscribe(v=>result=v);const r=http.expectOne(req=>req.url.startsWith(path+'/export?'));
    const params=new URL(r.request.url).searchParams;expect(params.get('status')).toBe('open');expect(params.has('page')).toBeFalse();expect(r.request.responseType).toBe('blob');r.flush(new Blob(['CSV'],{type:'text/csv'}));expect(result?.size).toBe(3);
  });
});
