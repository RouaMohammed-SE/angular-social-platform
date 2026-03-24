import { Component, EventEmitter, HostListener, OnInit, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Comment } from '../../core/models/comment.interface';
import { Post, PostPrivacy } from '../../core/models/post.interface';
import { User } from '../../core/models/user.interface';
import { AlertService } from '../../core/services/alert/alert.service';
import { PostEntityService } from '../../core/services/post-entity/post-entity.service';
import { PostsService } from '../../core/services/posts/posts.service';
import { PostThreadService } from '../../core/services/post-thread/post-thread.service';
import { UserService } from '../../core/services/user/user.service';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { EditPostModalComponent } from './components/edit-post-modal/edit-post-modal.component';
import { SharePostModalComponent } from './components/share-post-modal/share-post-modal.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RightSidebarComponent } from './components/right-sidebar/right-sidebar.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { MobileTabsComponent } from './components/mobile-tabs/mobile-tabs.component';
import { FeedSection } from './types/feed-section.type';

@Component({
  selector: 'app-feed',
  imports: [
    CreatePostComponent,
    EditPostModalComponent,
    SharePostModalComponent,
    SidebarComponent,
    RightSidebarComponent,
    PostListComponent,
    MobileTabsComponent,
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent implements OnInit {
  private readonly scrollThreshold = 300;
  private readonly commentsLimit = 5;
  private readonly repliesLimit = 10;
  private readonly alert = inject(AlertService);
  private readonly postEntityService = inject(PostEntityService);
  private readonly postsService = inject(PostsService);
  private readonly postThreadService = inject(PostThreadService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  protected commentsByPostId: Record<string, Comment[]> = {};
  protected commentsHasMoreByPostId: Record<string, boolean> = {};
  protected commentsPageByPostId: Record<string, number> = {};
  protected posts: Post[] = [];
  protected currentUser: User | null = null;
  protected currentUserId: string | null = null;
  protected editingPost: Post | null = null;
  protected sharingPost: Post | null = null;
  protected page = 1;
  protected readonly limit = 20;
  protected expandedCommentsPostId: string | null = null;
  protected hasMore = true;
  protected isLoadingMore = false;
  protected loadingCommentsPostId: string | null = null;
  protected loadingMoreCommentsPostId: string | null = null;
  protected loadingRepliesCommentId: string | null = null;
  protected loadingMoreRepliesCommentId: string | null = null;
  protected repliesByCommentId: Record<string, Comment[]> = {};
  protected repliesHasMoreByCommentId: Record<string, boolean> = {};
  protected repliesPageByCommentId: Record<string, number> = {};
  protected submittingCommentPostId: string | null = null;
  protected submittingReplyCommentId: string | null = null;
  protected isUpdatingPost = false;
  protected isSharingPost = false;
  protected isMobileSuggestionsOpen = false;

  @Output() like = new EventEmitter<Post>();
  @Output() bookmark = new EventEmitter<Post>();
  @Output() delete = new EventEmitter<Post>();
  @Output() edit = new EventEmitter<Post>();
  @Output() comment = new EventEmitter<Post>();
  @Output() deleteComment = new EventEmitter<Comment>();
  @Output() editComment = new EventEmitter<Comment>();
  @Output() likeComment = new EventEmitter<Comment>();
  @Output() share = new EventEmitter<Post>();

  protected activeSection: FeedSection = 'feed';
  protected readonly sectionLabels: Record<FeedSection, string> = {
    feed: 'Feed',
    'my-posts': 'My Posts',
    community: 'Community',
    saved: 'Saved',
  };

  ngOnInit(): void {
    const cachedUser = this.userService.getCachedMyProfile();
    if (cachedUser) {
      this.currentUser = cachedUser;
      this.currentUserId = cachedUser.id ?? cachedUser._id;
    }

    this.loadCurrentUser();
    this.loadActiveSection();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (!this.canPaginateActiveSection || !this.hasMore || this.isLoadingMore) {
      return;
    }

    const viewportBottom = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    if (pageHeight - viewportBottom <= this.scrollThreshold) {
      this.loadMorePosts();
    }
  }

  protected setActiveSection(section: FeedSection): void {
    if (this.activeSection === section) {
      return;
    }

    this.activeSection = section;
    this.resetPagination();
    this.loadActiveSection();
  }

  protected prependPost(post: Post): void {
    if (this.activeSection !== 'feed') {
      return;
    }

    this.posts = [
      this.postEntityService.normalizePostWithCurrentUser(post, this.currentUser, this.currentUserId),
      ...this.posts,
    ];
  }

  protected handleLike(post: Post): void {
    this.postsService.likeUnlikePost(post.id, null).subscribe({
      next: (response) => {
        this.posts = this.posts.map((currentPost) =>
          currentPost.id === post.id
            ? this.postEntityService.mergeAndNormalizePost(
                currentPost,
                response.data.post,
                this.currentUser,
                this.currentUserId,
              )
            : currentPost,
        );
        this.like.emit(
          this.postEntityService.mergeAndNormalizePost(post, response.data.post, this.currentUser, this.currentUserId),
        );
      },
      error: () => {
        this.alert.error('Like failed', 'We could not update the like right now.');
      },
    });
  }

  protected handleBookmark(post: Post): void {
    this.postsService.bookmarkUnbookmarkPost(post.id, null).subscribe({
      next: (response) => {
        if (this.activeSection === 'saved' && !response.data.bookmarked) {
          this.posts = this.posts.filter((currentPost) => currentPost.id !== post.id);
          this.bookmark.emit({ ...post, bookmarked: false });
          return;
        }

        this.posts = this.posts.map((currentPost) =>
          currentPost.id === post.id
            ? this.postEntityService.mergeAndNormalizePost(
                currentPost,
                {
                  ...currentPost,
                  bookmarked: response.data.bookmarked,
                },
                this.currentUser,
                this.currentUserId,
              )
            : currentPost,
        );
        this.bookmark.emit(
          this.postEntityService.mergeAndNormalizePost(
            post,
            {
              ...post,
              bookmarked: response.data.bookmarked,
            },
            this.currentUser,
            this.currentUserId,
          ),
        );
      },
      error: () => {
        this.alert.error('Save failed', 'We could not update this saved post right now.');
      },
    });
  }

  protected handleDelete(post: Post): void {
    this.postsService.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter((currentPost) => currentPost.id !== post.id);
        this.delete.emit(post);
        this.alert.success('Post deleted', 'Your post was removed successfully.');
      },
      error: () => {
        this.alert.error('Delete failed', 'We could not delete this post right now.');
      },
    });
  }

  protected handleEdit(post: Post): void {
    this.editingPost = post;
  }

  protected closeEditModal(): void {
    if (this.isUpdatingPost) {
      return;
    }

    this.editingPost = null;
  }

  protected saveEditedPost(payload: { postId: string; body: string; privacy: PostPrivacy }): void {
    this.isUpdatingPost = true;

    this.postsService
      .updatePost(payload.postId, {
        body: payload.body,
        privacy: payload.privacy,
      })
      .subscribe({
        next: (response) => {
          this.posts = this.posts.map((currentPost) =>
            currentPost.id === payload.postId
              ? this.postEntityService.mergeAndNormalizePost(
                  currentPost,
                  response.data.post,
                  this.currentUser,
                  this.currentUserId,
                )
              : currentPost,
          );
          this.edit.emit(
            this.postEntityService.mergeAndNormalizePost(
              this.editingPost as Post,
              response.data.post,
              this.currentUser,
              this.currentUserId,
            ),
          );
          this.editingPost = null;
          this.isUpdatingPost = false;
          this.alert.success('Post updated', 'Your post was updated successfully.');
        },
        error: () => {
          this.isUpdatingPost = false;
          this.alert.error('Update failed', 'We could not update this post right now.');
        },
      });
  }

  protected handleComment(post: Post): void {
    if (this.expandedCommentsPostId === post.id) {
      this.expandedCommentsPostId = null;
      return;
    }

    this.expandedCommentsPostId = post.id;
    this.comment.emit(post);

    if (this.commentsByPostId[post.id]) {
      return;
    }

    this.loadCommentsPage(post, 1);
  }

  protected handleSubmitComment(payload: { post: Post; content: string; image: File | null }): void {
    this.submittingCommentPostId = payload.post.id;

    this.postThreadService.createComment(payload.post.id, payload.content, payload.image).subscribe({
      next: (response) => {
        const nextComments = [response.data.comment, ...(this.commentsByPostId[payload.post.id] ?? [])];
        this.commentsByPostId = {
          ...this.commentsByPostId,
          [payload.post.id]: nextComments,
        };
        this.posts = this.posts.map((currentPost) =>
          currentPost.id === payload.post.id
            ? {
                ...currentPost,
                commentsCount: (currentPost.commentsCount ?? 0) + 1,
                topComment: response.data.comment,
              }
            : currentPost,
        );
        this.submittingCommentPostId = null;
      },
      error: () => {
        this.submittingCommentPostId = null;
        this.alert.error('Comment failed', 'We could not publish your comment right now.');
      },
    });
  }

  protected handleToggleReplies(payload: { post: Post; comment: Comment }): void {
    if (this.repliesByCommentId[payload.comment._id]) {
      return;
    }

    this.loadRepliesPage(payload.post, payload.comment, 1);
  }

  protected handleSubmitReply(payload: {
    post: Post;
    comment: Comment;
    content: string;
    image: File | null;
  }): void {
    this.submittingReplyCommentId = payload.comment._id;

    this.postThreadService
      .createReply(payload.post.id, payload.comment._id, payload.content, payload.image)
      .subscribe({
      next: (response) => {
        const nextReplies = [response.data.reply, ...(this.repliesByCommentId[payload.comment._id] ?? [])];
        this.repliesByCommentId = {
          ...this.repliesByCommentId,
          [payload.comment._id]: nextReplies,
        };
        this.commentsByPostId = {
          ...this.commentsByPostId,
          [payload.post.id]: (this.commentsByPostId[payload.post.id] ?? []).map((comment) =>
            comment._id === payload.comment._id
              ? { ...comment, repliesCount: (comment.repliesCount ?? 0) + 1 }
              : comment,
          ),
        };
        this.submittingReplyCommentId = null;
      },
      error: () => {
        this.submittingReplyCommentId = null;
        this.alert.error('Reply failed', 'We could not publish your reply right now.');
      },
    });
  }

  protected handleLikeComment(payload: { post: Post; comment: Comment }): void {
    this.postThreadService.likeComment(payload.post.id, payload.comment._id).subscribe({
      next: (response) => {
        this.commentsByPostId = {
          ...this.commentsByPostId,
          [payload.post.id]: (this.commentsByPostId[payload.post.id] ?? []).map((comment) =>
            comment._id === payload.comment._id
              ? { ...comment, ...response.data.comment, likesCount: response.data.likesCount }
              : comment,
          ),
        };

        this.repliesByCommentId = Object.fromEntries(
          Object.entries(this.repliesByCommentId).map(([commentId, replies]) => [
            commentId,
            replies.map((reply) =>
              reply._id === payload.comment._id
                ? { ...reply, ...response.data.comment, likesCount: response.data.likesCount }
                : reply,
            ),
          ]),
        );

        this.likeComment.emit({
          ...payload.comment,
          ...response.data.comment,
          likesCount: response.data.likesCount,
        });
      },
      error: () => {
        this.alert.error('Comment like failed', 'We could not update the comment like right now.');
      },
    });
  }

  protected handleDeleteComment(payload: { post: Post; comment: Comment }): void {
    this.postThreadService.deleteComment(payload.post.id, payload.comment._id).subscribe({
      next: () => {
        if (payload.comment.parentComment) {
          this.repliesByCommentId = Object.fromEntries(
            Object.entries(this.repliesByCommentId).map(([commentId, replies]) => [
              commentId,
              replies.filter((reply) => reply._id !== payload.comment._id),
            ]),
          );

          this.commentsByPostId = {
            ...this.commentsByPostId,
            [payload.post.id]: (this.commentsByPostId[payload.post.id] ?? []).map((comment) =>
              comment._id === payload.comment.parentComment
                ? { ...comment, repliesCount: Math.max(0, (comment.repliesCount ?? 0) - 1) }
                : comment,
            ),
          };
        } else {
          const nextComments = (this.commentsByPostId[payload.post.id] ?? []).filter(
            (comment) => comment._id !== payload.comment._id,
          );

          this.commentsByPostId = {
            ...this.commentsByPostId,
            [payload.post.id]: nextComments,
          };

          this.posts = this.posts.map((currentPost) =>
            currentPost.id === payload.post.id
              ? {
                  ...currentPost,
                  commentsCount: Math.max(0, (currentPost.commentsCount ?? 0) - 1),
                  topComment:
                    currentPost.topComment?._id === payload.comment._id
                      ? nextComments[0] ?? null
                      : currentPost.topComment,
                }
              : currentPost,
          );
        }

        this.deleteComment.emit(payload.comment);
      },
      error: () => {
        this.alert.error('Delete failed', 'We could not delete this comment right now.');
      },
    });
  }

  protected handleEditComment(payload: { post: Post; comment: Comment; content: string }): void {
    this.postThreadService.updateComment(payload.post.id, payload.comment._id, payload.content).subscribe({
        next: (response) => {
          const updatedComment = response.data.comment;

          if (payload.comment.parentComment) {
            this.repliesByCommentId = Object.fromEntries(
              Object.entries(this.repliesByCommentId).map(([commentId, replies]) => [
                commentId,
                replies.map((reply) =>
                  reply._id === payload.comment._id ? { ...reply, ...updatedComment } : reply,
                ),
              ]),
            );
          } else {
            this.commentsByPostId = {
              ...this.commentsByPostId,
              [payload.post.id]: (this.commentsByPostId[payload.post.id] ?? []).map((comment) =>
                comment._id === payload.comment._id ? { ...comment, ...updatedComment } : comment,
              ),
            };

            this.posts = this.posts.map((currentPost) =>
              currentPost.id === payload.post.id && currentPost.topComment?._id === payload.comment._id
                ? { ...currentPost, topComment: { ...currentPost.topComment, ...updatedComment } }
                : currentPost,
            );
          }

          this.editComment.emit(updatedComment);
        },
        error: () => {
          this.alert.error('Edit failed', 'We could not update this comment right now.');
        },
      });
  }

  protected handleShare(post: Post): void {
    this.sharingPost = post;
  }

  protected handleViewDetails(post: Post): void {
    this.router.navigate(['/posts', post.id]);
  }

  protected closeShareModal(): void {
    if (this.isSharingPost) {
      return;
    }

    this.sharingPost = null;
  }

  protected submitShare(payload: { postId: string; body: string }): void {
    this.isSharingPost = true;
    const sourcePost = this.sharingPost;

    this.postsService
      .sharePost(payload.postId, payload.body ? { body: payload.body } : {})
      .subscribe({
        next: (response) => {
          const sharedPost = this.postEntityService.normalizePostWithCurrentUser(
            this.postEntityService.ensureSharedPostPreview(response.data.post, sourcePost),
            this.currentUser,
            this.currentUserId,
          );

          if (this.activeSection === 'feed' || this.activeSection === 'community' || this.activeSection === 'my-posts') {
            this.posts = [
              sharedPost,
              ...this.postEntityService.bumpSharedPostCount(payload.postId, this.posts),
            ];
          } else {
            this.posts = this.postEntityService.bumpSharedPostCount(payload.postId, this.posts);
          }

          this.share.emit(sharedPost);
          this.sharingPost = null;
          this.isSharingPost = false;
          this.alert.success('Post shared', 'Your post was shared successfully.');
        },
        error: () => {
          this.isSharingPost = false;
          this.alert.error('Share failed', 'We could not share this post right now.');
        },
      });
  }

  protected handleLoadMoreComments(post: Post): void {
    const nextPage = (this.commentsPageByPostId[post.id] ?? 1) + 1;
    this.loadCommentsPage(post, nextPage, true);
  }

  protected handleLoadMoreReplies(payload: { post: Post; comment: Comment }): void {
    const nextPage = (this.repliesPageByCommentId[payload.comment._id] ?? 1) + 1;
    this.loadRepliesPage(payload.post, payload.comment, nextPage, true);
  }

  protected openMobileSuggestions(): void {
    this.isMobileSuggestionsOpen = true;
  }

  protected closeMobileSuggestions(): void {
    this.isMobileSuggestionsOpen = false;
  }

  protected get isFeedSection(): boolean {
    return this.activeSection === 'feed';
  }

  protected get canRenderPostsList(): boolean {
    return (
      this.activeSection === 'feed' ||
      this.activeSection === 'saved' ||
      this.activeSection === 'my-posts' ||
      this.activeSection === 'community'
    );
  }

  protected get canPaginateActiveSection(): boolean {
    return this.activeSection === 'feed' || this.activeSection === 'community';
  }

  protected get emptyStateTitle(): string {
    return `${this.sectionLabels[this.activeSection]} will appear here`;
  }

  protected get emptyStateDescription(): string {
    switch (this.activeSection) {
      case 'my-posts':
        return 'You have not published any posts yet.';
      case 'community':
        return 'There are no community posts to show right now.';
      case 'saved':
        return 'You do not have any saved posts yet.';
      default:
        return 'No posts available right now.';
    }
  }

  private loadActiveSection(): void {
    switch (this.activeSection) {
      case 'feed':
        this.loadFeedPage();
        break;
      case 'community':
        this.loadCommunityPage();
        break;
      case 'saved':
        this.hasMore = false;
        this.isLoadingMore = false;
        this.userService.getBookmarks().subscribe({
          next: (response) => {
            this.posts = this.postEntityService.normalizePostsWithCurrentUser(
              response.data.bookmarks,
              this.currentUser,
              this.currentUserId,
            );
          },
          error: () => {
            this.posts = [];
          },
        });
        break;
      case 'my-posts':
        this.hasMore = false;
        this.isLoadingMore = false;
        if (!this.currentUserId) {
          this.posts = [];
          break;
        }

        this.userService.getUserPosts(this.currentUserId).subscribe({
          next: (response) => {
            this.posts = this.postEntityService.normalizePostsWithCurrentUser(
              response.data.posts,
              this.currentUser,
              this.currentUserId,
            );
          },
          error: () => {
            this.posts = [];
          },
        });
        break;
      default:
        this.hasMore = false;
        this.isLoadingMore = false;
        this.posts = [];
        break;
    }
  }

  private loadFeedPage(): void {
    this.isLoadingMore = true;
    this.postsService.getHomeFeed(this.page, this.limit).subscribe({
      next: (response) => {
        const normalizedPosts = this.postEntityService.normalizePostsWithCurrentUser(
          response.data.posts,
          this.currentUser,
          this.currentUserId,
        );
        this.posts = this.page === 1 ? normalizedPosts : [...this.posts, ...normalizedPosts];
        this.updatePaginationState(
          response.meta?.pagination.currentPage,
          response.meta?.pagination.numberOfPages,
          response.data.posts.length,
        );
      },
      error: () => {
        this.posts = this.page === 1 ? [] : this.posts;
        this.isLoadingMore = false;
      },
    });
  }

  private loadCommunityPage(): void {
    this.isLoadingMore = true;
    this.postsService.getAllPosts(this.page, this.limit).subscribe({
      next: (response) => {
        const normalizedPosts = this.postEntityService.normalizePostsWithCurrentUser(
          response.data.posts,
          this.currentUser,
          this.currentUserId,
        );
        this.posts = this.page === 1 ? normalizedPosts : [...this.posts, ...normalizedPosts];
        this.updatePaginationState(
          response.meta?.pagination.currentPage,
          response.meta?.pagination.numberOfPages,
          response.data.posts.length,
        );
      },
      error: () => {
        this.posts = this.page === 1 ? [] : this.posts;
        this.isLoadingMore = false;
      },
    });
  }

  private loadMorePosts(): void {
    if (!this.canPaginateActiveSection || !this.hasMore || this.isLoadingMore) {
      return;
    }

    this.page += 1;

    if (this.activeSection === 'feed') {
      this.loadFeedPage();
      return;
    }

    if (this.activeSection === 'community') {
      this.loadCommunityPage();
    }
  }

  private resetPagination(): void {
    this.page = 1;
    this.hasMore = true;
    this.isLoadingMore = false;
    this.posts = [];
  }

  private updatePaginationState(
    currentPage: number | undefined,
    numberOfPages: number | undefined,
    receivedCount: number,
  ): void {
    if (currentPage && numberOfPages) {
      this.page = currentPage;
      this.hasMore = currentPage < numberOfPages;
      this.isLoadingMore = false;
      return;
    }

    this.hasMore = receivedCount === this.limit;
    this.isLoadingMore = false;
  }

  private loadCurrentUser(): void {
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        this.currentUser = response.data.user;
        this.currentUserId = response.data.user.id ?? response.data.user._id;
        this.posts = this.postEntityService.normalizePostsWithCurrentUser(
          this.posts,
          this.currentUser,
          this.currentUserId,
        );
      },
      error: () => {
        this.currentUser = null;
        this.currentUserId = null;
      },
    });
  }

  private loadCommentsPage(post: Post, page: number, append = false): void {
    if (append) {
      this.loadingMoreCommentsPostId = post.id;
    } else {
      this.loadingCommentsPostId = post.id;
    }

    this.postThreadService.getCommentsPage(post.id, page, this.commentsLimit).subscribe({
      next: (response) => {
        const incomingComments = response.data.comments;
        this.commentsByPostId = {
          ...this.commentsByPostId,
          [post.id]: append
            ? [...(this.commentsByPostId[post.id] ?? []), ...incomingComments]
            : incomingComments,
        };
        this.commentsPageByPostId = {
          ...this.commentsPageByPostId,
          [post.id]: response.meta?.pagination.currentPage ?? page,
        };
        this.commentsHasMoreByPostId = {
          ...this.commentsHasMoreByPostId,
          [post.id]: this.postThreadService.hasMoreFromPagination(
            response.meta?.pagination.currentPage,
            response.meta?.pagination.numberOfPages,
            incomingComments.length,
            this.commentsLimit,
          ),
        };
        this.loadingCommentsPostId = null;
        this.loadingMoreCommentsPostId = null;
      },
      error: () => {
        this.loadingCommentsPostId = null;
        this.loadingMoreCommentsPostId = null;
        this.alert.error('Comments failed', 'We could not load comments right now.');
      },
    });
  }

  private loadRepliesPage(post: Post, comment: Comment, page: number, append = false): void {
    if (append) {
      this.loadingMoreRepliesCommentId = comment._id;
    } else {
      this.loadingRepliesCommentId = comment._id;
    }

    this.postThreadService.getRepliesPage(post.id, comment._id, page, this.repliesLimit).subscribe({
        next: (response) => {
          const incomingReplies = response.data.replies;
          this.repliesByCommentId = {
            ...this.repliesByCommentId,
            [comment._id]: append
              ? [...(this.repliesByCommentId[comment._id] ?? []), ...incomingReplies]
              : incomingReplies,
          };
          this.repliesPageByCommentId = {
            ...this.repliesPageByCommentId,
            [comment._id]: response.meta?.pagination.currentPage ?? page,
          };
          this.repliesHasMoreByCommentId = {
          ...this.repliesHasMoreByCommentId,
          [comment._id]: this.postThreadService.hasMoreFromPagination(
            response.meta?.pagination.currentPage,
            response.meta?.pagination.numberOfPages,
            incomingReplies.length,
              this.repliesLimit,
            ),
          };
          this.loadingRepliesCommentId = null;
          this.loadingMoreRepliesCommentId = null;
        },
        error: () => {
          this.loadingRepliesCommentId = null;
          this.loadingMoreRepliesCommentId = null;
          this.alert.error('Replies failed', 'We could not load replies right now.');
        },
      });
  }

}
