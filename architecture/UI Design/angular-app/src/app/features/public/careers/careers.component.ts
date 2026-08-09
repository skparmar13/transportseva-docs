import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './careers.component.html',
  styleUrl: './careers.component.scss',
})
export class CareersComponent {
  protected readonly perks = signal([
    { icon: 'i-heart', title: 'Health Insurance', desc: 'Comprehensive medical cover for you and your family.' },
    { icon: 'i-award', title: 'Performance Bonus', desc: 'Quarterly bonuses tied to company and individual goals.' },
    { icon: 'i-coffee', title: 'Flexible Hours', desc: 'Hybrid work options with flexible working hours.' },
    { icon: 'i-trending-up', title: 'Learning Budget', desc: 'Annual budget for courses, books and conferences.' },
  ]);
  protected readonly jobs = signal([
    { title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Noida', type: 'Full-time' },
    { title: 'Product Manager - Fleet Ops', dept: 'Product', location: 'Noida', type: 'Full-time' },
    { title: 'Regional Sales Manager - North', dept: 'Sales', location: 'Delhi NCR', type: 'Full-time' },
    { title: 'Customer Support Executive', dept: 'Operations', location: 'Remote', type: 'Full-time' },
    { title: 'UI/UX Designer', dept: 'Design', location: 'Noida', type: 'Full-time' },
    { title: 'Data Analyst - Logistics', dept: 'Data & Analytics', location: 'Bengaluru', type: 'Full-time' },
  ]);
}
