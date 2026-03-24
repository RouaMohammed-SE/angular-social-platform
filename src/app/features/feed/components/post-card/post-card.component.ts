import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Comment } from '../../../../core/models/comment.interface';
import { Post } from '../../../../core/models/post.interface';
import { User } from '../../../../core/models/user.interface';
import { AvatarPhotoPipe } from '../../../../shared/pipes/avatar-photo.pipe';
import { PostCardCommentsComponent } from './components/post-card-comments/post-card-comments.component';
import { PostCardHeaderComponent } from './components/post-card-header/post-card-header.component';

@Component({
  selector: 'app-post-card',
  imports: [NgClass, RouterLink, PostCardHeaderComponent, PostCardCommentsComponent, AvatarPhotoPipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css',
})
export class PostCardComponent {
  @Input() currentUserId: string | null = null;
  @Input() comments: Comment[] = [];
  @Input() hasMoreComments = false;
  @Input() currentUserName = 'You';
  @Input() currentUser: User | null = null;
  @Input() isCommentsLoading = false;
  @Input() isCommentsOpen = false;
  @Input() isDetailsView = false;
  @Input() isCommentSubmitting = false;
  @Input() isLoadingMoreComments = false;
  @Input() repliesByCommentId: Record<string, Comment[]> = {};
  @Input() repliesHasMoreByCommentId: Record<string, boolean> = {};
  @Input() loadingRepliesCommentId: string | null = null;
  @Input() loadingMoreRepliesCommentId: string | null = null;
  @Input() submittingReplyCommentId: string | null = null;
  @Input({ required: true }) post!: Post;
  @Output() bookmark = new EventEmitter<Post>();
  @Output() delete = new EventEmitter<Post>();
  @Output() edit = new EventEmitter<Post>();
  @Output() like = new EventEmitter<Post>();
  @Output() comment = new EventEmitter<Post>();
  @Output() deleteComment = new EventEmitter<{ post: Post; comment: Comment }>();
  @Output() editComment = new EventEmitter<{ post: Post; comment: Comment; content: string }>();
  @Output() likeComment = new EventEmitter<{ post: Post; comment: Comment }>();
  @Output() loadMoreComments = new EventEmitter<Post>();
  @Output() loadMoreReplies = new EventEmitter<{ post: Post; comment: Comment }>();
  @Output() submitComment = new EventEmitter<{ post: Post; content: string; image: File | null }>();
  @Output() toggleReplies = new EventEmitter<{ post: Post; comment: Comment }>();
  @Output() submitReply = new EventEmitter<{
    post: Post;
    comment: Comment;
    content: string;
    image: File | null;
  }>();
  @Output() share = new EventEmitter<Post>();
  @Output() viewDetails = new EventEmitter<Post>();

  protected isMenuOpen = false;

  protected readonly actions = [
    { id: 'like', label: 'Like' },
    { id: 'comment', label: 'Comment' },
    { id: 'share', label: 'Share' },
  ] as const;

  protected emitAction(action: 'like' | 'comment' | 'share'): void {
    switch (action) {
      case 'like':
        this.like.emit(this.post);
        break;
      case 'comment':
        this.comment.emit(this.post);
        break;
      case 'share':
        this.share.emit(this.post);
        break;
    }
  }

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  protected toggleBookmark(): void {
    this.bookmark.emit(this.post);
    this.isMenuOpen = false;
  }

  protected handleEdit(): void {
    this.edit.emit(this.post);
    this.isMenuOpen = false;
  }

  protected handleDelete(): void {
    this.delete.emit(this.post);
    this.isMenuOpen = false;
  }

  protected handleSubmitComment(payload: { content: string; image: File | null }): void {
    this.submitComment.emit({
      post: this.post,
      content: payload.content,
      image: payload.image,
    });
  }

  protected handleToggleReplies(comment: Comment): void {
    this.toggleReplies.emit({
      post: this.post,
      comment,
    });
  }

  protected handleLikeComment(comment: Comment): void {
    this.likeComment.emit({
      post: this.post,
      comment,
    });
  }

  protected handleDeleteComment(comment: Comment): void {
    this.deleteComment.emit({
      post: this.post,
      comment,
    });
  }

  protected handleEditComment(payload: { comment: Comment; content: string }): void {
    this.editComment.emit({
      post: this.post,
      comment: payload.comment,
      content: payload.content,
    });
  }

  protected handleLoadMoreComments(): void {
    this.loadMoreComments.emit(this.post);
  }

  protected handleLoadMoreReplies(comment: Comment): void {
    this.loadMoreReplies.emit({
      post: this.post,
      comment,
    });
  }

  protected handleSubmitReply(payload: { comment: Comment; content: string; image: File | null }): void {
    this.submitReply.emit({
      post: this.post,
      comment: payload.comment,
      content: payload.content,
      image: payload.image,
    });
  }

  protected openDetails(): void {
    if (this.isDetailsView) {
      return;
    }

    this.viewDetails.emit(this.post);
  }

  protected get author(): User | null {
    return typeof this.post.user === 'string' ? null : this.post.user;
  }

  protected get authorId(): string | null {
    if (typeof this.post.user === 'string') {
      return this.post.user;
    }

    return this.post.user.id ?? this.post.user._id;
  }

  protected get sharedPostAuthor(): User | null {
    return this.post.sharedPost && typeof this.post.sharedPost.user !== 'string'
      ? this.post.sharedPost.user
      : null;
  }

  protected get sharedPostAuthorProfileLink(): string[] | null {
    if (!this.sharedPostAuthor) {
      return null;
    }

    return ['/profile', this.sharedPostAuthor.id ?? this.sharedPostAuthor._id];
  }

  protected get privacyLabel(): string {
    switch (this.post.privacy) {
      case 'following':
        return 'Following';
      case 'only_me':
        return 'Only me';
      default:
        return 'Public';
    }
  }

  protected get topComment(): Comment | null {
    return this.post.topComment ?? null;
  }

  protected get isLikedByCurrentUser(): boolean {
    if (!this.currentUserId) {
      return false;
    }

    return this.post.likes.includes(this.currentUserId);
  }

  protected get isCurrentUserPost(): boolean {
    if (!this.currentUserId || !this.authorId) {
      return false;
    }

    return this.currentUserId === this.authorId;
  }

  protected get relativeCreatedAt(): string {
    const createdAt = new Date(this.post.createdAt);
    const timestamp = createdAt.getTime();

    if (Number.isNaN(timestamp)) {
      return '';
    }

    const diffInSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 5) {
      return `${diffInWeeks}w`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y`;
  }
}
