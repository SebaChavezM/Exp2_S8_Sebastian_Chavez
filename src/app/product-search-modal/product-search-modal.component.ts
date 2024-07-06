import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importamos CommonModule y CurrencyPipe
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService, Product } from '../service/product.service';

@Component({
  selector: 'app-product-search-modal',
  templateUrl: './product-search-modal.component.html',
  styleUrls: ['./product-search-modal.component.css'],
  standalone: true,
  imports: [CommonModule, CurrencyPipe] // Aseguramos importar CommonModule y CurrencyPipe aquí
})
export class ProductSearchModalComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(public activeModal: NgbActiveModal, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.products = this.productService.getAllProducts();
    this.filteredProducts = [...this.products];
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.description.toLowerCase().includes(filterValue)
    );
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
