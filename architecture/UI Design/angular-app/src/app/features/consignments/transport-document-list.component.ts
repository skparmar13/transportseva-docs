import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiTransportDocumentService, TransportDocumentVersion, transportDocumentLabel } from '../../core/api/api-transport-document.service';
import { SessionService } from '../../core/services/session.service';
import { LanguageService } from '../../core/i18n';
import { apiErrorMessage } from '../../core/api/api-error';
import { formatDateTime } from '../../core/utils/date-format';
@Component({selector:'app-transport-document-list',standalone:true,imports:[RouterLink],styleUrl:'./consignment.scss',changeDetection:ChangeDetectionStrategy.OnPush,template:`
<section class="consignment" data-transport-list><div class="heading"><h2>{{ tr('Supporting trip files','यात्रा की सहायक फ़ाइलें') }}</h2><button class="btn btn-outline btn-sm" type="button" [disabled]="busy()" (click)="load(page)">{{ tr('Refresh trip files','यात्रा फ़ाइलें रीफ़्रेश करें') }}</button></div>
@if(busy()){<p role="status"><span class="spinner"></span>{{ tr('Loading files…','फ़ाइलें लोड हो रही…') }}</p>}@else if(error()){<p role="alert" class="error">{{ error() }}</p><button class="btn btn-outline" type="button" (click)="load(page)">{{ tr('Retry','पुनः प्रयास करें') }}</button>}@else{
@for(v of rows();track v.uuid){<article class="history"><h3>{{ label(v.kind) }} · {{ v.reference }} · v{{ v.version }}</h3><p>{{ v.booking_reference }} · {{ v.file_name }}<br>{{ dateTime(v.recorded_at) }}</p><a class="btn btn-outline btn-sm" [routerLink]="path()" [queryParams]="{booking:v.booking_uuid}">{{ tr('Open booking documents','बुकिंग दस्तावेज़ खोलें') }}</a></article>}@empty{<p>{{ tr('No supporting trip files recorded.','यात्रा की सहायक फ़ाइलें दर्ज नहीं हैं।') }}</p>}
@if(lastPage>1){<button class="btn btn-outline" type="button" [disabled]="page<=1" (click)="load(page-1)">{{ tr('Previous','पिछला') }}</button><span>{{ page }} / {{ lastPage }}</span><button class="btn btn-outline" type="button" [disabled]="page>=lastPage" (click)="load(page+1)">{{ tr('Next','अगला') }}</button>}}
</section>`})
export class TransportDocumentListComponent {
  private readonly api=inject(ApiTransportDocumentService);private readonly session=inject(SessionService);private readonly destroy=inject(DestroyRef);private readonly lang=inject(LanguageService);
  readonly rows=signal<TransportDocumentVersion[]>([]);readonly busy=signal(false);readonly error=signal('');page=1;lastPage=1;readonly dateTime=formatDateTime;
  tr(en:string,hi:string){return this.lang.lang()==='hi'?hi:en;}label(kind:string){return transportDocumentLabel(kind,this.lang.lang());}path(){return [this.session.portal().basePath,this.session.role()==='transporter'?'requests':'bookings'];}
  constructor(){this.load();}load(page=1){if(this.busy())return;this.busy.set(true);this.error.set('');this.rows.set([]);this.api.list(page).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(false))).subscribe({next:r=>{this.rows.set(r.rows);this.page=r.page;this.lastPage=r.last_page;},error:e=>this.error.set(apiErrorMessage(e,'Supporting files could not be loaded. Please retry.'))});}
}
