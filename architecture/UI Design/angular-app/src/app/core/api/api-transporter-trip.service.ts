import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiShipperTripService } from './api-shipper-trip.service';

@Injectable()
export class ApiTransporterTripService extends ApiShipperTripService {
  protected override readonly resourcePath = 'account/transporter/trips';
  override get(uuid: string) {
    return super.get(uuid).pipe(map(data => {
      if (!['owner', 'provider'].includes(data.trip.viewer_side ?? '')) throw new Error('Invalid transporter trip side');
      return data;
    }));
  }
}
