import { Comment } from './comment.interface';
import { User } from './user.interface';

export type PostPrivacy = 'public' | 'only_me' | 'following';

export interface Post {
  _id: string;
  id: string;
  body?: string;
  image?: string;
  privacy: PostPrivacy | string;
  user: User | string;
  sharedPost: Post | null;
  sharedPostUnavailable?: boolean;
  likes: string[];
  createdAt: string;
  commentsCount?: number;
  topComment?: Comment | null;
  sharesCount?: number;
  likesCount: number;
  isShare: boolean;
  bookmarked?: boolean;
}
