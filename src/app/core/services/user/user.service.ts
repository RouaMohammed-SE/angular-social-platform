import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpClient = inject(HttpClient);

  uploadProfilePhoto(data: FormData): Observable<UploadProfilePhotoResponse> {
    return this.httpClient.put<UploadProfilePhotoResponse>(`${environment.apiUrl}/users/upload-photo`, data);
  }

  getMyProfile(): Observable<GetMyProfileResponse> {
    return this.httpClient.get<GetMyProfileResponse>(`${environment.apiUrl}/users/profile-data`);
  }
  getBookmarks(): Observable<GetBookmarksResponse> {
    return this.httpClient.get<GetBookmarksResponse>(`${environment.apiUrl}/users/bookmarks`);
  }
  getFollowSuggestion(): Observable<GetFollowSuggestionsResponse> {
    return this.httpClient.get<GetFollowSuggestionsResponse>(`${environment.apiUrl}/users/suggestions?limit=50`);
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
}
