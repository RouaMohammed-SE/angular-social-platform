import { inject, Injectable } from '@angular/core';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly toastr = inject(ToastrService);

  success(title: string, text?: string): ActiveToast<unknown> {
    return this.toastr.success(text ?? '', title, {
      closeButton: true,
      progressBar: true,
      timeOut: 2500,
    });
  }

  error(title: string, text?: string): ActiveToast<unknown> {
    return this.toastr.error(text ?? '', title, {
      closeButton: true,
      progressBar: true,
      timeOut: 3500,
    });
  }

  warning(title: string, text?: string): ActiveToast<unknown> {
    return this.toastr.warning(text ?? '', title, {
      closeButton: true,
      progressBar: true,
      timeOut: 3500,
    });
  }

  modalError(title: string, text?: string) {
    return Swal.fire({
      icon: 'error',
      title,
      text,
    });
  }

  modalSuccess(title: string, text?: string) {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
    });
  }
}
