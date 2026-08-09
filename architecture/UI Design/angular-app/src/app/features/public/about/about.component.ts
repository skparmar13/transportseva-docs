import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  protected readonly values = signal([
    { icon: 'i-target', title: 'Mission Driven', desc: 'We exist to make freight movement transparent and reliable for every business, big or small.' },
    { icon: 'i-shield', title: 'Trust & Safety', desc: 'Verified transporters, insured shipments and secure payments — always.' },
    { icon: 'i-users', title: 'Customer First', desc: 'Every feature we build starts with a real problem faced by our customers.' },
    { icon: 'i-trending-up', title: 'Constant Innovation', desc: 'AI-driven route optimization and smarter pricing, shipped every month.' },
  ]);
  protected readonly team = signal([
    { initials: 'RK', name: 'Rajesh Kumar', role: 'Co-founder & CEO' },
    { initials: 'SP', name: 'Sunita Pillai', role: 'Co-founder & COO' },
    { initials: 'AV', name: 'Aman Verma', role: 'Chief Technology Officer' },
    { initials: 'NM', name: 'Neha Mehta', role: 'Head of Customer Success' },
  ]);
}
