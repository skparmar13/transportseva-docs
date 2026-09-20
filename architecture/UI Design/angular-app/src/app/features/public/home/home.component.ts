import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { computed } from '@angular/core';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { MarketplaceMockService } from '../../../core/services/marketplace-mock.service';
import { Load } from '../../../core/models/marketplace.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly cms = inject(CmsMockService);
  private readonly language = inject(LanguageService);
  private readonly marketplace = inject(MarketplaceMockService);
  protected readonly sourceQuery = signal('');
  protected readonly destinationQuery = signal('');
  protected readonly vehicleTypeFilter = signal('All');
  protected readonly previewLimit = signal(10);
  protected readonly publicVehicleTypes = computed(() => [...new Set(this.publicLoads().map((load) => load.vehicleType))].sort());
  protected readonly publicLoads = computed(() => this.marketplace.loads()
    .filter((load) => load.status === 'Open' || load.status === 'Applications Received')
    .sort((a, b) => this.postedMinutesAgo(a.postedAgo) - this.postedMinutesAgo(b.postedAgo)));
  protected readonly visiblePublicLoads = computed(() => {
    const source = this.sourceQuery().trim().toLowerCase();
    const destination = this.destinationQuery().trim().toLowerCase();
    const vehicle = this.vehicleTypeFilter();
    return this.publicLoads().filter((load) => load.pickupCity.toLowerCase().includes(source)
      && load.dropCity.toLowerCase().includes(destination)
      && (vehicle === 'All' || load.vehicleType === vehicle)).slice(0, this.previewLimit());
  });

  ngOnInit(): void {
    this.seo.update({
      title: "TransportSeva | India's Trusted Transport & Logistics Platform",
      description:
        'Book, track and manage shipments in real-time with TransportSeva — connecting shippers, transporters, truck owners and drivers on one platform across India.',
      url: '/',
    });
    this.seo.setJsonLd('org-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TransportSeva',
      url: 'https://www.transportseva.com',
      logo: 'https://www.transportseva.com/images/logo.png',
    });
  }

  protected readonly stats = signal([
    { icon: 'i-users', value: '10,000+', labelKey: 'stats.happyCustomers' },
    { icon: 'i-truck', value: '50,000+', labelKey: 'stats.shipmentsDelivered' },
    { icon: 'i-users', value: '500+', labelKey: 'stats.transportPartners' },
    { icon: 'i-map', value: '20+', labelKey: 'stats.statesCovered' },
    { icon: 'i-percent', value: '99.5%', labelKey: 'stats.onTimeDelivery' },
  ]);
  protected readonly services = signal([
    { icon: 'i-truck', titleKey: 'services.fullTruckLoad.title', descKey: 'services.fullTruckLoad.desc' },
    { icon: 'i-box', titleKey: 'services.partLoad.title', descKey: 'services.partLoad.desc' },
    { icon: 'i-send', titleKey: 'services.parcelDelivery.title', descKey: 'services.parcelDelivery.desc' },
    { icon: 'i-home', titleKey: 'services.warehousing.title', descKey: 'services.warehousing.desc' },
    { icon: 'i-globe', titleKey: 'services.freightForwarding.title', descKey: 'services.freightForwarding.desc' },
    { icon: 'i-truck2', titleKey: 'services.fleetManagement.title', descKey: 'services.fleetManagement.desc' },
    { icon: 'i-pin', titleKey: 'services.gpsTracking.title', descKey: 'services.gpsTracking.desc' },
    { icon: 'i-shield', titleKey: 'services.insurance.title', descKey: 'services.insurance.desc' },
  ]);
  protected readonly whyItems = signal(['why.item1', 'why.item2', 'why.item3', 'why.item4', 'why.item5', 'why.item6', 'why.item7', 'why.item8']);
  protected readonly steps = signal([
    { number: '1', titleKey: 'how.step1.title', descKey: 'how.step1.desc' },
    { number: '2', titleKey: 'how.step2.title', descKey: 'how.step2.desc' },
    { number: '3', titleKey: 'how.step3.title', descKey: 'how.step3.desc' },
    { number: '4', titleKey: 'how.step4.title', descKey: 'how.step4.desc' },
    { number: '5', titleKey: 'how.step5.title', descKey: 'how.step5.desc' },
    { number: '6', titleKey: 'how.step6.title', descKey: 'how.step6.desc' },
    { number: '7', titleKey: 'how.step7.title', descKey: 'how.step7.desc' },
    { number: '8', titleKey: 'how.step8.title', descKey: 'how.step8.desc' },
  ]);
  protected readonly mobileItems = signal(['mobile.item1', 'mobile.item2', 'mobile.item3', 'mobile.item4', 'mobile.item5']);
  private readonly defaultTestimonials = [
    { textKey: 'testi1.text', name: 'Rakesh Sharma', roleKey: 'testi1.role', text: '', role: '' },
    { textKey: 'testi2.text', name: 'Vikram Singh', roleKey: 'testi2.role', text: '', role: '' },
    { textKey: 'testi3.text', name: 'Neha Verma', roleKey: 'testi3.role', text: '', role: '' },
  ];
  protected readonly testimonials = computed(() => {
    const selectedLanguage = this.language.lang() === 'hi' ? 'Hindi' : 'English';
    const managed = this.cms.publishedTestimonials().filter((item) => item.language === selectedLanguage);
    return managed.length || selectedLanguage === 'English'
      ? managed.map((item) => ({ name: item.author || item.title, role: item.attribution || item.summary, text: item.body, textKey: '', roleKey: '' }))
      : this.defaultTestimonials;
  });
  protected readonly partners = signal(['TATA MOTORS', 'ASHOK LEYLAND', 'mahindra', 'Castrol', 'FASTag', 'ICICI Lombard']);

  protected setPreviewLimit(value: string): void { this.previewLimit.set(Number(value) === 20 ? 20 : 10); }
  protected loadBudget(load: Load): string { return load.budget; }

  private postedMinutesAgo(value: string): number {
    if (/just now/i.test(value)) return 0;
    const match = value.match(/(\d+)\s*(minute|hour|day)/i);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const count = Number(match[1]);
    return match[2].toLowerCase().startsWith('minute') ? count : match[2].toLowerCase().startsWith('hour') ? count * 60 : count * 1440;
  }
}
