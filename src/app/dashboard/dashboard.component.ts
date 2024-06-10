import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ProductService, Product } from '../service/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  historial: any[] = [];
  selectedProductIndexToDelete: number = -1;
  selectedProductIndexToEdit: number = -1;
  newProduct: Product = {
    code: '',
    name: '',
    description: '',
    model: '',
    brand: '',
    material: '',
    color: '',
    family: '',
    value: 0,
    currency: '',
    unit: '',
    location: '',
    stock: 0
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.products$.subscribe(products => this.products = products);
    this.productService.historial$.subscribe(historial => this.historial = historial);
  }

  onAddProduct(form: NgForm) {
    if (form.valid) {
      this.productService.addProduct(this.newProduct);
      // Reset form
      form.resetForm();
      this.newProduct = {
        code: '',
        name: '',
        description: '',
        model: '',
        brand: '',
        material: '',
        color: '',
        family: '',
        value: 0,
        currency: '',
        unit: '',
        location: '',
        stock: 0
      };
    }
  }

  onDeleteProduct(index: number) {
    this.selectedProductIndexToDelete = index;
    this.productService.deleteProduct(index);
  }

  onUpdateProduct(index: number, product: Product) {
    this.productService.updateProduct(index, product);
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredProducts = this.products.filter(product =>
      product.code.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.name.toLowerCase().includes(searchTerm)
    );
    this.products = filteredProducts;
  }

  onViewProductInfo(index: number) {
    const product = this.products[index];
    // Lógica para mostrar la información del producto en un modal
  }

  onEditProduct(index: number) {
    this.selectedProductIndexToEdit = index;
    const product = this.products[index];
    // Lógica para llenar el formulario de edición con los datos del producto
  }
}
