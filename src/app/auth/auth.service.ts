import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSignal = signal(false);

  login(email: string, password: string): boolean {
    const users: { email: string, password: string, role: string }[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(user => user.email === email);

    if (user && user.password === password) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.isLoggedInSignal.set(true);
      return true;
    }

    return false;
  }

  isLoggedIn() {
    return this.isLoggedInSignal();
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.isLoggedInSignal.set(false);
  }
}
