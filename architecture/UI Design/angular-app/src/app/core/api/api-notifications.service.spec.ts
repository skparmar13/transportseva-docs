import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiNotificationsService } from './api-notifications.service';
import { API_CONFIG } from './api-config';

describe('ApiNotificationsService', () => {
  let service: ApiNotificationsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ApiNotificationsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps notifications and preserves unread state', () => {
    let result: unknown;
    service.list().subscribe((notifications) => result = notifications);
    const request = http.expectOne(`${API_CONFIG.baseUrl}/notifications?per_page=50`);
    request.flush({ success: true, data: [{ id: 'n-1', title: 'New message', message: 'Hello', read_at: null }] });
    expect(result).toEqual([jasmine.objectContaining({ id: 'n-1', read_at: null })]);
  });

  it('marks a notification read through the protected endpoint', () => {
    service.markRead('n-1').subscribe();
    const request = http.expectOne(`${API_CONFIG.baseUrl}/notifications/n-1/read`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ success: true, data: {} });
  });
});
