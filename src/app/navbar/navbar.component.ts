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
    private notificationService: NotificationService // Inyecta el servicio
  ) {}

  ngOnInit(): void {
    // Suscríbete a los cambios en el contador de notificaciones pendientes
    this.notificationService.pendingCount$.subscribe(count => {
      this.pendingNotificationsCount = count;
    });

    // Verifica el tamaño de la pantalla al iniciar
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  checkScreenSize(): void {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      this.isSidebarCollapsed = true;
    } else {
      this.isSidebarCollapsed = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    const sidebar = document.getElementById('sidebar');
    if (this.isSidebarCollapsed) {
      sidebar?.classList.add('show');
    } else {
      sidebar?.classList.remove('show');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirige al login después de cerrar sesión
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
    const role = this.authService.getCurrentUser()?.role;
    let route = '';
    switch (role) {
      case 'Admin':
        route = '/admin-dashboard';
        break;
      case 'Área':
        route = '/area-dashboard';
        break;
      case 'Auditor':
        route = '/auditor-dashboard';
        break;
      case 'Bodega':
        route = '/bodega-dashboard';
        break;
      default:
        route = '/';
        break;
    }
    this.router.navigate([route]);
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  toggleDropdown(dropdownId: string): void {
    if (this.currentOpenDropdown && this.currentOpenDropdown !== dropdownId) {
      const currentDropdown = document.getElementById(this.currentOpenDropdown);
      if (currentDropdown) {
        currentDropdown.classList.remove('show');
      }
    }

    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
    
    this.currentOpenDropdown = dropdownId;
  }
}
