import { User } from './user.interface';

export interface Comment {
  _id: string;
  id?: string;
  content: string;
  image?: string;
  commentCreator: User;
  post: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
  likesCount?: number;
  isReply?: boolean;
  replies?: Comment[];
}
