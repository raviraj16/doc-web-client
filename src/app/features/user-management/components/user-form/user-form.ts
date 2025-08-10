import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserManagement } from '../../services/user-management';
import { UserStore } from '../../../../core/services/user-store.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../../../core/models/user.model';
import { UserRole } from '../../../../core/enums/user-role.enum';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm implements OnInit {
  userForm: FormGroup;
  loading = false;
  error = '';
  isEdit = false;
  userId: string | null = null;
  currentUser: User | null = null;
  UserRole = UserRole;

  userRoles = [
    { value: UserRole.ADMIN, label: 'Admin' },
    { value: UserRole.EDITOR, label: 'Editor' },
    { value: UserRole.VIEWER, label: 'Viewer' }
  ];

  constructor(
    private fb: FormBuilder,
    private userManagement: UserManagement,
    private userStore: UserStore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit() {
    this.currentUser = this.userStore.getUser();
    
    // Check if user is admin
    if (!this.currentUser || this.currentUser.role !== UserRole.ADMIN) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.userId;
    
    if (this.isEdit && this.userId) {
      this.loadUser(this.userId);
      // Remove password requirement for edit
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.VIEWER, [Validators.required]],
      isActive: [true]
    });
  }

  loadUser(id: string) {
    this.loading = true;
    
    this.userManagement.getUserById(id).subscribe({
      next: (response) => {
        if (response.success) {
          const user = response.data;
          this.userForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user details.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const formValue = this.userForm.value;

    if (this.isEdit && this.userId) {
      const updateData: UpdateUserRequest = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        role: formValue.role,
        isActive: formValue.isActive
      };

      this.userManagement.updateUser(this.userId, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/users']);
          }
        },
        error: (err) => {
          console.error('Error updating user:', err);
          this.error = 'Failed to update user. Please try again.';
          this.loading = false;
        }
      });
    } else {
      const createData: CreateUserRequest = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        password: formValue.password,
        role: formValue.role,
        isActive: formValue.isActive
      };

      this.userManagement.createUser(createData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/users']);
          }
        },
        error: (err) => {
          console.error('Error creating user:', err);
          this.error = 'Failed to create user. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  onCancel() {
    this.router.navigate(['/users']);
  }
}
