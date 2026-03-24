import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SKIP_GLOBAL_ERROR_HANDLER = new HttpContextToken<boolean>(() => false);
export const SKIP_LOADING_SPINNER = new HttpContextToken<boolean>(() => false);

export function buildRequestContext(options?: {
  skipErrorHandling?: boolean;
  skipLoadingSpinner?: boolean;
}): HttpContext {
  let context = new HttpContext();

  if (options?.skipErrorHandling) {
    context = context.set(SKIP_GLOBAL_ERROR_HANDLER, true);
  }

  if (options?.skipLoadingSpinner) {
    context = context.set(SKIP_LOADING_SPINNER, true);
  }

  return context;
}
