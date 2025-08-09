
import { inject } from '@angular/core';
import { UserStore } from '../services/user-store.service';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  return new Promise<boolean>((resolve) => {
    userStore.fetchUser().subscribe({
      next: user => {
        if (user) {
          resolve(true);
        } else {
          router.navigate(['/auth/login']);
          resolve(false);
        }
      },
      error: () => {
        router.navigate(['/auth/login']);
        resolve(false);
      }
    });
  });
};
