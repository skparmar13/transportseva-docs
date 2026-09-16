import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface AuditEvent { time: string; actor: string; action: string; target: string; severity: 'Info' | 'Review' | 'Security'; }

@Component({ selector: 'app-audit-logs', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './audit-logs.component.html' })
export class AuditLogsComponent {
  protected readonly events = signal<AuditEvent[]>([
    { time: 'Today, 11:28 AM', actor: 'Priya Nair', action: 'Approved customer workspace', target: 'Mehta Industries', severity: 'Info' },
    { time: 'Today, 10:55 AM', actor: 'Arjun Rao', action: 'Requested KYC document review', target: 'Jaipur Freight Network', severity: 'Review' },
    { time: 'Today, 10:12 AM', actor: 'System', action: 'Payment webhook reconciled', target: '#TS-48230', severity: 'Info' },
    { time: 'Yesterday, 6:42 PM', actor: 'Super Admin', action: 'Suspended workspace access', target: 'Om Logistics Pvt Ltd', severity: 'Security' },
  ]);
  protected readonly filter = signal<'All' | AuditEvent['severity']>('All');
  protected readonly filtered = computed(() => this.filter() === 'All' ? this.events() : this.events().filter((event) => event.severity === this.filter()));
}
