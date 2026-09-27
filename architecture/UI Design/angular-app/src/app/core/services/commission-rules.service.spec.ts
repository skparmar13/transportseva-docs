import { TestBed } from '@angular/core/testing';
import { CommissionRulesService } from './commission-rules.service';

describe('CommissionRulesService', () => {
  let commission: CommissionRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    commission = TestBed.inject(CommissionRulesService);
  });

  it('snapshots a fixed ₹300 fee for each side at the ₹10,000 threshold', () => {
    const snapshot = commission.calculate({
      freight: '₹10,000', ownerRole: 'shipper', ownerName: 'Shipper Co.',
      providerRole: 'truck-owner', providerName: 'Truck Owner',
    });

    expect(snapshot.components.map((fee) => fee.feePaise)).toEqual([30_000, 30_000]);
    expect(snapshot.components.map((fee) => fee.billedToName)).toEqual(['Shipper Co.', 'Truck Owner']);
    expect(snapshot.components.every((fee) => fee.rule === 'fixed')).toBeTrue();
  });

  it('uses the separately configured rates above the threshold and retains the old snapshot', () => {
    const original = commission.calculate({
      freight: '₹20,000', ownerRole: 'shipper', ownerName: 'Shipper Co.',
      providerRole: 'truck-owner', providerName: 'Truck Owner',
    });
    commission.updateRules({ ...commission.rules(), shipperRateBps: 400, providerRateBps: 600 });

    expect(original.components.map((fee) => fee.feePaise)).toEqual([100_000, 100_000]);
    const updated = commission.calculate({
      freight: '₹20,000', ownerRole: 'shipper', ownerName: 'Shipper Co.',
      providerRole: 'truck-owner', providerName: 'Truck Owner',
    });
    expect(updated.components.map((fee) => fee.feePaise)).toEqual([80_000, 120_000]);
    expect(updated.policyVersion).toBeGreaterThan(original.policyVersion);
  });

  it('charges a participating Transporter both commission components', () => {
    const snapshot = commission.calculate({
      freight: '₹20,000', ownerRole: 'shipper', ownerName: 'Shipper Co.',
      providerRole: 'transporter', providerName: 'Transporter Co.',
    });

    expect(snapshot.components.length).toBe(2);
    expect(snapshot.components.every((fee) => fee.billedToRole === 'transporter' && fee.billedToName === 'Transporter Co.')).toBeTrue();
  });
});
