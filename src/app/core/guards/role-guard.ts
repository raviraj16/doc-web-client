
import { UserStore } from '../services/user-store.service';
import { UserRole } from '../enums/user-role.enum';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
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

const isAdmin = (user: User | null) => {
  return user?.role === UserRole.ADMIN;
}