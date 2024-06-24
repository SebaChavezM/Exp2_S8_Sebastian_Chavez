import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Interfaz para definir un producto.
 */
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

/**
 * Interfaz para definir un movimiento de inventario.
 */
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

/**
 * Tipo que define una versión parcial de un producto.
 */
export type PartialProduct = {
  [P in keyof Product]?: Product[P];
} & {
  [key: string]: any;
};

/**
 * Interfaz para definir una notificación.
 */
interface Notification {
  id: number;
  status: string;
  message: string;
  solicitadaPor: string;
  productoOriginal: PartialProduct;
  cambiosSolicitados: PartialProduct;
}

/**
 * Servicio para la gestión de productos y movimientos de inventario.
 *
 * @export
 * @class ProductService
 */
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

  /**
   * Carga los productos desde el almacenamiento local.
   *
   * @private
   * @returns {Product[]} Lista de productos.
   * @memberof ProductService
   */
  private loadProductsFromLocalStorage(): Product[] {
    return JSON.parse(localStorage.getItem('products')!) || [];
  }

  /**
   * Guarda los productos en el almacenamiento local.
   *
   * @private
   * @param {Product[]} products Lista de productos.
   * @memberof ProductService
   */
  private saveProductsToLocalStorage(products: Product[]): void {
    localStorage.setItem('products', JSON.stringify(products));
    this.productsSubject.next(products);
  }

  /**
   * Agrega un nuevo producto.
   *
   * @param {Product} product Producto a agregar.
   * @memberof ProductService
   */
  addProduct(product: Product): void {
    const currentProducts = this.productsSubject.getValue();
    currentProducts.push(product);
    this.saveProductsToLocalStorage(currentProducts);
  }

  /**
   * Elimina un producto por su índice.
   *
   * @param {number} index Índice del producto a eliminar.
   * @memberof ProductService
   */
  deleteProduct(index: number): void {
    const currentProducts = this.productsSubject.getValue();
    currentProducts.splice(index, 1);
    this.saveProductsToLocalStorage(currentProducts);
  }

  /**
   * Actualiza un producto por su código.
   *
   * @param {string} code Código del producto a actualizar.
   * @param {PartialProduct} updatedProduct Datos actualizados del producto.
   * @memberof ProductService
   */
  updateProduct(code: string, updatedProduct: PartialProduct): void {
    const currentProducts = this.productsSubject.getValue();
    const productIndex = currentProducts.findIndex(p => p.code === code);
    if (productIndex !== -1) {
      currentProducts[productIndex] = { ...currentProducts[productIndex], ...updatedProduct };
      this.saveProductsToLocalStorage(currentProducts);
    }
  }

  /**
   * Obtiene el próximo número de ingreso.
   *
   * @returns {number} Próximo número de ingreso.
   * @memberof ProductService
   */
  getNextIngresoNumber(): number {
    return this.nextIngresoNumber;
  }

  /**
   * Obtiene el próximo número de salida.
   *
   * @returns {number} Próximo número de salida.
   * @memberof ProductService
   */
  getNextSalidaNumber(): number {
    return this.nextSalidaNumber;
  }

  /**
   * Incrementa el próximo número de ingreso.
   *
   * @memberof ProductService
   */
  incrementNextIngresoNumber(): void {
    this.nextIngresoNumber++;
    this.saveNextIngresoNumber();
  }

  /**
   * Incrementa el próximo número de salida.
   *
   * @memberof ProductService
   */
  incrementNextSalidaNumber(): void {
    this.nextSalidaNumber++;
    this.saveNextSalidaNumber();
  }

  /**
   * Guarda el próximo número de ingreso en el almacenamiento local.
   *
   * @private
   * @memberof ProductService
   */
  private saveNextIngresoNumber(): void {
    localStorage.setItem('nextIngresoNumber', this.nextIngresoNumber.toString());
  }

  /**
   * Guarda el próximo número de salida en el almacenamiento local.
   *
   * @private
   * @memberof ProductService
   */
  private saveNextSalidaNumber(): void {
    localStorage.setItem('nextSalidaNumber', this.nextSalidaNumber.toString());
  }

  /**
   * Agrega un movimiento de inventario.
   *
   * @param {Movimiento} movimiento Movimiento a agregar.
   * @memberof ProductService
   */
  addMovimiento(movimiento: Movimiento): void {
    this.historial.push(movimiento);
    this.updateHistorialLocalStorage();
  }

  /**
   * Actualiza el historial de movimientos en el almacenamiento local.
   *
   * @private
   * @memberof ProductService
   */
  private updateHistorialLocalStorage(): void {
    localStorage.setItem('historial', JSON.stringify(this.historial));
    this.historialSubject.next(this.historial);
  }

  /**
   * Agrega una notificación.
   *
   * @param {Notification} notification Notificación a agregar.
   * @memberof ProductService
   */
  addNotification(notification: Notification): void {
    this.notifications.push(notification);
    this.saveNotificationsToLocalStorage();
  }

  /**
   * Obtiene todas las notificaciones.
   *
   * @returns {Notification[]} Lista de notificaciones.
   * @memberof ProductService
   */
  getNotifications(): Notification[] {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  /**
   * Actualiza el estado de una notificación.
   *
   * @param {number} notificationId ID de la notificación a actualizar.
   * @param {string} status Nuevo estado de la notificación.
   * @memberof ProductService
   */
  updateNotificationStatus(notificationId: number, status: string): void {
    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      this.notifications[notificationIndex].status = status;
      this.saveNotificationsToLocalStorage();
    }
  }

  /**
   * Guarda las notificaciones en el almacenamiento local.
   *
   * @private
   * @memberof ProductService
   */
  private saveNotificationsToLocalStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.notificationsSubject.next(this.notifications);
  }

  /**
   * Actualiza la lista de notificaciones.
   *
   * @param {Notification[]} notifications Lista actualizada de notificaciones.
   * @memberof ProductService
   */
  updateNotifications(notifications: Notification[]): void {
    this.notifications = notifications;
    this.saveNotificationsToLocalStorage();
  }
}
