import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Comment } from '../../../../core/models/comment.interface';
import { Post } from '../../../../core/models/post.interface';
import { User } from '../../../../core/models/user.interface';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-post-list',
  imports: [PostCardComponent],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css',
})
export class PostListComponent {
  @Input() commentsByPostId: Record<string, Comment[]> = {};
  @Input() commentsHasMoreByPostId: Record<string, boolean> = {};
  @Input() currentUserId: string | null = null;
  @Input() currentUserName = 'You';
  @Input() currentUser: User | null = null;
  @Input() expandedCommentsPostId: string | null = null;
  @Input() hasMore = false;
  @Input() loadingCommentsPostId: string | null = null;
  @Input() loadingMoreCommentsPostId: string | null = null;
  @Input() loadingRepliesCommentId: string | null = null;
  @Input() loadingMoreRepliesCommentId: string | null = null;
  @Input() isDetailsView = false;
  @Input() repliesByCommentId: Record<string, Comment[]> = {};
  @Input() repliesHasMoreByCommentId: Record<string, boolean> = {};
  @Input() submittingCommentPostId: string | null = null;
  @Input() submittingReplyCommentId: string | null = null;
  @Input() isLoadingMore = false;
  @Input({ required: true }) posts: Post[] = [];
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
  @Output() submitReply = new EventEmitter<{
    post: Post;
    comment: Comment;
    content: string;
    image: File | null;
  }>();
  @Output() toggleReplies = new EventEmitter<{ post: Post; comment: Comment }>();
  @Output() share = new EventEmitter<Post>();
  @Output() viewDetails = new EventEmitter<Post>();
}
