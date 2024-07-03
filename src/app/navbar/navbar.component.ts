import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../service/notificacion.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  pendingNotificationsCount: number = 0;
  isSidebarCollapsed = false;
  currentOpenDropdown: string | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private notificationService: NotificationService 
  ) {}

  ngOnInit(): void {
    this.notificationService.pendingCount$.subscribe(count => {
      this.pendingNotificationsCount = count;
    });

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  checkScreenSize(): void {
    const screenWidth = window.innerWidth;
    this.isSidebarCollapsed = screenWidth <= 768;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    const sidebar = document.getElementById('sidebar');
    if (this.isSidebarCollapsed) {
      sidebar?.classList.add('show');
      this.closeAllDropdowns();  // Cierra todos los dropdowns
    } else {
      sidebar?.classList.remove('show');
    }
  }

  closeAllDropdowns(): void {
    const dropdowns = document.querySelectorAll('.collapse.show');
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
    this.currentOpenDropdown = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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

  navigateToHome(): void {
    this.router.navigate(['/inicio']);
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isInicioPage(): boolean {
    return this.router.url === '/inicio';
  }

  toggleDropdown(dropdownId: string): void {
    if (this.currentOpenDropdown && this.currentOpenDropdown !== dropdownId) {
      const currentDropdown = document.getElementById(this.currentOpenDropdown);
      currentDropdown?.classList.remove('show');
    }
  
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      dropdown.classList.toggle('show');
      this.currentOpenDropdown = dropdown.classList.contains('show') ? dropdownId : null;
    }
  }
}
