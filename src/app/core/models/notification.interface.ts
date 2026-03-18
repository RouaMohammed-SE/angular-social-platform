import { Comment } from './comment.interface';
import { Post } from './post.interface';
import { User } from './user.interface';

export type NotificationType =
  | 'like_post'
  | 'share_post'
  | 'comment_post'
  | 'follow_user'
  | string;

export type NotificationEntityType = 'post' | 'comment' | 'user' | string;

export interface NotificationUser {
  _id: string;
  name: string;
  photo: string;
  username?: string;
  id?: string;
}

export interface Notification {
  _id: string;
  recipient: NotificationUser;
  actor: NotificationUser;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  entity: Post | Comment | User | null;
}
