import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
/**
 * Componente para la página de inicio de sesión.
 * @class
 */
export class LoginComponent {
  /**
   * Correo electrónico del usuario.
   * @type {string}
   */
  email: string = '';

  /**
   * Contraseña del usuario.
   * @type {string}
   */
  password: string = '';

  /**
   * Correo electrónico de recuperación.
   * @type {string}
   */
  recoveryEmail: string = '';

  /**
   * Nombre completo del usuario.
   * @type {string}
   */
  fullName: string = '';

  /**
   * Fecha de nacimiento del usuario.
   * @type {string}
   */
  birthDate: string = '';

  /**
   * Área de trabajo del usuario.
   * @type {string}
   */
  workArea: string = '';

  /**
   * Supervisor del usuario.
   * @type {string}
   */
  supervisor: string = '';

  /**
   * Mensaje de error para el correo electrónico.
   * @type {string}
   */
  emailError: string = '';

  /**
   * Mensaje de error para el inicio de sesión.
   * @type {string}
   */
  loginError: string = '';

  /**
   * Indicador de si el correo electrónico es válido.
   * @type {boolean}
   */
  emailValid: boolean = true;

  /**
   * Indicador de si el usuario es adulto.
   * @type {boolean}
   */
  isAdult: boolean = true;

  /**
   * Constructor del componente.
   * @param {AuthService} authService - Servicio de autenticación.
   */
  constructor(private authService: AuthService) {}

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * @param {NgForm} form - El formulario de inicio de sesión.
   * @returns {void}
   */
  onSubmit(form: NgForm): void {
    if (form.valid) {
      const success = this.authService.login(this.email, this.password);
      if (!success) {
        this.loginError = 'Credenciales incorrectas';
      } else {
        this.loginError = 'Credenciales inválidas. Por favor, intente de nuevo.';
      }
    }
  }

  /**
   * Verifica si el correo electrónico de recuperación pertenece a un usuario registrado.
   * @returns {void}
   */
  verifyEmail(): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((user: any) => user.email === this.recoveryEmail);

    if (user) {
      this.showStep(2);
    } else {
      this.emailError = 'Este correo no pertenece a la empresa.';
      this.emailValid = false;
    }
  }

  /**
   * Envía una notificación para la recuperación de cuenta.
   * @param {NgForm} form - El formulario de notificación.
   * @returns {void}
   */
  sendNotification(form: NgForm): void {
    if (form.valid && this.isAdult) {
      // Guardar notificación en el local storage
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        id: Date.now(), // Genera un ID único basado en la marca de tiempo
        status: 'pending',
        solicitadaPor: this.fullName,
        email: this.recoveryEmail,
        birthDate: this.birthDate,
        workArea: this.workArea,
        supervisor: this.supervisor
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));

      alert('Notificación enviada al administrador.');
      this.showStep(3);
    } else {
      form.form.markAllAsTouched();
    }
  }

  /**
   * Muestra el paso especificado en el formulario de recuperación.
   * @param {number} step - El número de paso a mostrar.
   * @returns {void}
   */
  showStep(step: number): void {
    for (let i = 1; i <= 3; i++) {
      document.getElementById(`step${i}`)?.classList.add('d-none');
    }
    document.getElementById(`step${step}`)?.classList.remove('d-none');
  }

  /**
   * Valida la edad del usuario a partir de la fecha de nacimiento.
   * @param {Event} event - Evento de cambio en el campo de fecha de nacimiento.
   * @returns {void}
   */
  validateAge(event: any): void {
    const birthDate = new Date(event.target.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.isAdult = age >= 18;
  }
}
