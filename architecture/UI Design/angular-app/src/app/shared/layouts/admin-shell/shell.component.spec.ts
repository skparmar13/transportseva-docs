import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ShellComponent } from './shell.component';
import { SessionService } from '../../../core/services/session.service';

describe('ShellComponent shared controls', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('finds current-portal navigation from global search and opens it', async () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.topbar-search input') as HTMLInputElement;
    input.value = 'bookings';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const result = fixture.nativeElement.querySelector('.topbar-search-results button') as HTMLButtonElement;
    expect(result).toBeTruthy();
    result.click();
    expect(navigate).toHaveBeenCalledWith(['/admin', 'bookings']);
  });

  it('toggles the desktop sidebar between expanded and collapsed states', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.sidebar-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sidebar').classList.contains('collapsed')).toBeTrue();
    expect((fixture.nativeElement.querySelector('.sidebar-toggle') as HTMLButtonElement).getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the mobile drawer and closes it when a navigation item is chosen', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.sidebar-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sidebar').classList.contains('open')).toBeTrue();

    (fixture.nativeElement.querySelector('.side-link') as HTMLAnchorElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sidebar').classList.contains('open')).toBeFalse();
  });

  it('logs out to the login route and resets the mock portal role', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    const session = TestBed.inject(SessionService);
    session.setRole('driver');
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.logout-button') as HTMLButtonElement).click();

    expect(session.role()).toBe('admin');
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
