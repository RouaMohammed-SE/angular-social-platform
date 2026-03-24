import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Comment } from '../../core/models/comment.interface';
import { Post, PostPrivacy } from '../../core/models/post.interface';
import { User } from '../../core/models/user.interface';
import { AlertService } from '../../core/services/alert/alert.service';
import { PostEntityService } from '../../core/services/post-entity/post-entity.service';
import { PostsService } from '../../core/services/posts/posts.service';
import { PostThreadService } from '../../core/services/post-thread/post-thread.service';
import { UserService } from '../../core/services/user/user.service';
import { EditPostModalComponent } from '../feed/components/edit-post-modal/edit-post-modal.component';
import { PostCardComponent } from '../feed/components/post-card/post-card.component';
import { SharePostModalComponent } from '../feed/components/share-post-modal/share-post-modal.component';

@Component({
  selector: 'app-post-details',
  imports: [PostCardComponent, EditPostModalComponent, SharePostModalComponent],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alert = inject(AlertService);
  private readonly postEntityService = inject(PostEntityService);
  private readonly postsService = inject(PostsService);
  private readonly postThreadService = inject(PostThreadService);
  private readonly userService = inject(UserService);
  private readonly commentsLimit = 5;
  private readonly repliesLimit = 10;

  protected post: Post | null = null;
  protected currentUser: User | null = null;
  protected currentUserId: string | null = null;
  protected comments: Comment[] = [];
  protected commentsHasMore = false;
  protected commentsPage = 1;
  protected repliesByCommentId: Record<string, Comment[]> = {};
  protected repliesHasMoreByCommentId: Record<string, boolean> = {};
  protected repliesPageByCommentId: Record<string, number> = {};
  protected isLoadingPost = true;
  protected isLoadingComments = false;
  protected isLoadingMoreComments = false;
  protected loadingRepliesCommentId: string | null = null;
  protected loadingMoreRepliesCommentId: string | null = null;
  protected isSubmittingComment = false;
  protected submittingReplyCommentId: string | null = null;
  protected editingPost: Post | null = null;
  protected sharingPost: Post | null = null;
  protected isUpdatingPost = false;
  protected isSharingPost = false;

  constructor() {
    const postId = this.route.snapshot.paramMap.get('postId');
    const cachedUser = this.userService.getCachedMyProfile();

    if (cachedUser) {
      this.currentUser = cachedUser;
      this.currentUserId = cachedUser.id ?? cachedUser._id;
    }

    this.loadCurrentUser();

    if (!postId) {
      this.isLoadingPost = false;
      this.router.navigate(['/feed']);
      return;
    }

    this.loadPost(postId);
  }

  protected goBack(): void {
    this.location.back();
  }

  protected handleLike(post: Post): void {
    this.postsService.likeUnlikePost(post.id, null).subscribe({
      next: (response) => {
        if (!this.post) {
          return;
        }

        this.post = this.postEntityService.mergeAndNormalizePost(
          this.post,
          response.data.post,
          this.currentUser,
          this.currentUserId,
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
        if (!this.post) {
          return;
        }

        this.post = this.postEntityService.normalizePostWithCurrentUser(
          {
            ...this.post,
            bookmarked: response.data.bookmarked,
          },
          this.currentUser,
          this.currentUserId,
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
        this.alert.success('Post deleted', 'Your post was removed successfully.');
        this.router.navigate(['/feed']);
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
          if (this.post) {
            this.post = this.postEntityService.mergeAndNormalizePost(
              this.post,
              response.data.post,
              this.currentUser,
              this.currentUserId,
            );
          }
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

  protected handleShare(post: Post): void {
    this.sharingPost = post;
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
        next: () => {
          if (this.post && this.post.id === payload.postId) {
            this.post = {
              ...this.post,
              sharesCount: (this.post.sharesCount ?? 0) + 1,
            };
          } else if (
            this.post &&
            this.postEntityService.isPostObject(this.post.sharedPost) &&
            this.post.sharedPost.id === payload.postId
          ) {
            this.post = {
              ...this.post,
              sharedPost: {
                ...this.post.sharedPost,
                sharesCount: (this.post.sharedPost.sharesCount ?? 0) + 1,
              },
            };
          }

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

  protected handleComment(): void {
    if (!this.post || this.comments.length > 0 || this.isLoadingComments) {
      return;
    }

    this.loadCommentsPage(1);
  }

  protected handleSubmitComment(payload: { post: Post; content: string; image: File | null }): void {
    if (!this.post) {
      return;
    }

    this.isSubmittingComment = true;

    this.postThreadService.createComment(this.post.id, payload.content, payload.image).subscribe({
      next: (response) => {
        this.comments = [response.data.comment, ...this.comments];
        this.post = {
          ...this.post!,
          commentsCount: (this.post!.commentsCount ?? 0) + 1,
          topComment: response.data.comment,
        };
        this.isSubmittingComment = false;
      },
      error: () => {
        this.isSubmittingComment = false;
        this.alert.error('Comment failed', 'We could not publish your comment right now.');
      },
    });
  }

  protected handleToggleReplies(payload: { post: Post; comment: Comment }): void {
    if (this.repliesByCommentId[payload.comment._id]) {
      return;
    }

    this.loadRepliesPage(payload.comment, 1);
  }

  protected handleSubmitReply(payload: {
    post: Post;
    comment: Comment;
    content: string;
    image: File | null;
  }): void {
    if (!this.post) {
      return;
    }

    this.submittingReplyCommentId = payload.comment._id;

    this.postThreadService
      .createReply(this.post.id, payload.comment._id, payload.content, payload.image)
      .subscribe({
      next: (response) => {
        this.repliesByCommentId = {
          ...this.repliesByCommentId,
          [payload.comment._id]: [response.data.reply, ...(this.repliesByCommentId[payload.comment._id] ?? [])],
        };
        this.comments = this.comments.map((comment) =>
          comment._id === payload.comment._id
            ? { ...comment, repliesCount: (comment.repliesCount ?? 0) + 1 }
            : comment,
        );
        this.submittingReplyCommentId = null;
      },
      error: () => {
        this.submittingReplyCommentId = null;
        this.alert.error('Reply failed', 'We could not publish your reply right now.');
      },
    });
  }

  protected handleLikeComment(payload: { post: Post; comment: Comment }): void {
    if (!this.post) {
      return;
    }

    this.postThreadService.likeComment(this.post.id, payload.comment._id).subscribe({
      next: (response) => {
        this.comments = this.comments.map((comment) =>
          comment._id === payload.comment._id
            ? { ...comment, ...response.data.comment, likesCount: response.data.likesCount }
            : comment,
        );

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
      },
      error: () => {
        this.alert.error('Comment like failed', 'We could not update the comment like right now.');
      },
    });
  }

  protected handleDeleteComment(payload: { post: Post; comment: Comment }): void {
    if (!this.post) {
      return;
    }

    this.postThreadService.deleteComment(this.post.id, payload.comment._id).subscribe({
      next: () => {
        if (payload.comment.parentComment) {
          this.repliesByCommentId = Object.fromEntries(
            Object.entries(this.repliesByCommentId).map(([commentId, replies]) => [
              commentId,
              replies.filter((reply) => reply._id !== payload.comment._id),
            ]),
          );

          this.comments = this.comments.map((comment) =>
            comment._id === payload.comment.parentComment
              ? { ...comment, repliesCount: Math.max(0, (comment.repliesCount ?? 0) - 1) }
              : comment,
          );
        } else {
          const nextComments = this.comments.filter((comment) => comment._id !== payload.comment._id);
          this.comments = nextComments;
          this.post = {
            ...this.post!,
            commentsCount: Math.max(0, (this.post!.commentsCount ?? 0) - 1),
            topComment:
              this.post!.topComment?._id === payload.comment._id ? nextComments[0] ?? null : this.post!.topComment,
          };
        }
      },
      error: () => {
        this.alert.error('Delete failed', 'We could not delete this comment right now.');
      },
    });
  }

  protected handleEditComment(payload: { post: Post; comment: Comment; content: string }): void {
    if (!this.post) {
      return;
    }

    this.postThreadService.updateComment(this.post.id, payload.comment._id, payload.content).subscribe({
        next: (response) => {
          const updatedComment = response.data.comment;
          const currentPost = this.post;

          if (payload.comment.parentComment) {
            this.repliesByCommentId = Object.fromEntries(
              Object.entries(this.repliesByCommentId).map(([commentId, replies]) => [
                commentId,
                replies.map((reply) =>
                  reply._id === payload.comment._id ? { ...reply, ...updatedComment } : reply,
                ),
              ]),
            );
            return;
          }

          this.comments = this.comments.map((comment) =>
            comment._id === payload.comment._id ? { ...comment, ...updatedComment } : comment,
          );

          if (currentPost?.topComment?._id === payload.comment._id) {
            this.post = {
              ...currentPost,
              topComment: { ...currentPost.topComment, ...updatedComment },
            };
          }
        },
        error: () => {
          this.alert.error('Edit failed', 'We could not update this comment right now.');
        },
      });
  }

  protected handleLoadMoreComments(): void {
    this.loadCommentsPage(this.commentsPage + 1, true);
  }

  protected handleLoadMoreReplies(payload: { post: Post; comment: Comment }): void {
    const nextPage = (this.repliesPageByCommentId[payload.comment._id] ?? 1) + 1;
    this.loadRepliesPage(payload.comment, nextPage, true);
  }

  private loadPost(postId: string): void {
    this.postsService.getSinglePost(postId).subscribe({
      next: (response) => {
        const singlePost = 'post' in response.data ? response.data.post : response.data.posts[0];

        if (!singlePost) {
          this.isLoadingPost = false;
          this.router.navigate(['/feed']);
          return;
        }

        this.post = this.postEntityService.normalizePostWithCurrentUser(
          singlePost,
          this.currentUser,
          this.currentUserId,
        );
        this.isLoadingPost = false;
        this.loadCommentsPage(1);
      },
      error: () => {
        this.isLoadingPost = false;
        this.alert.error('Post failed', 'We could not load this post right now.');
        this.router.navigate(['/feed']);
      },
    });
  }

  private loadCurrentUser(): void {
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        this.currentUser = response.data.user;
        this.currentUserId = response.data.user.id ?? response.data.user._id;

        if (this.post) {
          this.post = this.postEntityService.normalizePostWithCurrentUser(
            this.post,
            this.currentUser,
            this.currentUserId,
          );
        }
      },
      error: () => {
        this.currentUser = null;
        this.currentUserId = null;
      },
    });
  }

  private loadCommentsPage(page: number, append = false): void {
    if (!this.post) {
      return;
    }

    if (append) {
      this.isLoadingMoreComments = true;
    } else {
      this.isLoadingComments = true;
    }

    this.postThreadService.getCommentsPage(this.post.id, page, this.commentsLimit).subscribe({
      next: (response) => {
        const incomingComments = response.data.comments;
        this.comments = append ? [...this.comments, ...incomingComments] : incomingComments;
        this.commentsPage = response.meta?.pagination.currentPage ?? page;
        this.commentsHasMore = this.postThreadService.hasMoreFromPagination(
          response.meta?.pagination.currentPage,
          response.meta?.pagination.numberOfPages,
          incomingComments.length,
          this.commentsLimit,
        );
        this.isLoadingComments = false;
        this.isLoadingMoreComments = false;
      },
      error: () => {
        this.isLoadingComments = false;
        this.isLoadingMoreComments = false;
        this.alert.error('Comments failed', 'We could not load comments right now.');
      },
    });
  }

  private loadRepliesPage(comment: Comment, page: number, append = false): void {
    if (!this.post) {
      return;
    }

    if (append) {
      this.loadingMoreRepliesCommentId = comment._id;
    } else {
      this.loadingRepliesCommentId = comment._id;
    }

    this.postThreadService.getRepliesPage(this.post.id, comment._id, page, this.repliesLimit).subscribe({
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
