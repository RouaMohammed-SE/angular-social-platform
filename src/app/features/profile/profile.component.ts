import { CommonModule, DatePipe, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Post } from '../../core/models/post.interface';
import { User } from '../../core/models/user.interface';
import { AlertService } from '../../core/services/alert/alert.service';
import { UserService } from '../../core/services/user/user.service';

type ProfileTab = 'posts' | 'saved';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly alert = inject(AlertService);
  private readonly userService = inject(UserService);

  protected currentUser: User | null = this.userService.getCachedMyProfile();
  protected profileUser: User | null = this.currentUser;
  protected posts: Post[] = [];
  protected savedPosts: Post[] = [];
  protected isLoadingProfile = true;
  protected isLoadingPosts = true;
  protected isLoadingSaved = false;
  protected isUpdatingFollow = false;
  protected isUploadingPhoto = false;
  protected isUploadingCover = false;
  protected isDeletingCover = false;
  protected isFollowing = false;
  protected activeTab: ProfileTab = 'posts';
  protected viewedUserId: string | null = null;
  protected viewerImageUrl: string | null = null;
  protected viewerImageAlt = '';
  protected viewerImageLabel = '';

  protected get currentUserId(): string | null {
    const user = this.currentUser;
    return user ? user.id ?? user._id : null;
  }

  protected get profileUserId(): string | null {
    const user = this.profileUser;
    return user ? user.id ?? user._id : null;
  }

  protected get isOwnProfile(): boolean {
    const viewedUserId = this.viewedUserId;
    const currentUserId = this.currentUserId;

    if (!viewedUserId) {
      return true;
    }

    return !!currentUserId && currentUserId === viewedUserId;
  }

  protected get visiblePosts(): Post[] {
    return this.activeTab === 'saved' ? this.savedPosts : this.posts;
  }

  protected get visibleCount(): number {
    return this.activeTab === 'saved' ? this.savedPosts.length : this.posts.length;
  }

  protected get followersPreview(): User[] {
    return this.extractUsers(this.profileUser?.followers).slice(0, 6);
  }

  protected get followingPreview(): User[] {
    return this.extractUsers(this.profileUser?.following).slice(0, 6);
  }

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const userId = params.get('userId');
      this.viewedUserId = userId;
      this.activeTab = 'posts';
      this.posts = [];
      this.savedPosts = [];

      if (userId) {
        this.loadCurrentUser();
        this.loadOtherUserProfile(userId);
        return;
      }

      this.loadOwnProfile();
    });
  }

  protected goBack(): void {
    this.location.back();
  }

  protected openImageViewer(imageUrl: string | null | undefined, alt: string, label: string): void {
    const normalizedUrl = imageUrl?.trim();

    if (!normalizedUrl) {
      return;
    }

    this.viewerImageUrl = normalizedUrl;
    this.viewerImageAlt = alt;
    this.viewerImageLabel = label;
  }

  protected closeImageViewer(): void {
    this.viewerImageUrl = null;
    this.viewerImageAlt = '';
    this.viewerImageLabel = '';
  }

  protected setActiveTab(tab: ProfileTab): void {
    if (!this.isOwnProfile || this.activeTab === tab) {
      return;
    }

    this.activeTab = tab;

    if (tab === 'saved' && this.savedPosts.length === 0) {
      this.loadSavedPosts();
    }
  }

  protected toggleFollow(): void {
    const userId = this.profileUserId;

    if (!userId || this.isOwnProfile || this.isUpdatingFollow) {
      return;
    }

    this.isUpdatingFollow = true;

    this.userService.followUnfollow(userId)
      .pipe(finalize(() => {
        this.isUpdatingFollow = false;
      }))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            return;
          }

          this.isFollowing = response.data.following;
          if (this.profileUser) {
            this.profileUser = {
              ...this.profileUser,
              followersCount: response.data.followersCount,
            };
          }

          this.alert.success(
            response.data.following ? 'Following' : 'Unfollowed',
            response.data.following
              ? 'This user was added to your following list.'
              : 'This user was removed from your following list.',
          );
        },
        error: () => {
          this.alert.error('Action failed', 'We could not update the follow state right now.');
        },
      });
  }

  protected uploadProfilePhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file || !this.isOwnProfile || this.isUploadingPhoto) {
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    this.isUploadingPhoto = true;

    this.userService.uploadProfilePhoto(formData)
      .pipe(finalize(() => {
        this.isUploadingPhoto = false;
      }))
      .subscribe({
        next: (response) => {
          if (this.profileUser) {
            this.profileUser = {
              ...this.profileUser,
              photo: response.data.photo,
            };
          }
          this.syncCurrentUserCache();
          this.alert.success('Photo updated', 'Your profile photo was updated.');
        },
        error: () => {
          this.alert.error('Upload failed', 'We could not update your profile photo right now.');
        },
      });

    (event.target as HTMLInputElement).value = '';
  }

  protected uploadCover(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file || !this.isOwnProfile || this.isUploadingCover) {
      return;
    }

    const formData = new FormData();
    formData.append('cover', file);
    this.isUploadingCover = true;

    this.userService.updateUserCover(formData)
      .pipe(finalize(() => {
        this.isUploadingCover = false;
      }))
      .subscribe({
        next: (response) => {
          if (this.profileUser) {
            this.profileUser = {
              ...this.profileUser,
              cover: response.data.cover,
            };
          }
          this.syncCurrentUserCache();
          this.alert.success('Cover updated', 'Your cover photo was updated.');
        },
        error: () => {
          this.alert.error('Upload failed', 'We could not update your cover photo right now.');
        },
      });

    (event.target as HTMLInputElement).value = '';
  }

  protected removeCover(): void {
    if (!this.isOwnProfile || !this.profileUser?.cover || this.isDeletingCover) {
      return;
    }

    this.isDeletingCover = true;

    this.userService.deleteUserCover()
      .pipe(finalize(() => {
        this.isDeletingCover = false;
      }))
      .subscribe({
        next: () => {
          if (this.profileUser) {
            this.profileUser = {
              ...this.profileUser,
              cover: '',
            };
          }
          this.syncCurrentUserCache();
          this.alert.success('Cover removed', 'Your cover photo was removed.');
        },
        error: () => {
          this.alert.error('Remove failed', 'We could not remove your cover right now.');
        },
      });
  }

  protected getProfilePhoto(user: User | null | undefined): string {
    if (!user) {
      return '/assets/images/app/default-male-profile.png';
    }

    const photo = user.photo?.trim();
    if (photo && !photo.includes('default-profile.png')) {
      return photo;
    }

    return user.gender?.trim().toLowerCase() === 'female'
      ? '/assets/images/app/default-female-profile.jpg'
      : '/assets/images/app/default-male-profile.png';
  }

  protected getPreviewPhoto(user: User): string {
    return user.photo?.trim() || '/assets/images/app/default-male-profile.png';
  }

  protected getDisplayUsername(user: User | null | undefined): string {
    return `@${user?.username || 'route-user'}`;
  }

  protected getProfileBadgeText(_: User): string {
    if (this.isOwnProfile) {
      return 'Your space';
    }

    return this.isFollowing ? 'Following each other feed' : 'Discover this profile';
  }

  protected getProfileSummary(user: User): string {
    if (this.isOwnProfile) {
      return 'Manage your photo, cover, saved posts, and account details from one place.';
    }

    const followers = user.followersCount || 0;
    const following = user.followingCount || 0;

    return `${followers} follower${followers === 1 ? '' : 's'} - ${following} following`;
  }

  protected getCoverLabel(): string {
    return this.isUploadingCover ? 'Uploading...' : 'Update cover';
  }

  protected getPhotoLabel(): string {
    return this.isUploadingPhoto ? 'Uploading...' : 'Change photo';
  }

  protected formatPostDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  private loadOwnProfile(): void {
    this.isLoadingProfile = true;
    this.isFollowing = false;

    this.userService.getMyProfile().subscribe({
      next: (response) => {
        const user = response.data.user;
        this.currentUser = user;
        this.profileUser = user;
        this.userService.setCachedMyProfile(user);
        this.isLoadingProfile = false;
        this.loadPostsForUser(user.id ?? user._id);
      },
      error: () => {
        this.profileUser = this.currentUser;
        this.isLoadingProfile = false;
        this.posts = [];
      },
    });
  }

  private loadCurrentUser(): void {
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        const user = response.data.user;
        this.currentUser = user;
        this.userService.setCachedMyProfile(user);
      },
    });
  }

  private loadOtherUserProfile(userId: string): void {
    this.isLoadingProfile = true;

    this.userService.getUserProfile(userId).subscribe({
      next: (response) => {
        this.profileUser = response.data.user;
        this.isFollowing = response.data.isFollowing;
        this.isLoadingProfile = false;
        this.loadPostsForUser(userId);
      },
      error: () => {
        this.profileUser = null;
        this.posts = [];
        this.isLoadingProfile = false;
        this.alert.error('Profile failed', 'We could not load this profile right now.');
      },
    });
  }

  private loadPostsForUser(userId: string): void {
    this.isLoadingPosts = true;

    this.userService.getUserPosts(userId).subscribe({
      next: (response) => {
        this.posts = response.data.posts;
        this.isLoadingPosts = false;
      },
      error: () => {
        this.posts = [];
        this.isLoadingPosts = false;
      },
    });
  }

  private loadSavedPosts(): void {
    this.isLoadingSaved = true;

    this.userService.getBookmarks().subscribe({
      next: (response) => {
        this.savedPosts = response.data.bookmarks;
        this.isLoadingSaved = false;
      },
      error: () => {
        this.savedPosts = [];
        this.isLoadingSaved = false;
      },
    });
  }

  private syncCurrentUserCache(): void {
    const profile = this.profileUser;

    if (!this.isOwnProfile || !profile) {
      return;
    }

    this.currentUser = profile;
    this.userService.setCachedMyProfile(profile);
  }

  private extractUsers(values: Array<string | User> | undefined): User[] {
    return (values ?? []).filter((value): value is User => typeof value !== 'string');
  }
}
