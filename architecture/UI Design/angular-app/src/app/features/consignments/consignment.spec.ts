import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ApiConsignmentService, ConsignmentVersion, ConsignmentView } from '../../core/api/api-consignment.service';
import { LanguageService } from '../../core/i18n';
import { SessionService } from '../../core/services/session.service';
import { BookingConsignmentComponent } from './booking-consignment.component';
import { ConsignmentListComponent } from './consignment-list.component';

describe('Booking LR/GR records',()=>{
  let api:any;
  const version=():ConsignmentVersion=>({uuid:'version-id',consignment_uuid:'consignment-id',booking_uuid:'booking-id',version:1,fingerprint:'fingerprint',
    snapshot:{document_type:'LR',number:'QA/LR/1',issue_date:'2026-11-28',financial_year:'2026-2027',booking_reference:'TS-QA-LR',load_reference:'LD-QA',issuer_name:'QA Carrier',issuer_address:'QA carrier address',issuer_gstin:null,
      consignor_name:'QA Consignor',consignor_address:'Delhi QA address',consignor_gstin:null,consignee_name:'QA Consignee',consignee_address:'Jaipur QA address',consignee_gstin:null,origin:'Delhi',destination:'Jaipur',goods:'QA cartons',weight_tons:16,vehicle_registration:'QALR281126',driver_name:'QA driver',package_count:100,package_unit:'cartons',declared_goods_value:null,invoice_number:null,invoice_date:null,eway_bill_number:null,tax_liable_party:'not_recorded',tax_liable_gstin:null,gross_freight:17000,remarks:null,issued_after_departure:false},
    amendment_reason:null,scan_available:false,scan_name:null,recorded_at:'2026-11-28T10:00:00Z'});
  const view=():ConsignmentView=>({current:null,history:[],can_issue:true,blocked_reason:null,context:{provider_name:'QA Carrier',origin:'Delhi',destination:'Jaipur',goods:'QA cartons',weight_tons:16,vehicle_registration:'QALR281126',driver_name:'QA driver'},pod_reference:null,pod_recorded:false});
  beforeEach(()=>{
    api=jasmine.createSpyObj('consignment',['get','issue','list','download']);api.get.and.returnValue(of(view()));api.issue.and.returnValue(of(version()));api.list.and.returnValue(of({rows:[version()],page:1,last_page:1,total:1}));
    TestBed.configureTestingModule({imports:[BookingConsignmentComponent,ConsignmentListComponent],providers:[provideRouter([]),{provide:ApiConsignmentService,useValue:api},{provide:LanguageService,useValue:{lang:()=> 'en'}},{provide:SessionService,useValue:{role:()=> 'transporter',portal:()=>({basePath:'/transporter'})}}]});
  });
  function mount(){const f=TestBed.createComponent(BookingConsignmentComponent);f.componentRef.setInput('bookingUuid','booking-id');f.detectChanges();return f;}
  function complete(c:BookingConsignmentComponent){c.begin();c.form={...version().snapshot};c.attested=true;}
  it('shows an actual empty state without a sample LR/GR',()=>{const f=mount();expect(f.nativeElement.textContent).toContain('No LR/GR recorded');expect(f.nativeElement.textContent).not.toContain('QA/LR/1');});
  it('keeps issuance unavailable to a read-only participant',()=>{api.get.and.returnValue(of({...view(),can_issue:false}));const f=mount();f.componentInstance.begin();f.componentInstance.issue();expect(api.issue).not.toHaveBeenCalled();expect(f.nativeElement.querySelector('form')).toBeNull();});
  it('requires carrier declaration and party details',()=>{const c=mount().componentInstance;c.begin();c.issue();expect(api.issue).not.toHaveBeenCalled();expect(c.error()).toContain('declaration');});
  it('submits a stable request ID on a network retry and displays the issued record',()=>{
    const f=mount(),c=f.componentInstance;complete(c);api.issue.and.returnValue(throwError(()=>new HttpErrorResponse({status:0})));c.issue();const first=api.issue.calls.mostRecent().args[1] as FormData;
    api.issue.and.returnValue(of(version()));c.issue();const second=api.issue.calls.mostRecent().args[1] as FormData;
    expect(second.get('request_uuid')).toBe(first.get('request_uuid'));expect(second.get('expected_version')).toBe('0');expect(second.get('attested')).toBe('1');expect(second.has('gross_freight')).toBeFalse();f.detectChanges();expect(f.nativeElement.textContent).toContain('QA/LR/1');
  });
  it('prevents duplicate submission clicks while the request is running',()=>{const c=mount().componentInstance;complete(c);api.issue.and.returnValue(new Subject<ConsignmentVersion>());c.issue();c.issue();expect(api.issue).toHaveBeenCalledTimes(1);expect(c.busy()).toBe('issue');});
  it('requires an amendment reason and keeps the issued number and date visible',()=>{const v=version();api.get.and.returnValue(of({...view(),current:v,history:[v]}));const f=mount(),c=f.componentInstance;c.begin();c.attested=true;c.issue();expect(api.issue).not.toHaveBeenCalled();c.form['amendment_reason']='QA consignee address correction';c.issue();expect((api.issue.calls.mostRecent().args[1] as FormData).get('expected_version')).toBe('1');});
  it('clears a previous file when an invalid scan replacement is selected',()=>{const c=mount().componentInstance;complete(c);c.scan=new File(['qa'],'qa.png',{type:'image/png'});const target={value:'bad.svg',files:{item:()=>new File(['bad'],'bad.svg',{type:'image/svg+xml'})}};c.choose({target} as unknown as Event);expect(c.scan).toBeNull();expect(target.value).toBe('');expect(c.error()).toContain('PDF');});
  it('sends only the reuse instruction when a new scan is deselected in favour of the previous scan',()=>{const v=version();v.scan_available=true;api.get.and.returnValue(of({...view(),current:v,history:[v]}));const c=mount().componentInstance;c.begin();c.form['amendment_reason']='QA scan selection correction';c.attested=true;c.scan=new File(['qa'],'qa.png',{type:'image/png'});c.reuseScan=true;c.issue();const body=api.issue.calls.mostRecent().args[1] as FormData;expect(body.get('reuse_scan')).toBe('1');expect(body.has('scan')).toBeFalse();});
  it('shows the exact POD reference, and never invents one for a historical POD',()=>{const v=version();api.get.and.returnValue(of({...view(),current:v,history:[v],can_issue:false,pod_recorded:true,pod_reference:{uuid:v.uuid,consignment_uuid:v.consignment_uuid,version:1,number:v.snapshot.number,document_type:'LR',fingerprint:v.fingerprint}}));const f=mount();expect(f.nativeElement.querySelector('[data-pod-consignment]').textContent).toContain('QA/LR/1 · v1');f.componentInstance.view.set({...view(),pod_recorded:true,can_issue:false});f.detectChanges();expect(f.nativeElement.textContent).toContain('No LR/GR link was recorded');});
  it('cancels stale requests when another booking is opened',()=>{const old=new Subject<ConsignmentView>();api.get.and.returnValue(old);const f=mount();api.get.and.returnValue(of({...view(),context:{...view().context,provider_name:'New carrier'}}));f.componentRef.setInput('bookingUuid','new-booking');f.detectChanges();old.next(view());expect(f.componentInstance.view()?.context.provider_name).toBe('New carrier');});
  it('retains server conflicts and ends its progress indicator',()=>{const c=mount().componentInstance;complete(c);api.issue.and.returnValue(throwError(()=>new HttpErrorResponse({status:409,error:{message:'The consignment changed. Refresh before issuing or amending it.'}})));c.issue();expect(c.error()).toContain('consignment changed');expect(c.busy()).toBe('');});
  it('links the Documents entry to the exact transporter booking',()=>{const f=TestBed.createComponent(ConsignmentListComponent);f.detectChanges();expect(f.nativeElement.querySelector('a').getAttribute('href')).toBe('/transporter/requests?booking=booking-id');expect(f.nativeElement.textContent).toContain('QA/LR/1');});
  it('does not display an empty list after a failed document read',()=>{api.list.and.returnValue(throwError(()=>new HttpErrorResponse({status:500})));const f=TestBed.createComponent(ConsignmentListComponent);f.detectChanges();expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();expect(f.nativeElement.textContent).not.toContain('No LR/GR documents recorded');});
});
