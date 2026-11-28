import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { ApiTransportDocumentService, TransportDocumentKind, TransportDocumentPack, TransportDocumentVersion, transportDocumentLabel } from '../../core/api/api-transport-document.service';
import { LanguageService } from '../../core/i18n';
import { apiErrorMessage } from '../../core/api/api-error';
import { formatDate, formatDateTime } from '../../core/utils/date-format';

@Component({selector:'app-transport-documents',standalone:true,imports:[FormsModule],templateUrl:'./transport-documents.component.html',styleUrl:'./consignment.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class TransportDocumentsComponent {
  readonly bookingUuid=input.required<string>();readonly revision=input('');readonly changed=output<void>();readonly fingerprint=output<string|null>();
  private readonly api=inject(ApiTransportDocumentService);private readonly destroy=inject(DestroyRef);private readonly lang=inject(LanguageService);
  readonly view=signal<TransportDocumentPack|null>(null);readonly busy=signal('');readonly error=signal('');readonly notice=signal('');
  editing:TransportDocumentKind|null=null;form:Record<string,any>={};file:File|null=null;attested=false;private requestId='';private operation?:Subscription;
  readonly history=signal<{kind:TransportDocumentKind;rows:TransportDocumentVersion[];page:number;last_page:number}|null>(null);
  readonly date=formatDate;readonly dateTime=formatDateTime;
  label(kind:string){return transportDocumentLabel(kind,this.lang.lang());}tr(en:string,hi:string){return this.lang.lang()==='hi'?hi:en;}
  isWeighbridge(kind:string){return kind.endsWith('weighbridge');}
  constructor(){effect(cleanup=>{this.bookingUuid();this.revision();untracked(()=>{this.operation?.unsubscribe();this.busy.set('');this.view.set(null);this.history.set(null);this.editing=null;this.fingerprint.emit(null);this.load();});cleanup(()=>this.operation?.unsubscribe());});}
  load(){if(this.busy())return;this.busy.set('load');this.error.set('');this.operation=this.api.get(this.bookingUuid()).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(''))).subscribe({next:v=>{this.view.set(v);this.fingerprint.emit(v.fingerprint);},error:e=>this.error.set(apiErrorMessage(e,'Supporting documents could not be loaded. Please retry.'))});}
  begin(kind:TransportDocumentKind){if(!this.view()?.can_submit||this.busy())return;this.editing=kind;this.file=null;this.attested=false;this.error.set('');this.notice.set('');this.requestId=crypto.randomUUID();
    const old=this.view()?.current[kind];this.form={reference:old?.reference??'',document_date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date()),gross_kg:null,tare_kg:null,station_name:old?.metadata.station_name??'',measured_at:'',expires_at:'',amendment_reason:''};}
  choose(e:Event){const target=e.target as HTMLInputElement;this.file=null;const file=target.files?.item(0);if(!file)return;if(file.size>5*1024*1024||!['application/pdf','image/png','image/jpeg'].includes(file.type)){target.value='';this.error.set('Select a PDF, JPG or PNG up to 5 MB.');return;}this.file=file;this.error.set('');}
  upload(){const v=this.view(),kind=this.editing;if(!v?.can_submit||!kind||this.busy())return;
    if(!this.file||!this.attested||!String(this.form['reference']??'').trim()||!this.form['document_date']||(v.current[kind]&&String(this.form['amendment_reason']??'').trim().length<10)) {this.error.set('Provide the file, reference, date and declaration; replacements require a reason.');return;}
    if(this.isWeighbridge(kind)&&(!(Number(this.form['gross_kg'])>Number(this.form['tare_kg']))||!(Number(this.form['tare_kg'])>0)||!this.form['station_name']||!this.form['measured_at'])){this.error.set('Enter the station and measurement time; gross weight must exceed positive tare weight.');return;}
    const body=new FormData();body.set('file',this.file);body.set('expected_version',String(v.current[kind]?.version??0));body.set('request_uuid',this.requestId);body.set('attested','1');
    for(const key of ['reference','document_date','amendment_reason',...(this.isWeighbridge(kind)?['gross_kg','tare_kg','station_name','measured_at']:[]),...(kind==='eway_bill'?['expires_at']:[])])if(this.form[key]!==null&&this.form[key]!==undefined&&String(this.form[key]).trim())body.set(key,String(this.form[key]).trim());
    let refresh=false;this.busy.set('upload');this.error.set('');this.operation=this.api.upload(this.bookingUuid(),kind,body).pipe(takeUntilDestroyed(this.destroy),finalize(()=>{this.busy.set('');if(refresh&&!this.destroy.destroyed)this.load();})).subscribe({next:r=>{this.view.set({...v,current:{...v.current,[kind]:r}});this.editing=null;this.file=null;this.history.set(null);this.notice.set('Supporting document version saved. Previous files remain available.');this.changed.emit();refresh=true;},error:e=>this.error.set(apiErrorMessage(e,'Upload failed. Refresh the current document before retrying.'))});}
  showHistory(kind:TransportDocumentKind,page=1){if(this.busy())return;this.busy.set('history');this.error.set('');this.operation=this.api.history(this.bookingUuid(),kind,page).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(''))).subscribe({next:h=>this.history.set({...h,kind}),error:e=>this.error.set(apiErrorMessage(e))});}
  download(v:TransportDocumentVersion){if(this.busy())return;this.busy.set('download');this.error.set('');this.operation=this.api.download(this.bookingUuid(),v.uuid).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(''))).subscribe({next:blob=>{const ext=({'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'} as Record<string,string>)[blob.type]??'bin';const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${v.kind}-v${v.version}.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},error:e=>this.error.set(apiErrorMessage(e,'The supporting file is unavailable.'))});}
}
