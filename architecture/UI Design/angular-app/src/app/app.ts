import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { IconSpriteComponent } from './shared/components/icon-sprite/icon-sprite.component';
import { SeoService } from './core/seo/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconSpriteComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly indexablePaths = new Set([
    '/', '/about', '/pricing', '/contact', '/blog', '/blog-post', '/careers',
    '/help-center', '/privacy-policy', '/terms-conditions', '/refund-policy',
  ]);

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
        this.seo.setIndexable(this.indexablePaths.has(path));
      });
  }
}
