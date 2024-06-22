// src/app/notificaciones/notificaciones.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ProductService, Product, PartialProduct } from '../service/product.service';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  status: string;
  message: string;
  solicitadaPor: string;
  productoOriginal: PartialProduct;
  cambiosSolicitados: PartialProduct;
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

  constructor(private authService: AuthService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.isBodega = this.authService.isBodega();
  }

  loadNotifications() {
    this.notifications = this.productService.getNotifications();
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
    }
  }

  rejectModification() {
    if (this.selectedNotification) {
      this.productService.updateNotificationStatus(this.selectedNotification.id, 'rejected');
      this.selectedNotification.status = 'rejected';
      this.saveNotifications();
      this.closeModal();
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
