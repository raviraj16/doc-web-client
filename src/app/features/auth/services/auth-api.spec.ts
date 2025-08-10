import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthApi, UserLogin, UserRegistration } from './auth-api';
import { environment } from '../../../../environments/environment';
import { UserRole } from '../../../core/enums/user-role.enum';

describe('AuthApi', () => {
  let service: AuthApi;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: UserRole.ADMIN
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthApi,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthApi);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request with correct data', () => {
      const loginData: UserLogin = {
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const mockResponse = { success: true, data: mockUser };

      service.login(loginData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const loginData: UserLogin = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      service.login(loginData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should send registration request with correct data', () => {
      const registrationData: UserRegistration = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: UserRole.VIEWER
      };

      const mockResponse = { success: true, message: 'User registered successfully' };

      service.register(registrationData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registrationData);
      req.flush(mockResponse);
    });

    it('should handle registration error for existing email', () => {
      const registrationData: UserRegistration = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.VIEWER
      };

      service.register(registrationData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/signup`);
      req.flush('Email already exists', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getMe', () => {
    it('should return current user data', () => {
      const mockResponse = { data: mockUser };

      service.getMe().subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('should return null when user is not authenticated', () => {
      const mockResponse = { data: null };

      service.getMe().subscribe(user => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/me`);
      req.flush(mockResponse);
    });

    it('should handle getMe error', () => {
      service.getMe().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/me`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('refreshToken', () => {
    it('should refresh authentication token', () => {
      const mockResponse = { data: mockUser };

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/refresh`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('should handle refresh token error', () => {
      service.refreshToken().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/auth/refresh`);
      req.flush('Token expired', { status: 401, statusText: 'Unauthorized' });
    });
  });
});
