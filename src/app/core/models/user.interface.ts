export interface User {
  _id: string;
  id?: string;
  name: string;
  username?: string;
  photo: string;
  email?: string;
  cover?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | string;
  bookmarks?: string[];
  followers?: Array<string | User>;
  following?: Array<string | User>;
  createdAt?: string;
  passwordChangedAt?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  mutualFollowersCount?: number;
}
