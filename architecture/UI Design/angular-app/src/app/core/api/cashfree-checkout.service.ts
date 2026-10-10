import { Injectable } from '@angular/core';
import { Observable, from, switchMap, throwError } from 'rxjs';

interface CashfreeSdk {
  checkout(options: { paymentSessionId: string; redirectTarget?: '_self' | '_blank' | '_modal' }): Promise<unknown>;
}

declare global {
  interface Window { Cashfree?: (options: { mode: 'sandbox' | 'production' }) => CashfreeSdk; }
}

@Injectable({ providedIn: 'root' })
export class CashfreeCheckoutService {
  private readonly scriptUrl = 'https://sdk.cashfree.com/js/v3/cashfree.js';

  open(paymentSessionId: string, mode: 'sandbox' | 'production' = 'sandbox'): Observable<unknown> {
    if (!paymentSessionId) return throwError(() => new Error('Missing Cashfree payment session.'));
    return this.loadSdk().pipe(
      switchMap(() => {
        if (!window.Cashfree) return throwError(() => new Error('Cashfree checkout SDK unavailable.'));
        return from(window.Cashfree({ mode }).checkout({ paymentSessionId, redirectTarget: '_modal' }));
      }),
    );
  }

  private loadSdk(): Observable<void> {
    if (window.Cashfree) return from(Promise.resolve());
    return new Observable<void>((subscriber) => {
      const existing = document.querySelector(`script[src="${this.scriptUrl}"]`);
      if (existing) {
        existing.addEventListener('load', () => { subscriber.next(); subscriber.complete(); });
        existing.addEventListener('error', () => subscriber.error(new Error('Cashfree SDK failed to load.')));
        return;
      }
      const script = document.createElement('script');
      script.src = this.scriptUrl; script.async = true;
      script.onload = () => { subscriber.next(); subscriber.complete(); };
      script.onerror = () => subscriber.error(new Error('Cashfree SDK failed to load.'));
      document.head.appendChild(script);
    });
  }
}
