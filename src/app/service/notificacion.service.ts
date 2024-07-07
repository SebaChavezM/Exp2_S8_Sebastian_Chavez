import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Notification {
  id: number;
  status: string;
  message: string;
  solicitadaPor: string;
  productoOriginal: any;  // Cambia esto si tienes una definición específica
  cambiosSolicitados: any;  // Cambia esto si tienes una definición específica
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>(this.notifications);
  notifications$ = this.notificationsSubject.asObservable();

  getNotifications(): Notification[] {
    return this.notifications;
  }

  addNotification(notification: Notification): void {
    this.notifications.push(notification);
    this.saveNotificationsToLocalStorage();
  }

  private saveNotificationsToLocalStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.notificationsSubject.next(this.notifications);
  }

  setPendingCount(count: number): void {
    this.pendingCount.next(count);
  }

  private pendingCount = new BehaviorSubject<number>(0);
  pendingCount$ = this.pendingCount.asObservable();
}
