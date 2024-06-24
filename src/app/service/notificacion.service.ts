import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio de notificaciones.
 *
 * @export
 * @class NotificationService
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private pendingCount = new BehaviorSubject<number>(0);
  
  /**
   * Observable para el conteo de notificaciones pendientes.
   *
   * @type {Observable<number>}
   * @memberof NotificationService
   */
  pendingCount$ = this.pendingCount.asObservable();

  /**
   * Establece el conteo de notificaciones pendientes.
   *
   * @param {number} count Nuevo conteo de notificaciones pendientes.
   * @memberof NotificationService
   */
  setPendingCount(count: number): void {
    this.pendingCount.next(count);
  }
}
