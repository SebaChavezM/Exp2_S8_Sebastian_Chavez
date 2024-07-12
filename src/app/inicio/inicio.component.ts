import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class InicioComponent implements OnInit, OnDestroy {
  userRole: string = '';
  welcomeMessage: string = '';
  private welcomeMessages: string[] = ['Bienvenido', 'Welcome', 'Bienvenue', 'Willkommen', 'Benvenuto'];
  private currentMessageIndex: number = 0;
  private intervalId: any;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userRole = currentUser.role;
    }
    this.welcomeMessage = this.welcomeMessages[this.currentMessageIndex];
    this.intervalId = setInterval(() => {
      this.changeWelcomeMessage();
    }, 5000); // Cambiar mensaje cada 5 segundos
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId); // Limpiar el intervalo cuando el componente se destruya
  }

  private changeWelcomeMessage(): void {
    this.currentMessageIndex = (this.currentMessageIndex + 1) % this.welcomeMessages.length;
    this.welcomeMessage = this.welcomeMessages[this.currentMessageIndex];
  }

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

  navigateToPage(page: string): void {
    this.router.navigate([page]);
  }
}
