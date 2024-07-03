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

  constructor(public authService: AuthService, private router: Router) {}

  navigateToDashboard() {
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

  navigateToPage(page: string) {
    this.router.navigate([page]);
  }
}