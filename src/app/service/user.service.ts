import { Injectable } from '@angular/core';

/**
 * Servicio para la gestión de usuarios.
 *
 * @export
 * @class UserService
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: { username: string, password: string }[] = JSON.parse(localStorage.getItem('users')!) || [];

  /**
   * Crea un nuevo usuario y lo agrega al almacenamiento local.
   *
   * @param {string} username Nombre de usuario.
   * @param {string} password Contraseña del usuario.
   * @memberof UserService
   */
  createUser(username: string, password: string): void {
    this.users.push({ username, password });
    this.updateLocalStorage();
  }

  /**
   * Autentica a un usuario con el nombre de usuario y la contraseña proporcionados.
   *
   * @param {string} username Nombre de usuario.
   * @param {string} password Contraseña del usuario.
   * @returns {boolean} Verdadero si la autenticación es exitosa, falso de lo contrario.
   * @memberof UserService
   */
  authenticateUser(username: string, password: string): boolean {
    const user = this.users.find(user => user.username === username && user.password === password);
    if (user) {
      localStorage.setItem('authenticatedUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  /**
   * Cierra la sesión del usuario autenticado.
   *
   * @memberof UserService
   */
  logoutUser(): void {
    localStorage.removeItem('authenticatedUser');
  }

  /**
   * Obtiene el usuario autenticado desde el almacenamiento local.
   *
   * @returns {any} Usuario autenticado.
   * @memberof UserService
   */
  getAuthenticatedUser(): any {
    return JSON.parse(localStorage.getItem('authenticatedUser')!);
  }

  /**
   * Actualiza el almacenamiento local con la lista de usuarios actualizada.
   *
   * @private
   * @memberof UserService
   */
  private updateLocalStorage(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
  }
}
