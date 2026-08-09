import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Friendly placeholder shown for sidebar links that belong to a
 * module not yet built in this sprint (see project IA — modules are
 * delivered incrementally). Keeps every nav link clickable instead
 * of 404-ing while the prototype is still being assembled.
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <app-icon name="i-layers" />
      <h3>{{ title }}</h3>
      <p>This screen is on our roadmap and will be designed in an upcoming sprint.</p>
    </div>
  `,
})
export class ComingSoonComponent {
  @Input() title = 'Coming Soon';
}
