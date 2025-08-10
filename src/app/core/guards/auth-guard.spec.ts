import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { UserStore } from '../services/user-store.service';
import { User } from '../models/user.model';
import { UserRole } from '../enums/user-role.enum';
import { of, throwError } from 'rxjs';

describe('authGuard', () => {
  let userStoreSpy: any;
  let routerSpy: any;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: UserRole.ADMIN
  };

  beforeEach(() => {
    const userStoreSpyObj = jasmine.createSpyObj('UserStore', ['fetchUser']);
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
    mockState = { url: '/dashboard' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should allow access when user is authenticated', (done) => {
    userStoreSpy.fetchUser.and.returnValue(of(mockUser));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(mockRoute, mockState);
      
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(true);
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          done();
        });
      }
    });
  });

  it('should deny access and redirect when user is not authenticated', (done) => {
    userStoreSpy.fetchUser.and.returnValue(of(null));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(mockRoute, mockState);
      
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(false);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
          done();
        });
      }
    });
  });

  it('should deny access and redirect when fetchUser fails', (done) => {
    userStoreSpy.fetchUser.and.returnValue(throwError(() => new Error('Authentication failed')));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(mockRoute, mockState);
      
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(false);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
          done();
        });
      }
    });
  });

  it('should handle different user roles correctly', (done) => {
    const viewerUser: User = { ...mockUser, role: UserRole.VIEWER };
    userStoreSpy.fetchUser.and.returnValue(of(viewerUser));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(mockRoute, mockState);
      
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(true);
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          done();
        });
      }
    });
  });

  it('should call fetchUser to verify authentication', () => {
    userStoreSpy.fetchUser.and.returnValue(of(mockUser));

    TestBed.runInInjectionContext(() => {
      authGuard(mockRoute, mockState);
      expect(userStoreSpy.fetchUser).toHaveBeenCalled();
    });
  });
});
