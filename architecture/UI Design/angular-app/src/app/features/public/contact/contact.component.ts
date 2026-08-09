import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
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
