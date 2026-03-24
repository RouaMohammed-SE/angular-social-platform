import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth/auth.service';
import { SKIP_GLOBAL_ERROR_HANDLER } from '../request-context/request-context';

type ValidationErrors = Record<string, string[] | string>;

const NOTIFICATION_DEDUPE_WINDOW_MS = 2500;

let lastNotificationKey = '';
let lastNotificationAt = 0;
let isUnauthorizedAlertOpen = false;

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastr = inject(ToastrService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.context.get(SKIP_GLOBAL_ERROR_HANDLER)) {
        return throwError(() => error);
      }

      handleHttpError(error, authService, router, toastr);
      return throwError(() => error);
    }),
  );
};

function handleHttpError(
  error: HttpErrorResponse,
  authService: AuthService,
  router: Router,
  toastr: ToastrService,
): void {
  const message = getErrorMessage(error);
  const validationMessage = formatValidationErrors(error.error?.errors);

  switch (error.status) {
    case 0:
      notifyToastr(toastr, 'error', 'No internet connection');
      return;

    case 400:
      notifyToastr(toastr, 'error', validationMessage || message);
      return;

    case 401:
      authService.clearToken();
      void router.navigate(['/login']);
      notifyUnauthorizedAlert();
      return;

    case 403:
      notifyToastr(toastr, 'warning', "You don't have permission to do that");
      return;

    case 404:
      notifyToastr(toastr, 'error', 'Resource not found');
      return;

    case 422:
      notifyToastr(toastr, 'error', validationMessage || message);
      return;

    case 500:
      notifyAlert('Server error', 'Something went wrong on our side');
      return;

    case 503:
      notifyToastr(toastr, 'error', 'Server is temporarily unavailable');
      return;

    default:
      notifyToastr(toastr, 'error', message);
      return;
  }
}

function getErrorMessage(error: HttpErrorResponse): string {
  const backendMessage = error.error?.message;

  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage.trim();
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }

  return 'An unexpected error occurred';
}

function formatValidationErrors(errors: ValidationErrors | null | undefined): string {
  if (!errors || typeof errors !== 'object') {
    return '';
  }

  const messages = Object.values(errors).flatMap((value) => {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && !!item.trim());
    }

    return typeof value === 'string' && value.trim() ? [value] : [];
  });

  return messages.join('\n');
}

function notifyToastr(
  toastr: ToastrService,
  type: 'error' | 'warning',
  message: string,
  title = 'Error',
): void {
  if (!shouldNotify(`${type}:${title}:${message}`)) {
    return;
  }

  toastr[type](message, title, {
    closeButton: true,
    progressBar: true,
    timeOut: 3500,
  });
}

function notifyAlert(title: string, text: string): void {
  if (!shouldNotify(`alert:${title}:${text}`)) {
    return;
  }

  void Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
  });
}

function notifyUnauthorizedAlert(): void {
  if (isUnauthorizedAlertOpen) {
    return;
  }

  isUnauthorizedAlertOpen = true;

  void Swal.fire({
    icon: 'warning',
    title: 'Session expired',
    text: 'Your session has expired. Please log in again.',
    confirmButtonText: 'OK',
  }).finally(() => {
    isUnauthorizedAlertOpen = false;
  });
}

function shouldNotify(key: string): boolean {
  const now = Date.now();

  if (lastNotificationKey === key && now - lastNotificationAt < NOTIFICATION_DEDUPE_WINDOW_MS) {
    return false;
  }

  lastNotificationKey = key;
  lastNotificationAt = now;
  return true;
}
