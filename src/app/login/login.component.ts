import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  ngOnInit() {
    const loginForm = document.querySelector('form') as HTMLFormElement;

    loginForm.addEventListener('submit', (event: Event) => {
        event.preventDefault();

        const emailInput = document.getElementById('exampleInputEmail1') as HTMLInputElement;
        const passwordInput = document.getElementById('exampleInputPassword1') as HTMLInputElement;

        const email = emailInput.value;
        const password = passwordInput.value;

        const users: { email: string, password: string, role: string }[] = JSON.parse(localStorage.getItem('users') || '[]');

        const user = users.find(user => user.email === email);

        if (user) {
            if (password === user.password) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                switch (user.role) {
                    case 'Admin':
                        window.location.href = 'Vista_Admin/Inicio_Admin.html';
                        break;
                    case 'Área':
                        window.location.href = 'Vista_Area/Inicio_Area.html';
                        break;
                    case 'Bodega':
                        window.location.href = 'Vista_Bodega/Inicio_Bodega.html';
                        break;
                    case 'Auditor':
                        window.location.href = 'Vista_Auditor/Inicio_Auditor.html';
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
    });
  }
}
