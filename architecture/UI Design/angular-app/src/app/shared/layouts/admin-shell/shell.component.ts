import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { SessionService } from '../../../core/services/session.service';
import { CommunicationMockService } from '../../../core/services/communication-mock.service';
import { NotificationCategory } from '../../../core/models/communication.model';
import { LanguageService, TranslatePipe } from '../../../core/i18n';
import { NavItem } from '../../../core/models/nav.model';

const CATEGORY_ICON: Record<NotificationCategory, string> = {
  Booking: 'i-box',
  Payment: 'i-credit-card',
  Trip: 'i-route',
  Document: 'i-doc',
  System: 'i-info',
};

/**
 * Single shared shell reused by every portal (Admin, Shipper,
 * Transporter, Truck Owner, Company, Driver). The sidebar/topbar
 * markup mirrors the existing HTML prototype's `.admin-shell` /
 * `.sidebar` / `.topbar` classes 1:1 (see Website/admin/index.html)
 * so styling stays pixel-consistent; only the nav data changes based
 * on the active `PortalConfig` from SessionService.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent, UpperCasePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  protected readonly language = inject(LanguageService);

  constructor(
    private readonly sessionSvc: SessionService,
    private readonly router: Router,
    protected readonly comms: CommunicationMockService,
  ) {}

  protected readonly portal = computed(() => this.sessionSvc.portal());
  protected readonly user = computed(() => this.sessionSvc.user());

  protected readonly categoryIcon = CATEGORY_ICON;
  protected readonly showBellDropdown = signal(false);
  protected readonly sidebarOpen = signal(false);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly searchOpen = signal(false);
  protected readonly searchResults = computed(() => {
    this.language.lang();
    const term = this.searchTerm().trim().toLocaleLowerCase();
    if (!term) return [];
    return this.portal().nav.flatMap((section) => section.items)
      .filter((item) => !item.planned && `${this.language.translate(item.labelKey)} ${item.path}`.toLocaleLowerCase().includes(term))
      .slice(0, 8);
  });

  protected toggleSidebar(): void {
    if (window.matchMedia('(max-width: 900px)').matches) {
      this.sidebarCollapsed.set(false);
      this.sidebarOpen.update((v) => !v);
    }
    else this.sidebarCollapsed.update((v) => !v);
  }

  protected isSidebarExpanded(): boolean {
    return window.matchMedia('(max-width: 900px)').matches ? this.sidebarOpen() : !this.sidebarCollapsed();
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected navigateToSearchResult(item: NavItem): void {
    this.searchOpen.set(false);
    this.searchTerm.set('');
    this.router.navigate([this.portal().basePath, item.path]);
  }

  protected handleSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.searchOpen.set(false);
      this.searchTerm.set('');
    } else if (event.key === 'Enter' && this.searchResults().length) {
      event.preventDefault();
      this.navigateToSearchResult(this.searchResults()[0]);
    }
  }

  @HostListener('document:click', ['$event'])
  protected closeSearchOutside(event: MouseEvent): void {
    if (!(event.target as HTMLElement | null)?.closest('.topbar-search')) this.searchOpen.set(false);
  }

  protected logout(): void {
    this.closeSidebar();
    this.closeBellDropdown();
    this.searchTerm.set('');
    const isPlatformStaff = this.sessionSvc.platformStaff() !== null;
    this.sessionSvc.clearPlatformStaff();
    this.sessionSvc.setRole('admin');
    this.router.navigate([isPlatformStaff ? '/auth/staff/login' : '/auth/login']);
  }

  protected toggleBellDropdown(): void {
    this.showBellDropdown.update((v) => !v);
  }

  protected closeBellDropdown(): void {
    this.showBellDropdown.set(false);
  }

  protected markRead(id: string): void {
    this.comms.markNotificationRead(id);
  }

  protected viewAllNotifications(): void {
    this.closeBellDropdown();
    this.router.navigate([this.portal().basePath, 'notifications']);
  }
}
