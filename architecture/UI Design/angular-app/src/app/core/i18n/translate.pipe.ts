import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from './language.service';

/**
 * Template pipe for translated strings: `{{ 'nav.home' | t }}`.
 * Marked impure so it re-evaluates whenever `LanguageService.lang` changes
 * (the signal read inside `transform` is tracked by Angular's change
 * detection even under OnPush, but marking it impure guarantees a refresh
 * immediately after `setLang`/`toggle` without relying on other inputs
 * changing on the host component).
 */
@Pipe({
  name: 't',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(key: string, params?: Record<string, string | number>): string {
    // Reading the signal here ties this pipe's re-evaluation to language changes.
    this.language.lang();
    return this.language.translate(key, params);
  }
}
