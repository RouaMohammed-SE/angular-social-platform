import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { Post } from '../../../../core/models/post.interface';
import { User } from '../../../../core/models/user.interface';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { PostsService } from '../../../../core/services/posts/posts.service';
import { AvatarPhotoPipe } from '../../../../shared/pipes/avatar-photo.pipe';

@Component({
  selector: 'app-create-post',
  imports: [AvatarPhotoPipe],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css',
})
export class CreatePostComponent implements OnInit, OnDestroy {
  private readonly postsService = inject(PostsService);
  private readonly alert = inject(AlertService);

  @Input() currentUserName = 'You';
  @Input() currentUser: User | null = null;
  @Output() postCreated = new EventEmitter<Post>();
  @Output() openSuggestions = new EventEmitter<void>();

  privacy: 'public' | 'following' | 'only_me' = 'public';
  showPrivacyMenu = false;
  body = '';
  selectedImage: File | null = null;
  imagePreviewUrl: string | null = null;
  isSubmitting = false;

  ngOnInit(): void {
    initFlowbite();
  }

  ngOnDestroy(): void {
    this.clearImagePreview();
  }

  togglePrivacyMenu() {
    this.showPrivacyMenu = !this.showPrivacyMenu;
  }

  setPrivacy(value: 'public' | 'following' | 'only_me') {
    this.privacy = value;
    this.showPrivacyMenu = false;
  }

  onBodyInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.body = target.value;
  }

  onImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.clearImagePreview();
    this.selectedImage = target.files?.[0] ?? null;

    if (this.selectedImage) {
      this.imagePreviewUrl = URL.createObjectURL(this.selectedImage);
    }
  }

  submitPost(): void {
    const trimmedBody = this.body.trim();
    if (!trimmedBody || this.isSubmitting) {
      return;
    }

    const formData = new FormData();
    formData.append('body', trimmedBody);

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.privacy !== 'public') {
      formData.append('privacy', this.privacy);
    }

    this.isSubmitting = true;

    this.postsService.createPost(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.body = '';
        this.selectedImage = null;
        this.clearImagePreview();
        this.privacy = 'public';
        this.showPrivacyMenu = false;
        this.postCreated.emit(response.data.post);
        this.alert.success('Post created', 'Your post was published successfully.');
      },
      error: () => {
        this.isSubmitting = false;
        this.alert.error('Post failed', 'We could not publish your post right now.');
      },
    });
  }

  private clearImagePreview(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = null;
    }
  }
}
