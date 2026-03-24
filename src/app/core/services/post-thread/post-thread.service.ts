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
import { CommentsService } from '../comments/comments.service';

@Injectable({
  providedIn: 'root',
})
export class PostThreadService {
  private readonly commentsService = inject(CommentsService);

  getCommentsPage(postId: string, page: number, limit: number): Observable<GetPostCommentsResponse> {
    return this.commentsService.getCommentsForPost(postId, page, limit);
  }

  getRepliesPage(
    postId: string,
    commentId: string,
    page: number,
    limit: number,
  ): Observable<GetCommentRepliesResponse> {
    return this.commentsService.getCommentReplies(postId, commentId, page, limit);
  }

  createComment(postId: string, content: string, image: File | null): Observable<CreateCommentResponse> {
    return this.commentsService.createComment(postId, this.buildFormData(content, image));
  }

  createReply(
    postId: string,
    commentId: string,
    content: string,
    image: File | null,
  ): Observable<CreateReplyResponse> {
    return this.commentsService.createCommentReply(postId, commentId, this.buildFormData(content, image));
  }

  likeComment(postId: string, commentId: string): Observable<ToggleCommentLikeResponse> {
    return this.commentsService.likeUnlikeComment(postId, commentId, null);
  }

  updateComment(postId: string, commentId: string, content: string): Observable<UpdateCommentResponse> {
    return this.commentsService.updateComment(postId, commentId, { content });
  }

  deleteComment(postId: string, commentId: string): Observable<DeleteCommentResponse> {
    return this.commentsService.deleteComment(postId, commentId);
  }

  hasMoreFromPagination(
    currentPage: number | undefined,
    numberOfPages: number | undefined,
    receivedCount: number,
    limit: number,
  ): boolean {
    if (typeof currentPage === 'number' && typeof numberOfPages === 'number') {
      return currentPage < numberOfPages;
    }

    return receivedCount === limit;
  }

  private buildFormData(content: string, image: File | null): FormData {
    const formData = new FormData();
    formData.append('content', content);

    if (image) {
      formData.append('image', image);
    }

    return formData;
  }
}
