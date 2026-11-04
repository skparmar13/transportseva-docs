import { Injectable } from '@angular/core';
import { ApiShipperDocumentService } from './api-shipper-document.service';

/** Private provider PODs and self-only KYC, with shared document contracts. */
@Injectable()
export class ApiTruckOwnerDocumentService extends ApiShipperDocumentService {
  protected override readonly resourcePath = 'account/truck-owner/documents';
}
