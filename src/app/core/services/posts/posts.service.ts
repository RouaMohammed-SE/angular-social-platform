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
import { buildRequestContext } from '../../interceptors/request-context/request-context';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient);

  getAllPosts(page = 1, limit = 20): Observable<GetAllPostsResponse> {
    return this.httpClient.get<GetAllPostsResponse>(
      `${environment.apiUrl}/posts?page=${page}&limit=${limit}`,
    );
  }

  getHomeFeed(page = 1, limit = 20): Observable<GetHomeFeedResponse> {
    return this.httpClient.get<GetHomeFeedResponse>(
      `${environment.apiUrl}/posts/feed?only=following&page=${page}&limit=${limit}`,
    );
  }

  createPost(data: FormData): Observable<CreatePostResponse> {
    return this.httpClient.post<CreatePostResponse>(`${environment.apiUrl}/posts`, data, {
      context: createLocalFeedbackContext(),
    });
  }

  getSinglePost(postId: string): Observable<GetSinglePostResponse> {
    return this.httpClient.get<GetSinglePostResponse>(`${environment.apiUrl}/posts/${postId}`, {
      context: createLocalLoadingContext(),
    });
  }

  getPostLikes(postId: string): Observable<GetPostLikesResponse> {
    return this.httpClient.get<GetPostLikesResponse>(`${environment.apiUrl}/posts/${postId}/likes`);
  }

  updatePost(postId: string, postData: object): Observable<UpdatePostResponse> {
    return this.httpClient.put<UpdatePostResponse>(
      `${environment.apiUrl}/posts/${postId}`,
      postData,
      {
        context: createLocalFeedbackContext(),
      },
    );
  }

  deletePost(postId: string): Observable<DeletePostResponse> {
    return this.httpClient.delete<DeletePostResponse>(`${environment.apiUrl}/posts/${postId}`, {
      context: createLocalFeedbackContext(),
    });
  }

  likeUnlikePost(postId: string, postData: object | null): Observable<TogglePostLikeResponse> {
    return this.httpClient.put<TogglePostLikeResponse>(
      `${environment.apiUrl}/posts/${postId}/like`,
      postData,
      {
        context: createLocalFeedbackContext(),
      },
    );
  }

  bookmarkUnbookmarkPost(
    postId: string,
    postData: object | null,
  ): Observable<ToggleBookmarkResponse> {
    return this.httpClient.put<ToggleBookmarkResponse>(
      `${environment.apiUrl}/posts/${postId}/bookmark`,
      postData,
      {
        context: createLocalFeedbackContext(),
      },
    );
  }

  sharePost(postId: string, postData: object): Observable<SharePostResponse> {
    return this.httpClient.post<SharePostResponse>(
      `${environment.apiUrl}/posts/${postId}/share`,
      postData,
      {
        context: createLocalFeedbackContext(),
      },
    );
  }
}

function createLocalFeedbackContext() {
  return buildRequestContext({
    skipErrorHandling: true,
    skipLoadingSpinner: true,
  });
}

function createLocalLoadingContext() {
  return buildRequestContext({
    skipLoadingSpinner: true,
  });
}
