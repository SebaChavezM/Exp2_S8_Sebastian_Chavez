import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Product {
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
  stock: number;
  bodega: string;
}

export interface Movimiento {
  tipo: string;
  numero: number;
  fecha: string;
  documento?: string;
  detalles: string;
  items: Array<{
    code: string;
    name: string;
    description: string;
    cantidad: number;
  }>;
  usuario: string;
  bodegaOrigen?: string;
  bodegaDestino?: string;
}

export type PartialProduct = {
  [P in keyof Product]?: Product[P];
} & {
  [key: string]: any;
};

interface Notification {
  id: number;
  status: string;
  message: string;
  solicitadaPor: string;
  productoOriginal: PartialProduct;
  cambiosSolicitados: PartialProduct;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsSubject: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>(this.loadProductsFromLocalStorage());
  products$ = this.productsSubject.asObservable();
  private nextIngresoNumber: number = +localStorage.getItem('nextIngresoNumber')! || 1;
  private nextSalidaNumber: number = +localStorage.getItem('nextSalidaNumber')! || 1;
  private historial: Movimiento[] = JSON.parse(localStorage.getItem('historial')!) || [];
  private historialSubject: BehaviorSubject<Movimiento[]> = new BehaviorSubject<Movimiento[]>(this.historial);
  private notifications: Notification[] = JSON.parse(localStorage.getItem('notifications') || '[]');
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>(this.notifications);
  historial$ = this.historialSubject.asObservable();

  constructor() {}

  private loadProductsFromLocalStorage(): Product[] {
    return JSON.parse(localStorage.getItem('products')!) || [];
  }

  private saveProductsToLocalStorage(products: Product[]): void {
    localStorage.setItem('products', JSON.stringify(products));
    this.productsSubject.next(products);
  }

  addProduct(product: Product) {
    const currentProducts = this.productsSubject.getValue();
    currentProducts.push(product);
    this.saveProductsToLocalStorage(currentProducts);
  }

  deleteProduct(index: number) {
    const currentProducts = this.productsSubject.getValue();
    currentProducts.splice(index, 1);
    this.saveProductsToLocalStorage(currentProducts);
  }

  updateProduct(code: string, updatedProduct: PartialProduct) {
    const currentProducts = this.productsSubject.getValue();
    const productIndex = currentProducts.findIndex(p => p.code === code);
    if (productIndex !== -1) {
      currentProducts[productIndex] = { ...currentProducts[productIndex], ...updatedProduct };
      this.saveProductsToLocalStorage(currentProducts);
    }
  }

  getNextIngresoNumber(): number {
    return this.nextIngresoNumber;
  }

  getNextSalidaNumber(): number {
    return this.nextSalidaNumber;
  }

  incrementNextIngresoNumber() {
    this.nextIngresoNumber++;
    this.saveNextIngresoNumber();
  }

  incrementNextSalidaNumber() {
    this.nextSalidaNumber++;
    this.saveNextSalidaNumber();
  }

  saveNextIngresoNumber() {
    localStorage.setItem('nextIngresoNumber', this.nextIngresoNumber.toString());
  }

  saveNextSalidaNumber() {
    localStorage.setItem('nextSalidaNumber', this.nextSalidaNumber.toString());
  }

  addMovimiento(movimiento: Movimiento) {
    this.historial.push(movimiento);
    this.updateHistorialLocalStorage();
  }

  private updateHistorialLocalStorage() {
    localStorage.setItem('historial', JSON.stringify(this.historial));
    this.historialSubject.next(this.historial);
  }

  // Notificaciones
  addNotification(notification: Notification) {
    this.notifications.push(notification);
    this.saveNotificationsToLocalStorage();
  }

  getNotifications(): Notification[] {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  updateNotificationStatus(notificationId: number, status: string) {
    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      this.notifications[notificationIndex].status = status;
      this.saveNotificationsToLocalStorage();
    }
  }

  private saveNotificationsToLocalStorage() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.notificationsSubject.next(this.notifications);
  }

  // Nuevo método para actualizar las notificaciones
  updateNotifications(notifications: Notification[]) {
    this.notifications = notifications;
    this.saveNotificationsToLocalStorage();
  }
}
