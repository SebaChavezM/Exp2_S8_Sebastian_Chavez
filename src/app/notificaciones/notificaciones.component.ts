import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ProductService, Product } from '../service/product.service';
import { NotificationService } from '../service/notificacion.service';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';

/**
 * Interfaz para representar una notificación.
 * @interface
 */
interface Notification {
  /**
   * Identificador único de la notificación.
   * @type {number}
   */
  id: number;

  /**
   * Estado de la notificación (e.g., pending, accepted, rejected).
   * @type {string}
   */
  status: string;

  /**
   * Mensaje descriptivo de la notificación.
   * @type {string}
   */
  message: string;

  /**
   * Nombre de la persona que solicitó la notificación.
   * @type {string}
   */
  solicitadaPor: string;

  /**
   * Producto original antes de la modificación.
   * @type {Partial<Product>}
   */
  productoOriginal: Partial<Product>;

  /**
   * Cambios solicitados en el producto.
   * @type {Partial<Product>}
   */
  cambiosSolicitados: Partial<Product>;
}

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
  standalone: true,
  imports: [CommonModule]
})
/**
 * Componente para gestionar las notificaciones.
 * @class
 * @implements {OnInit}
 */
export class NotificacionesComponent implements OnInit {
  /**
   * Lista de notificaciones.
   * @type {Notification[]}
   * @memberof NotificacionesComponent
   */
  notifications: Notification[] = [];

  /**
   * Notificación seleccionada.
   * @type {(Notification | null)}
   * @memberof NotificacionesComponent
   */
  selectedNotification: Notification | null = null;

  /**
   * Indica si es bodega.
   * @type {boolean}
   * @memberof NotificacionesComponent
   */
  isBodega: boolean = false;

  /**
   * Contador de notificaciones pendientes.
   * @type {number}
   * @memberof NotificacionesComponent
   */
  pendingNotificationsCount: number = 0;

  /**
   * Constructor del componente.
   * @param {AuthService} authService - Servicio de autenticación.
   * @param {ProductService} productService - Servicio de productos.
   * @param {NotificationService} notificationService - Servicio de notificaciones.
   */
  constructor(private authService: AuthService, private productService: ProductService, private notificationService: NotificationService) {}

  /**
   * Método de inicialización del componente.
   * @returns {void}
   */
  ngOnInit(): void {
    this.loadNotifications();
    this.isBodega = this.authService.isBodega();
  }

  /**
   * Carga las notificaciones desde el servicio de productos.
   * @returns {void}
   */
  loadNotifications(): void {
    this.notifications = this.productService.getNotifications();
    this.updatePendingNotificationsCount();
  }

  /**
   * Actualiza el contador de notificaciones pendientes.
   * @returns {void}
   */
  updatePendingNotificationsCount(): void {
    const count = this.notifications.filter(notification => notification.status === 'pending').length;
    this.pendingNotificationsCount = count;
    this.notificationService.setPendingCount(count);
  }

  /**
   * Abre el modal de notificación.
   * @param {Notification} notification - Notificación a mostrar en el modal.
   * @returns {void}
   */
  openModal(notification: Notification): void {
    this.selectedNotification = notification;
    const modalElement = document.getElementById('notificationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  /**
   * Acepta la modificación del producto en la notificación seleccionada.
   * @returns {void}
   */
  acceptModification(): void {
    if (this.selectedNotification) {
      const productCode = this.selectedNotification.productoOriginal.code as string;
      this.productService.updateProduct(productCode, this.selectedNotification.cambiosSolicitados);
      this.productService.updateNotificationStatus(this.selectedNotification.id, 'accepted');
      this.selectedNotification.status = 'accepted';
      this.saveNotifications();
      this.closeModal();
      this.updatePendingNotificationsCount();
    }
  }

  /**
   * Rechaza la modificación del producto en la notificación seleccionada.
   * @returns {void}
   */
  rejectModification(): void {
    if (this.selectedNotification) {
      this.productService.updateNotificationStatus(this.selectedNotification.id, 'rejected');
      this.selectedNotification.status = 'rejected';
      this.saveNotifications();
      this.closeModal();
      this.updatePendingNotificationsCount();
    }
  }

  /**
   * Guarda las notificaciones actualizadas.
   * @returns {void}
   */
  saveNotifications(): void {
    this.productService.updateNotifications(this.notifications);
  }

  /**
   * Verifica si un campo específico ha cambiado en la notificación seleccionada.
   * @param {keyof Product} field - Campo a verificar.
   * @returns {boolean} - Verdadero si el campo ha cambiado, falso en caso contrario.
   */
  hasChanged(field: keyof Product): boolean {
    if (!this.selectedNotification) return false;
    return this.selectedNotification.productoOriginal[field] !== this.selectedNotification.cambiosSolicitados[field];
  }

  /**
   * Cierra el modal de notificación.
   * @returns {void}
   */
  closeModal(): void {
    const modalElement = document.getElementById('notificationModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  /**
   * Traduce el estado de la notificación al español.
   * @param {string | undefined} status - Estado de la notificación.
   * @returns {string} - Estado traducido.
   */
  translateStatus(status: string | undefined): string {
    if (!status) return '';
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptado';
      case 'rejected':
        return 'Rechazado';
      default:
        return '';
    }
  }

  /**
   * Obtiene la clase CSS correspondiente al estado de la notificación.
   * @param {string | undefined} status - Estado de la notificación.
   * @returns {string} - Clase CSS.
   */
  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    switch (status) {
      case 'pending':
        return 'text-warning';
      case 'accepted':
        return 'text-success';
      case 'rejected':
        return 'text-danger';
      default:
        return '';
    }
  }
}

