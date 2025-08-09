import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthApi } from '../../features/auth/services/auth-api';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthApi);
  return next(req.clone({ withCredentials: true })).pipe(
    catchError(error => {
      if (error.status === 401) { // Unauthorized, try to refresh token
        return authService.refreshToken().pipe(
          switchMap(() => next(req)),
          catchError(err => { authService.logout(); return throwError(() => err); })
        );
      }
      return throwError(() => error);
    })
  );
};
