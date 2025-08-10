import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserStore } from './user-store.service';
import { AuthApi } from '../../features/auth/services/auth-api';
import { User } from '../models/user.model';
import { UserRole } from '../enums/user-role.enum';
import { of, throwError } from 'rxjs';

describe('UserStore', () => {
  let service: UserStore;
  let authApiSpy: any;

  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: UserRole.ADMIN
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthApi', ['getMe']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserStore,
        { provide: AuthApi, useValue: spy }
      ]
    });

    service = TestBed.inject(UserStore);
    authApiSpy = TestBed.inject(AuthApi);

    // Clear session storage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser', () => {
    it('should return null when no user is stored', () => {
      const user = service.getUser();
      expect(user).toBeNull();
    });

    it('should return user from session storage when available', () => {
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      
      const user = service.getUser();
      expect(user).toEqual(mockUser);
    });

    it('should handle corrupted session storage data', () => {
      sessionStorage.setItem('user', 'invalid-json');
      
      // Should not throw and return null
      expect(() => service.getUser()).not.toThrow();
    });

    it('should cache user after first retrieval from session storage', () => {
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      
      const user1 = service.getUser();
      const user2 = service.getUser();
      
      expect(user1).toEqual(mockUser);
      expect(user2).toEqual(mockUser);
      expect(user1).toBe(user2); // Should be same instance after caching
    });
  });

  describe('fetchUser', () => {
    it('should fetch user from API and update internal state', (done) => {
      authApiSpy.getMe.and.returnValue(of(mockUser));

      service.fetchUser().subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(service.getUser()).toEqual(mockUser);
        expect(authApiSpy.getMe).toHaveBeenCalled();
        done();
      });
    });

    it('should save user to session storage when fetched', (done) => {
      authApiSpy.getMe.and.returnValue(of(mockUser));

      service.fetchUser().subscribe(user => {
        expect(sessionStorage.getItem('user')).toEqual(JSON.stringify(mockUser));
        done();
      });
    });

    it('should handle API error gracefully', (done) => {
      authApiSpy.getMe.and.returnValue(throwError(() => new Error('API Error')));

      service.fetchUser().subscribe({
        next: () => fail('Should not succeed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.getUser()).toBeNull();
          done();
        }
      });
    });

    it('should handle null response from API', (done) => {
      authApiSpy.getMe.and.returnValue(of(null));

      service.fetchUser().subscribe(user => {
        expect(user).toBeNull();
        expect(service.getUser()).toBeNull();
        expect(sessionStorage.getItem('user')).toBeNull();
        done();
      });
    });

    it('should emit user through user$ observable', (done) => {
      authApiSpy.getMe.and.returnValue(of(mockUser));

      service.user$.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.fetchUser().subscribe();
    });
  });

  describe('clearUser', () => {
    it('should clear user from memory and session storage', () => {
      // First set a user
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      service.getUser(); // Load into memory
      
      // Then clear
      service.clearUser();

      expect(service.getUser()).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });

    it('should emit null through user$ observable', (done) => {
      authApiSpy.getMe.and.returnValue(of(mockUser));
      
      // First set a user
      service.fetchUser().subscribe(() => {
        // Then clear and check emission
        service.user$.subscribe(user => {
          if (user === null) {
            done();
          }
        });
        
        service.clearUser();
      });
    });

    it('should work even when no user is set', () => {
      expect(() => service.clearUser()).not.toThrow();
      expect(service.getUser()).toBeNull();
    });
  });

  describe('user$ observable', () => {
    it('should initially emit null', (done) => {
      service.user$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should emit user when fetchUser is called', (done) => {
      authApiSpy.getMe.and.returnValue(of(mockUser));
      
      service.user$.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.fetchUser().subscribe();
    });

    it('should emit null when clearUser is called', (done) => {
      authApiSpy.getMe.and.returnValue(of(mockUser));
      let emissionCount = 0;
      
      service.user$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(user).toBeNull(); // Initial emission
        } else if (emissionCount === 2) {
          expect(user).toEqual(mockUser); // After fetch
        } else if (emissionCount === 3) {
          expect(user).toBeNull(); // After clear
          done();
        }
      });

      service.fetchUser().subscribe(() => {
        service.clearUser();
      });
    });
  });

  describe('integration scenarios', () => {
    it('should maintain user state across multiple operations', (done) => {
      authApiSpy.getMe.and.returnValue(of(mockUser));

      // Fetch user
      service.fetchUser().subscribe(() => {
        expect(service.getUser()).toEqual(mockUser);
        
        // Clear user
        service.clearUser();
        expect(service.getUser()).toBeNull();
        
        // Fetch again
        service.fetchUser().subscribe(() => {
          expect(service.getUser()).toEqual(mockUser);
          done();
        });
      });
    });

    it('should handle session storage being unavailable', () => {
      const originalSessionStorage = window.sessionStorage;
      delete (window as any).sessionStorage;

      expect(() => service.getUser()).not.toThrow();
      expect(service.getUser()).toBeNull();

      (window as any).sessionStorage = originalSessionStorage;
    });
  });
});