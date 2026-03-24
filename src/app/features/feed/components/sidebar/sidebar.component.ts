import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FeedSection } from '../../types/feed-section.type';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() activeSection: FeedSection = 'feed';
  @Output() sectionChange = new EventEmitter<FeedSection>();

  protected readonly sections = [
    { id: 'feed', label: 'Feed', icon: 'feed' },
    { id: 'my-posts', label: 'My Posts', icon: 'my-posts' },
    { id: 'community', label: 'Community', icon: 'community' },
    { id: 'saved', label: 'Saved', icon: 'saved' },
  ] as const;

  protected selectSection(section: FeedSection): void {
    this.sectionChange.emit(section);
  }
}
