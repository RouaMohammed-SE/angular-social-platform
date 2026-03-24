import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { SKIP_LOADING_SPINNER } from '../request-context/request-context';

let activeRequests = 0;
let showSpinnerTimeout: ReturnType<typeof setTimeout> | null = null;
const SPINNER_DELAY_MS = 150;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADING_SPINNER)) {
    return next(req);
  }

  const spinner = inject(NgxSpinnerService);

  activeRequests += 1;

  if (!showSpinnerTimeout) {
    showSpinnerTimeout = setTimeout(() => {
      showSpinnerTimeout = null;

      if (activeRequests > 0) {
        void spinner.show();
      }
    }, SPINNER_DELAY_MS);
  }

  return next(req).pipe(
    finalize(() => {
      activeRequests = Math.max(0, activeRequests - 1);

      if (activeRequests === 0) {
        if (showSpinnerTimeout) {
          clearTimeout(showSpinnerTimeout);
          showSpinnerTimeout = null;
        }

        void spinner.hide();
      }
    }),
  );
};
