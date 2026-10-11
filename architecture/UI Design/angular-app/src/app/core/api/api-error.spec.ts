import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage, apiFieldErrors } from './api-error';

describe('API error presentation', () => {
  it('turns Laravel validation errors into readable field text', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: {
        message: 'Validation failed.',
        errors: { email: ['The email field is required.'], password: ['The password field is required.'] },
      },
    });

    expect(apiErrorMessage(error)).toBe('The email field is required. The password field is required.');
    expect(apiFieldErrors(error)).toEqual({
      email: 'The email field is required.',
      password: 'The password field is required.',
    });
  });

  it('falls back to the server message when no field errors exist', () => {
    const error = new HttpErrorResponse({ status: 422, error: { message: 'Invalid or expired OTP' } });
    expect(apiErrorMessage(error)).toBe('Invalid or expired OTP');
  });

  it('does not expose database internals in the customer UI', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { message: "SQLSTATE[42S22]: Column not found: 1054 Unknown column 'created_by'" },
    });
    expect(apiErrorMessage(error, 'Chat could not be sent.')).toBe('Chat could not be sent.');
  });
});
