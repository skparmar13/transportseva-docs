import { Injectable } from '@angular/core';
import { ApiShipperDocumentService } from './api-shipper-document.service';

/** Transporter-party PODs and self-only KYC through a private scoped API. */
@Injectable()
export class ApiTransporterDocumentService extends ApiShipperDocumentService {
  protected override readonly resourcePath = 'account/transporter/documents';
}
