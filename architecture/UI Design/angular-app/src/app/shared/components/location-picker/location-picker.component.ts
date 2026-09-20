import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { GeoLocation } from '../../../core/models/location.model';
import { LocationSearchService } from '../../../core/services/location-search.service';
import { TranslatePipe } from '../../../core/i18n';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './location-picker.component.html',
})
export class LocationPickerComponent {
  private readonly searchService = inject(LocationSearchService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTerms = new Subject<string>();

  @Input({ required: true }) id = '';
  @Input({ required: true }) name = '';
  @Input() labelKey = '';
  @Input() placeholderKey = '';
  @Input() value = '';
  @Input() suggestionsAbove = false;
  @Output() readonly valueChange = new EventEmitter<string>();
  @Output() readonly locationSelected = new EventEmitter<GeoLocation | null>();

  protected readonly query = signal('');
  protected readonly suggestions = signal<GeoLocation[]>([]);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly isOpen = signal(false);

  constructor() {
    this.searchTerms.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query.trim().length < 3) {
          this.loading.set(false);
          return of([] as GeoLocation[]);
        }
        this.loading.set(true);
        this.failed.set(false);
        return this.searchService.search(query).pipe(catchError(() => {
          this.failed.set(true);
          return of([] as GeoLocation[]);
        }));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((locations) => {
      this.suggestions.set(locations);
      this.loading.set(false);
      this.isOpen.set(this.query().trim().length >= 3);
    });
  }

  ngOnChanges(): void {
    this.query.set(this.value ?? '');
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.valueChange.emit(value);
    this.locationSelected.emit(null);
    this.failed.set(false);
    this.suggestions.set([]);
    this.isOpen.set(value.trim().length >= 3);
    this.loading.set(value.trim().length >= 3);
    this.searchTerms.next(value);
  }

  protected select(location: GeoLocation): void {
    this.query.set(location.label);
    this.valueChange.emit(location.label);
    this.locationSelected.emit(location);
    this.suggestions.set([]);
    this.isOpen.set(false);
  }

  protected closeSuggestions(): void {
    this.isOpen.set(false);
  }
}
