import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    const users = JSON.parse(localStorage.getItem('users')!);
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (user.role === 'Admin') {
        this.router.navigate(['/admin-dashboard']);
      } else if (user.role === 'Área') {
        this.router.navigate(['/area-dashboard']);
      } else if (user.role === 'Auditor') {
        this.router.navigate(['/auditor-dashboard']);
      }
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')!);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'Admin';
  }

  isArea(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'Área';
  }

  isAuditor(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'Auditor';
  }
}
