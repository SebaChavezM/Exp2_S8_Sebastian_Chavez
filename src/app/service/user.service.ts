import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: { username: string, password: string }[] = JSON.parse(localStorage.getItem('users')!) || [];

  createUser(username: string, password: string) {
    this.users.push({ username, password });
    this.updateLocalStorage();
  }

  authenticateUser(username: string, password: string): boolean {
    const user = this.users.find(user => user.username === username && user.password === password);
    if (user) {
      localStorage.setItem('authenticatedUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logoutUser() {
    localStorage.removeItem('authenticatedUser');
  }

  getAuthenticatedUser() {
    return JSON.parse(localStorage.getItem('authenticatedUser')!);
  }

  private updateLocalStorage() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }
}
