import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PaymentMockService } from '../../core/services/payment-mock.service';
import { GstInvoice, GstInvoiceStatus, PaymentStatus, PayoutStatus } from '../../core/models/payment.model';

type PaymentsTab = 'freight' | 'commission' | 'gst' | 'payouts';

const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  Paid: 'status-delivered',
  Pending: 'status-pending',
  Overdue: 'status-cancelled',
};

const GST_STATUS_CLASS: Record<GstInvoiceStatus, string> = {
  Paid: 'status-delivered',
  Unpaid: 'status-pending',
};

const PAYOUT_STATUS_CLASS: Record<PayoutStatus, string> = {
  Processed: 'status-delivered',
  Pending: 'status-pending',
  Failed: 'status-cancelled',
};

/**
 * Payments — Module 9. Freight Payments (invoices owed/received),
 * Commission (platform's cut per trip), GST Invoices, and Payouts
 * (settlements paid out to truck owners/transporters/drivers).
 * Provider-facing payment operations: freight payments, commission,
 * invoices and payouts. Stored-value wallet behavior is intentionally excluded.
 */
@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [IconComponent, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments.component.html',
})
export class PaymentsComponent {
  protected readonly payments = inject(PaymentMockService);

  protected readonly paymentStatusClass = PAYMENT_STATUS_CLASS;
  protected readonly gstStatusClass = GST_STATUS_CLASS;
  protected readonly payoutStatusClass = PAYOUT_STATUS_CLASS;

  protected readonly activeTab = signal<PaymentsTab>('freight');

  protected setTab(tab: PaymentsTab): void {
    this.activeTab.set(tab);
  }

  protected markPaid(id: string): void {
    this.payments.markFreightPaymentPaid(id);
  }

  protected markGstPaid(id: string): void {
    this.payments.markGstInvoicePaid(id);
  }

  protected downloadGstInvoice(invoice: GstInvoice): void {
    const content = [`Tax invoice: ${invoice.invoiceNumber}`, `Date: ${invoice.date}`, `Billed to: ${invoice.billedTo}`, `Taxable amount: ${invoice.taxableAmount}`, `GST: ${invoice.gstAmount}`, `Total: ${invoice.totalAmount}`, `Status: ${invoice.status}`].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
