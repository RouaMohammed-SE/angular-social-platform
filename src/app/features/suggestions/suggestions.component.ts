import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertService } from '../../core/services/alert/alert.service';
import { User } from '../../core/models/user.interface';
import { UserService } from '../../core/services/user/user.service';

@Component({
  selector: 'app-suggestions',
  imports: [CommonModule, RouterLink],
  templateUrl: './suggestions.component.html',
  styleUrl: './suggestions.component.css',
})
export class SuggestionsComponent {
  private readonly location = inject(Location);
  private readonly userService = inject(UserService);
  private readonly alert = inject(AlertService);
  private readonly fallbackPhoto = '/assets/images/app/default-male-profile.png';

  private page = 1;
  private readonly limit = 20;

  protected suggestions: User[] = [];
  protected searchTerm = '';
  protected isLoading = true;
  protected isLoadingMore = false;
  protected hasMore = true;
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

  constructor() {
    this.loadSuggestions(true);
  }

  protected goBack(): void {
    this.location.back();
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

  protected loadMore(): void {
    if (!this.hasMore || this.isLoadingMore) {
      return;
    }

    this.page += 1;
    this.loadSuggestions(false);
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

  private loadSuggestions(reset: boolean): void {
    if (reset) {
      this.isLoading = true;
      this.page = 1;
    } else {
      this.isLoadingMore = true;
    }

    this.userService.getFollowSuggestion(this.page, this.limit).subscribe({
      next: (response) => {
        const incomingSuggestions = response.data.suggestions;

        this.suggestions = reset ? incomingSuggestions : [...this.suggestions, ...incomingSuggestions];

        const pagination = response.meta?.pagination;
        if (pagination) {
          this.hasMore = pagination.currentPage < pagination.numberOfPages;
        } else {
          this.hasMore = incomingSuggestions.length === this.limit;
        }

        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: () => {
        if (reset) {
          this.suggestions = [];
        }

        this.hasMore = false;
        this.isLoading = false;
        this.isLoadingMore = false;
        this.alert.error('Suggestions failed', 'We could not load suggestions right now.');
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
