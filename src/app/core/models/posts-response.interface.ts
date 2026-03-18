import { ApiResponse } from './api-response.interface';
import { PaginationMeta } from './pagination.interface';
import { Post } from './post.interface';
import { User } from './user.interface';

export interface FeedMeta extends PaginationMeta {
  feedMode: 'page' | 'cursor' | string;
}

export interface PostsData {
  posts: Post[];
}

export interface PostData {
  post: Post;
}

export interface PostLikesData {
  likes: User[];
}

export interface TogglePostLikeData {
  liked: boolean;
  likesCount: number;
  post: Post;
}

export interface ToggleBookmarkData {
  bookmarked: boolean;
  bookmarksCount: number;
}

export type GetAllPostsResponse = ApiResponse<PostsData, PaginationMeta>;
export type GetHomeFeedResponse = ApiResponse<PostsData, FeedMeta>;
export type GetSinglePostResponse = ApiResponse<PostsData, PaginationMeta>;
export type CreatePostResponse = ApiResponse<PostData>;
export type UpdatePostResponse = ApiResponse<PostData>;
export type DeletePostResponse = ApiResponse<PostData>;
export type SharePostResponse = ApiResponse<PostData>;
export type GetPostLikesResponse = ApiResponse<PostLikesData, PaginationMeta>;
export type TogglePostLikeResponse = ApiResponse<TogglePostLikeData>;
export type ToggleBookmarkResponse = ApiResponse<ToggleBookmarkData>;
