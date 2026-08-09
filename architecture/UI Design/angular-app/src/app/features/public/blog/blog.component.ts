import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  protected readonly posts = signal([
    { tag: 'Industry', date: '12 Jan 2026', author: 'Neha Mehta', readTime: '6 min read', title: 'How AI is Transforming Freight Route Optimization in India', desc: 'Discover how machine learning models are helping transporters cut fuel costs and delivery times across major freight corridors.' },
    { tag: 'Company News', date: '02 Jan 2026', author: 'Rajesh Kumar', readTime: '4 min read', title: 'TransportSeva Crosses 12 Lakh Shipments Milestone', desc: 'A look back at the journey from a small Noida-based startup to a pan-India logistics platform trusted by thousands.' },
    { tag: 'Guides', date: '27 Dec 2025', author: 'Aman Verma', readTime: '8 min read', title: 'A Complete Guide to GST Invoicing for Transporters', desc: 'Everything fleet owners need to know about e-way bills, GST rates and digital invoicing for road freight.' },
    { tag: 'Product', date: '18 Dec 2025', author: 'Sunita Pillai', readTime: '3 min read', title: 'Introducing Live Slot-based Booking for Full Truck Loads', desc: 'Book a dedicated truck for your exact pickup window with our new slot-based scheduling system.' },
    { tag: 'Industry', date: '05 Dec 2025', author: 'Neha Mehta', readTime: '5 min read', title: 'Why Digital Proof of Delivery is a Game-Changer for SMEs', desc: 'How e-PODs reduce disputes, speed up payments and improve trust between shippers and transporters.' },
    { tag: 'Guides', date: '22 Nov 2025', author: 'Rajesh Kumar', readTime: '6 min read', title: 'Choosing Between Full Truck Load and Part Load Shipping', desc: 'A practical comparison to help you pick the most cost-effective shipping method for your business.' },
  ]);
}
