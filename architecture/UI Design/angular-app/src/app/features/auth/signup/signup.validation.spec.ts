import { isSignupReady } from './signup.component';

describe('signup form readiness', () => {
  const valid = {
    formValid: true,
    fullName: 'Truck Owner',
    mobile: '8505838433',
    password: 'Strong123',
    confirmPassword: 'Strong123',
    agreeTerms: true,
  };

  it('enables account creation only for complete, valid data', () => {
    expect(isSignupReady(valid)).toBeTrue();
  });

  it('keeps account creation disabled until terms are accepted', () => {
    expect(isSignupReady({ ...valid, agreeTerms: false })).toBeFalse();
  });

  it('rejects malformed mobile numbers and mismatched passwords', () => {
    expect(isSignupReady({ ...valid, mobile: '12345' })).toBeFalse();
    expect(isSignupReady({ ...valid, confirmPassword: 'Different123' })).toBeFalse();
  });
});
