import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard, adminRoleGuard, editorRoleGuard } from './role-guard';
import { UserStore } from '../services/user-store.service';
import { User } from '../models/user.model';
import { UserRole } from '../enums/user-role.enum';

describe('roleGuard', () => {
  let userStoreSpy: any;
  let routerSpy: any;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  const adminUser: User = {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: UserRole.ADMIN
  };

  const editorUser: User = {
    id: '2',
    firstName: 'Editor',
    lastName: 'User',
    email: 'editor@example.com',
    role: UserRole.EDITOR
  };

  const viewerUser: User = {
    id: '3',
    firstName: 'Viewer',
    lastName: 'User',
    email: 'viewer@example.com',
    role: UserRole.VIEWER
  };

  beforeEach(() => {
    const userStoreSpyObj = jasmine.createSpyObj('UserStore', ['getUser']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: UserStore, useValue: userStoreSpyObj },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    userStoreSpy = TestBed.inject(UserStore);
    routerSpy = TestBed.inject(Router);
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/admin' } as RouterStateSnapshot;
  });

  describe('roleGuard', () => {
    it('should allow access when user has required role', () => {
      userStoreSpy.getUser.and.returnValue(adminUser);
      mockRoute.data = { roles: [UserRole.ADMIN] };

      TestBed.runInInjectionContext(() => {
        const result = roleGuard(mockRoute, mockState);
        expect(result).toBe(true);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      });
    });

    it('should allow access when user has one of multiple required roles', () => {
      userStoreSpy.getUser.and.returnValue(editorUser);
      mockRoute.data = { roles: [UserRole.ADMIN, UserRole.EDITOR] };

      TestBed.runInInjectionContext(() => {
        const result = roleGuard(mockRoute, mockState);
        expect(result).toBe(true);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      });
    });

    it('should deny access when user does not have required role', () => {
      userStoreSpy.getUser.and.returnValue(viewerUser);
      mockRoute.data = { roles: [UserRole.ADMIN] };

      TestBed.runInInjectionContext(() => {
        const result = roleGuard(mockRoute, mockState);
        expect(result).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      });
    });

    it('should deny access and redirect to login when no user is found', () => {
      userStoreSpy.getUser.and.returnValue(null);
      mockRoute.data = { roles: [UserRole.ADMIN] };

      TestBed.runInInjectionContext(() => {
        const result = roleGuard(mockRoute, mockState);
        expect(result).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    });

    it('should allow access when no roles are required', () => {
      userStoreSpy.getUser.and.returnValue(viewerUser);
      mockRoute.data = { roles: [] };

      TestBed.runInInjectionContext(() => {
        const result = roleGuard(mockRoute, mockState);
        expect(result).toBe(true);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      });
    });

    it('should allow access when roles property is undefined', () => {
      userStoreSpy.getUser.and.returnValue(viewerUser);
      mockRoute.data = {};

      TestBed.runInInjectionContext(() => {
        const result = roleGuard(mockRoute, mockState);
        expect(result).toBe(true);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      });
    });

    it('should handle case when route data is undefined', () => {
      userStoreSpy.getUser.and.returnValue(viewerUser);
      mockRoute.data = {} as any;

      TestBed.runInInjectionContext(() => {
        const result = roleGuard(mockRoute, mockState);
        expect(result).toBe(true);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('adminRoleGuard', () => {
    it('should allow access for admin user', () => {
      userStoreSpy.getUser.and.returnValue(adminUser);

      TestBed.runInInjectionContext(() => {
        const result = adminRoleGuard(mockRoute, mockState);
        expect(result).toBe(true);
      });
    });

    it('should deny access for editor user', () => {
      userStoreSpy.getUser.and.returnValue(editorUser);

      TestBed.runInInjectionContext(() => {
        const result = adminRoleGuard(mockRoute, mockState);
        expect(result).toBe(false);
      });
    });

    it('should deny access for viewer user', () => {
      userStoreSpy.getUser.and.returnValue(viewerUser);

      TestBed.runInInjectionContext(() => {
        const result = adminRoleGuard(mockRoute, mockState);
        expect(result).toBe(false);
      });
    });

    it('should deny access when no user is found', () => {
      userStoreSpy.getUser.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        const result = adminRoleGuard(mockRoute, mockState);
        expect(result).toBe(false);
      });
    });
  });

  describe('editorRoleGuard', () => {
    it('should allow access for admin user', () => {
      userStoreSpy.getUser.and.returnValue(adminUser);

      TestBed.runInInjectionContext(() => {
        const result = editorRoleGuard(mockRoute, mockState);
        expect(result).toBe(true);
      });
    });

    it('should allow access for editor user', () => {
      userStoreSpy.getUser.and.returnValue(editorUser);

      TestBed.runInInjectionContext(() => {
        const result = editorRoleGuard(mockRoute, mockState);
        expect(result).toBe(true);
      });
    });

    it('should deny access for viewer user', () => {
      userStoreSpy.getUser.and.returnValue(viewerUser);

      TestBed.runInInjectionContext(() => {
        const result = editorRoleGuard(mockRoute, mockState);
        expect(result).toBe(false);
      });
    });

    it('should deny access when no user is found', () => {
      userStoreSpy.getUser.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        const result = editorRoleGuard(mockRoute, mockState);
        expect(result).toBe(false);
      });
    });
  });
});
