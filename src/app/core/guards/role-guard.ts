
import { UserStore } from '../services/user-store.service';
import { UserRole } from '../enums/user-role.enum';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from '../models/user.model';

export const adminRoleGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const user = userStore.getUser();
  return isAdmin(user);
};

export const editorRoleGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const user = userStore.getUser();
  return user?.role === UserRole.EDITOR || isAdmin(user);
};

export const roleGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const router = inject(Router);
  
  // Get required roles from route data
  const requiredRoles = route.data?.['roles'] as UserRole[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  const user = userStore.getUser();
  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  // Check if user's role is included in the required roles
  const userRole = user.role;
  const hasRequiredRole = requiredRoles.includes(userRole);
  
  if (!hasRequiredRole) {
    router.navigate(['/']);
    return false;
  }
  
  return true;
};

const isAdmin = (user: User | null) => {
  return user?.role === UserRole.ADMIN;
}