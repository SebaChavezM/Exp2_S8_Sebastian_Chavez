import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Proveedor {
  id: number;
  nombre: string;
  rut: string;
  direccion: string;
  comuna: string;
  telefono: string;
  contacto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private proveedoresSubject: BehaviorSubject<Proveedor[]> = new BehaviorSubject<Proveedor[]>(this.loadProveedoresFromLocalStorage());
  proveedores$ = this.proveedoresSubject.asObservable();

  constructor() {}

  private loadProveedoresFromLocalStorage(): Proveedor[] {
    return JSON.parse(localStorage.getItem('proveedores')!) || [];
  }

  private saveProveedoresToLocalStorage(proveedores: Proveedor[]): void {
    localStorage.setItem('proveedores', JSON.stringify(proveedores));
    this.proveedoresSubject.next(proveedores);
  }

  addProveedor(proveedor: Proveedor): void {
    const proveedores = this.proveedoresSubject.getValue();
    proveedores.push({ ...proveedor, id: new Date().getTime() });
    this.saveProveedoresToLocalStorage(proveedores);
  }

  updateProveedor(updatedProveedor: Proveedor): void {
    const proveedores = this.proveedoresSubject.getValue();
    const index = proveedores.findIndex(p => p.id === updatedProveedor.id);
    if (index !== -1) {
      proveedores[index] = updatedProveedor;
      this.saveProveedoresToLocalStorage(proveedores);
    }
  }

  deleteProveedor(id: number): void {
    const proveedores = this.proveedoresSubject.getValue();
    const updatedProveedores = proveedores.filter(p => p.id !== id);
    this.saveProveedoresToLocalStorage(updatedProveedores);
  }

  getProveedores(): Proveedor[] {
    return this.proveedoresSubject.getValue();
  }
}
