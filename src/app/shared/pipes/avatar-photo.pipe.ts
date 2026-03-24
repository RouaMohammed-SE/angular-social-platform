import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../../core/models/user.interface';

type AvatarPhotoMode = 'gendered' | 'preserve-photo';

@Pipe({
  name: 'avatarPhoto',
  standalone: true,
})
export class AvatarPhotoPipe implements PipeTransform {
  private readonly defaultMalePhoto = '/assets/images/app/default-male-profile.png';
  private readonly defaultFemalePhoto = '/assets/images/app/default-female-profile.jpg';
  private readonly backendDefaultPhotoName = 'default-profile.png';

  transform(user: User | null | undefined, mode: AvatarPhotoMode = 'gendered'): string {
    const photo = user?.photo?.trim();

    if (photo && (mode === 'preserve-photo' || !photo.includes(this.backendDefaultPhotoName))) {
      return photo;
    }

    const normalizedGender = user?.gender?.trim().toLowerCase();
    return normalizedGender === 'female' ? this.defaultFemalePhoto : this.defaultMalePhoto;
  }
}
