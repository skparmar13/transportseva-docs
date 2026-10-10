import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

interface CalendarDay {
  date: Date;
  day: number;
  iso: string;
  currentMonth: boolean;
  disabled: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modern-date-picker">
      <button type="button" class="date-trigger" [class.has-value]="value" [attr.aria-expanded]="open()" aria-haspopup="dialog" (click)="toggle()">
        <app-icon name="i-calendar" [size]="18" />
        <span>{{ displayValue() || placeholder }}</span>
        <app-icon name="i-chevron" [size]="16" class="date-trigger-chevron" />
      </button>
      @if (open()) {
        <div class="calendar-popover" role="dialog" aria-label="Choose a date">
          <div class="calendar-header">
            <button type="button" class="calendar-nav" aria-label="Previous month" [disabled]="previousDisabled()" (click)="moveMonth(-1)"><app-icon name="i-arrow-left" [size]="16" /></button>
            <div class="calendar-month">{{ monthLabel() }}</div>
            <button type="button" class="calendar-nav" aria-label="Next month" (click)="moveMonth(1)"><app-icon name="i-arrow-right" [size]="16" /></button>
          </div>
          <div class="calendar-weekdays" aria-hidden="true">
            @for (weekday of weekdays; track weekday) { <span>{{ weekday }}</span> }
          </div>
          <div class="calendar-grid">
            @for (cell of days(); track cell.iso) {
              <button type="button" class="calendar-day" [class.outside-month]="!cell.currentMonth" [class.selected]="cell.selected" [class.today]="cell.iso === todayIso" [disabled]="cell.disabled" [attr.aria-label]="cell.iso" [attr.aria-pressed]="cell.selected" (click)="select(cell)">{{ cell.day }}</button>
            }
          </div>
          <div class="calendar-footer">
            <button type="button" class="calendar-clear" [disabled]="!value" (click)="clear()">Clear</button>
            <button type="button" class="calendar-today" (click)="selectToday()">Today</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display:block; width:100%; }
    .modern-date-picker { position:relative; width:100%; }
    .date-trigger { width:100%; min-height:48px; display:flex; align-items:center; gap:10px; padding:0 14px; border:1px solid var(--color-border, #e5e7eb); border-radius:10px; background:var(--color-surface, #fff); color:var(--color-text-muted, #9ca3af); font:inherit; text-align:left; cursor:pointer; transition:border-color .18s, box-shadow .18s; }
    .date-trigger:hover, .date-trigger:focus-visible { border-color:var(--color-primary, #ff5a00); box-shadow:0 0 0 3px rgba(255,90,0,.1); outline:none; }
    .date-trigger.has-value { color:var(--color-text, #172033); }
    .date-trigger-chevron { margin-left:auto; opacity:.55; transition:transform .18s; }
    .date-trigger[aria-expanded="true"] .date-trigger-chevron { transform:rotate(180deg); }
    .calendar-popover { position:absolute; z-index:30; top:calc(100% + 8px); left:0; width:292px; padding:14px; border:1px solid #eceff3; border-radius:16px; background:#fff; box-shadow:0 16px 40px rgba(18, 26, 38, .16); }
    .calendar-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .calendar-month { font-size:15px; font-weight:700; color:#172033; }
    .calendar-nav { width:32px; height:32px; display:grid; place-items:center; border:0; border-radius:8px; background:transparent; color:#526071; cursor:pointer; }
    .calendar-nav:hover:not(:disabled) { background:#fff2ea; color:#f15a0a; }
    .calendar-nav:disabled { opacity:.3; cursor:not-allowed; }
    .calendar-weekdays, .calendar-grid { display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; }
    .calendar-weekdays { margin-bottom:6px; color:#8b95a3; font-size:11px; font-weight:700; text-align:center; text-transform:uppercase; }
    .calendar-day { width:32px; height:32px; border:0; border-radius:9px; background:transparent; color:#263244; font:inherit; font-size:13px; cursor:pointer; }
    .calendar-day:hover:not(:disabled) { background:#fff0e8; color:#ed5708; }
    .calendar-day.outside-month { color:#b7bec8; }
    .calendar-day:disabled { color:#d2d6dc; cursor:not-allowed; }
    .calendar-day.today { box-shadow:inset 0 0 0 1px #ff6a1a; }
    .calendar-day.selected { background:#ff5b0a; color:#fff; font-weight:700; box-shadow:none; }
    .calendar-footer { display:flex; justify-content:space-between; margin-top:12px; padding-top:11px; border-top:1px solid #f0f1f3; }
    .calendar-clear, .calendar-today { border:0; background:transparent; color:#f15a0a; font:inherit; font-size:12px; font-weight:700; cursor:pointer; }
    .calendar-clear:disabled { color:#b7bec8; cursor:not-allowed; }
  `],
})
export class DatePickerComponent {
  @Input() value = '';
  @Input() placeholder = 'DD/MM/YYYY';
  @Output() readonly valueChange = new EventEmitter<string>();

  protected readonly open = signal(false);
  private readonly viewMonth = signal(this.startOfMonth(new Date()));
  protected readonly todayIso = this.toIso(new Date());
  protected readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  protected readonly monthLabel = computed(() => this.viewMonth().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }));

  constructor(private readonly element: ElementRef<HTMLElement>) {}

  protected displayValue(): string {
    if (!this.value) return '';
    const date = this.parseIso(this.value);
    return date ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}` : this.value;
  }

  protected days(): CalendarDay[] { return this.buildDays(this.viewMonth()); }

  protected toggle(): void { this.open.update(value => !value); }
  protected moveMonth(offset: number): void { const date = this.viewMonth(); this.viewMonth.set(new Date(date.getFullYear(), date.getMonth() + offset, 1)); }
  protected previousDisabled(): boolean { return this.viewMonth().getTime() <= this.startOfMonth(new Date()).getTime(); }
  protected select(cell: CalendarDay): void { if (cell.disabled) return; this.valueChange.emit(cell.iso); this.open.set(false); }
  protected selectToday(): void { this.valueChange.emit(this.todayIso); this.viewMonth.set(this.startOfMonth(new Date())); this.open.set(false); }
  protected clear(): void { this.valueChange.emit(''); this.open.set(false); }

  @HostListener('document:click', ['$event'])
  protected closeOnOutsideClick(event: MouseEvent): void { if (this.open() && !this.element.nativeElement.contains(event.target as Node)) this.open.set(false); }

  private buildDays(month: Date): CalendarDay[] {
    const year = month.getFullYear(); const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const count = new Date(year, monthIndex + 1, 0).getDate();
    const cells: CalendarDay[] = [];
    for (let index = 0; index < 42; index++) {
      const dayOffset = index - firstDay + 1;
      const date = new Date(year, monthIndex, dayOffset);
      const currentMonth = dayOffset > 0 && dayOffset <= count;
      cells.push({ date, day: date.getDate(), iso: this.toIso(date), currentMonth, disabled: date.getTime() < this.startOfDay(new Date()).getTime(), selected: this.toIso(date) === this.value });
    }
    return cells;
  }
  private parseIso(value: string): Date | null { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); return match ? new Date(+match[1], +match[2] - 1, +match[3]) : null; }
  private toIso(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  private startOfDay(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
  private startOfMonth(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), 1); }
}
