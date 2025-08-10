import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthApi, UserLogin } from '../../services/auth-api';
import { UserStore } from '../../../../core/services/user-store.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loading = false;
  error: string | null = null;
  loginForm;


  constructor(private fb: FormBuilder, private authApi: AuthApi, private userStore: UserStore, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  submit() {
    this.error = null;
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.authApi.login(this.loginForm.getRawValue() as UserLogin)
      .subscribe({
        next: (response) => {
          // If login returns user data, set it in the store
          if (response?.data) {
            this.userStore.setUser(response.data);
          } else {
            // Otherwise fetch user data
            this.userStore.fetchUser().subscribe();
          }
          this.router.navigate(['/document'])
        },
        error: err => {
          this.error = err?.error?.message || 'Login failed. Please try again.';
        }
      }).add(() => this.loading = false);
  }
}
