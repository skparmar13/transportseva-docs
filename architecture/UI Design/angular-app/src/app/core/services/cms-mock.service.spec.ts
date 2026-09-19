import { TestBed } from '@angular/core/testing';
import { CmsContent, CmsMockService } from './cms-mock.service';

describe('CmsMockService', () => {
  let cms: CmsMockService;

  beforeEach(() => {
    localStorage.removeItem('transportseva.cms.v1');
    TestBed.configureTestingModule({});
    cms = TestBed.inject(CmsMockService);
  });

  afterEach(() => localStorage.removeItem('transportseva.cms.v1'));

  const draft: CmsContent = {
    id: 'CMS-TEST-01', type: 'Blog Post', language: 'Hindi', title: 'Test article', summary: 'Test summary',
    body: '<p>Test body</p>', author: 'Test author', attribution: '', section: 'Guides', updated: 'Today', status: 'Draft',
  };

  it('creates and updates content without duplicating its id', () => {
    cms.save(draft);
    cms.save({ ...draft, title: 'Updated title' });

    expect(cms.content().filter((item) => item.id === draft.id).length).toBe(1);
    expect(cms.content().find((item) => item.id === draft.id)?.title).toBe('Updated title');
  });

  it('keeps drafts out of public blog selectors until published', () => {
    cms.save(draft);
    expect(cms.publishedBlogPosts().some((item) => item.id === draft.id)).toBeFalse();

    cms.toggle(draft.id);
    expect(cms.publishedBlogPosts().some((item) => item.id === draft.id)).toBeTrue();
  });

  it('unpublishes content and removes it from public selectors', () => {
    cms.save({ ...draft, status: 'Published' });
    cms.toggle(draft.id);

    expect(cms.publishedBlogPosts().some((item) => item.id === draft.id)).toBeFalse();
  });

  it('returns only a published page matching both target and language', () => {
    cms.save({ ...draft, type: 'Public Page', section: 'Contact page', status: 'Published' });

    expect(cms.publishedPage('Contact page', 'Hindi')?.id).toBe(draft.id);
    expect(cms.publishedPage('Contact page', 'English')).toBeUndefined();
    expect(cms.publishedPage('About page', 'Hindi')).toBeUndefined();
  });

  it('removes content from the admin list and public selectors', () => {
    cms.save({ ...draft, status: 'Published' });
    cms.remove(draft.id);

    expect(cms.content().some((item) => item.id === draft.id)).toBeFalse();
    expect(cms.publishedBlogPosts().some((item) => item.id === draft.id)).toBeFalse();
  });

  it('restores edits from browser storage after the service is recreated', () => {
    cms.save(draft);
    TestBed.flushEffects();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(CmsMockService);

    expect(restored.content().find((item) => item.id === draft.id)?.title).toBe(draft.title);
  });
});
