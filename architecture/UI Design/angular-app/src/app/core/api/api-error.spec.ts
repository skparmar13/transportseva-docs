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
});
