import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly router = inject(Router);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private started = false;
  private readonly events = ['click', 'keydown', 'pointerdown', 'scroll', 'touchstart'];

  start(): void {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    for (const event of this.events) window.addEventListener(event, this.reset, { passive: true });
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.reset());
    this.reset();
  }

  private readonly reset = (): void => {
    if (!localStorage.getItem('transportseva.access_token') || this.router.url.startsWith('/auth/')) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.expire(), INACTIVITY_LIMIT_MS);
  };

  private expire(): void {
    localStorage.removeItem('transportseva.access_token');
    localStorage.removeItem('transportseva.refresh_token');
    localStorage.removeItem('transportseva.api_user');
    this.timer = null;
    void this.router.navigate(['/auth/login'], { queryParams: { reason: 'inactivity' } });
  }
}
