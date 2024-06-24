import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Interface para las notificaciones.
 */
interface Notification {
  id: number;
  status: string;
  message: string;
  solicitadaPor: string;
  productoOriginal: any;
  cambiosSolicitados: any;
}

/**
 * Servicio de autenticación.
 *
 * @export
 * @class AuthService
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * Crea una instancia de AuthService.
   * @param {Router} router Servicio de enrutamiento.
   * @memberof AuthService
   */
  constructor(private router: Router) {
    this.createDefaultAdmin();
  }

  /**
   * Crea un usuario administrador predeterminado si no existe.
   * @memberof AuthService
   */
  createDefaultAdmin(): void {
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

  /**
   * Inicia sesión con las credenciales proporcionadas.
   *
   * @param {string} email Correo electrónico del usuario.
   * @param {string} password Contraseña del usuario.
   * @returns {boolean} True si las credenciales son correctas, de lo contrario false.
   * @memberof AuthService
   */
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
      } else if (user.role === 'Bodega') {
        this.router.navigate(['/bodega-dashboard']);
      }
      return true;
    }
    return false;
  }

  /**
   * Obtiene los roles del usuario actual.
   *
   * @returns {string[]} Array de roles del usuario.
   * @memberof AuthService
   */
  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user ? user.roles : [];
  }

  /**
   * Cierra la sesión del usuario.
   * @memberof AuthService
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario está autenticado.
   *
   * @returns {boolean} True si el usuario está autenticado, de lo contrario false.
   * @memberof AuthService
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  /**
   * Obtiene el usuario actual.
   *
   * @returns {any} Datos del usuario actual.
   * @memberof AuthService
   */
  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser')!);
  }

  /**
   * Verifica si el usuario actual es administrador.
   *
   * @returns {boolean} True si el usuario es administrador, de lo contrario false.
   * @memberof AuthService
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'Admin';
  }

  /**
   * Verifica si el usuario actual pertenece al área.
   *
   * @returns {boolean} True si el usuario pertenece al área, de lo contrario false.
   * @memberof AuthService
   */
  isArea(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'Área';
  }

  /**
   * Verifica si el usuario actual es auditor.
   *
   * @returns {boolean} True si el usuario es auditor, de lo contrario false.
   * @memberof AuthService
   */
  isAuditor(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'Auditor';
  }

  /**
   * Verifica si el usuario actual pertenece a la bodega.
   *
   * @returns {boolean} True si el usuario pertenece a la bodega, de lo contrario false.
   * @memberof AuthService
   */
  isBodega(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'Bodega';
  }

  /**
   * Verifica si el rol del usuario está permitido.
   *
   * @param {string[]} allowedRoles Array de roles permitidos.
   * @returns {boolean} True si el rol del usuario está permitido, de lo contrario false.
   * @memberof AuthService
   */
  isRoleAllowed(allowedRoles: string[]): boolean {
    const user = this.getCurrentUser();
    return user && allowedRoles.includes(user.role);
  }

  /**
   * Actualiza los datos del usuario actual.
   *
   * @param {any} user Datos del usuario.
   * @memberof AuthService
   */
  updateCurrentUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Actualiza los datos de un usuario en la lista de usuarios.
   *
   * @param {any} updatedUser Datos actualizados del usuario.
   * @memberof AuthService
   */
  updateUserInList(updatedUser: any): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((user: any) => user.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  /**
   * Obtiene las notificaciones del usuario.
   *
   * @returns {Notification[]} Array de notificaciones.
   * @memberof AuthService
   */
  getNotifications(): Notification[] {
    const storedNotifications = localStorage.getItem('notifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  }

  /**
   * Actualiza el estado de una notificación.
   *
   * @param {number} notificationId ID de la notificación.
   * @param {string} status Nuevo estado de la notificación.
   * @memberof AuthService
   */
  updateNotificationStatus(notificationId: number, status: string): void {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = status;
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }
}
