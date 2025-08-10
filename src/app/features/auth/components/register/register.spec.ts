import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Register } from './register';
import { AuthApi } from '../../services/auth-api';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authApiSpy: any;

  beforeEach(async () => {
    const authApiSpyObj = jasmine.createSpyObj('AuthApi', ['register']);
    const activatedRouteSpyObj = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule],
      providers: [
        { provide: AuthApi, useValue: authApiSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    authApiSpy = TestBed.inject(AuthApi) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize register form with empty values', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const controls = [
      'firstName', 'lastName', 'email', 'password'
    ];

    controls.forEach(controlName => {
      const control = component.registerForm.get(controlName);
      expect(control?.hasError('required')).toBe(true);
    });
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get('password');
    
    passwordControl?.setValue('short');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('validpassword');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should validate maximum length for names', () => {
    const firstNameControl = component.registerForm.get('firstName');
    const lastNameControl = component.registerForm.get('lastName');
    
    const longName = 'a'.repeat(33);
    
    firstNameControl?.setValue(longName);
    expect(firstNameControl?.hasError('maxlength')).toBe(true);
    
    lastNameControl?.setValue(longName);
    expect(lastNameControl?.hasError('maxlength')).toBe(true);
  });

  it('should not submit form when invalid', () => {
    component.submit();
    expect(authApiSpy.register).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should submit form with valid data and handle success', fakeAsync(() => {
    const registrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    authApiSpy.register.and.returnValue(of({ success: true }));

    // Set form values
    component.registerForm.setValue(registrationData);
    component.registerForm.markAllAsTouched();
    
    expect(component.registerForm.valid).toBe(true);
    
    // Initial state
    expect(component.loading).toBe(false);
    expect(component.success).toBe(false);
    expect(component.error).toBeNull();
    
    component.submit();

    // The observable should complete synchronously with `of()`, so loading should be false after tick
    tick(); // Allow observable to complete
    
    expect(authApiSpy.register).toHaveBeenCalledWith(registrationData);
    expect(component.success).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  }));

  it('should handle registration error', fakeAsync(() => {
    const registrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'existing@example.com',
      password: 'password123'
    };

    const errorResponse = {
      error: { message: 'Email already exists' }
    };

    authApiSpy.register.and.returnValue(throwError(() => errorResponse));

    // Set form values
    component.registerForm.setValue(registrationData);
    component.registerForm.markAllAsTouched();
    
    expect(component.registerForm.valid).toBe(true);
    
    // Initial state
    expect(component.loading).toBe(false);
    expect(component.success).toBe(false);
    expect(component.error).toBeNull();
    
    component.submit();

    // The observable should complete synchronously with `throwError()`, so loading should be false after tick
    tick(); // Allow observable to complete
    
    expect(authApiSpy.register).toHaveBeenCalled();
    expect(component.success).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Email already exists');
  }));

  it('should handle registration error without message', () => {
    const registrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    authApiSpy.register.and.returnValue(throwError(() => ({})));

    component.registerForm.patchValue(registrationData);
    component.submit();

    expect(component.error).toBe('Registration failed. Please try again.');
  });

  it('should reset form on successful registration', () => {
    const registrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    authApiSpy.register.and.returnValue(of({ success: true }));

    component.registerForm.patchValue(registrationData);
    component.submit();

    expect(component.registerForm.get('firstName')?.value).toBeNull();
    expect(component.registerForm.get('lastName')?.value).toBeNull();
    expect(component.registerForm.get('email')?.value).toBeNull();
    expect(component.registerForm.get('password')?.value).toBeNull();
  });
});
