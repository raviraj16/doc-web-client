import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthApi } from '../../features/auth/services/auth-api';
import { UserStore } from '../services/user-store.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthApi);
  const userStore = inject(UserStore);
  const router = inject(Router);
  return next(req.clone({ withCredentials: true })).pipe(
    catchError(error => {
      if (error.status === 401) { // Unauthorized, try to refresh token
        return authService.refreshToken().pipe(
          switchMap(() => next(req)),
          catchError(err => {
            userStore.clearUser();
            router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
