import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      const users: { email: string, password: string, role: string }[] = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(user => user.email === this.email);

      if (user) {
        if (user.password === this.password) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('User authenticated, role:', user.role); // Debugging
          switch (user.role) {
            case 'Admin':
              this.router.navigate(['/dashboard']);
              break;
            case 'Área':
              this.router.navigate(['/area']);
              break;
            case 'Bodega':
              this.router.navigate(['/bodega']);
              break;
            case 'Auditor':
              this.router.navigate(['/auditor']);
              break;
            default:
              alert('Rol no reconocido');
          }
        } else {
          alert('Contraseña incorrecta. Por favor, inténtelo de nuevo.');
        }
      } else {
        alert('Usuario no encontrado. Por favor, regístrese o inténtelo de nuevo.');
      }
    }
  }
}
