import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginError: string = '';

  constructor(private authService: AuthService) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      const success = this.authService.login(this.email, this.password);
      if (!success) {
        this.loginError = 'Credenciales incorrectas';
      } else {
        this.loginError = 'Credenciales inválidas. Por favor, intente de nuevo.';
      }
    }
  }
}
