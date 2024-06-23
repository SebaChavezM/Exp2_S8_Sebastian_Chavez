// src/app/notificaciones/notificaciones.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ProductService, Product } from '../service/product.service';
import { NotificationService } from '../service/notificacion.service';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  status: string;
  message: string;
  solicitadaPor: string;
  productoOriginal: Partial<Product>;
  cambiosSolicitados: Partial<Product>;
}

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NotificacionesComponent implements OnInit {
  notifications: Notification[] = [];
  selectedNotification: Notification | null = null;
  isBodega: boolean = false;
  pendingNotificationsCount: number = 0;

  constructor(private authService: AuthService, private productService: ProductService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.isBodega = this.authService.isBodega();
  }

  loadNotifications() {
    this.notifications = this.productService.getNotifications();
    this.updatePendingNotificationsCount();
  }

  updatePendingNotificationsCount() {
    const count = this.notifications.filter(notification => notification.status === 'pending').length;
    this.pendingNotificationsCount = count;
    this.notificationService.setPendingCount(count);
  }
  
  openModal(notification: Notification) {
    this.selectedNotification = notification;
    const modalElement = document.getElementById('notificationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  acceptModification() {
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

  rejectModification() {
    if (this.selectedNotification) {
      this.productService.updateNotificationStatus(this.selectedNotification.id, 'rejected');
      this.selectedNotification.status = 'rejected';
      this.saveNotifications();
      this.closeModal();
      this.updatePendingNotificationsCount();
    }
  }

  saveNotifications() {
    this.productService.updateNotifications(this.notifications);
  }

  hasChanged(field: keyof Product): boolean {
    if (!this.selectedNotification) return false;
    return this.selectedNotification.productoOriginal[field] !== this.selectedNotification.cambiosSolicitados[field];
  }

  closeModal() {
    const modalElement = document.getElementById('notificationModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

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
