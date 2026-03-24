import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateCommentResponse,
  CreateReplyResponse,
  DeleteCommentResponse,
  GetCommentRepliesResponse,
  GetPostCommentsResponse,
  ToggleCommentLikeResponse,
  UpdateCommentResponse,
} from '../../models/comments-response.interface';
import { environment } from '../../../../environments/environment';
import { buildRequestContext } from '../../interceptors/request-context/request-context';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient = inject(HttpClient);

  getCommentsForPost(postId: string, page = 1, limit = 5): Observable<GetPostCommentsResponse> {
    return this.httpClient.get<GetPostCommentsResponse>(
      `${environment.apiUrl}/posts/${postId}/comments?page=${page}&limit=${limit}`,
      {
        context: createLocalCommentContext(),
      },
    );
  }

  createComment(postId: string, commentData: FormData): Observable<CreateCommentResponse> {
    return this.httpClient.post<CreateCommentResponse>(
      `${environment.apiUrl}/posts/${postId}/comments`,
      commentData,
      {
        context: createLocalCommentContext(),
      },
    );
  }

  getCommentReplies(postId: string, commentId: string, page = 1, limit = 10): Observable<GetCommentRepliesResponse> {
    return this.httpClient.get<GetCommentRepliesResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`,
      {
        context: createLocalCommentContext(),
      },
    );
  }

  createCommentReply(
    postId: string,
    commentId: string,
    commentData: FormData,
  ): Observable<CreateReplyResponse> {
    return this.httpClient.post<CreateReplyResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}/replies`,
      commentData,
      {
        context: createLocalCommentContext(),
      },
    );
  }

  updateComment(postId: string, commentId: string, commentData: object): Observable<UpdateCommentResponse> {
    return this.httpClient.put<UpdateCommentResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}`,
      commentData,
      {
        context: createLocalCommentContext(),
      },
    );
  }

  deleteComment(postId: string, commentId: string): Observable<DeleteCommentResponse> {
    return this.httpClient.delete<DeleteCommentResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}`,
      {
        context: createLocalCommentContext(),
      },
    );
  }

  likeUnlikeComment(
    postId: string,
    commentId: string,
    commentData: object | null,
  ): Observable<ToggleCommentLikeResponse> {
    return this.httpClient.put<ToggleCommentLikeResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}/like`,
      commentData,
      {
        context: createLocalCommentContext(),
      },
    );
  }
}

function createLocalCommentContext() {
  return buildRequestContext({
    skipErrorHandling: true,
    skipLoadingSpinner: true,
  });
}
