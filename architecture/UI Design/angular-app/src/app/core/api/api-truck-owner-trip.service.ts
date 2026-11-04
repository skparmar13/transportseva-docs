import { Injectable } from '@angular/core';
import { ApiShipperTripService } from './api-shipper-trip.service';

/** Shared operational contract with a separate provider-owned read endpoint. */
@Injectable()
export class ApiTruckOwnerTripService extends ApiShipperTripService {
  protected override readonly resourcePath = 'account/truck-owner/trips';
}
