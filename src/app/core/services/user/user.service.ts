import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  DeleteUserCoverResponse,
  FollowUnfollowResponse,
  GetBookmarksResponse,
  GetFollowSuggestionsResponse,
  GetMyProfileResponse,
  GetUserPostsResponse,
  GetUserProfileResponse,
  UploadProfilePhotoResponse,
  UpdateUserCoverResponse,
} from '../../models/user-response.interface';
import { environment } from '../../../../environments/environment';
import { User } from '../../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpClient = inject(HttpClient);
  private readonly PROFILE_CACHE_KEY = 'cachedUserProfile';

  uploadProfilePhoto(data: FormData): Observable<UploadProfilePhotoResponse> {
    return this.httpClient.put<UploadProfilePhotoResponse>(`${environment.apiUrl}/users/upload-photo`, data);
  }

  getMyProfile(): Observable<GetMyProfileResponse> {
    return this.httpClient
      .get<GetMyProfileResponse>(`${environment.apiUrl}/users/profile-data`)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.cacheMyProfile(response.data.user);
          }
        }),
      );
  }
  getBookmarks(): Observable<GetBookmarksResponse> {
    return this.httpClient.get<GetBookmarksResponse>(`${environment.apiUrl}/users/bookmarks`);
  }
  getFollowSuggestion(page = 1, limit = 20): Observable<GetFollowSuggestionsResponse> {
    return this.httpClient.get<GetFollowSuggestionsResponse>(
      `${environment.apiUrl}/users/suggestions?page=${page}&limit=${limit}`,
    );
  }
  getUserProfile(userId: string): Observable<GetUserProfileResponse> {
    return this.httpClient.get<GetUserProfileResponse>(`${environment.apiUrl}/users/${userId}/profile`);
  }
  followUnfollow(userId: string): Observable<FollowUnfollowResponse> {
    return this.httpClient.put<FollowUnfollowResponse>(`${environment.apiUrl}/users/${userId}/follow`, null);
  }
  getUserPosts(userId: string): Observable<GetUserPostsResponse> {
    return this.httpClient.get<GetUserPostsResponse>(`${environment.apiUrl}/users/${userId}/posts`);
  }

  deleteUserCover(): Observable<DeleteUserCoverResponse> {
    return this.httpClient.delete<DeleteUserCoverResponse>(`${environment.apiUrl}/users/cover`);
  }
  updateUserCover(data: FormData): Observable<UpdateUserCoverResponse> {
    return this.httpClient.put<UpdateUserCoverResponse>(`${environment.apiUrl}/users/upload-cover`, data);
  }

  getCachedMyProfile(): User | null {
    const rawProfile = localStorage.getItem(this.PROFILE_CACHE_KEY);

    if (!rawProfile) {
      return null;
    }

    try {
      return JSON.parse(rawProfile) as User;
    } catch {
      localStorage.removeItem(this.PROFILE_CACHE_KEY);
      return null;
    }
  }

  clearCachedMyProfile(): void {
    localStorage.removeItem(this.PROFILE_CACHE_KEY);
  }

  setCachedMyProfile(user: User): void {
    this.cacheMyProfile(user);
  }

  private cacheMyProfile(user: User): void {
    localStorage.setItem(this.PROFILE_CACHE_KEY, JSON.stringify(user));
  }
}
