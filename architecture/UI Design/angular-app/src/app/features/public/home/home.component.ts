import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly stats = signal([
    { icon: 'i-users', value: '10,000+', label: 'Happy Customers' },
    { icon: 'i-truck', value: '50,000+', label: 'Shipments Delivered' },
    { icon: 'i-users', value: '500+', label: 'Transport Partners' },
    { icon: 'i-map', value: '20+', label: 'States Covered' },
    { icon: 'i-percent', value: '99.5%', label: 'On-time Delivery' },
  ]);
  protected readonly services = signal([
    { icon: 'i-truck', title: 'Full Truck Load', desc: 'Dedicated trucks for large shipments across India.' },
    { icon: 'i-box', title: 'Part Load', desc: 'Cost-effective solutions for smaller shipments and shared loads.' },
    { icon: 'i-send', title: 'Parcel Delivery', desc: 'Fast and reliable parcel delivery across India.' },
    { icon: 'i-home', title: 'Warehousing', desc: 'Secure storage and inventory management solutions.' },
    { icon: 'i-globe', title: 'Freight Forwarding', desc: 'International and domestic freight forwarding solutions.' },
    { icon: 'i-truck2', title: 'Fleet Management', desc: 'Manage your fleet, drivers and operations seamlessly.' },
    { icon: 'i-pin', title: 'GPS Tracking', desc: 'Real-time tracking with live updates and alerts.' },
    { icon: 'i-shield', title: 'Insurance & Safety', desc: 'Comprehensive insurance coverage for your shipments.' },
  ]);
  protected readonly whyItems = signal(['Live GPS Tracking', 'Digital POD', 'Verified Transporters', 'Online Payments', 'Lowest Freight Rates', 'GST Invoices', 'AI Route Optimization', '24x7 Support']);
  protected readonly steps = signal([
    { number: '1', title: 'Register', desc: 'Create your free account' },
    { number: '2', title: 'Search Vehicle', desc: 'Find the best vehicle for your load' },
    { number: '3', title: 'Book Shipment', desc: 'Enter details and confirm booking' },
    { number: '4', title: 'Driver Pickup', desc: 'Driver reaches pickup location' },
    { number: '5', title: 'Live Tracking', desc: 'Track your shipment in real-time' },
    { number: '6', title: 'Delivery', desc: 'Shipment delivered safely' },
    { number: '7', title: 'Digital POD', desc: 'Get digital proof of delivery' },
    { number: '8', title: 'Payment', desc: 'Payment released securely' },
  ]);
  protected readonly mobileItems = signal([
    'Book and manage shipments anytime, anywhere',
    'Real-time tracking and status updates',
    'Instant notifications and alerts',
    'Digital documents and invoices',
    'Multiple payment options',
  ]);
  protected readonly testimonials = signal([
    { text: 'TransportSeva has simplified our logistics operations. Real-time tracking and transparent pricing help us deliver better to our customers.', name: 'Rakesh Sharma', role: 'Logistics Manager, ABC Pvt. Ltd.' },
    { text: 'Excellent platform for transporters. We get good loads regularly and payments are always on time.', name: 'Vikram Singh', role: 'Fleet Owner' },
    { text: 'The best part is the live tracking and digital POD. It gives us complete visibility and peace of mind.', name: 'Neha Verma', role: 'Supply Chain Head, XYZ Corp.' },
  ]);
  protected readonly partners = signal(['TATA MOTORS', 'ASHOK LEYLAND', 'mahindra', 'Castrol', 'FASTag', 'ICICI Lombard']);
}
