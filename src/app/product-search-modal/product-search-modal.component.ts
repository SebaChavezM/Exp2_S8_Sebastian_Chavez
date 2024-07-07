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
  searchTerm: string = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];

  activeModal = inject(NgbActiveModal);
  productService = inject(ProductService);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.products = this.productService.getAllProducts();
    this.filteredProducts = this.products;
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter(product => product.name.toLowerCase().includes(filterValue));
  }

  selectProduct(product: Product) {
    this.activeModal.close(product);
  }

  addProduct() {
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
