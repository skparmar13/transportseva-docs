import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ADMIN_REPORT_STATES, AdminReportPage, ApiAdminReportService } from '../../../core/api/api-admin-report.service';
import { LanguageService } from '../../../core/i18n';
import { AdminReportsComponent } from './admin-reports.component';

describe('Admin operational reports',()=>{
  const config=API_CONFIG as {useBackend:boolean};let old:boolean;let api:jasmine.SpyObj<ApiAdminReportService>;
  const report:AdminReportPage={table:'loads',filters:{from:null,to:null,status:'all',timezone:'Asia/Kolkata',basis:'created_at'},summary:{total:39,statuses:Object.fromEntries(ADMIN_REPORT_STATES.loads.map(s=>[s,s==='open'?39:0]))},rows:[{date:'2026-11-19',status:'open',records:39}],generated_at:'2026-11-19T10:00:00Z',page:1,lastPage:2,matching:26};
  beforeEach(()=>{old=config.useBackend;config.useBackend=true;api=jasmine.createSpyObj('ApiAdminReportService',['list','export']);api.list.and.returnValue(of(structuredClone(report)));api.export.and.returnValue(of(new Blob(['CSV'],{type:'text/csv'})));TestBed.configureTestingModule({providers:[{provide:ApiAdminReportService,useValue:api}]});TestBed.inject(LanguageService).setLang('en');});
  afterEach(()=>{TestBed.resetTestingModule();config.useBackend=old;});
  const create=()=>{const f=TestBed.createComponent(AdminReportsComponent);f.detectChanges();return{f,c:f.componentInstance as any};};
  it('renders real aggregate values, clear cohort semantics and DD/MM/YYYY dates',()=>{
    const{f}=create();expect(f.nativeElement.querySelector('[data-report-total]').textContent).toBe('39');expect(f.nativeElement.querySelector('tbody').textContent).toContain('19/11/2026');expect(f.nativeElement.textContent).toContain('not historical status snapshots');expect(f.nativeElement.textContent).not.toContain('Freight Revenue');
  });
  it('locks duplicate reads and clears displayed records while a refresh is pending',()=>{
    const pending=new Subject<AdminReportPage>();api.list.and.returnValue(pending);const{f,c}=create();c.load();f.detectChanges();expect(api.list).toHaveBeenCalledTimes(1);expect(f.nativeElement.querySelector('[aria-busy=true]')).not.toBeNull();expect(f.nativeElement.querySelector('table')).toBeNull();expect(f.nativeElement.querySelector('button').disabled).toBeTrue();
  });
  it('retains the exact applied request/page on retry rather than using a modified form draft',()=>{
    const{f,c}=create();c.from.set('2026-10-01');c.status.set('open');api.list.and.returnValue(throwError(()=>new Error('offline')));c.apply();c.load(2);c.from.set('2026-01-01');c.retry();f.detectChanges();
    expect(api.list.calls.mostRecent().args).toEqual([{table:'loads',from:'2026-10-01',to:null,status:'open'},2]);expect(f.nativeElement.textContent).toContain('could not be loaded');
  });
  it('rejects inverted dates without sending a request and changes dataset using the applied period',()=>{
    const{c}=create();c.from.set('2026-12-01');c.to.set('2026-01-01');c.apply();expect(c.error()).toBe('invalid');expect(api.list).toHaveBeenCalledTimes(1);
    c.changeTable('applications');expect(api.list.calls.mostRecent().args).toEqual([{table:'applications',from:null,to:null,status:'all'},1]);
  });
  it('exports all matching applied groups and blocks duplicate export and refresh clicks',()=>{
    const pending=new Subject<Blob>();api.export.and.returnValue(pending);const{f,c}=create();c.from.set('2026-01-01');c.status.set('closed');c.export();c.export();c.load();f.detectChanges();
    expect(api.export).toHaveBeenCalledOnceWith({table:'loads',from:null,to:null,status:'all'});expect(api.list).toHaveBeenCalledTimes(1);expect(c.exporting()).toBeTrue();expect(f.nativeElement.textContent).toContain('Preparing CSV');
    const make=spyOn(URL,'createObjectURL').and.returnValue('blob:report-test');const revoke=spyOn(URL,'revokeObjectURL');spyOn(HTMLAnchorElement.prototype,'click');pending.next(new Blob(['CSV'],{type:'text/csv'}));pending.complete();expect(make).toHaveBeenCalled();expect(revoke).toHaveBeenCalledWith('blob:report-test');expect(c.exporting()).toBeFalse();
  });
  it('keeps a failed export retryable and clears private data after export authorization revocation',()=>{
    const{f,c}=create();api.export.and.returnValue(throwError(()=>new HttpErrorResponse({status:422})));c.export();f.detectChanges();expect(c.exportError()).toBeTrue();expect(c.data()).not.toBeNull();
    api.export.and.returnValue(throwError(()=>new HttpErrorResponse({status:403})));c.export();f.detectChanges();expect(c.error()).toBe('denied');expect(c.data()).toBeNull();expect(f.nativeElement.querySelector('table')).toBeNull();
  });
  it('bounds list and export requests and cancels them on navigation',fakeAsync(()=>{
    const read=new Subject<AdminReportPage>();api.list.and.returnValue(read);const{f,c}=create();tick(30_001);expect(read.observed).toBeFalse();expect(c.error()).toBe('failed');
    api.list.and.returnValue(of(report));c.retry();const download=new Subject<Blob>();api.export.and.returnValue(download);c.export();tick(60_001);expect(download.observed).toBeFalse();expect(c.exportError()).toBeTrue();c.export();f.destroy();expect(download.observed).toBeFalse();
  }));
  it('renders translated zero and empty-group states without samples',()=>{
    api.list.and.returnValue(of({...report,summary:{total:0,statuses:Object.fromEntries(ADMIN_REPORT_STATES.loads.map(s=>[s,0]))},rows:[],matching:0}));const{f}=create();TestBed.inject(LanguageService).setLang('hi');f.detectChanges();expect(f.nativeElement.textContent).toContain('मेल खाने वाले समूह नहीं मिले');expect(f.nativeElement.querySelector('[data-report-total]').textContent).toBe('0');
  });
  it('fails closed in backend-off mode without exporting local prototype data',()=>{
    config.useBackend=false;const{c}=create();c.export();expect(api.list).not.toHaveBeenCalled();expect(api.export).not.toHaveBeenCalled();expect(c.error()).toBe('denied');
  });
});
