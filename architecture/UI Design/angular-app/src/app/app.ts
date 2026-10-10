import { Component, inject } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { signal } from '@angular/core';
import { IconSpriteComponent } from './shared/components/icon-sprite/icon-sprite.component';
import { SeoService } from './core/seo/seo.service';
import { SessionTimeoutService } from './core/services/session-timeout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconSpriteComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly sessionTimeout = inject(SessionTimeoutService);
  protected readonly navigating = signal(false);
  private readonly indexablePaths = new Set([
    '/', '/about', '/pricing', '/contact', '/blog', '/blog-post', '/careers',
    '/help-center', '/privacy-policy', '/terms-conditions', '/refund-policy',
  ]);

  constructor() {
    this.sessionTimeout.start();
    this.router.events.pipe(filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.navigating.set(true);
          return;
        }
        this.navigating.set(false);
        if (!(event instanceof NavigationEnd)) return;
        const path = event.urlAfterRedirects.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
        this.seo.setIndexable(this.indexablePaths.has(path));
      });
  }
}
