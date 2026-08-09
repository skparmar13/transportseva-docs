import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss',
})
export class BlogPostComponent {
  protected readonly relatedPosts = signal([
    { tag: 'Guides', date: '27 Dec 2025', title: 'A Complete Guide to GST Invoicing for Transporters' },
    { tag: 'Product', date: '18 Dec 2025', title: 'Introducing Live Slot-based Booking for Full Truck Loads' },
    { tag: 'Industry', date: '05 Dec 2025', title: 'Why Digital Proof of Delivery is a Game-Changer for SMEs' },
  ]);
}
