import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ProductService, Product, Movimiento } from '../service/product.service';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  historial: Movimiento[] = [];
  selectedProductIndexToDelete: number = -1;
  selectedProductIndexToEdit: number = -1;
  selectedProduct: Product | null = null;
  selectedProductSalida: Product | null = null;
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
  ingresoItems: any[] = [];
  salidaItems: any[] = [];
  cantidadIngreso: number = 1;
  cantidadSalida: number = 1;
  tipoDocumento: string = '';
  numeroDocumento: string = '';
  motivoSalida: string = '';
  registroNumero: number = 0;
  registroNumeroSalida: number = 0;
  today: string = '';
  selectedMovimiento: Movimiento | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.products$.subscribe(products => this.products = products);
    this.productService.historial$.subscribe(historial => this.historial = historial);
    this.today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    this.registroNumero = this.productService.getNextIngresoNumber();
    this.registroNumeroSalida = this.productService.getNextSalidaNumber();
  }

  productExists(code: string): boolean {
    return this.products.some(product => product.code === code);
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
    this.selectedProduct = this.products[index];
    const productInfoModal = new bootstrap.Modal(document.getElementById('productInfoModal')!);
    productInfoModal.show();
  }

  onEditProduct(index: number) {
    this.selectedProductIndexToEdit = index;
    const product = this.products[index];
    // Lógica para llenar el formulario de edición con los datos del producto
  }

  onAddProduct(form: NgForm) {
    if (form.valid) {
      if (!this.productExists(this.newProduct.code)) {
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
  }

  onAddProductoToIngreso() {
    const selectedProductCode = this.selectedProduct?.code;
    if (!selectedProductCode) return;

    const existingItem = this.ingresoItems.find(item => item.product.code === selectedProductCode);
    if (existingItem) {
      alert('El producto ya se encuentra en la tabla.');
      return;
    }

    const productToAdd = this.products.find(product => product.code === selectedProductCode);
    if (productToAdd) {
      this.ingresoItems.push({
        product: productToAdd,
        cantidad: this.cantidadIngreso
      });
      this.cantidadIngreso = 1; // Reset the input
    }
  }

  onEliminarItem(index: number) {
    this.ingresoItems.splice(index, 1);
  }

  onConfirmarIngreso() {
    this.ingresoItems.forEach(item => {
      const product = this.products.find(p => p.code === item.product.code);
      if (product) {
        product.stock += item.cantidad;
        this.productService.updateProduct(this.products.indexOf(product), product);
        // Añadir registro al historial
        this.productService.addMovimiento({
          tipo: 'Ingreso',
          numero: this.registroNumero,
          fecha: this.today,
          detalles: `Ingreso de ${item.cantidad} unidades de ${product.name}`,
          items: this.ingresoItems.map(i => ({
            code: i.product.code,
            name: i.product.name,
            description: i.product.description,
            cantidad: i.cantidad
          })),
          usuario: 'usuario_definido' // Cambia esto por la lógica adecuada para obtener el usuario
        });
      }
    });
    this.ingresoItems = [];
    this.productService.saveNextIngresoNumber();
    this.registroNumero = this.productService.getNextIngresoNumber();
    const ingresoBodegaModal = bootstrap.Modal.getInstance(document.getElementById('ingresoBodegaModal')!);
    ingresoBodegaModal?.hide();
  }  

  onAddProductoToSalida() {
    const selectedProductCode = this.selectedProductSalida?.code;
    if (!selectedProductCode) return;

    const existingItem = this.salidaItems.find(item => item.product.code === selectedProductCode);
    if (existingItem) {
      alert('El producto ya se encuentra en la tabla.');
      return;
    }

    const productToAdd = this.products.find(product => product.code === selectedProductCode);
    if (productToAdd) {
      this.salidaItems.push({
        product: productToAdd,
        cantidad: this.cantidadSalida
      });
      this.cantidadSalida = 1; // Reset the input
    }
  }

  onEliminarItemSalida(index: number) {
    this.salidaItems.splice(index, 1);
  }

  onConfirmarSalida() {
    this.salidaItems.forEach(item => {
      const product = this.products.find(p => p.code === item.product.code);
      if (product) {
        product.stock -= item.cantidad;
        this.productService.updateProduct(this.products.indexOf(product), product);
        // Añadir registro al historial
        this.productService.addMovimiento({
          tipo: 'Salida',
          numero: this.registroNumeroSalida,
          fecha: this.today,
          documento: `${this.tipoDocumento} ${this.numeroDocumento}`,
          detalles: this.motivoSalida,
          items: this.salidaItems.map(i => ({
            code: i.product.code,
            name: i.product.name,
            description: i.product.description,
            cantidad: i.cantidad
          })),
          usuario: 'usuario_definido' // Cambia esto por la lógica adecuada para obtener el usuario
        });
      }
    });
    this.salidaItems = [];
    this.productService.saveNextSalidaNumber();
    this.registroNumeroSalida = this.productService.getNextSalidaNumber();
    const salidaBodegaModal = bootstrap.Modal.getInstance(document.getElementById('salidaBodegaModal')!);
    salidaBodegaModal?.hide();
  }   

  onAbrirHistorial(): void {
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }

  onVerDetallesMovimiento(movimiento: Movimiento) {
    this.selectedMovimiento = movimiento;
    const detalleMovimientoModal = new bootstrap.Modal(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal.show();
    const detalleHistorialModal = bootstrap.Modal.getInstance(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal?.hide();
  }

  onVolverHistorial(): void {
    const detalleMovimientoModal = bootstrap.Modal.getInstance(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal?.hide();
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }
}
