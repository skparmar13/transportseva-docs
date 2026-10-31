import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiBusinessProfileService, BusinessProfileView } from '../../../core/api/api-business-profile.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { AccountBusinessProfileComponent } from './account-business-profile.component';

describe('AccountBusinessProfileComponent', () => {
  const config = API_CONFIG as { useBackend: boolean };
  const data: BusinessProfileView = {
    account: { uuid: 'self', full_name: 'Profile QA', email: 'login@example.test', phone: '+919000011111', role: 'shipper' },
    profile: { business_name: 'Persisted QA Logistics', business_type: 'other', contact_email: 'contact@example.test',
      contact_phone: '+919000022222', address: 'QA office', city: 'Jaipur', state: 'Rajasthan', pincode: '302022', version: 3, updated_at: '2026-10-31T08:00:00Z' },
    persisted: true, changed: false,
    kyc: { status: 'approved', business_name: 'Legal QA identity', business_type: 'company', pan_last_four: '******234F', gstin_last_four: null },
  };
  let api: jasmine.SpyObj<ApiBusinessProfileService>; let original: boolean;
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true;
    api = jasmine.createSpyObj('ApiBusinessProfileService', ['get', 'save']); api.get.and.returnValue(of(structuredClone(data)));
    api.save.and.returnValue(of({ ...structuredClone(data), changed: true, profile: { ...data.profile, version: 4 } }));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiBusinessProfileService, useValue: api }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; TestBed.inject(LanguageService).setLang('en'); });
  const create = () => { const fixture = TestBed.createComponent(AccountBusinessProfileComponent); fixture.detectChanges(); return fixture; };
  const edit = async (fixture: ReturnType<typeof create>) => { (fixture.componentInstance as any).edit(); fixture.detectChanges(); await fixture.whenStable(); };

  it('renders real persisted fields, immutable login identity, masked KYC and a relevant KYC link', () => {
    const element: HTMLElement = create().nativeElement;
    expect(element.textContent).toContain('Persisted QA Logistics'); expect(element.textContent).toContain('login@example.test');
    expect(element.textContent).toContain('******234F'); expect(element.textContent).not.toContain('Yadav Road Carriers');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/shipper/kyc');
    expect(element.querySelectorAll('input').length).toBe(0);
    expect(element.textContent).toMatch(/31\/10\/2026 \d{2}:\d{2} (AM|PM)/);
  });
  it('shows empty business data with actual account details, not a seeded business', () => {
    const empty = structuredClone(data); empty.persisted = false; empty.kyc = null;
    for (const field of ['business_name', 'business_type', 'contact_email', 'contact_phone', 'address', 'city', 'state', 'pincode'] as const) empty.profile[field] = null;
    empty.profile.version = 0; api.get.and.returnValue(of(empty));
    const element: HTMLElement = create().nativeElement;
    expect(element.textContent).toContain('No business profile saved yet.'); expect(element.textContent).toContain('login@example.test');
    expect(element.textContent).not.toContain('Persisted QA Logistics'); expect(element.textContent).not.toContain('Yadav');
  });
  it('shows loading, blocks duplicate fetches and never displays prototype data', () => {
    api.get.and.returnValue(new Subject<BusinessProfileView>()); const fixture = create(); const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[aria-busy=true]')).not.toBeNull();
    (fixture.componentInstance as any).load(); expect(api.get).toHaveBeenCalledTimes(1);
    expect(element.textContent).not.toContain('Persisted QA Logistics');
  });
  it('retries a real load failure and recovers to the stored profile', () => {
    api.get.and.returnValues(throwError(() => new HttpErrorResponse({ status: 503 })), of(data));
    const fixture = create(); const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[role=alert]')).not.toBeNull();
    (element.querySelector('[role=alert] button') as HTMLButtonElement).click(); fixture.detectChanges();
    expect(element.textContent).toContain('Persisted QA Logistics');
  });
  it('cancel discards a local edit without sending a request', async () => {
    const fixture = create(); await edit(fixture); const component = fixture.componentInstance as any;
    component.update('business_name', 'Draft only'); component.cancel(); fixture.detectChanges();
    expect(api.save).not.toHaveBeenCalled(); expect(fixture.nativeElement.textContent).toContain('Persisted QA Logistics');
    expect(fixture.nativeElement.textContent).not.toContain('Draft only');
  });
  it('saves current-version business fields and shows success only after the server responds', async () => {
    const pending = new Subject<BusinessProfileView>(); api.save.and.returnValue(pending);
    const fixture = create(); await edit(fixture); const component = fixture.componentInstance as any;
    component.update('business_name', 'Changed QA'); component.save(); fixture.detectChanges(); component.save();
    expect(api.save).toHaveBeenCalledTimes(1); expect(api.save.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ version: 3, business_name: 'Changed QA' }));
    expect((fixture.nativeElement.querySelector('button[type=submit]') as HTMLButtonElement).disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('[aria-busy=true]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Business profile saved.');
    pending.next({ ...data, changed: true, profile: { ...data.profile, business_name: 'Changed QA', version: 4 } }); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Business profile saved.'); expect(fixture.nativeElement.textContent).toContain('Changed QA');
  });
  it('validates fields inline and focuses the first invalid field without calling save', async () => {
    const fixture = create(); await edit(fixture); const component = fixture.componentInstance as any;
    component.update('business_name', ' '); component.update('pincode', '000001'); component.save(); fixture.detectChanges();
    expect(api.save).not.toHaveBeenCalled(); expect(fixture.nativeElement.querySelectorAll('[aria-invalid=true]').length).toBe(2);
    expect(fixture.nativeElement.querySelector('#business-business_name')?.getAttribute('aria-describedby')).toBe('error-business_name');
  });
  it('shows server field validation without discarding the draft', async () => {
    api.save.and.returnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { errors: { city: ['Review this city.'] } } })));
    const fixture = create(); await edit(fixture); (fixture.componentInstance as any).save(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Review this city.'); expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect((fixture.nativeElement.querySelector('[name=business_name]') as HTMLInputElement).value).toBe('Persisted QA Logistics');
  });
  it('keeps a draft after a network/server failure instead of showing a false saved state', async () => {
    api.save.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    const fixture = create(); await edit(fixture); (fixture.componentInstance as any).save(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Your draft is still here.');
    expect(fixture.nativeElement.textContent).not.toContain('Business profile saved.'); expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  });
  it('preserves a stale-tab draft until the user explicitly discards it and loads the latest version', async () => {
    api.save.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const fixture = create(); await edit(fixture); const component = fixture.componentInstance as any;
    component.update('city', 'Stale draft city'); component.save(); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Another session saved a newer profile.');
    expect((fixture.nativeElement.querySelector('[name=city]') as HTMLInputElement).value).toBe('Stale draft city');
    api.get.and.returnValue(of({ ...data, profile: { ...data.profile, city: 'Server winner', version: 4 } }));
    component.load(true); fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Server winner');
    expect(api.save).toHaveBeenCalledTimes(1);
  });
  it('reports a server-confirmed no-op accurately', async () => {
    api.save.and.returnValue(of(data)); const fixture = create(); await edit(fixture);
    (fixture.componentInstance as any).save(); fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('No changes to save.');
  });
  it('shows denied access without rendering a fake tenant or making backend-off requests', () => {
    config.useBackend = false; const element: HTMLElement = create().nativeElement;
    expect(api.get).not.toHaveBeenCalled(); expect(element.textContent).toContain('not available for this account type');
    expect(element.textContent).not.toContain('Yadav');
  });
  it('renders translated Hindi profile labels', () => {
    TestBed.inject(LanguageService).setLang('hi'); const element: HTMLElement = create().nativeElement;
    expect(element.textContent).toContain('व्यवसाय प्रोफ़ाइल'); expect(element.textContent).toContain('व्यावसायिक संपर्क ईमेल');
  });
});
