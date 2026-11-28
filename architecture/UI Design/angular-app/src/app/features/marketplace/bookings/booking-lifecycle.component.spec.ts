import { TestBed } from '@angular/core/testing';
import { BookingLifecycleComponent } from './booking-lifecycle.component';
import { BookingLifecycle } from '../../../core/models/booking-lifecycle.model';
import { LanguageService } from '../../../core/i18n';

import { lifecycleFixture } from './booking-lifecycle.fixtures';

describe('Independent booking status cards', () => {
  let lang: 'en' | 'hi';
  beforeEach(() => { lang = 'en'; TestBed.configureTestingModule({ imports: [BookingLifecycleComponent], providers: [{ provide: LanguageService, useValue: { lang: () => lang } }] }); });
  function mount(value?: BookingLifecycle) { const f = TestBed.createComponent(BookingLifecycleComponent); f.componentRef.setInput('value', value); f.detectChanges(); return f; }
  it('shows delivered, POD approval and full freight separately from uncollected fees and paid tokens', () => {
    const f = mount(lifecycleFixture()); const el = f.nativeElement;
    expect(el.querySelectorAll('[data-life-group]').length).toBe(5);
    expect(el.querySelector('[data-life-group=trip]').textContent).toContain('Delivered');
    expect(el.querySelector('[data-life-group=freight]').textContent).toContain('Freight fully confirmed');
    expect(el.querySelector('[data-life-group=fees]').textContent).toContain('Collection not recorded');
    expect(el.querySelector('[data-owner-token-status]').textContent).toContain('Paid');
    expect(el.querySelector('[data-life-group=trip]').textContent).toContain('27/11/2026');
  });
  it('does not infer freight receipt from an old settled record', () => {
    const v = lifecycleFixture(); v.freight = { ...v.freight, status: 'not_recorded', confirmed: 0, unpaid: 17000 };
    v.legacy_settlement = { status: 'settled', recorded_at: null, is_receipt_evidence: false };
    const f = mount(v); expect(f.nativeElement.querySelector('[data-life-group=freight]').textContent).toContain('No confirmed receipts');
    expect(f.nativeElement.querySelector('[data-legacy-settlement]').textContent).toContain('does not establish freight received');
    expect(f.nativeElement.textContent).not.toContain('Calculated provider net amount');
  });
  it('keeps disputed and awaiting amounts separate from confirmed money', () => {
    const v = lifecycleFixture(); v.freight = { ...v.freight, status: 'disputed', confirmed: 5100, awaiting_confirmation: 2000, disputed: 1000, unpaid: 11900 };
    const f = mount(v); const text = f.nativeElement.querySelector('[data-life-group=freight]').textContent;
    expect(text).toContain('₹5,100.00'); expect(text).toContain('₹11,900.00'); expect(text).toContain('₹2,000.00'); expect(text).toContain('₹1,000.00');
  });
  it('distinguishes an approved refund decision from a recorded refund', () => {
    const v = lifecycleFixture(); v.tokens.owner.admin_decision = 'refund'; const f = mount(v);
    expect(f.nativeElement.querySelector('[data-owner-token-status]').textContent).toContain('Paid');
    expect(f.nativeElement.textContent).toContain('Refund approved; execution separate');
    f.componentRef.setInput('value', { ...v, tokens: { ...v.tokens, owner: { ...v.tokens.owner, status: 'refunded' } } }); f.detectChanges();
    expect(f.nativeElement.querySelector('[data-owner-token-status]').textContent).toContain('Refund recorded');
  });
  it('renders an unavailable summary instead of zero financial figures when missing', () => {
    const f = mount(); expect(f.nativeElement.querySelectorAll('[data-life-group]').length).toBe(0);
    expect(f.nativeElement.textContent).toContain('summary unavailable'); expect(f.nativeElement.textContent).not.toContain('₹0');
  });
  it('shows a paused dispute without changing delivered evidence', () => {
    const v = lifecycleFixture(); v.trip.blocked_by_dispute = true; const f = mount(v);
    expect(f.nativeElement.querySelector('[data-life-group=trip]').textContent).toContain('Delivered');
    expect(f.nativeElement.textContent).toContain('Actions paused for dispute review');
  });
  it('supports Hindi without showing translation keys', () => {
    lang = 'hi'; const f = mount(lifecycleFixture()); expect(f.nativeElement.textContent).toContain('डिलीवरी पूरी');
    expect(f.nativeElement.textContent).toContain('वसूली दर्ज नहीं');
  });
  it('labels all supported admin decisions without interpreting them as money movement', () => {
    const v = lifecycleFixture(); v.tokens.provider.admin_decision = 'retain'; v.platform_fees.admin_decision = 'charge'; const f = mount(v);
    expect(f.nativeElement.textContent).toContain('Token retention approved'); expect(f.nativeElement.textContent).toContain('Fee charge approved; collection not recorded');
    expect(f.nativeElement.textContent).not.toContain('Status not verified');
  });
});
