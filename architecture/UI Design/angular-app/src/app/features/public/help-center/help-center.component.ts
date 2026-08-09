import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.scss',
})
export class HelpCenterComponent {
  protected readonly categories = signal([
    { id: 'track-card', icon: 'i-box', title: 'Bookings & Shipments', count: '24 articles' },
    { id: 'rate-card', icon: 'i-credit-card', title: 'Payments & Billing', count: '18 articles' },
    { id: 'toll-card', icon: 'i-truck', title: 'For Transporters', count: '15 articles' },
    { id: 'api-card', icon: 'i-headphones', title: 'Account & Support', count: '12 articles' },
  ]);
  protected readonly faqs = signal([
    { question: 'How do I book a truck on TransportSeva?', answer: "Simply log in to your account, click 'Book Your Shipment', enter your pickup and drop locations, select your vehicle type and confirm your booking. You'll get a verified transporter assigned within minutes.", open: true },
    { question: 'How can I track my shipment in real-time?', answer: "Every booking includes live GPS tracking. Go to 'Track Shipment' from your dashboard or the tracking link sent to your registered mobile number to see live vehicle location and ETA.", open: false },
    { question: 'What payment methods are supported?', answer: 'We support UPI, net banking, credit/debit cards and TransportSeva Wallet. Corporate accounts can also opt for monthly invoicing with GST-compliant bills.', open: false },
    { question: 'How do I become a verified transporter partner?', answer: 'Sign up as a Transporter, upload your vehicle RC, driver license and insurance documents. Our verification team typically approves applications within 24-48 hours.', open: false },
    { question: 'What is your cancellation and refund policy?', answer: 'Bookings can be cancelled free of charge up to 2 hours before the scheduled pickup. Refunds for eligible cancellations are processed within 5-7 business days. See our Refund Policy for full details.', open: false },
    { question: 'Is my shipment insured during transit?', answer: 'Yes, all shipments booked through TransportSeva are covered under our standard transit insurance, with optional additional coverage available for high-value goods.', open: false },
  ]);
}
