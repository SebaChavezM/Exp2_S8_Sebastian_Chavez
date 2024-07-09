import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class InicioComponent {

  /**
   * Constructor del componente Inicio.
   * @param {AuthService} authService - Servicio de autenticación.
   * @param {Router} router - Router para la navegación.
   */
  constructor(public authService: AuthService, private router: Router) {}

  /**
   * Navega al panel de control correspondiente según el rol del usuario.
   * @returns {void}
   */
  navigateToDashboard(): void {
    const userRole = this.authService.getCurrentUser()?.role;
    if (userRole === 'Admin') {
      this.router.navigate(['/admin-dashboard']);
    } else if (userRole === 'Área') {
      this.router.navigate(['/area-dashboard']);
    } else if (userRole === 'Bodega') {
      this.router.navigate(['/bodega-dashboard']);
    } else if (userRole === 'Auditor') {
      this.router.navigate(['/auditor-dashboard']);
    }
  }

  /**
   * Navega a una página específica.
   * @param {string} page - La ruta de la página a la que se va a navegar.
   * @returns {void}
   */
  navigateToPage(page: string): void {
    this.router.navigate([page]);
  }
}
