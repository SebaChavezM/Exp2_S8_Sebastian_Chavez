import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
/**
 * Componente de inicio de sesión.
 * @class
 */
export class LoginComponent {
  /** Correo electrónico del usuario */
  email: string = '';
  /** Contraseña del usuario */
  password: string = '';
  /** Correo electrónico para la recuperación de la cuenta */
  recoveryEmail: string = '';
  /** Nombre completo del usuario */
  fullName: string = '';
  /** Fecha de nacimiento del usuario */
  birthDate: string = '';
  /** Área de trabajo del usuario */
  workArea: string = '';
  /** Supervisor del usuario */
  supervisor: string = '';
  /** Mensaje de error relacionado con el correo electrónico */
  emailError: string = '';
  /** Mensaje de error relacionado con el inicio de sesión */
  loginError: string = '';
  /** Indica si el correo electrónico es válido */
  emailValid: boolean = true;
  /** Indica si el usuario es mayor de edad */
  isAdult: boolean = true;

  /**
   * Constructor del componente.
   * @param {AuthService} authService - Servicio de autenticación.
   */
  constructor(private authService: AuthService) {}

  /**
   * Maneja el evento de envío del formulario de inicio de sesión.
   * 
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
   * Verifica si el correo electrónico de recuperación es válido.
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
   * 
   * @param {NgForm} form - El formulario de recuperación de cuenta.
   * @returns {void}
   */
  sendNotification(form: NgForm): void {
    if (form.valid && this.isAdult) {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        id: Date.now(),
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
   * Muestra el paso actual en el proceso de recuperación de cuenta.
   * 
   * @param {number} step - El paso actual a mostrar.
   * @returns {void}
   */
  showStep(step: number): void {
    for (let i = 1; i <= 3; i++) {
      const stepElement = document.getElementById(`step${i}`);
      const stepCircle = document.getElementById(`stepCircle${i}`);
      
      if (stepElement && stepCircle) {
        if (i === step) {
          stepElement.classList.add('active');
          stepCircle.classList.add('active');
        } else {
          stepElement.classList.remove('active');
          stepCircle.classList.remove('active');
        }
      }
    }
  }

  /**
   * Valida si la edad del usuario es mayor o igual a 18 años.
   * 
   * @param {Event} event - El evento de cambio de fecha de nacimiento.
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
  /**
   * Reinicia el modal de recuperación de cuenta.
   * @returns {void}
   */
  resetModal(): void {
    this.recoveryEmail = '';
    this.fullName = '';
    this.birthDate = '';
    this.workArea = '';
    this.supervisor = '';
    this.emailError = '';
    this.emailValid = true;
    this.isAdult = true;
    this.showStep(1);
  }
}
