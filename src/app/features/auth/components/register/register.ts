import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthApi, UserRegistration } from '../../services/auth-api';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  loading = false;
  success = false;
  error: string | null = null;
  registerForm;

  constructor(private fb: FormBuilder, private authApi: AuthApi) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(32)]],
      lastName: ['', [Validators.required, Validators.maxLength(32)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  submit() {
    this.error = null;
    this.success = false;
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.authApi.register(this.registerForm.getRawValue() as UserRegistration)
      .subscribe({
        next: () => {
          this.success = true;
          this.registerForm.reset();
        },
        error: err => {
          this.error = err?.error?.message || 'Registration failed. Please try again.';
        }
      }).add(() => this.loading = false);
  }
}
