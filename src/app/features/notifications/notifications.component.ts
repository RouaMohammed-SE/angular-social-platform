import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Comment } from '../../core/models/comment.interface';
import { Notification } from '../../core/models/notification.interface';
import { Post } from '../../core/models/post.interface';
import { User } from '../../core/models/user.interface';
import { AlertService } from '../../core/services/alert/alert.service';
import { NotificationsService } from '../../core/services/notifications/notifications.service';

type NotificationFilter = 'all' | 'unread';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {
  private readonly notificationsService = inject(NotificationsService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);
  private readonly fallbackPhoto = '/assets/images/app/default-male-profile.png';

  protected notifications: Notification[] = [];
  protected activeFilter: NotificationFilter = 'all';
  protected isLoading = true;
  protected isMarkingAllRead = false;
  protected markingNotificationIds = new Set<string>();

  constructor() {
    this.loadNotifications();
  }

  protected get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }

  protected get filteredNotifications(): Notification[] {
    if (this.activeFilter === 'unread') {
      return this.notifications.filter((notification) => !notification.isRead);
    }

    return this.notifications;
  }

  protected setFilter(filter: NotificationFilter): void {
    this.activeFilter = filter;
  }

  protected markAsRead(notification: Notification): void {
    const notificationId = notification._id;

    if (notification.isRead || this.markingNotificationIds.has(notificationId)) {
      return;
    }

    this.markingNotificationIds = new Set(this.markingNotificationIds).add(notificationId);

    this.notificationsService.markNotificationAsRead(notificationId)
      .pipe(finalize(() => {
        const nextIds = new Set(this.markingNotificationIds);
        nextIds.delete(notificationId);
        this.markingNotificationIds = nextIds;
      }))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.map((item) =>
            item._id === notificationId
              ? {
                  ...item,
                  isRead: true,
                  readAt: new Date().toISOString(),
                }
              : item,
          );
          this.notificationsService.setUnreadCount(this.unreadCount);
        },
        error: () => {
          this.alert.error('Update failed', 'We could not mark this notification as read.');
        },
      });
  }

  protected markAllAsRead(): void {
    if (this.unreadCount === 0 || this.isMarkingAllRead) {
      return;
    }

    this.isMarkingAllRead = true;

    this.notificationsService.markAllAsRead()
      .pipe(finalize(() => {
        this.isMarkingAllRead = false;
      }))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.map((notification) => ({
            ...notification,
            isRead: true,
            readAt: notification.readAt ?? new Date().toISOString(),
          }));
          this.notificationsService.setUnreadCount(0);
          this.alert.success('All caught up', 'All notifications were marked as read.');
        },
        error: () => {
          this.alert.error('Update failed', 'We could not mark all notifications as read.');
        },
      });
  }

  protected openNotification(notification: Notification): void {
    const route = this.getNotificationRoute(notification);

    if (!route) {
      return;
    }

    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    this.router.navigate(route);
  }

  protected isMarking(notificationId: string): boolean {
    return this.markingNotificationIds.has(notificationId);
  }

  protected getActorPhoto(notification: Notification): string {
    return notification.actor.photo?.trim() || this.fallbackPhoto;
  }

  protected getNotificationMessage(notification: Notification): string {
    switch (notification.type) {
      case 'like_post':
        return 'liked your post';
      case 'comment_post':
        return 'commented on your post';
      case 'share_post':
        return 'shared your post';
      case 'follow_user':
        return 'followed you';
      default:
        return 'interacted with your activity';
    }
  }

  protected getNotificationPreview(notification: Notification): string {
    if (!notification.entity) {
      return '';
    }

    if (this.isPostEntity(notification.entity)) {
      return notification.entity.body || (notification.entity.image ? 'Updated profile picture.' : '');
    }

    if (this.isCommentEntity(notification.entity)) {
      return notification.entity.content;
    }

    if (this.isUserEntity(notification.entity)) {
      return notification.entity.username ? `@${notification.entity.username}` : notification.entity.name;
    }

    return '';
  }

  protected getRelativeTime(value: string): string {
    const createdAt = new Date(value).getTime();
    const now = Date.now();

    if (Number.isNaN(createdAt)) {
      return '';
    }

    const diffMinutes = Math.max(1, Math.floor((now - createdAt) / 60000));

    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays}d`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) {
      return `${diffWeeks}w`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths}mo`;
    }

    return `${Math.floor(diffDays / 365)}y`;
  }

  protected getTypeIconClass(notification: Notification): string {
    switch (notification.type) {
      case 'like_post':
        return 'text-rose-500';
      case 'comment_post':
        return 'text-[#1877f2]';
      case 'share_post':
        return 'text-emerald-600';
      case 'follow_user':
        return 'text-violet-600';
      default:
        return 'text-slate-500';
    }
  }

  protected getTypeIcon(notification: Notification): string {
    switch (notification.type) {
      case 'like_post':
        return 'heart';
      case 'comment_post':
        return 'comment';
      case 'share_post':
        return 'share';
      case 'follow_user':
        return 'follow';
      default:
        return 'dot';
    }
  }

  private loadNotifications(): void {
    this.isLoading = true;

    this.notificationsService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.data.notifications;
        this.notificationsService.setUnreadCount(this.unreadCount);
        this.isLoading = false;
      },
      error: () => {
        this.notifications = [];
        this.isLoading = false;
        this.alert.error('Notifications failed', 'We could not load your notifications right now.');
      },
    });
  }

  private getNotificationRoute(notification: Notification): string[] | null {
    if (notification.type === 'follow_user') {
      return ['/profile', notification.actor.id ?? notification.actor._id];
    }

    if (this.isCommentEntity(notification.entity)) {
      return ['/posts', notification.entity.post];
    }

    if (this.isPostEntity(notification.entity)) {
      return ['/posts', notification.entity.id ?? notification.entity._id];
    }

    if (notification.entityType === 'post' && notification.entityId) {
      return ['/posts', notification.entityId];
    }

    return null;
  }

  private isPostEntity(entity: Notification['entity']): entity is Post {
    return !!entity && 'privacy' in entity && 'likesCount' in entity;
  }

  private isCommentEntity(entity: Notification['entity']): entity is Comment {
    return !!entity && 'content' in entity && 'commentCreator' in entity;
  }

  private isUserEntity(entity: Notification['entity']): entity is User {
    return !!entity && 'name' in entity && !('privacy' in entity) && !('content' in entity);
  }
}
