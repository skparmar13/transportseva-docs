import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { BusinessSettingsMockService } from './core/services/business-settings-mock.service';
import { MarketplaceMockService } from './core/services/marketplace-mock.service';
import { FleetMockService } from './core/services/fleet-mock.service';

describe('portal route browser smoke checks', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideRouter(routes)] }).compileComponents();
  });

  it('renders a dashboard screen for every portal role', async () => {
    const harness = await RouterTestingHarness.create();
    for (const path of [
      '/admin/dashboard',
      '/shipper/dashboard',
      '/transporter/dashboard',
      '/truck-owner/dashboard',
      '/driver/dashboard',
      '/company/dashboard',
    ]) {
      await harness.navigateByUrl(path);
      expect(harness.routeNativeElement?.querySelector('h1'))
        .withContext(`${path} should render a dashboard heading`)
        .toBeTruthy();
    }
  });

  it('renders a main task screen for each non-admin workspace', async () => {
    const harness = await RouterTestingHarness.create();
    for (const path of [
      '/shipper/post-load',
      '/transporter/requests',
      '/truck-owner/vehicles',
      '/driver/trips',
      '/company/staff',
    ]) {
      await harness.navigateByUrl(path);
      expect(harness.routeNativeElement?.querySelector('h1'))
        .withContext(`${path} should render a task screen`)
        .toBeTruthy();
    }
  });

  it('lets a transporter accept a request and reflects the accepted state', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/transporter/dashboard');
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const button = harness.routeNativeElement?.querySelector('tbody button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.disabled).toBeFalse();
    const initialLabel = button.textContent?.trim();
    button.click();
    harness.fixture.detectChanges();
    expect(button.disabled).toBeTrue();
    expect(button.textContent?.trim()).not.toBe(initialLabel);
  });

  it('lets a company manager suspend and reactivate a staff member', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/company/staff');
    harness.fixture.detectChanges();

    const button = harness.routeNativeElement?.querySelector('tbody button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    const initialLabel = button.textContent?.trim();
    button.click();
    harness.fixture.detectChanges();
    expect(button.textContent?.trim()).not.toBe(initialLabel);
    button.click();
    harness.fixture.detectChanges();
    expect(button.textContent?.trim()).toBe(initialLabel);
  });

  it('lets a company manager invite a staff member from the Staff Management screen', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/company/staff');
    harness.fixture.detectChanges();

    (harness.routeNativeElement?.querySelector('.page-toolbar .btn-primary') as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    const name = harness.routeNativeElement?.querySelector('input[name="staffName"]') as HTMLInputElement;
    const email = harness.routeNativeElement?.querySelector('input[name="staffEmail"]') as HTMLInputElement;
    name.value = 'Smoke Test Dispatcher';
    name.dispatchEvent(new Event('input'));
    email.value = 'smoke.dispatcher@example.test';
    email.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();

    const save = harness.routeNativeElement?.querySelector('.modal-foot .btn-primary') as HTMLButtonElement;
    expect(save.disabled).toBeFalse();
    save.click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(TestBed.inject(BusinessSettingsMockService).staff().some((user) => user.email === 'smoke.dispatcher@example.test')).toBeTrue();
  });

  it('lets a shipper post a load and adds it to the shared marketplace records', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/shipper/post-load');

    for (const [field, value] of [
      ['pickupCity', 'Smoke Origin'],
      ['dropCity', 'Smoke Destination'],
      ['material', 'Prototype cargo'],
      ['budget', '₹12,500'],
    ]) {
      const input = harness.routeNativeElement?.querySelector(`input[name="${field}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    harness.fixture.detectChanges();
    (harness.routeNativeElement?.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(TestBed.inject(MarketplaceMockService).loads().some((load) => load.pickupCity === 'Smoke Origin' && load.dropCity === 'Smoke Destination')).toBeTrue();
  });

  it('lets a truck owner add a vehicle to the fleet list', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/truck-owner/vehicles');
    const fleet = TestBed.inject(FleetMockService);
    const initialCount = fleet.getVehiclesByOwner('truck-owner')().length;

    (harness.routeNativeElement?.querySelector('.page-toolbar .btn-primary') as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    for (const [field, value] of [
      ['regNumber', 'SMOKE-TS-1001'],
      ['make', 'Test Motors'],
      ['model', 'Prototype One'],
      ['yearOfMake', '2026'],
      ['capacityTons', '18'],
    ]) {
      const input = harness.routeNativeElement?.querySelector(`[name="${field}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    harness.fixture.detectChanges();
    (harness.routeNativeElement?.querySelector('.modal-foot .btn-primary') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(fleet.getVehiclesByOwner('truck-owner')().length).toBe(initialCount + 1);
    expect(fleet.vehicles().some((vehicle) => vehicle.regNumber === 'SMOKE-TS-1001')).toBeTrue();
  });
});
