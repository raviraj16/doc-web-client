import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserManagement } from '../../services/user-management';
import { User } from '../../../../core/models/user.model';
import { UserRole } from '../../../../core/enums/user-role.enum';
import { UserStore } from '../../../../core/services/user-store.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  currentUser: User | null = null;
  UserRole = UserRole; // Make enum available in template

  constructor(
    private userManagement: UserManagement,
    private userStore: UserStore
  ) {}

  ngOnInit() {
    this.currentUser = this.userStore.getUser();
    // Check if user is admin
    if (!this.currentUser || this.currentUser.role !== UserRole.ADMIN) {
      this.error = 'Access denied. Admin privileges required.';
      return;
    }
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    
    this.userManagement.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.userManagement.deleteUser(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = this.users.filter(user => user.id !== id);
        }
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.error = 'Failed to delete user. Please try again.';
      }
    });
  }

  getRoleName(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.EDITOR:
        return 'Editor';
      case UserRole.VIEWER:
        return 'Viewer';
      default:
        return 'Unknown';
    }
  }
}
