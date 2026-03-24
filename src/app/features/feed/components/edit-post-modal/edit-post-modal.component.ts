import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Post, PostPrivacy } from '../../../../core/models/post.interface';
import { User } from '../../../../core/models/user.interface';
import { AvatarPhotoPipe } from '../../../../shared/pipes/avatar-photo.pipe';

@Component({
  selector: 'app-edit-post-modal',
  imports: [AvatarPhotoPipe],
  templateUrl: './edit-post-modal.component.html',
  styleUrl: './edit-post-modal.component.css',
})
export class EditPostModalComponent implements OnChanges {
  @Input({ required: true }) post!: Post;
  @Input() currentUserName = 'You';
  @Input() currentUser: User | null = null;
  @Input() isSubmitting = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ postId: string; body: string; privacy: PostPrivacy }>();

  protected body = '';
  protected privacy: PostPrivacy = 'public';
  protected showPrivacyMenu = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post']?.currentValue) {
      this.body = this.post.body ?? '';
      this.privacy = this.normalizePrivacy(this.post.privacy);
      this.showPrivacyMenu = false;
    }
  }

  protected onBodyInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.body = target.value;
  }

  protected togglePrivacyMenu(): void {
    this.showPrivacyMenu = !this.showPrivacyMenu;
  }

  protected setPrivacy(value: PostPrivacy): void {
    this.privacy = value;
    this.showPrivacyMenu = false;
  }

  protected submit(): void {
    const trimmedBody = this.body.trim();
    if (!trimmedBody || this.isSubmitting) {
      return;
    }

    this.save.emit({
      postId: this.post.id,
      body: trimmedBody,
      privacy: this.privacy,
    });
  }

  private normalizePrivacy(value: Post['privacy']): PostPrivacy {
    switch (value) {
      case 'following':
        return 'following';
      case 'only_me':
        return 'only_me';
      default:
        return 'public';
    }
  }
}
