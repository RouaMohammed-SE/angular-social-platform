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

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient = inject(HttpClient);

  getCommentsForPost(postId: string): Observable<GetPostCommentsResponse> {
    return this.httpClient.get<GetPostCommentsResponse>(`${environment.apiUrl}/posts/${postId}/comments`);
  }

  createComment(postId: string, commentData: object): Observable<CreateCommentResponse> {
    return this.httpClient.post<CreateCommentResponse>(
      `${environment.apiUrl}/posts/${postId}/comments`,
      commentData,
    );
  }

  getcommentreplies(postId: string, commentId: string): Observable<GetCommentRepliesResponse> {
    return this.httpClient.get<GetCommentRepliesResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}/replies`,
    );
  }

  createCommentReply(
    postId: string,
    commentId: string,
    commentData: object,
  ): Observable<CreateReplyResponse> {
    return this.httpClient.post<CreateReplyResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}/replies`,
      commentData,
    );
  }

  updateComment(postId: string, commentId: string, commentData: object): Observable<UpdateCommentResponse> {
    return this.httpClient.put<UpdateCommentResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}`,
      commentData,
    );
  }

  deleteComment(postId: string, commentId: string): Observable<DeleteCommentResponse> {
    return this.httpClient.delete<DeleteCommentResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}`,
    );
  }

  likeunlikeComment(
    postId: string,
    commentId: string,
    commentData: object | null,
  ): Observable<ToggleCommentLikeResponse> {
    return this.httpClient.put<ToggleCommentLikeResponse>(
      `${environment.apiUrl}/posts/${postId}/comments/${commentId}/like`,
      commentData,
    );
  }
}
