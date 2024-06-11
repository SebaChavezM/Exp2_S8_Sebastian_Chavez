import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../service/product.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-auditor-dashboard',
  templateUrl: './auditor-dashboard.component.html',
  styleUrls: ['./auditor-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AuditorDashboardComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchProductTerm: string = '';
  selectedProduct: Product | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.products$.subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
    });
  }

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

  onViewProductInfo(index: number) {
    this.selectedProduct = this.products[index];
    const productInfoModal = new bootstrap.Modal(document.getElementById('productInfoModal')!);
    productInfoModal.show();
  }
}
