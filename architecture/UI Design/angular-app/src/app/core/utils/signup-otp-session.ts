const COOLDOWN_KEY = 'transportseva.signup_otp_cooldown';

export function pendingSignupContact(): { phone: string; role?: string } | null {
  try {
    const pending = JSON.parse(sessionStorage.getItem('transportseva.pending_signup') ?? 'null');
    if (!pending || typeof pending.mobile !== 'string' || !/^[6-9]\d{9}$/.test(pending.mobile)
      || (pending.role !== undefined && !['shipper', 'transporter', 'truck-owner'].includes(pending.role))) return null;
    return { phone: '+91' + pending.mobile, role: pending.role };
  } catch { return null; }
}

export function signupOtpWait(phone: string): number {
  try {
    const state = JSON.parse(sessionStorage.getItem(COOLDOWN_KEY) ?? 'null');
    return state?.phone === phone && Number.isFinite(state.until)
      ? Math.max(0, Math.min(3600, Math.ceil((state.until - Date.now()) / 1000))) : 0;
  } catch { return 0; }
}

export function rememberSignupOtpWait(phone: string, seconds = 60): void {
  const delay = Number.isFinite(seconds) ? Math.max(1, Math.min(3600, Math.ceil(seconds))) : 60;
  sessionStorage.setItem(COOLDOWN_KEY, JSON.stringify({ phone, until: Date.now() + delay * 1000 }));
}

export function clearSignupOtpWait(): void { sessionStorage.removeItem(COOLDOWN_KEY); }
