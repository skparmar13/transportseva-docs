import { Injectable, signal } from '@angular/core';
import { EN } from './translations.en';
import { HI } from './translations.hi';

/** Supported languages today. New Indian languages can be added by pushing
 * a code here and providing a matching `translations.<code>.ts` dictionary. */
export type LanguageCode = 'en' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
}

const STORAGE_KEY = 'ts_lang';

const DICTIONARIES: Record<LanguageCode, Record<string, string>> = {
  en: EN,
  hi: HI,
};

/**
 * Central i18n service for the whole app (public site, auth flows and the
 * authenticated portal). Holds the active language as a signal so any
 * component/pipe reading it re-renders automatically when the language
 * changes — no page reload required. Persists the choice to localStorage
 * (mirrors the legacy static prototype's `ts_lang` key) and updates
 * `<html lang>` for accessibility/SEO.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly available: LanguageOption[] = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिंदी' },
  ];

  readonly lang = signal<LanguageCode>(this.readInitialLang());

  constructor() {
    this.applyDocumentLang(this.lang());
  }

  setLang(code: LanguageCode): void {
    if (!DICTIONARIES[code] || this.lang() === code) return;
    this.lang.set(code);
    this.applyDocumentLang(code);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, code);
      }
    } catch {
      /* localStorage unavailable (SSR/incognito) — ignore */
    }
  }

  toggle(): void {
    this.setLang(this.lang() === 'en' ? 'hi' : 'en');
  }

  /** Translate a key for the currently active language, falling back to
   * English and finally the raw key so missing translations never render
   * blank. Supports simple `{placeholder}` interpolation. */
  translate(key: string, params?: Record<string, string | number>): string {
    const dict = DICTIONARIES[this.lang()];
    let value = dict[key] ?? EN[key] ?? key;
    if (params) {
      for (const [name, val] of Object.entries(params)) {
        value = value.replace(new RegExp(`{${name}}`, 'g'), String(val));
      }
    }
    return value;
  }

  private readInitialLang(): LanguageCode {
    try {
      if (typeof localStorage === 'undefined') return 'en';
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi') return saved;
    } catch {
      /* localStorage unavailable (SSR/incognito) — ignore */
    }
    return 'en';
  }

  private applyDocumentLang(code: LanguageCode): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', code);
    }
  }
}
