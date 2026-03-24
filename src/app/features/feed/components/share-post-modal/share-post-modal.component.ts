import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Post } from '../../../../core/models/post.interface';
import { User } from '../../../../core/models/user.interface';
import { AvatarPhotoPipe } from '../../../../shared/pipes/avatar-photo.pipe';

@Component({
  selector: 'app-share-post-modal',
  imports: [AvatarPhotoPipe],
  templateUrl: './share-post-modal.component.html',
  styleUrl: './share-post-modal.component.css',
})
export class SharePostModalComponent implements OnChanges {
  @Input({ required: true }) post!: Post;
  @Input() currentUserName = 'You';
  @Input() currentUser: User | null = null;
  @Input() isSubmitting = false;

  @Output() close = new EventEmitter<void>();
  @Output() share = new EventEmitter<{ postId: string; body: string }>();

  protected body = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post']?.currentValue) {
      this.body = '';
    }
  }

  protected onBodyInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.body = target.value;
  }

  protected submit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.share.emit({
      postId: this.post.id,
      body: this.body.trim(),
    });
  }
}
