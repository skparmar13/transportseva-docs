import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiConsignmentService, ConsignmentVersion } from '../../core/api/api-consignment.service';
import { SessionService } from '../../core/services/session.service';
import { LanguageService } from '../../core/i18n';
import { apiErrorMessage } from '../../core/api/api-error';
import { formatDateTime } from '../../core/utils/date-format';

@Component({selector:'app-consignment-list',standalone:true,imports:[RouterLink],template:`
<section class="consignment" data-consignment-list><div class="heading"><h2>{{ tr('LR / GR documents','LR / GR दस्तावेज़') }}</h2><button type="button" class="btn btn-outline btn-sm" [disabled]="busy()" (click)="load(page)">{{ tr('Refresh LR/GR','LR/GR रीफ़्रेश करें') }}</button></div>
@if(busy()){<p role="status"><span class="spinner"></span>{{ tr('Loading documents…','दस्तावेज़ लोड हो रहे…') }}</p>}@else if(error()){<p role="alert" class="error">{{ error() }}</p><button class="btn btn-outline" type="button" (click)="load(page)">{{ tr('Retry','पुनः प्रयास करें') }}</button>}@else{
@for(v of rows();track v.uuid){<article class="history"><h3>{{ v.snapshot.document_type }} {{ v.snapshot.number }} · v{{ v.version }}</h3><p>{{ v.snapshot.booking_reference }} · {{ v.snapshot.origin }} → {{ v.snapshot.destination }}<br>{{ v.snapshot.vehicle_registration }} · {{ dateTime(v.recorded_at) }}</p><a class="btn btn-outline btn-sm" [routerLink]="bookingPath()" [queryParams]="{booking:v.booking_uuid}">{{ tr('View booking and LR/GR','बुकिंग और LR/GR देखें') }}</a></article>}@empty{<p>{{ tr('No LR/GR documents recorded.','कोई LR/GR दस्तावेज़ दर्ज नहीं है।') }}</p>}
@if(lastPage>1){<button type="button" class="btn btn-outline" [disabled]="page<=1" (click)="load(page-1)">{{ tr('Previous','पिछला') }}</button><span>{{ page }} / {{ lastPage }}</span><button type="button" class="btn btn-outline" [disabled]="page>=lastPage" (click)="load(page+1)">{{ tr('Next','अगला') }}</button>}}
</section>`,styleUrl:'./consignment.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class ConsignmentListComponent {
  private readonly api=inject(ApiConsignmentService);private readonly destroy=inject(DestroyRef);private readonly session=inject(SessionService);private readonly lang=inject(LanguageService);
  readonly rows=signal<ConsignmentVersion[]>([]);readonly busy=signal(false);readonly error=signal('');page=1;lastPage=1;readonly dateTime=formatDateTime;
  tr(en:string,hi:string){return this.lang.lang()==='hi'?hi:en;}
  bookingPath(){return [this.session.portal().basePath,this.session.role()==='transporter'?'requests':'bookings'];}
  constructor(){this.load();}
  load(page=1){if(this.busy())return;this.busy.set(true);this.error.set('');this.rows.set([]);this.api.list(page).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.busy.set(false))).subscribe({next:r=>{this.rows.set(r.rows);this.page=r.page;this.lastPage=r.last_page;},error:e=>this.error.set(apiErrorMessage(e,'LR/GR documents could not be loaded. Please retry.'))});}
}
