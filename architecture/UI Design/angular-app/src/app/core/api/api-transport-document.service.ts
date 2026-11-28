import { Injectable, inject } from '@angular/core';
import { map, timeout } from 'rxjs';
import { ApiClientService } from './api-client.service';
export const TRANSPORT_DOCUMENT_KINDS=['goods_invoice','bill_of_supply','delivery_challan','eway_bill','pickup_weighbridge','delivery_weighbridge'] as const;
export type TransportDocumentKind=typeof TRANSPORT_DOCUMENT_KINDS[number];
export interface TransportDocumentReference { uuid:string;kind:TransportDocumentKind;version:number;reference:string;fingerprint:string }
export interface TransportDocumentVersion extends TransportDocumentReference {
  booking_uuid:string;document_date:string;file_name:string;file_available:boolean;recorded_at:string;amendment_reason:string|null;submitted_by_side:'owner'|'provider';
  metadata:{gross_kg?:number;tare_kg?:number;net_kg?:number;vehicle_registration?:string;station_name?:string;measured_at?:string;expires_at?:string|null;recorded_after_departure:boolean};
  booking_reference?:string;
}
export interface TransportDocumentPack {booking_uuid:string;kinds:TransportDocumentKind[];current:Partial<Record<TransportDocumentKind,TransportDocumentVersion>>;
  can_submit:boolean;fingerprint:string;vehicle_registration:string|null;departure_references:TransportDocumentReference[];pod_references:TransportDocumentReference[];trip_started:boolean;pod_recorded:boolean}
export function transportDocumentLabel(kind:string,lang='en') {
  const labels:Record<string,[string,string]>={goods_invoice:['Goods invoice','माल का बिल'],bill_of_supply:['Bill of supply','बिल ऑफ सप्लाई'],delivery_challan:['Delivery challan','डिलीवरी चालान'],eway_bill:['E-way bill','ई-वे बिल'],pickup_weighbridge:['Pickup weighbridge slip','पिकअप धर्मकाँटा पर्ची'],delivery_weighbridge:['Delivery weighbridge slip','डिलीवरी धर्मकाँटा पर्ची']};
  return labels[kind]?.[lang==='hi'?1:0]??kind;
}
@Injectable({providedIn:'root'})
export class ApiTransportDocumentService {
  private readonly api=inject(ApiClientService);
  get(id:string){return this.api.get<TransportDocumentPack>(`marketplace-bookings/${id}/transport-documents`).pipe(timeout(30000),map(r=>r.data));}
  upload(id:string,kind:TransportDocumentKind,body:FormData){return this.api.post<TransportDocumentVersion>(`marketplace-bookings/${id}/transport-documents/${kind}`,body).pipe(timeout(60000),map(r=>r.data));}
  history(id:string,kind:TransportDocumentKind,page=1){return this.api.get<{rows:TransportDocumentVersion[];page:number;last_page:number}>(`marketplace-bookings/${id}/transport-documents/${kind}/history`,{page}).pipe(timeout(30000),map(r=>r.data));}
  download(id:string,version:string){return this.api.getBlob(`marketplace-bookings/${id}/transport-documents/${version}/download`).pipe(timeout(30000));}
  list(page=1){return this.api.get<{rows:TransportDocumentVersion[];page:number;last_page:number}>(`account/transport-documents`,{page}).pipe(timeout(30000),map(r=>r.data));}
}
