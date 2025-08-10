import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../../core/services/user-store.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  user$;
  showMenu = false;
  showDrawer = false;
  currentYear = new Date().getFullYear();

  constructor(private userStore: UserStore, private router: Router) {
    this.user$ = this.userStore.user$;
  }

  getInitials(user: any): string {
    if (!user) return '';
    const first = user.firstName ? user.firstName[0] : '';
    const last = user.lastName ? user.lastName[0] : '';
    return (first + last).toUpperCase();
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  toggleDrawer() {
    this.showDrawer = !this.showDrawer;
  }

  closeDrawer() {
    this.showDrawer = false;
  }

  logout() {
    this.userStore.clearUser();
    this.router.navigate(['/auth/login']);
  }
}
