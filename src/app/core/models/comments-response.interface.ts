import { ApiResponse } from './api-response.interface';
import { PaginationMeta } from './pagination.interface';
import { Comment } from './comment.interface';

export interface CommentsData {
  comments: Comment[];
}

export interface RepliesData {
  replies: Comment[];
}

export interface CommentData {
  comment: Comment;
}

export interface ReplyData {
  reply: Comment;
}

export interface ToggleCommentLikeData {
  liked: boolean;
  likesCount: number;
  comment: Comment;
}

export type GetPostCommentsResponse = ApiResponse<CommentsData, PaginationMeta>;
export type CreateCommentResponse = ApiResponse<CommentData>;
export type GetCommentRepliesResponse = ApiResponse<RepliesData, PaginationMeta>;
export type CreateReplyResponse = ApiResponse<ReplyData>;
export type UpdateCommentResponse = ApiResponse<CommentData>;
export type ToggleCommentLikeResponse = ApiResponse<ToggleCommentLikeData>;
export type DeleteCommentResponse = ApiResponse<Record<string, never>>;
