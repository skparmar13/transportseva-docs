import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { ApiMarketplaceService } from '../../../core/api/api-marketplace.service';
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
