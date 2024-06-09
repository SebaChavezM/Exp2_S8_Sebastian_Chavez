import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const loginForm = document.querySelector('form') as HTMLFormElement;

    loginForm.addEventListener('submit', (event: Event) => {
        event.preventDefault();

        const emailInput = document.getElementById('exampleInputEmail1') as HTMLInputElement;
        const passwordInput = document.getElementById('exampleInputPassword1') as HTMLInputElement;

        const email = emailInput.value;
        const password = passwordInput.value;

        if (this.authService.login(email, password)) {
          this.router.navigate(['/dashboard']);
        } else {
          alert('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
        }
    });
  }
}
