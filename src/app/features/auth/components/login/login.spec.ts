import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthApi } from '../../services/auth-api';
import { UserStore } from '../../../../core/services/user-store.service';
import { UserRole } from '../../../../core/enums/user-role.enum';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authApiSpy: any;
  let userStoreSpy: any;

  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: UserRole.ADMIN
  };

  beforeEach(async () => {
    const authApiSpyObj = jasmine.createSpyObj('AuthApi', ['login']);
    const userStoreSpyObj = jasmine.createSpyObj('UserStore', ['setUser']);

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthApi, useValue: authApiSpyObj },
        { provide: UserStore, useValue: userStoreSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authApiSpy = TestBed.inject(AuthApi);
    userStoreSpy = TestBed.inject(UserStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    emailControl?.setValue('');
    passwordControl?.setValue('');
    
    expect(emailControl?.valid).toBeFalsy();
    expect(passwordControl?.valid).toBeFalsy();
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should submit form with valid data and handle success', () => {
    const loginResponse = { data: mockUser };
    authApiSpy.login.and.returnValue(of(loginResponse));

    component.loginForm.patchValue({
      email: 'john.doe@example.com',
      password: 'password123'
    });

    component.submit();

    expect(authApiSpy.login).toHaveBeenCalledWith({
      email: 'john.doe@example.com',
      password: 'password123'
    });
    expect(userStoreSpy.setUser).toHaveBeenCalledWith(mockUser);
  });

  it('should handle login error with message', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authApiSpy.login.and.returnValue(throwError(errorResponse));

    component.loginForm.patchValue({
      email: 'john.doe@example.com',
      password: 'wrongpassword'
    });

    component.submit();

    expect(component.error).toBe('Invalid credentials');
    expect(component.loading).toBeFalsy();
  });
});
