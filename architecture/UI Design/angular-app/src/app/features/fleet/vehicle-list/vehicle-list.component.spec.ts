import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceService, ApiMarketplaceVehicle } from '../../../core/api/api-marketplace.service';
import { VehicleListComponent } from './vehicle-list.component';

describe('Registered vehicle directory read states', () => {
  let api: jasmine.SpyObj<ApiMarketplaceService>; let original: boolean;
  const config = API_CONFIG as { useBackend: boolean };
  beforeEach(() => {
    original=config.useBackend; config.useBackend=true;
    api=jasmine.createSpyObj('ApiMarketplaceService',['listMarketplaceVehicles']);
    TestBed.configureTestingModule({providers:[provideRouter([]),{provide:ApiMarketplaceService,useValue:api}]});
  });
  afterEach(() => config.useBackend=original);
  it('shows loading without falsely reporting an empty fleet', () => {
    api.listMarketplaceVehicles.and.returnValue(new Subject<ApiMarketplaceVehicle[]>());
    const f=TestBed.createComponent(VehicleListComponent);f.detectChanges();
    expect(f.nativeElement.querySelector('[role=status]')?.textContent).toContain('Loading registered vehicles');
    expect(f.nativeElement.textContent).not.toContain('No vehicles found');
    expect(f.nativeElement.textContent).not.toContain('Add Your First Vehicle');
  });
  it('exposes retry after failure and recovers to genuine empty state', () => {
    api.listMarketplaceVehicles.and.returnValues(throwError(()=>new Error('Unavailable')),of([]));
    const f=TestBed.createComponent(VehicleListComponent);f.detectChanges();
    const alert=f.nativeElement.querySelector('[role=alert]');expect(alert).not.toBeNull();
    expect(f.nativeElement.textContent).not.toContain('No vehicles found');
    expect(alert.querySelector('button')).not.toBeNull();
    alert.querySelector('button').click();f.detectChanges();
    expect(f.nativeElement.textContent).toContain('No vehicles found');
    expect(api.listMarketplaceVehicles).toHaveBeenCalledTimes(2);
  });
});
