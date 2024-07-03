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

  addProduct(product: Product): void {
    const currentProducts = this.productsSubject.getValue();
    if (!currentProducts.some(p => p.code === product.code)) {
      currentProducts.push(product);
      this.saveProductsToLocalStorage(currentProducts);
    }
  }

  addProducts(products: Product[]): void {
    const currentProducts = this.productsSubject.getValue();
    const newProducts = products.filter(p => !currentProducts.some(cp => cp.code === p.code));
    newProducts.forEach(p => p.bodega = p.bodega.toUpperCase());
    this.saveProductsToLocalStorage([...currentProducts, ...newProducts]);
  }

  deleteProductByCode(code: string): void {
    const currentProducts = this.productsSubject.getValue();
    const updatedProducts = currentProducts.filter(product => product.code !== code);
    this.saveProductsToLocalStorage(updatedProducts);
  }

  updateProduct(code: string, updatedProduct: PartialProduct): void {
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

  incrementNextIngresoNumber(): void {
    this.nextIngresoNumber++;
    this.saveNextIngresoNumber();
  }

  incrementNextSalidaNumber(): void {
    this.nextSalidaNumber++;
    this.saveNextSalidaNumber();
  }

  private saveNextIngresoNumber(): void {
    localStorage.setItem('nextIngresoNumber', this.nextIngresoNumber.toString());
  }

  private saveNextSalidaNumber(): void {
    localStorage.setItem('nextSalidaNumber', this.nextSalidaNumber.toString());
  }

  addMovimiento(movimiento: Movimiento): void {
    this.historial.push(movimiento);
    this.updateHistorialLocalStorage();
  }

  private updateHistorialLocalStorage(): void {
    localStorage.setItem('historial', JSON.stringify(this.historial));
    this.historialSubject.next(this.historial);
  }

  addNotification(notification: Notification): void {
    this.notifications.push(notification);
    this.saveNotificationsToLocalStorage();
  }

  getNotifications(): Notification[] {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  updateNotificationStatus(notificationId: number, status: string): void {
    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      this.notifications[notificationIndex].status = status;
      this.saveNotificationsToLocalStorage();
    }
  }

  private saveNotificationsToLocalStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.notificationsSubject.next(this.notifications);
  }

  updateNotifications(notifications: Notification[]): void {
    this.notifications = notifications;
    this.saveNotificationsToLocalStorage();
  }

  getAllProducts(): Product[] {
    return this.loadProductsFromLocalStorage();
  }

  getAllBodegas(): string[] {
    const bodegas = new Set<string>();
    this.productsSubject.getValue().forEach(product => bodegas.add(product.bodega.toUpperCase()));
    return Array.from(bodegas);
  }
}
