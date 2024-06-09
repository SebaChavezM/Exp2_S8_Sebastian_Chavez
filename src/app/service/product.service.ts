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
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>(this.loadProducts());
  products$ = this.productsSubject.asObservable();

  private historialSubject = new BehaviorSubject<any[]>(this.loadHistorial());
  historial$ = this.historialSubject.asObservable();

  private ultimoIngreso = parseInt(localStorage.getItem('ultimoIngreso') || '0', 10);
  private ultimoSalida = parseInt(localStorage.getItem('ultimoSalida') || '0', 10);

  constructor() {}

  private loadProducts(): Product[] {
    return JSON.parse(localStorage.getItem('products') || '[]');
  }

  private saveProducts(products: Product[]): void {
    localStorage.setItem('products', JSON.stringify(products));
    this.productsSubject.next(products);
  }

  private loadHistorial(): any[] {
    return JSON.parse(localStorage.getItem('historial') || '[]');
  }

  private saveHistorial(historial: any[]): void {
    localStorage.setItem('historial', JSON.stringify(historial));
    this.historialSubject.next(historial);
  }

  addProduct(product: Product): void {
    const products = this.loadProducts();
    products.push(product);
    this.saveProducts(products);
  }

  deleteProduct(index: number): void {
    const products = this.loadProducts();
    products.splice(index, 1);
    this.saveProducts(products);
  }

  updateProduct(index: number, updatedProduct: Product): void {
    const products = this.loadProducts();
    products[index] = updatedProduct;
    this.saveProducts(products);
  }

  addSalida(nuevoRegistro: any): void {
    const historial = this.loadHistorial();
    historial.push(nuevoRegistro);
    this.saveHistorial(historial);
    this.ultimoSalida++;
    localStorage.setItem('ultimoSalida', this.ultimoSalida.toString());
  }
}
