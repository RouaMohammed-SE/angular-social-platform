import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-post-card-menu',
  imports: [],
  templateUrl: './post-card-menu.component.html',
  styleUrl: './post-card-menu.component.css',
})
export class PostCardMenuComponent {
  @Input() bookmarked = false;
  @Input() isOpen = false;
  @Input() isOwner = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() bookmark = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
