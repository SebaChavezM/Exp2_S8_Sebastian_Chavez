import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../service/product.service';
import * as bootstrap from 'bootstrap';

/**
 * Componente del panel de control del auditor.
 * 
 * @export
 * @class AuditorDashboardComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-auditor-dashboard',
  templateUrl: './auditor-dashboard.component.html',
  styleUrls: ['./auditor-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AuditorDashboardComponent implements OnInit {

  /**
   * Lista de productos.
   * 
   * @type {Product[]}
   * @memberof AuditorDashboardComponent
   */
  products: Product[] = [];

  /**
   * Lista de productos filtrados.
   * 
   * @type {Product[]}
   * @memberof AuditorDashboardComponent
   */
  filteredProducts: Product[] = [];

  /**
   * Término de búsqueda de productos.
   * 
   * @type {string}
   * @memberof AuditorDashboardComponent
   */
  searchProductTerm: string = '';

  /**
   * Producto seleccionado.
   * 
   * @type {(Product | null)}
   * @memberof AuditorDashboardComponent
   */
  selectedProduct: Product | null = null;

  /**
   * Crea una instancia de AuditorDashboardComponent.
   * 
   * @param {ProductService} productService Servicio de productos
   * @memberof AuditorDashboardComponent
   */
  constructor(private productService: ProductService) {}

  /**
   * Método que se ejecuta al inicializar el componente.
   * 
   * @memberof AuditorDashboardComponent
   */
  ngOnInit(): void {
    this.productService.products$.subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
    });
  }

  /**
   * Filtra los productos según el término de búsqueda ingresado.
   * 
   * @param {any} event Evento de entrada de búsqueda
   * @memberof AuditorDashboardComponent
   */
  onSearchProduct(event: any) {
    this.searchProductTerm = event.target.value.toLowerCase();
    if (this.searchProductTerm) {
      this.filteredProducts = this.products.filter(product =>
        product.code.toLowerCase().includes(this.searchProductTerm) ||
        product.description.toLowerCase().includes(this.searchProductTerm) ||
        product.name.toLowerCase().includes(this.searchProductTerm)
      );
    } else {
      this.filteredProducts = this.products;
    }
  }

  /**
   * Muestra la información del producto seleccionado en un modal.
   * 
   * @param {number} index Índice del producto seleccionado en la lista
   * @memberof AuditorDashboardComponent
   */
  onViewProductInfo(index: number) {
    this.selectedProduct = this.products[index];
    const productInfoModal = new bootstrap.Modal(document.getElementById('productInfoModal')!);
    productInfoModal.show();
  }
}
