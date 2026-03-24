import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../../../../../core/models/user.interface';
import { AvatarPhotoPipe } from '../../../../../../shared/pipes/avatar-photo.pipe';
import { PostCardMenuComponent } from '../post-card-menu/post-card-menu.component';

@Component({
  selector: 'app-post-card-header',
  imports: [PostCardMenuComponent, AvatarPhotoPipe, RouterLink],
  templateUrl: './post-card-header.component.html',
  styleUrl: './post-card-header.component.css',
})
export class PostCardHeaderComponent {
  @Input() author: User | null = null;
  @Input() bookmarked = false;
  @Input() isCurrentUserPost = false;
  @Input() isMenuOpen = false;
  @Input() isShare = false;
  @Input() privacyLabel = 'Public';
  @Input() relativeCreatedAt = '';

  @Output() toggleMenu = new EventEmitter<void>();
  @Output() bookmark = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  protected get authorProfileLink(): string[] | null {
    if (!this.author) {
      return null;
    }

    return ['/profile', this.author.id ?? this.author._id];
  }

  protected get authorUsername(): string {
    return this.author?.username ?? '';
  }
}
