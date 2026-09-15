import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Lightweight, dependency-free modal dialog shared across the
 * prototype (Apply for Load, Accept/Reject confirmations, Booking
 * Confirmation, etc.). Deliberately plain CSS (see `.modal-*` in
 * _base.scss) to match the rest of the ported design system rather
 * than pulling in Angular Material's dialog styling.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div #dialog class="modal-panel" [class.modal-lg]="large" role="dialog" aria-modal="true" [attr.aria-labelledby]="title ? 'modal-title' : null" tabindex="-1">
        <div class="modal-head">
          <h3 id="modal-title">{{ title }}</h3>
          <button type="button" class="modal-close" (click)="close.emit()" aria-label="Close">
            <app-icon name="i-plus" [size]="16" className="icon-rotate-45" />
          </button>
        </div>
        <div class="modal-body">
          <ng-content />
        </div>
        @if (showFooter) {
          <div class="modal-foot">
            <ng-content select="[modal-footer]" />
          </div>
        }
      </div>
    </div>
  `,
})
export class ModalComponent implements AfterViewInit {
  @ViewChild('dialog') private readonly dialog?: ElementRef<HTMLElement>;
  @Input() title = '';
  @Input() large = false;
  @Input() showFooter = true;
  @Output() close = new EventEmitter<void>();

  ngAfterViewInit(): void {
    queueMicrotask(() => this.dialog?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
