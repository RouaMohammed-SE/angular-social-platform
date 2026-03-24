import { Injectable } from '@angular/core';
import { Post } from '../../models/post.interface';
import { User } from '../../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class PostEntityService {
  normalizePostWithCurrentUser(post: Post, currentUser: User | null, currentUserId: string | null): Post {
    const normalizedId = this.getEntityId(post);
    const normalizedUserId = currentUserId ?? this.getEntityId(currentUser);
    const normalizedSharedPost = this.normalizeSharedPost(post.sharedPost, currentUser, normalizedUserId);

    return {
      ...post,
      id: normalizedId,
      _id: post._id ?? normalizedId,
      likes: Array.isArray(post.likes) ? post.likes : [],
      likesCount: post.likesCount ?? post.likes?.length ?? 0,
      commentsCount: post.commentsCount ?? 0,
      sharesCount: post.sharesCount ?? 0,
      topComment: post.topComment ?? null,
      sharedPost: normalizedSharedPost,
      sharedPostUnavailable: post.sharedPostUnavailable ?? (post.isShare && !normalizedSharedPost),
      bookmarked: this.resolveBookmarked(post, currentUser, normalizedUserId),
      user: this.normalizeUserReference(post.user, currentUser, normalizedUserId),
    };
  }

  normalizePostsWithCurrentUser(posts: Post[], currentUser: User | null, currentUserId: string | null): Post[] {
    return posts.map((post) => this.normalizePostWithCurrentUser(post, currentUser, currentUserId));
  }

  mergePostSnapshot(currentPost: Post, incomingPost: Partial<Post>): Post {
    const mergedSharedPost = this.mergeSharedPost(currentPost.sharedPost, incomingPost.sharedPost);

    return {
      ...currentPost,
      ...incomingPost,
      id: this.getEntityId(incomingPost) || currentPost.id,
      _id: incomingPost._id ?? currentPost._id,
      likes: incomingPost.likes ?? currentPost.likes,
      likesCount: incomingPost.likesCount ?? incomingPost.likes?.length ?? currentPost.likesCount,
      commentsCount: incomingPost.commentsCount ?? currentPost.commentsCount,
      sharesCount: incomingPost.sharesCount ?? currentPost.sharesCount,
      topComment: incomingPost.topComment ?? currentPost.topComment,
      bookmarked: incomingPost.bookmarked ?? currentPost.bookmarked,
      sharedPost: mergedSharedPost,
      sharedPostUnavailable:
        incomingPost.sharedPostUnavailable ??
        (incomingPost.isShare ?? currentPost.isShare ? !mergedSharedPost : currentPost.sharedPostUnavailable),
      };
  }

  mergeAndNormalizePost(
    currentPost: Post,
    incomingPost: Partial<Post>,
    currentUser: User | null,
    currentUserId: string | null,
  ): Post {
    return this.normalizePostWithCurrentUser(
      this.mergePostSnapshot(currentPost, incomingPost),
      currentUser,
      currentUserId,
    );
  }

  ensureSharedPostPreview(sharedPost: Post, sourcePost: Post | null): Post {
    if (sharedPost.sharedPost) {
      return sharedPost;
    }

    const previewSource = sourcePost?.sharedPost ?? sourcePost;
    if (!previewSource) {
      return sharedPost;
    }

    return {
      ...sharedPost,
      sharedPost: this.clonePost(previewSource),
      sharedPostUnavailable: false,
    };
  }

  bumpSharedPostCount(postId: string, posts: Post[]): Post[] {
    return posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          sharesCount: (post.sharesCount ?? 0) + 1,
        };
      }

      if (this.isPostObject(post.sharedPost) && post.sharedPost.id === postId) {
        return {
          ...post,
          sharedPost: {
            ...post.sharedPost,
            sharesCount: (post.sharedPost.sharesCount ?? 0) + 1,
          },
        };
      }

      return post;
    });
  }

  isPostObject(value: Post | null | string | undefined): value is Post {
    return !!value && typeof value === 'object' && ('id' in value || '_id' in value);
  }

  private normalizeSharedPost(
    sharedPost: Post | null,
    currentUser: User | null,
    currentUserId: string | null,
  ): Post | null {
    if (!this.isPostObject(sharedPost)) {
      return null;
    }

    return this.normalizePostWithCurrentUser(sharedPost, currentUser, currentUserId);
  }

  private normalizeUserReference(
    user: Post['user'],
    currentUser: User | null,
    currentUserId: string | null,
  ): Post['user'] {
    if (typeof user === 'string') {
      if (currentUser && user === currentUserId) {
        return {
          ...currentUser,
          id: currentUser.id ?? currentUserId ?? currentUser._id,
          _id: currentUser._id ?? currentUserId ?? currentUser.id ?? '',
        };
      }

      return user;
    }

    const normalizedId = this.getEntityId(user);

    return {
      ...user,
      id: user.id ?? normalizedId,
      _id: user._id ?? normalizedId,
    };
  }

  private resolveBookmarked(post: Post, currentUser: User | null, currentUserId: string | null): boolean {
    if (typeof post.bookmarked === 'boolean') {
      return post.bookmarked;
    }

    if (!currentUser || !Array.isArray(currentUser.bookmarks)) {
      return false;
    }

    const postId = this.getEntityId(post);
    return currentUser.bookmarks.includes(postId) || (!!currentUserId && currentUser.bookmarks.includes(post._id));
  }

  private mergeSharedPost(currentSharedPost: Post | null, incomingSharedPost: Post | null | undefined): Post | null {
    if (incomingSharedPost === undefined) {
      return currentSharedPost;
    }

    // Some partial post responses (like like/unlike on shared posts) come back with
    // `sharedPost` as `null` or just an id string, even though the current card
    // already has the full embedded post preview. Preserve the existing preview
    // instead of collapsing the UI until a full refresh.
    if (!this.isPostObject(incomingSharedPost) && this.isPostObject(currentSharedPost)) {
      return currentSharedPost;
    }

    if (!this.isPostObject(incomingSharedPost)) {
      return null;
    }

    if (!this.isPostObject(currentSharedPost)) {
      return this.clonePost(incomingSharedPost);
    }

    return {
      ...currentSharedPost,
      ...incomingSharedPost,
      id: this.getEntityId(incomingSharedPost) || currentSharedPost.id,
      _id: incomingSharedPost._id ?? currentSharedPost._id,
    };
  }

  private clonePost(post: Post): Post {
    return {
      ...post,
      sharedPost: this.isPostObject(post.sharedPost) ? this.clonePost(post.sharedPost) : null,
    };
  }

  private getEntityId(entity: { id?: string; _id?: string } | null | undefined): string {
    return entity?.id ?? entity?._id ?? '';
  }
}
