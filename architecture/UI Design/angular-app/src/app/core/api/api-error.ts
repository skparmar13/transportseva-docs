import { HttpErrorResponse } from '@angular/common/http';

/** Converts Laravel's {message, errors} envelope into a user-visible message. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const body = error instanceof HttpErrorResponse ? error.error : error;
  if (body && typeof body === 'object') {
    const payload = body as { message?: unknown; errors?: Record<string, unknown> };
    const fieldMessages = Object.values(payload.errors ?? {}).flatMap((value) => Array.isArray(value) ? value : [value])
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    if (fieldMessages.length) {
      const message = fieldMessages.join(' ');
      return isTechnicalServerError(message) ? fallback : message;
    }
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return isTechnicalServerError(payload.message) ? fallback : payload.message;
    }
  }
  return fallback;
}

/** Never render database queries or framework internals in the customer UI. */
function isTechnicalServerError(message: string): boolean {
  return /sqlstate|unknown column|insert into|connection:\s*(mysql|pgsql|sqlite)|stack trace/i.test(message);
}

export function apiFieldErrors(error: unknown): Record<string, string> {
  const body = error instanceof HttpErrorResponse ? error.error : error;
  const errors = body && typeof body === 'object' ? (body as { errors?: Record<string, unknown> }).errors : undefined;
  if (!errors) return {};
  return Object.fromEntries(Object.entries(errors).map(([key, value]) => {
    const first = Array.isArray(value) ? value[0] : value;
    return [key, typeof first === 'string' ? first : 'This field is invalid.'];
  }));
}
