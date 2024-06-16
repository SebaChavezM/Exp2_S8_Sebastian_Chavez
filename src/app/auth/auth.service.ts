import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router) {
    this.createDefaultAdmin();
  }

  createDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUser = users.find((u: any) => u.email === 'admin@example.com');

    if (!adminUser) {
      const defaultAdmin = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'Admin12345',
        role: 'Admin'
      };
      users.push(defaultAdmin);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Usuario administrador creado:', defaultAdmin);
    }
  }

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

  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user ? user.roles : [];
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

  isRoleAllowed(allowedRoles: string[]): boolean {
    const user = this.getCurrentUser();
    return user && allowedRoles.includes(user.role);
  }

  updateCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  updateUserInList(updatedUser: any) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((user: any) => user.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }
}
