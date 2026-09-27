import { isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BookingCommissionComponent, BookingCommissionSnapshot } from '../models/marketplace.model';
import { PortalRole } from '../models/nav.model';

export interface CommissionRules {
  version: number;
  thresholdPaise: number;
  fixedFeePaise: number;
  shipperRateBps: number;
  providerRateBps: number;
  minimumFeePaise: number;
  maximumFeePaise: number;
  taxRateBps: number;
  cancellationRateBps: number;
  cancellationRefundRateBps: number;
}

const toPaise = (value: string): number => Math.round(Number(value.replace(/[^0-9.]/g, '')) * 100) || 0;

@Injectable({ providedIn: 'root' })
export class CommissionRulesService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly rules = signal<CommissionRules>({
    version: 1,
    thresholdPaise: 1_000_000,
    fixedFeePaise: 30_000,
    shipperRateBps: 500,
    providerRateBps: 500,
    minimumFeePaise: 0,
    maximumFeePaise: 0,
    taxRateBps: 0,
    cancellationRateBps: 0,
    cancellationRefundRateBps: 10_000,
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem('transportseva.commission-rules.v1');
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (this.isValidRules(parsed)) this.rules.set(parsed);
        }
      } catch {
        // Keep demo defaults if browser storage is unavailable or malformed.
      }
    }
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      try {
        localStorage.setItem('transportseva.commission-rules.v1', JSON.stringify(this.rules()));
      } catch {
        // Rule updates remain usable in-memory when storage is blocked.
      }
    });
  }

  updateRules(changes: Omit<CommissionRules, 'version'>): void {
    this.rules.update((current) => ({ ...changes, version: current.version + 1 }));
  }

  calculate(input: {
    freight: string;
    ownerRole: PortalRole;
    ownerName: string;
    providerRole: PortalRole;
    providerName: string;
  }): BookingCommissionSnapshot {
    const rules = this.rules();
    const freightPaise = toPaise(input.freight);
    const transporter = input.providerRole === 'transporter'
      ? { role: input.providerRole, name: input.providerName }
      : input.ownerRole === 'transporter'
        ? { role: input.ownerRole, name: input.ownerName }
        : null;
    const components: BookingCommissionComponent[] = [
      this.component('shipper', input.ownerRole, input.ownerName, transporter, freightPaise, rules),
      this.component('provider', input.providerRole, input.providerName, transporter, freightPaise, rules),
    ];
    return {
      thresholdPaise: rules.thresholdPaise,
      fixedFeePaise: rules.fixedFeePaise,
      cancellationRateBps: rules.cancellationRateBps,
      cancellationRefundRateBps: rules.cancellationRefundRateBps,
      components,
      policyVersion: rules.version,
      status: 'Quoted',
    };
  }

  formatPaise(amount: number): string {
    return `₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private component(
    side: BookingCommissionComponent['side'],
    defaultRole: PortalRole,
    defaultName: string,
    transporter: { role: PortalRole; name: string } | null,
    freightPaise: number,
    rules: CommissionRules,
  ): BookingCommissionComponent {
    const fixed = freightPaise <= rules.thresholdPaise;
    const rateBps = side === 'shipper' ? rules.shipperRateBps : rules.providerRateBps;
    const rawFee = fixed ? rules.fixedFeePaise : Math.round((freightPaise * rateBps) / 10_000);
    const cappedFee = Math.max(rawFee, rules.minimumFeePaise);
    const feePaise = rules.maximumFeePaise > 0 ? Math.min(cappedFee, rules.maximumFeePaise) : cappedFee;
    const taxPaise = Math.round((feePaise * rules.taxRateBps) / 10_000);
    const payer = transporter ?? { role: defaultRole, name: defaultName };
    return {
      side,
      billedToRole: payer.role,
      billedToName: payer.name,
      basisFreightPaise: freightPaise,
      rule: fixed ? 'fixed' : 'percentage',
      rateBps: fixed ? 0 : rateBps,
      feePaise,
      taxRateBps: rules.taxRateBps,
      taxPaise,
      totalPaise: feePaise + taxPaise,
    };
  }

  private isValidRules(value: unknown): value is CommissionRules {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as CommissionRules;
    const amounts = [candidate.thresholdPaise, candidate.fixedFeePaise, candidate.minimumFeePaise, candidate.maximumFeePaise];
    const rates = [candidate.shipperRateBps, candidate.providerRateBps, candidate.taxRateBps, candidate.cancellationRateBps, candidate.cancellationRefundRateBps];
    return Number.isInteger(candidate.version) && candidate.version > 0
      && amounts.every((amount) => Number.isSafeInteger(amount) && amount >= 0)
      && candidate.thresholdPaise > 0 && candidate.fixedFeePaise > 0
      && (candidate.maximumFeePaise === 0 || candidate.maximumFeePaise >= candidate.minimumFeePaise)
      && rates.every((rate) => Number.isInteger(rate) && rate >= 0 && rate <= 10_000);
  }
}
