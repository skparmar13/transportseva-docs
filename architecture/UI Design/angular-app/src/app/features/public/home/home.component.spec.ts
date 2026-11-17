import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiLoad, ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
import { ApiMarketplaceReview, ApiReviewService } from '../../../core/api/api-review.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { HomeComponent } from './home.component';

describe('HomeComponent published reviews', () => {
  const config = API_CONFIG as { useBackend: boolean };
  let original: boolean;
  let api: jasmine.SpyObj<ApiReviewService>;
  const review: ApiMarketplaceReview = { uuid: 'review-qa', reviewer_name: 'Published Review QA',
    reviewer_role: 'shipper', rating: 4, comment: 'A real approved review.', status: 'approved' };
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true;
    api = jasmine.createSpyObj('ApiReviewService', ['listPublic']); api.listPublic.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiReviewService, useValue: api },
      { provide: ApiMarketplaceService, useValue: { listRecentLoads: () => of([]) } }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { config.useBackend = original; });
  const noSample = (text: string) => {
    for (const name of ['Rakesh Sharma', 'Vikram Singh', 'Neha Verma']) expect(text).not.toContain(name);
  };
  it('shows an honest empty state instead of sample or local CMS testimonials', () => {
    const fixture = TestBed.createComponent(HomeComponent); fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('.testimonials');
    expect(section.textContent).toContain('No published customer reviews yet.'); noSample(section.textContent);
  });
  it('does not render samples while the approved feed is loading', () => {
    api.listPublic.and.returnValue(new Subject<ApiMarketplaceReview[]>());
    const fixture = TestBed.createComponent(HomeComponent); fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('.testimonials');
    expect(section.querySelector('[aria-busy=true]')).not.toBeNull(); noSample(section.textContent);
  });
  it('can retry an error and displays the actual rating and reviewer', () => {
    api.listPublic.and.returnValues(throwError(() => new Error('Unavailable')), of([review]));
    const fixture = TestBed.createComponent(HomeComponent); fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('.testimonials');
    expect(section.querySelector('[role=alert]')).not.toBeNull(); noSample(section.textContent);
    section.querySelector('button').click(); fixture.detectChanges();
    expect(api.listPublic).toHaveBeenCalledTimes(2);
    expect(section.textContent).toContain('Published Review QA');
    expect(section.querySelector('.stars').textContent).toContain('★★★★☆');
  });
  it('rejects explicitly unapproved or invalid-rating rows defensively', () => {
    api.listPublic.and.returnValue(of([review, { ...review, uuid: 'pending', reviewer_name: 'Hidden pending', status: 'pending' },
      { ...review, uuid: 'bad', reviewer_name: 'Hidden rating', rating: 8 }]));
    const fixture = TestBed.createComponent(HomeComponent); fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('.testimonials');
    expect(section.querySelectorAll('.testi-card').length).toBe(1);
    expect(section.textContent).not.toContain('Hidden');
  });
  it('does not emit sample reviews in backend-off/SSR mode either', () => {
    config.useBackend = false;
    const fixture = TestBed.createComponent(HomeComponent); fixture.detectChanges();
    noSample(fixture.nativeElement.querySelector('.testimonials').textContent);
    expect(api.listPublic).not.toHaveBeenCalled();
  });
});

describe('HomeComponent current load preview', () => {
  const config = API_CONFIG as { useBackend: boolean };
  let original: boolean;
  let api: jasmine.SpyObj<ApiMarketplaceService>;
  const load: ApiLoad = { uuid: 'preview-qa', load_id: 'LD-009901', pickup_city: 'Delhi',
    drop_city: 'Mumbai', vehicle_type: '32ft Trailer', status: 'open', budget: 20000 };
  beforeEach(() => {
    original = config.useBackend; config.useBackend = true;
    api = jasmine.createSpyObj('ApiMarketplaceService', ['listRecentLoads']);
    api.listRecentLoads.and.returnValue(of([]));
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: ApiMarketplaceService, useValue: api },
      { provide: ApiReviewService, useValue: { listPublic: () => of([]) } }] });
    TestBed.inject(LanguageService).setLang('en');
  });
  afterEach(() => { TestBed.resetTestingModule(); config.useBackend = original; });
  function create() {
    const fixture = TestBed.createComponent(HomeComponent); fixture.detectChanges();
    return { fixture, component: fixture.componentInstance as any,
      section: fixture.nativeElement.querySelector('#current-loads') as HTMLElement };
  }
  it('shows a spinner and disabled filters while pending, never an empty table or prototype data', () => {
    api.listRecentLoads.and.returnValue(new Subject<ApiLoad[]>());
    const { section } = create();
    expect(section.querySelector('[role=status][aria-busy=true]')?.textContent).toContain('Loading current loads');
    expect(section.querySelector('.public-load-spinner')).not.toBeNull();
    expect(section.querySelector('fieldset')?.disabled).toBeTrue();
    expect(section.querySelector('table')).toBeNull();
    expect(section.textContent).not.toContain('No current loads');
    expect(api.listRecentLoads).toHaveBeenCalledOnceWith(20);
  });
  it('distinguishes a successful empty feed from errors and filter misses', () => {
    const { section } = create();
    expect(section.textContent).toContain('No open loads are available right now.');
    expect(section.querySelector('[role=alert]')).toBeNull();
    expect(section.querySelector('table')).toBeNull();
  });
  it('locks retry while pending, then renders recovered records with preserved filters', () => {
    const pending = new Subject<ApiLoad[]>();
    api.listRecentLoads.and.returnValues(throwError(() => new Error('Internal error')), pending);
    const { fixture, component, section } = create();
    expect(section.querySelector('[role=alert]')?.textContent).toContain('could not be loaded');
    expect(section.textContent).not.toContain('Internal error');
    component.sourceQuery.set('del'); component.destinationQuery.set('mum');
    component.vehicleTypeFilter.set('32ft Trailer'); component.previewLimit.set(20);
    section.querySelector('button')!.click(); component.retryLoads(); fixture.detectChanges();
    expect(api.listRecentLoads).toHaveBeenCalledTimes(2);
    expect(section.querySelector('[aria-busy=true]')).not.toBeNull();
    expect(section.querySelector('button')).toBeNull();
    pending.next([load]); pending.complete(); fixture.detectChanges();
    expect(section.querySelector('tbody')?.textContent).toContain('LD-009901');
    expect(section.querySelector('tbody')?.textContent).toContain('20,000');
    expect(component.sourceQuery()).toBe('del'); expect(component.destinationQuery()).toBe('mum');
    expect(component.vehicleTypeFilter()).toBe('32ft Trailer'); expect(component.previewLimit()).toBe(20);
  });
  it('bounds a stalled request, ignores late results and supports a fresh retry', fakeAsync(() => {
    const stalled = new Subject<ApiLoad[]>();
    api.listRecentLoads.and.returnValues(stalled, of([load]));
    const { fixture, section } = create(); tick(30_001); fixture.detectChanges();
    expect(stalled.observed).toBeFalse();
    expect(section.querySelector('[role=alert]')).not.toBeNull();
    stalled.next([load]); fixture.detectChanges(); expect(section.querySelector('table')).toBeNull();
    section.querySelector('button')!.click(); fixture.detectChanges();
    expect(section.querySelector('tbody')?.textContent).toContain('Delhi');
  }));
  it('cancels the pending read when navigating away', () => {
    const pending = new Subject<ApiLoad[]>(); api.listRecentLoads.and.returnValue(pending);
    const { fixture } = create(); expect(pending.observed).toBeTrue();
    fixture.destroy(); expect(pending.observed).toBeFalse();
  });
  it('filters only the bounded preview and clears all filters without another API request', () => {
    api.listRecentLoads.and.returnValue(of(Array.from({ length: 20 }, (_, i) => ({ ...load, uuid: 'load-'+i, load_id: 'LD-'+i }))));
    const { fixture, component, section } = create();
    expect(section.querySelectorAll('tbody tr').length).toBe(10);
    component.setPreviewLimit('20'); fixture.detectChanges(); expect(section.querySelectorAll('tbody tr').length).toBe(20);
    component.destinationQuery.set('Chennai'); fixture.detectChanges();
    expect(section.textContent).toContain('No current loads match these filters.');
    expect(section.textContent).toContain('up to 20 recent open loads');
    expect(section.textContent).not.toContain('No open loads are available right now.');
    section.querySelector('button')!.click(); fixture.detectChanges();
    expect(section.querySelectorAll('tbody tr').length).toBe(20);
    expect(api.listRecentLoads).toHaveBeenCalledTimes(1);
  });
  it('translates loading, failure and empty states into Hindi', () => {
    const pending = new Subject<ApiLoad[]>(); api.listRecentLoads.and.returnValues(pending, of([]));
    const { fixture, section } = create(); TestBed.inject(LanguageService).setLang('hi'); fixture.detectChanges();
    expect(section.textContent).toContain('वर्तमान लोड लोड हो रहे हैं');
    pending.error(new Error('Unavailable')); fixture.detectChanges();
    expect(section.querySelector('[role=alert]')?.textContent).toContain('फिर से प्रयास करें');
    section.querySelector('button')!.click(); fixture.detectChanges();
    expect(section.textContent).toContain('अभी कोई खुला लोड उपलब्ध नहीं है।');
    expect(section.textContent).not.toContain('publicLoads.');
  });
  it('makes no recent-load API request in explicit prototype mode', () => {
    config.useBackend = false; const { section } = create();
    expect(api.listRecentLoads).not.toHaveBeenCalled();
    expect(section.querySelector('[aria-busy=true]')).toBeNull();
  });
});
