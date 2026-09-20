import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { BusinessSettingsMockService } from './core/services/business-settings-mock.service';
import { MarketplaceMockService } from './core/services/marketplace-mock.service';
import { FleetMockService } from './core/services/fleet-mock.service';
import { TripMockService } from './core/services/trip-mock.service';
import { DriverMockService } from './core/services/driver-mock.service';
import { LocationSearchService } from './core/services/location-search.service';
import { GeoLocation } from './core/models/location.model';
import { of } from 'rxjs';

describe('portal route browser smoke checks', () => {
  let locationSearch: jasmine.SpyObj<LocationSearchService>;

  beforeEach(async () => {
    locationSearch = jasmine.createSpyObj<LocationSearchService>('LocationSearchService', ['search']);
    locationSearch.search.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: LocationSearchService, useValue: locationSearch },
      ],
    }).compileComponents();
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
    button.click();
    harness.fixture.detectChanges();
    expect(harness.routeNativeElement?.querySelector('tbody')?.textContent).not.toContain('#TS-48231');

    await harness.navigateByUrl('/transporter/requests');
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();
    const acceptedBooking = TestBed.inject(MarketplaceMockService).bookings().find((booking) => booking.bookingId === '#TS-48231');
    expect(acceptedBooking?.status).toBe('Awaiting Deposit');
    const bookingCard = Array.from(harness.routeNativeElement?.querySelectorAll('.card') ?? [])
      .find((card) => card.textContent?.includes('#TS-48231'));
    expect(bookingCard?.querySelector('.status-pill')?.textContent?.trim()).toBeTruthy();

    await harness.navigateByUrl('/transporter/dashboard');
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 200));
    harness.fixture.detectChanges();
    expect(harness.routeNativeElement?.querySelector('tbody')?.textContent).not.toContain('#TS-48231');
    expect(harness.routeNativeElement?.querySelector('tbody')?.textContent).toContain('#TS-48227');
    const requestsKpi = Array.from(harness.routeNativeElement?.querySelectorAll('.kpi-card') ?? [])
      .find((card) => card.textContent?.includes('New Requests'));
    expect(requestsKpi?.textContent).toContain('1');
  });

  it('returns a shipper to My Loads from a load detail instead of the missing load-board route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/shipper/my-loads');
    harness.fixture.detectChanges();

    const viewButton = harness.routeNativeElement?.querySelector('tbody button') as HTMLButtonElement;
    expect(viewButton).toBeTruthy();
    viewButton.click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();
    expect(TestBed.inject(Router).url).toMatch(/^\/shipper\/load-board\//);

    const backLink = harness.routeNativeElement?.querySelector('.page-toolbar a') as HTMLAnchorElement;
    expect(backLink?.getAttribute('href')).toBe('/shipper/my-loads');
    backLink.click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/shipper/my-loads');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).not.toContain('Coming Soon');
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

    const pickupLocation: GeoLocation = {
      label: 'Connaught Place, New Delhi, Delhi, India', city: 'New Delhi', state: 'Delhi', country: 'India',
      latitude: 28.6315, longitude: 77.2167, source: 'OpenStreetMap', osmId: '123',
    };
    const dropLocation: GeoLocation = {
      label: 'Andheri, Mumbai, Maharashtra, India', city: 'Mumbai', state: 'Maharashtra', country: 'India',
      latitude: 19.1197, longitude: 72.8468, source: 'OpenStreetMap', osmId: '456',
    };
    locationSearch.search.and.returnValues(of([pickupLocation]), of([dropLocation]));

    for (const [field, value] of [['pickupCity', 'Connaught Place'], ['dropCity', 'Andheri']]) {
      const input = harness.routeNativeElement?.querySelector(`input[name="${field}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
    harness.fixture.detectChanges();
    (harness.routeNativeElement?.querySelector('[role="option"]') as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    (harness.routeNativeElement?.querySelector('[role="option"]') as HTMLButtonElement).click();

    for (const [field, value] of [
      ['material', 'Prototype cargo'],
      ['budget', '12500'],
    ]) {
      const input = harness.routeNativeElement?.querySelector(`input[name="${field}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    harness.fixture.detectChanges();
    (harness.routeNativeElement?.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    const postedLoad = TestBed.inject(MarketplaceMockService).loads().find((load) => load.pickupLocation?.osmId === '123' && load.dropLocation?.osmId === '456');
    expect(postedLoad?.pickupCity).toBe('New Delhi');
    expect(postedLoad?.dropCity).toBe('Mumbai');
    expect(postedLoad?.pickupLocation?.latitude).toBe(28.6315);
    expect(postedLoad?.dropLocation?.longitude).toBe(72.8468);
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

  it('lets a driver upload POD metadata and the selected file name for a delivered trip', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/driver/trips/t5');
    (Array.from(harness.routeNativeElement?.querySelectorAll('.tab-row .tab-btn') ?? []) as HTMLButtonElement[])
      .find((button) => button.textContent?.trim() === 'POD')?.click();
    harness.fixture.detectChanges();

    for (const [field, value] of [['podNumber', 'POD-SMOKE-1'], ['receivedByName', 'Smoke Receiver']]) {
      const input = harness.routeNativeElement?.querySelector(`[name="${field}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    const fileInput = harness.routeNativeElement?.querySelector('input[type="file"]') as HTMLInputElement;
    const transfer = new DataTransfer();
    transfer.items.add(new File(['prototype delivery receipt'], 'signed-pod-smoke.pdf', { type: 'application/pdf' }));
    fileInput.files = transfer.files;
    fileInput.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();

    const upload = Array.from(harness.routeNativeElement?.querySelectorAll('button') ?? [])
      .find((button) => button.textContent?.includes('Upload POD')) as HTMLButtonElement;
    expect(upload.disabled).toBeFalse();
    upload.click();
    await harness.fixture.whenStable();

    const savedPod = TestBed.inject(TripMockService).getTrip('t5')?.pod;
    expect(savedPod?.uploaded).toBeTrue();
    expect(savedPod?.fileName).toBe('signed-pod-smoke.pdf');
    expect(savedPod?.receivedByName).toBe('Smoke Receiver');
  });

  it('lets a platform admin create a company and suspend its workspace', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin/companies');
    (harness.routeNativeElement?.querySelector('.page-toolbar .btn-primary') as HTMLButtonElement).click();
    harness.fixture.detectChanges();

    const name = harness.routeNativeElement?.querySelector('#company-name') as HTMLInputElement;
    name.value = 'Smoke Test Workspace';
    name.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();
    (harness.routeNativeElement?.querySelector('.modal-foot .btn-primary') as HTMLButtonElement).click();
    harness.fixture.detectChanges();

    const row = Array.from(harness.routeNativeElement?.querySelectorAll('tbody tr') ?? [])
      .find((candidate) => candidate.textContent?.includes('Smoke Test Workspace')) as HTMLTableRowElement;
    expect(row).toBeTruthy();
    (row.querySelectorAll('button')[1] as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    expect(row.textContent).toContain('Suspended');
  });

  it('attaches selected vehicle and driver document names from their detail screens', async () => {
    const harness = await RouterTestingHarness.create();
    const fleet = TestBed.inject(FleetMockService);
    const driverService = TestBed.inject(DriverMockService);

    await harness.navigateByUrl('/truck-owner/vehicles/v2');
    (harness.routeNativeElement?.querySelectorAll('.tab-row .tab-btn')[2] as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    const vehicleRow = Array.from(harness.routeNativeElement?.querySelectorAll('tbody tr') ?? [])
      .find((row) => row.textContent?.includes('Fitness Certificate')) as HTMLTableRowElement;
    const vehicleInput = vehicleRow.querySelector('input[type="file"]') as HTMLInputElement;
    const vehicleTransfer = new DataTransfer();
    vehicleTransfer.items.add(new File(['vehicle doc'], 'fitness-certificate.pdf', { type: 'application/pdf' }));
    vehicleInput.files = vehicleTransfer.files;
    vehicleInput.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();
    expect(fleet.vehicles().find((vehicle) => vehicle.id === 'v2')?.documents.find((doc) => doc.type === 'Fitness Certificate')?.fileName).toBe('fitness-certificate.pdf');

    await harness.navigateByUrl('/truck-owner/drivers/d2');
    (harness.routeNativeElement?.querySelectorAll('.tab-row .tab-btn')[1] as HTMLButtonElement).click();
    harness.fixture.detectChanges();
    const driverRow = Array.from(harness.routeNativeElement?.querySelectorAll('tbody tr') ?? [])
      .find((row) => row.textContent?.includes('Police Verification')) as HTMLTableRowElement;
    const driverInput = driverRow.querySelector('input[type="file"]') as HTMLInputElement;
    const driverTransfer = new DataTransfer();
    driverTransfer.items.add(new File(['driver doc'], 'police-verification.pdf', { type: 'application/pdf' }));
    driverInput.files = driverTransfer.files;
    driverInput.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();
    expect(driverService.drivers().find((driver) => driver.id === 'd2')?.documents.find((doc) => doc.type === 'Police Verification')?.fileName).toBe('police-verification.pdf');
  });
});
