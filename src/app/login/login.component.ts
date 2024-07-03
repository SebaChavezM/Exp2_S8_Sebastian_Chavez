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
export class LoginComponent {
  email: string = '';
  password: string = '';
  recoveryEmail: string = '';
  fullName: string = '';
  birthDate: string = '';
  workArea: string = '';
  supervisor: string = '';
  emailError: string = '';
  loginError: string = '';
  emailValid: boolean = true;
  isAdult: boolean = true;

  constructor(private authService: AuthService) {}

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
