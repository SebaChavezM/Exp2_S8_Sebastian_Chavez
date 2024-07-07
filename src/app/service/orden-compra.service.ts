import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrdenCompra } from '../models/orden-compra.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {
  private ordenesCompraSubject: BehaviorSubject<OrdenCompra[]> = new BehaviorSubject<OrdenCompra[]>(this.loadOrdenesCompraFromLocalStorage());
  ordenesCompra$ = this.ordenesCompraSubject.asObservable();

  constructor() {}

  private loadOrdenesCompraFromLocalStorage(): OrdenCompra[] {
    return JSON.parse(localStorage.getItem('ordenesCompra')!) || [];
  }

  private saveOrdenesCompraToLocalStorage(ordenesCompra: OrdenCompra[]): void {
    localStorage.setItem('ordenesCompra', JSON.stringify(ordenesCompra));
    this.ordenesCompraSubject.next(ordenesCompra);
  }

  getOrdenesCompra(): OrdenCompra[] {
    return this.ordenesCompraSubject.getValue();
  }

  addOrdenCompra(ordenCompra: OrdenCompra): void {
    const currentOrdenesCompra = this.getOrdenesCompra();
    currentOrdenesCompra.push(ordenCompra);
    this.saveOrdenesCompraToLocalStorage(currentOrdenesCompra);
  }

  updateOrdenCompra(numero: number, updatedOrdenCompra: OrdenCompra): void {
    const currentOrdenesCompra = this.getOrdenesCompra();
    const index = currentOrdenesCompra.findIndex(oc => oc.numero === numero);
    if (index !== -1) {
      currentOrdenesCompra[index] = updatedOrdenCompra;
      this.saveOrdenesCompraToLocalStorage(currentOrdenesCompra);
    }
  }

  deleteOrdenCompra(index: number): void {
    const currentOrdenesCompra = this.getOrdenesCompra();
    currentOrdenesCompra.splice(index, 1);
    this.saveOrdenesCompraToLocalStorage(currentOrdenesCompra);
  }
}
