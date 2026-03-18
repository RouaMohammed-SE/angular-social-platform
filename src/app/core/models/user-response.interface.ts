import { ApiResponse } from './api-response.interface';
import { PaginationMeta } from './pagination.interface';
import { Post } from './post.interface';
import { User } from './user.interface';

export interface ProfileData {
  user: User;
}

export interface BookmarksData {
  bookmarks: Post[];
}

export interface FollowSuggestionsData {
  suggestions: User[];
}

export interface UserProfileData {
  isFollowing: boolean;
  user: User;
}

export interface FollowToggleData {
  following: boolean;
  followersCount: number;
}

export interface UserPostsData {
  posts: Post[];
}

export interface UploadProfilePhotoData {
  photo: string;
  postId: string;
}

export interface UploadUserCoverData {
  cover: string;
  postId: string;
}

export type GetMyProfileResponse = ApiResponse<ProfileData>;
export type GetBookmarksResponse = ApiResponse<BookmarksData, PaginationMeta>;
export type GetFollowSuggestionsResponse = ApiResponse<FollowSuggestionsData, PaginationMeta>;
export type GetUserProfileResponse = ApiResponse<UserProfileData>;
export type FollowUnfollowResponse = ApiResponse<FollowToggleData>;
export type GetUserPostsResponse = ApiResponse<UserPostsData, PaginationMeta>;
export type UploadProfilePhotoResponse = ApiResponse<UploadProfilePhotoData>;
export type UpdateUserCoverResponse = ApiResponse<UploadUserCoverData>;
export type DeleteUserCoverResponse = ApiResponse<Record<string, never>>;
