import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductService, Product } from '../service/product.service';

@Component({
  selector: 'app-product-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './product-search-modal.component.html',
  styleUrls: ['./product-search-modal.component.css']
})
export class ProductSearchModalComponent implements OnInit {
  /** Término de búsqueda ingresado por el usuario */
  searchTerm: string = '';
  /** Lista de todos los productos */
  products: Product[] = [];
  /** Lista de productos filtrados según el término de búsqueda */
  filteredProducts: Product[] = [];

  /** Modal activo de NgbActiveModal */
  activeModal = inject(NgbActiveModal);
  /** Servicio de productos inyectado */
  productService = inject(ProductService);

  /**
   * Método de inicialización del componente.
   * Carga la lista de productos al iniciar el componente.
   * @returns {void}
   */
  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Carga todos los productos utilizando el ProductService.
   * @returns {void}
   */
  loadProducts(): void {
    this.products = this.productService.getAllProducts();
    this.filteredProducts = this.products;
  }

  /**
   * Filtra los productos según el término de búsqueda ingresado.
   * @returns {void}
   */
  filterProducts(): void {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  /**
   * Aplica el filtro a la lista de productos según el valor ingresado en el campo de búsqueda.
   * @param {Event} event - El evento de entrada.
   * @returns {void}
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter(product => product.name.toLowerCase().includes(filterValue));
  }

  /**
   * Selecciona un producto y cierra el modal activo pasando el producto seleccionado.
   * @param {Product} product - El producto seleccionado.
   * @returns {void}
   */
  selectProduct(product: Product): void {
    this.activeModal.close(product);
  }

  /**
   * Agrega un nuevo producto a la lista de productos y actualiza la lista de productos filtrados.
   * @returns {void}
   */
  addProduct(): void {
    const newProduct: Product = {
      code: '003',
      name: 'Producto 3',
      description: 'Nuevo Producto 3',
      model: '',
      brand: '',
      material: '',
      color: '',
      family: '',
      value: 20,
      currency: 'CLP',
      unit: 'pz',
      location: '',
      stock: 0,
      bodega: 'Bodega 1'
    };
    this.products.push(newProduct);
    this.filteredProducts = [...this.products];
  }
}
