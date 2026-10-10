import { HttpErrorResponse } from '@angular/common/http';

/** Converts Laravel's {message, errors} envelope into a user-visible message. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const body = error instanceof HttpErrorResponse ? error.error : error;
  if (body && typeof body === 'object') {
    const payload = body as { message?: unknown; errors?: Record<string, unknown> };
    const fieldMessages = Object.values(payload.errors ?? {}).flatMap((value) => Array.isArray(value) ? value : [value])
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    if (fieldMessages.length) return fieldMessages.join(' ');
    if (typeof payload.message === 'string' && payload.message.trim()) return payload.message;
  }
  return fallback;
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
