import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LocationSearchService } from '../../../core/services/location-search.service';
import { GeoLocation } from '../../../core/models/location.model';
import { take } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly cms = inject(CmsMockService);
  private readonly language = inject(LanguageService);
  private readonly locationSearch = inject(LocationSearchService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly managedPage = computed(() => this.cms.publishedPage('Contact page', this.language.lang() === 'hi' ? 'Hindi' : 'English'));
  protected readonly contactMapUrl = signal<SafeResourceUrl | null>(null);
  protected readonly contactMapLoading = signal(true);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.locationSearch.search('123 Logistics Park, Sector 62, Noida, Uttar Pradesh, 201309').pipe(take(1)).subscribe({
      next: (locations) => {
        const location = locations[0];
        if (location) {
          const pad = 0.008;
          const bbox = [location.longitude - pad, location.latitude - pad, location.longitude + pad, location.latitude + pad].join(',');
          const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${location.latitude},${location.longitude}`;
          this.contactMapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        }
        this.contactMapLoading.set(false);
      },
      error: () => this.contactMapLoading.set(false),
    });
    this.seo.update({
      title: 'Contact TransportSeva | Support, Sales & Partnerships',
      description:
        'Get in touch with TransportSeva for shipment support, sales queries or partnership requests. 24x7 support desk and quick response from our team across India.',
      url: '/contact',
    });
  }

  protected readonly fullName = signal('');
  protected readonly phone = signal('');
  protected readonly email = signal('');
  protected readonly subject = signal('General Inquiry');
  protected readonly message = signal('');
  protected readonly submitted = signal(false);

  protected submit(): void {
    this.submitted.set(true);
    this.fullName.set('');
    this.phone.set('');
    this.email.set('');
    this.subject.set('General Inquiry');
    this.message.set('');
  }
}
