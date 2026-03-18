import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePostResponse,
  DeletePostResponse,
  GetAllPostsResponse,
  GetHomeFeedResponse,
  GetPostLikesResponse,
  GetSinglePostResponse,
  SharePostResponse,
  ToggleBookmarkResponse,
  TogglePostLikeResponse,
  UpdatePostResponse,
} from '../../models/posts-response.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient);

  getAllPosts(): Observable<GetAllPostsResponse> {
    return this.httpClient.get<GetAllPostsResponse>(`${environment.apiUrl}/posts`);
  }

  getHomeFeed(): Observable<GetHomeFeedResponse> {
    return this.httpClient.get<GetHomeFeedResponse>(`${environment.apiUrl}/posts/feed?only=following`);
  }

  createPost(data: object): Observable<CreatePostResponse> {
    return this.httpClient.post<CreatePostResponse>(`${environment.apiUrl}/posts`, data);
  }

  getsinglePost(postId: string): Observable<GetSinglePostResponse> {
    return this.httpClient.get<GetSinglePostResponse>(`${environment.apiUrl}/posts/${postId}`);
  }

  getPostLikes(postId: string): Observable<GetPostLikesResponse> {
    return this.httpClient.get<GetPostLikesResponse>(`${environment.apiUrl}/posts/${postId}/likes`);
  }

  updatePost(postId: string, postData: object): Observable<UpdatePostResponse> {
    return this.httpClient.put<UpdatePostResponse>(`${environment.apiUrl}/posts/${postId}`, postData);
  }

  deletePost(postId: string): Observable<DeletePostResponse> {
    return this.httpClient.delete<DeletePostResponse>(`${environment.apiUrl}/posts/${postId}`);
  }

  linkeUnlikePost(postId: string, postData: object | null): Observable<TogglePostLikeResponse> {
    return this.httpClient.put<TogglePostLikeResponse>(
      `${environment.apiUrl}/posts/${postId}/like`,
      postData,
    );
  }

  bookmarkUnbookmarkPost(
    postId: string,
    postData: object | null,
  ): Observable<ToggleBookmarkResponse> {
    return this.httpClient.put<ToggleBookmarkResponse>(
      `${environment.apiUrl}/posts/${postId}/bookmark`,
      postData,
    );
  }

  sharePost(postId: string, postData: object): Observable<SharePostResponse> {
    return this.httpClient.post<SharePostResponse>(`${environment.apiUrl}/posts/${postId}/share`, postData);
  }
}
