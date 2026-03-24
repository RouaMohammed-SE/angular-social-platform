import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/user/user.service';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { User } from '../../../core/models/user.interface';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { AvatarPhotoPipe } from '../../pipes/avatar-photo.pipe';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, ClickOutsideDirective, AvatarPhotoPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user: User | null = null;
  unreadCount: number = 0;
  showDropdown: boolean = false;

  ngOnInit() {
    this.user = this.userService.getCachedMyProfile();
    this.loadUserProfile();
    this.notificationsService.unreadCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => {
        this.unreadCount = count;
      });
    this.loadUnreadCount();
  }

  private loadUserProfile() {
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.data.user;
        }
      },
    });
  }

  private loadUnreadCount() {
    this.notificationsService.getUnreadCount().subscribe({
      next: (response) => {
        if (response.success) {
          this.unreadCount = response.data.unreadCount;
        }
      },
    });
  }

  toggleDropdown(event?: MouseEvent) {
    event?.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  navigateToProfile() {
    this.closeDropdown();
    this.router.navigate(['/profile']);
  }

  navigateToSettings() {
    this.closeDropdown();
    this.router.navigate(['/changePassword']);
  }

  logout() {
    this.authService.clearToken();
    this.closeDropdown();
    this.router.navigate(['/login']);
  }
}
