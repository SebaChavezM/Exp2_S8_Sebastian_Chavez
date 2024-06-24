import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Componente de inicio de sesión.
 *
 * @export
 * @class LoginComponent
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  /**
   * Correo electrónico ingresado por el usuario.
   *
   * @type {string}
   * @memberof LoginComponent
   */
  email: string = '';

  /**
   * Contraseña ingresada por el usuario.
   *
   * @type {string}
   * @memberof LoginComponent
   */
  password: string = '';

  /**
   * Mensaje de error en caso de credenciales incorrectas.
   *
   * @type {string}
   * @memberof LoginComponent
   */
  loginError: string = '';

  /**
   * Crea una instancia de LoginComponent.
   * 
   * @param {AuthService} authService Servicio de autenticación.
   * @memberof LoginComponent
   */
  constructor(private authService: AuthService) {}

  /**
   * Maneja el envío del formulario de inicio de sesión.
   *
   * @param {NgForm} form Formulario de inicio de sesión.
   * @memberof LoginComponent
   */
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
