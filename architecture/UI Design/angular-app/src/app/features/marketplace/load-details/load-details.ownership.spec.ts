import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { CashfreeCheckoutService } from '../../../core/api/cashfree-checkout.service';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { FleetMockService } from '../../../core/services/fleet-mock.service';
import { SessionService } from '../../../core/services/session.service';
import { LoadDetailsComponent } from './load-details.component';

describe('Load details account ownership', () => {
  const config = API_CONFIG as unknown as { useBackend: boolean };
  const original = config.useBackend;
  let fixture: ComponentFixture<LoadDetailsComponent>;
  let api: jasmine.SpyObj<ApiMarketplaceService>;
  beforeEach(() => {
    config.useBackend = true;
    api = jasmine.createSpyObj('ApiMarketplaceService', ['getLoad', 'listApplications', 'listMarketplaceVehicles']);
    api.listApplications.and.returnValue(of([])); api.listMarketplaceVehicles.and.returnValue(of([]));
    TestBed.configureTestingModule({ imports: [LoadDetailsComponent], providers: [provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'load-one' }), queryParamMap: convertToParamMap({}) }, queryParamMap: of(convertToParamMap({})) } },
      { provide: ApiMarketplaceService, useValue: api }, { provide: CashfreeCheckoutService, useValue: {} },
      { provide: MarketplaceMockService, useValue: {} }, { provide: FleetMockService, useValue: {} },
      { provide: SessionService, useValue: { role: () => 'transporter' } },
    ] });
  });
  afterEach(() => { fixture?.destroy(); config.useBackend = original; });
  for (const [flag, expected] of [[false, false], [true, true], [undefined, false]] as const) {
    it(`uses the server viewer flag ${flag}, even when poster and viewer share a role`, () => {
      api.getLoad.and.returnValue(of({ uuid: 'load-one', posted_by_role: 'transporter', pickup_city: 'Delhi',
        drop_city: 'Jaipur', status: 'open', ...(flag === undefined ? {} : { viewer_is_owner: flag }) }));
      fixture = TestBed.createComponent(LoadDetailsComponent);
      expect((fixture.componentInstance as any).isOwner()).toBe(expected);
      expect(api.listMarketplaceVehicles.calls.count()).toBe(expected ? 0 : 1);
    });
  }
});
