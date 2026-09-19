import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { SeoService } from '../../../core/seo/seo.service';
import { CmsMockService } from '../../../core/services/cms-mock.service';
import { LanguageService } from '../../../core/i18n/language.service';

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
  protected readonly managedPage = computed(() => this.cms.publishedPage('Contact page', this.language.lang() === 'hi' ? 'Hindi' : 'English'));

  ngOnInit(): void {
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
