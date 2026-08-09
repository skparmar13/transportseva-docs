import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Thin wrapper around `<use>` referencing the shared sprite defined in
 * IconSpriteComponent, so templates can write:
 *   <app-icon name="i-grid" />
 * instead of repeating the raw SVG markup everywhere.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="icon" [class]="className" [attr.width]="size" [attr.height]="size" aria-hidden="true">
      <use [attr.href]="'#' + name"></use>
    </svg>
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 22;
  @Input() className = '';
}
