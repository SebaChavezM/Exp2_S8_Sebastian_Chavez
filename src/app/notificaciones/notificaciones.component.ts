import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ProductService } from '../service/product.service';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  status: string;
  message: string;
  solicitadaPor: string;
  productoOriginal: {
    code: string;
    name: string;
    description: string;
    model: string;
    brand: string;
    material: string;
    color: string;
    family: string;
    value: number;
    currency: string;
    unit: string;
    location: string;
  };
  cambiosSolicitados: {
    name: string;
    description: string;
    model: string;
    brand: string;
    material: string;
    color: string;
    family: string;
    value: number;
    currency: string;
    unit: string;
    location: string;
  };
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

  constructor(private authService: AuthService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notifications = this.authService.getNotifications();
    console.log(this.notifications); // Añadir un log para verificar que se cargan las notificaciones
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
      this.authService.updateNotificationStatus(this.selectedNotification.id, 'accepted');
      this.selectedNotification.status = 'accepted';
      this.saveNotifications();
      this.closeModal();
    }
  }

  rejectModification() {
    if (this.selectedNotification) {
      this.authService.updateNotificationStatus(this.selectedNotification.id, 'rejected');
      this.selectedNotification.status = 'rejected';
      this.saveNotifications();
      this.closeModal();
    }
  }

  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
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
}
