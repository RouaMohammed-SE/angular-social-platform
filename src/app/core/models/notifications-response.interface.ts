import { ApiResponse } from './api-response.interface';
import { PaginationMeta } from './pagination.interface';
import { Notification } from './notification.interface';

export interface NotificationsMeta extends PaginationMeta {
  feedMode: 'page' | 'cursor' | string;
}

export interface NotificationsData {
  notifications: Notification[];
}

export interface NotificationData {
  notification: Notification;
}

export interface UnreadCountData {
  unreadCount: number;
}

export interface MarkAllAsReadData {
  modifiedCount: number;
}

export type GetNotificationsResponse = ApiResponse<NotificationsData, NotificationsMeta>;
export type GetUnreadCountResponse = ApiResponse<UnreadCountData>;
export type MarkNotificationAsReadResponse = ApiResponse<NotificationData>;
export type MarkAllAsReadResponse = ApiResponse<MarkAllAsReadData>;
