import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { ApiConsignmentService, ConsignmentVersion, ConsignmentView, ConsignmentReference } from '../../core/api/api-consignment.service';
import { LanguageService } from '../../core/i18n';
import { apiErrorMessage } from '../../core/api/api-error';
import { formatDate, formatDateTime } from '../../core/utils/date-format';

@Component({ selector: 'app-booking-consignment', standalone: true, imports: [FormsModule], templateUrl: './booking-consignment.component.html', styleUrl: './consignment.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class BookingConsignmentComponent {
  readonly bookingUuid=input.required<string>(); readonly revision=input('');
  readonly reference=output<ConsignmentReference|null>();
  private readonly api=inject(ApiConsignmentService); private readonly destroy=inject(DestroyRef); private readonly lang=inject(LanguageService);
  readonly view=signal<ConsignmentView|null>(null); readonly busy=signal(''); readonly error=signal(''); readonly notice=signal('');
  editing=false; form: Record<string,any>={}; attested=false; scan: File|null=null; reuseScan=false; private requestId=''; private operation?:Subscription;
  readonly date=formatDate; readonly dateTime=formatDateTime;
  readonly fields=[
    {key:'issuer_name',label:'Carrier legal name',hi:'वाहक का कानूनी नाम',max:200,required:true},
    {key:'issuer_address',label:'Carrier address',hi:'वाहक का पता',max:500,required:true},
    {key:'issuer_gstin',label:'Carrier GSTIN (optional)',hi:'वाहक GSTIN (वैकल्पिक)',max:15,required:false},
    {key:'consignor_name',label:'Consignor name',hi:'प्रेषक का नाम',max:200,required:true},
    {key:'consignor_address',label:'Consignor address',hi:'प्रेषक का पता',max:500,required:true},
    {key:'consignor_gstin',label:'Consignor GSTIN (optional)',hi:'प्रेषक GSTIN (वैकल्पिक)',max:15,required:false},
    {key:'consignee_name',label:'Consignee name',hi:'प्राप्तकर्ता का नाम',max:200,required:true},
    {key:'consignee_address',label:'Consignee address',hi:'प्राप्तकर्ता का पता',max:500,required:true},
    {key:'consignee_gstin',label:'Consignee GSTIN (optional)',hi:'प्राप्तकर्ता GSTIN (वैकल्पिक)',max:15,required:false},
    {key:'invoice_number',label:'Goods invoice reference (optional)',hi:'माल बिल संदर्भ (वैकल्पिक)',max:100,required:false},
    {key:'eway_bill_number',label:'E-way bill number (optional)',hi:'ई-वे बिल नंबर (वैकल्पिक)',max:12,required:false},
    {key:'tax_liable_gstin',label:'Tax-liable party GSTIN (optional)',hi:'कर देय पक्ष GSTIN (वैकल्पिक)',max:15,required:false},
  ];
  tr(en:string,hi:string){return this.lang.lang()==='hi'?hi:en;}
  constructor(){effect(cleanup=>{this.bookingUuid();this.revision();untracked(()=>{this.operation?.unsubscribe();this.busy.set('');this.view.set(null);this.reference.emit(null);this.load();});cleanup(()=>this.operation?.unsubscribe());});}
  load(){if(this.busy())return;this.busy.set('load');this.error.set('');
    this.operation=this.api.get(this.bookingUuid()).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(''))).subscribe({next:v=>{this.view.set(v);this.editing=false;this.emitReference(v.current);},error:e=>this.error.set(apiErrorMessage(e,'LR/GR records could not be loaded. Please retry.'))});}
  private emitReference(v:ConsignmentVersion|null){this.reference.emit(v?{uuid:v.uuid,consignment_uuid:v.consignment_uuid,version:v.version,number:v.snapshot.number,document_type:v.snapshot.document_type,fingerprint:v.fingerprint}:null);}
  begin(){const v=this.view();if(!v?.can_issue)return;this.editing=true;this.error.set('');this.notice.set('');this.attested=false;this.scan=null;this.reuseScan=!!v.current?.scan_available;this.requestId=crypto.randomUUID();
    this.form={document_type:'LR',number:'',issue_date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date()),issuer_name:v.context.provider_name??'',package_count:1,package_unit:'',tax_liable_party:'not_recorded',...v.current?.snapshot,amendment_reason:''};}
  choose(event:Event){const input=event.target as HTMLInputElement;this.scan=null;const file=input.files?.item(0);if(!file)return;
    if(file.size>5*1024*1024||!['application/pdf','image/png','image/jpeg'].includes(file.type)){input.value='';this.error.set('Select a PDF, JPG or PNG up to 5 MB.');return;}this.scan=file;this.reuseScan=false;this.error.set('');}
  issue(){const v=this.view();if(!v?.can_issue||this.busy())return;
    if(!this.attested||!this.form['number']||this.fields.some(f=>f.required&&!String(this.form[f.key]??'').trim())||!(Number(this.form['package_count'])>=1)||!this.form['package_unit']||(v.current&&String(this.form['amendment_reason']??'').trim().length<10)){this.error.set('Complete the carrier, parties, packages and declaration; amendments need a reason.');return;}
    const body=new FormData();for(const key of [...this.fields.map(f=>f.key),'document_type','number','issue_date','package_count','package_unit','declared_goods_value','invoice_date','tax_liable_party','remarks','amendment_reason'])if(this.form[key]!==null&&this.form[key]!==undefined&&String(this.form[key]).trim())body.set(key,String(this.form[key]).trim());
    body.set('expected_version',String(v.current?.version??0));body.set('request_uuid',this.requestId);body.set('attested','1');body.set('reuse_scan',this.reuseScan?'1':'0');if(this.scan&&!this.reuseScan)body.set('scan',this.scan);
    this.busy.set('issue');this.error.set('');this.operation=this.api.issue(this.bookingUuid(),body).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(''))).subscribe({next:current=>{this.view.set({...v,current,history:[current,...v.history]});this.emitReference(current);this.editing=false;this.scan=null;this.notice.set('LR/GR version issued. Earlier versions remain available.');},error:e=>this.error.set(apiErrorMessage(e,'LR/GR could not be issued. Refresh before retrying.'))});}
  download(v:ConsignmentVersion,kind:'document'|'scan'){if(this.busy())return;this.busy.set('download');this.error.set('');this.operation=this.api.download(this.bookingUuid(),v.uuid,kind).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(''))).subscribe({next:blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=kind==='document'?`${v.snapshot.document_type}-${v.snapshot.booking_reference}-v${v.version}.html`:`scan-v${v.version}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},error:e=>this.error.set(apiErrorMessage(e,'Document download failed.'))});}
}
