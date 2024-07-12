import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface Notification {
  id: number;
  status: string;
  message: string;
  solicitadaPor: string;
  productoOriginal: any;
  cambiosSolicitados: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private router: Router) {
    this.createDefaultUsers();
  }

  createDefaultUsers(): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const defaultUsers = [
      {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'Admin12345',
        role: 'Admin'
      },
      {
        id: '2',
        firstName: 'Area',
        lastName: 'User',
        email: 'area@example.com',
        password: 'Area12345',
        role: 'Área'
      },
      {
        id: '3',
        firstName: 'Auditor',
        lastName: 'User',
        email: 'auditor@example.com',
        password: 'Auditor12345',
        role: 'Auditor'
      },
      {
        id: '4',
        firstName: 'Bodega',
        lastName: 'User',
        email: 'bodega@example.com',
        password: 'Bodega12345',
        role: 'Bodega'
      }
    ];

    defaultUsers.forEach(defaultUser => {
      const userExists = users.find((u: any) => u.email === defaultUser.email);
      if (!userExists) {
        users.push(defaultUser);
      }
    });

    localStorage.setItem('users', JSON.stringify(users));
    console.log('Usuarios predeterminados creados:', defaultUsers);
  }

  login(email: string, password: string): boolean {
    const users = JSON.parse(localStorage.getItem('users')!);
    const user = users.find((u: any) => u.email === email && u.password === password);
  
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.router.navigate(['/inicio']);
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

  getCurrentUser(): any {
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

  isBodega(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'Bodega';
  }

  isRoleAllowed(allowedRoles: string[]): boolean {
    const user = this.getCurrentUser();
    return user && allowedRoles.includes(user.role);
  }

  updateCurrentUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  updateUserInList(updatedUser: any): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((user: any) => user.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  getCurrentUserRole(): string {
    // Aquí deberías tener la lógica para obtener el rol del usuario actual
    // Esto es solo un ejemplo. Necesitas adaptar esto a tu lógica de autenticación.
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    return currentUser ? currentUser.role : 'Guest';
  }

  getNotifications(): Notification[] {
    const storedNotifications = localStorage.getItem('notifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  }

  updateNotificationStatus(notificationId: number, status: string): void {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = status;
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }
}
