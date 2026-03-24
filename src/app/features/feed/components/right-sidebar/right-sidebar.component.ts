import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { User } from '../../../../core/models/user.interface';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { UserService } from '../../../../core/services/user/user.service';

@Component({
  selector: 'app-right-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './right-sidebar.component.html',
  styleUrl: './right-sidebar.component.css',
})
export class RightSidebarComponent {
  private readonly userService = inject(UserService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly fallbackPhoto = '/assets/images/app/default-male-profile.png';

  protected suggestions: User[] = [];
  protected searchTerm = '';
  protected isLoading = true;
  protected isFollowingUserId: string | null = null;
  protected followedUserIds = new Set<string>();

  protected get filteredSuggestions(): User[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.suggestions;
    }

    return this.suggestions.filter((user) => {
      const username = user.username?.toLowerCase() ?? '';
      return user.name.toLowerCase().includes(term) || username.includes(term);
    });
  }

  protected get visibleSuggestions(): User[] {
    return this.filteredSuggestions.slice(0, 5);
  }

  protected get hasMoreSuggestions(): boolean {
    return this.filteredSuggestions.length > this.visibleSuggestions.length;
  }

  constructor() {
    this.loadSuggestions();
  }

  protected onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  protected clearSearch(): void {
    this.searchTerm = '';
  }

  protected followUser(userId: string): void {
    if (this.isFollowingUserId || this.isFollowed(userId)) {
      return;
    }

    this.isFollowingUserId = userId;

    this.userService.followUnfollow(userId)
      .pipe(finalize(() => {
        this.isFollowingUserId = null;
      }))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.followedUserIds = new Set(this.followedUserIds).add(userId);
            this.alert.success('Followed', 'This account was added to your network.');
            this.removeSuggestionAfterFollow(userId);
          }
        },
        error: () => {
          this.alert.error('Follow failed', 'We could not follow this user right now.');
        },
      });
  }

  protected goToSuggestionsPage(): void {
    this.router.navigate(['/suggestions']);
  }

  protected isFollowing(userId: string): boolean {
    return this.isFollowingUserId === userId;
  }

  protected isFollowed(userId: string): boolean {
    return this.followedUserIds.has(userId);
  }

  protected getSuggestionPhoto(user: User): string {
    return user.photo?.trim() || this.fallbackPhoto;
  }

  private loadSuggestions(): void {
    this.isLoading = true;

    this.userService.getFollowSuggestion(1, 12).subscribe({
      next: (response) => {
        if (response.success) {
          this.suggestions = response.data.suggestions;
        }

        this.isLoading = false;
      },
      error: () => {
        this.suggestions = [];
        this.isLoading = false;
      },
    });
  }

  private removeSuggestionAfterFollow(userId: string): void {
    window.setTimeout(() => {
      this.suggestions = this.suggestions.filter((user) => user._id !== userId);
      const nextIds = new Set(this.followedUserIds);
      nextIds.delete(userId);
      this.followedUserIds = nextIds;
    }, 700);
  }
}
