import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
  }

  isRoleAllowed(allowedRoles: string[]): boolean {
    return this.authService.isRoleAllowed(allowedRoles);
  }

  isOnDashboard(): boolean {
    const currentUrl = this.router.url;
    return (
      currentUrl.includes('/admin-dashboard') ||
      currentUrl.includes('/area-dashboard') ||
      currentUrl.includes('/bodega-dashboard')
    );
  }
}
