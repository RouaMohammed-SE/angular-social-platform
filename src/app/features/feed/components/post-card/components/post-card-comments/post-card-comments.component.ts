import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Comment } from '../../../../../../core/models/comment.interface';
import { User } from '../../../../../../core/models/user.interface';
import { ClickOutsideDirective } from '../../../../../../shared/directives/click-outside.directive';
import { AvatarPhotoPipe } from '../../../../../../shared/pipes/avatar-photo.pipe';

@Component({
  selector: 'app-post-card-comments',
  imports: [AvatarPhotoPipe, RouterLink, ClickOutsideDirective],
  templateUrl: './post-card-comments.component.html',
  styleUrl: './post-card-comments.component.css',
})
export class PostCardCommentsComponent implements OnDestroy {
  @Input() comments: Comment[] = [];
  @Input() commentsCount = 0;
  @Input() currentUserId: string | null = null;
  @Input() currentUserName = 'You';
  @Input() currentUser: User | null = null;
  @Input() hasMoreComments = false;
  @Input() isLoading = false;
  @Input() isLoadingMoreComments = false;
  @Input() isSubmitting = false;
  @Input() repliesByCommentId: Record<string, Comment[]> = {};
  @Input() repliesHasMoreByCommentId: Record<string, boolean> = {};
  @Input() loadingRepliesCommentId: string | null = null;
  @Input() loadingMoreRepliesCommentId: string | null = null;
  @Input() submittingReplyCommentId: string | null = null;

  @Output() submitComment = new EventEmitter<{ content: string; image: File | null }>();
  @Output() deleteComment = new EventEmitter<Comment>();
  @Output() editComment = new EventEmitter<{ comment: Comment; content: string }>();
  @Output() likeComment = new EventEmitter<Comment>();
  @Output() loadMoreComments = new EventEmitter<void>();
  @Output() loadMoreReplies = new EventEmitter<Comment>();
  @Output() toggleReplies = new EventEmitter<Comment>();
  @Output() submitReply = new EventEmitter<{
    comment: Comment;
    content: string;
    image: File | null;
  }>();

  protected content = '';
  protected sortBy: 'relevant' | 'newest' = 'relevant';
  protected selectedImage: File | null = null;
  protected imagePreviewUrl: string | null = null;
  protected activeReplyCommentId: string | null = null;
  protected activeMenuCommentId: string | null = null;
  protected editingCommentId: string | null = null;
  protected editingContent = '';
  protected replyContent = '';
  protected selectedReplyImage: File | null = null;
  protected replyImagePreviewUrl: string | null = null;

  protected onContentInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.content = target.value;
  }

  protected onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value === 'newest' ? 'newest' : 'relevant';
  }

  protected onImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.clearImagePreview();
    this.selectedImage = target.files?.[0] ?? null;

    if (this.selectedImage) {
      this.imagePreviewUrl = URL.createObjectURL(this.selectedImage);
    }
  }

  protected submit(): void {
    const trimmedContent = this.content.trim();
    if (!trimmedContent || this.isSubmitting) {
      return;
    }

    this.submitComment.emit({
      content: trimmedContent,
      image: this.selectedImage,
    });

    this.content = '';
    this.selectedImage = null;
    this.clearImagePreview();
  }

  protected toggleReplyThread(comment: Comment): void {
    this.activeReplyCommentId = this.activeReplyCommentId === comment._id ? null : comment._id;
    this.activeMenuCommentId = null;
    this.replyContent = '';
    this.selectedReplyImage = null;
    this.clearReplyImagePreview();
    this.toggleReplies.emit(comment);
  }

  protected onReplyContentInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.replyContent = target.value;
  }

  protected onReplyImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.clearReplyImagePreview();
    this.selectedReplyImage = target.files?.[0] ?? null;

    if (this.selectedReplyImage) {
      this.replyImagePreviewUrl = URL.createObjectURL(this.selectedReplyImage);
    }
  }

  protected submitReplyForComment(comment: Comment): void {
    const trimmedContent = this.replyContent.trim();
    if (!trimmedContent || this.submittingReplyCommentId === comment._id) {
      return;
    }

    this.submitReply.emit({
      comment,
      content: trimmedContent,
      image: this.selectedReplyImage,
    });

    this.replyContent = '';
    this.selectedReplyImage = null;
    this.clearReplyImagePreview();
  }

  protected isReplyThreadOpen(comment: Comment): boolean {
    return this.activeReplyCommentId === comment._id;
  }

  protected emitLike(comment: Comment): void {
    this.likeComment.emit(comment);
  }

  protected emitLoadMoreComments(): void {
    this.loadMoreComments.emit();
  }

  protected emitLoadMoreReplies(comment: Comment): void {
    this.loadMoreReplies.emit(comment);
  }

  protected emitDelete(comment: Comment): void {
    this.activeMenuCommentId = null;
    this.deleteComment.emit(comment);
  }

  protected toggleCommentMenu(comment: Comment): void {
    this.activeMenuCommentId = this.activeMenuCommentId === comment._id ? null : comment._id;
  }

  protected isMenuOpen(comment: Comment): boolean {
    return this.activeMenuCommentId === comment._id;
  }

  protected closeMenus(): void {
    this.activeMenuCommentId = null;
  }

  protected startEditing(comment: Comment): void {
    this.editingCommentId = comment._id;
    this.editingContent = comment.content;
    this.activeMenuCommentId = null;
  }

  protected isEditing(comment: Comment): boolean {
    return this.editingCommentId === comment._id;
  }

  protected onEditingContentInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.editingContent = target.value;
  }

  protected saveEdit(comment: Comment): void {
    const trimmedContent = this.editingContent.trim();
    if (!trimmedContent || trimmedContent === comment.content) {
      this.cancelEditing();
      return;
    }

    this.editComment.emit({
      comment,
      content: trimmedContent,
    });
    this.cancelEditing();
  }

  protected cancelEditing(): void {
    this.editingCommentId = null;
    this.editingContent = '';
  }

  protected isLikedByCurrentUser(comment: Comment): boolean {
    if (!this.currentUserId) {
      return false;
    }

    return comment.likes.includes(this.currentUserId);
  }

  protected isCurrentUserComment(comment: Comment): boolean {
    if (!this.currentUserId) {
      return false;
    }

    return (comment.commentCreator.id ?? comment.commentCreator._id) === this.currentUserId;
  }

  protected relativeTime(value: string): string {
    const createdAt = new Date(value);
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

    return `${Math.floor(diffInDays / 365)}y`;
  }

  protected get visibleComments(): Comment[] {
    if (this.sortBy === 'relevant') {
      return this.comments;
    }

    return [...this.comments].sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();

      return rightTime - leftTime;
    });
  }

  ngOnDestroy(): void {
    this.clearImagePreview();
    this.clearReplyImagePreview();
  }

  private clearImagePreview(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = null;
    }
  }

  private clearReplyImagePreview(): void {
    if (this.replyImagePreviewUrl) {
      URL.revokeObjectURL(this.replyImagePreviewUrl);
      this.replyImagePreviewUrl = null;
    }
  }
}
