import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { ProductService, Product, Movimiento } from '../service/product.service';
import { AuthService } from '../auth/auth.service';

interface Bodega {
  name: string;
  products: Product[];
}

interface ModificationRequest {
  originalProduct: Product;
  requestedChanges: Partial<Product>;
  status: 'pending' | 'accepted' | 'rejected';
  requestedBy: string;
  responseMessage?: string;
}

@Component({
  selector: 'app-bodega-dashboard',
  templateUrl: './bodega-dashboard.component.html',
  styleUrl: './bodega-dashboard.component.css',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class BodegaDashboardComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  historial: Movimiento[] = [];
  selectedProductIndexToDelete: number = -1;
  selectedProductIndexToEdit: number = -1;
  selectedProduct: Product | null = null;
  selectedProductSalida: Product | null = null;
  bodegas: Bodega[] = [];
  selectedBodega: Bodega = { name: 'Bodega Principal', products: [] };
  newBodegaName: string = '';
  searchProductTerm: string = '';
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
    stock: 0,
    bodega: 'Bodega Principal'
  };
  ingresoItems: any[] = [];
  salidaItems: any[] = [];
  cantidadIngreso: number = 1;
  cantidadSalida: number = 1;
  tipoDocumento: string = '';
  numeroDocumento: string = '';
  motivoSalida: string = '';
  registroNumeroIngreso: number = 0;
  registroNumeroSalida: number = 0;
  today: string = '';
  selectedMovimiento: Movimiento | null = null;
  selectedProductToEdit: Product = {
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
    stock: 0,
    bodega: 'Bodega Principal'
  };

  productToDelete: Product | null = null;
  productCodeExists: boolean = false;

  trasladoItems: any[] = [];
  selectedBodegaOrigen: Bodega | null = null;
  selectedBodegaDestino: Bodega | null = null;
  selectedProductTraslado: Product | null = null;

  constructor(private productService: ProductService, private authService: AuthService) {}

  ngOnInit(): void {
    this.productService.products$.subscribe(products => {
      this.products = products;
      this.filteredProducts = this.selectedBodega.products;
    });
    this.productService.historial$.subscribe(historial => this.historial = historial);
    this.today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    this.registroNumeroIngreso = this.productService.getNextIngresoNumber();
    this.registroNumeroSalida = this.productService.getNextSalidaNumber();
    this.loadUsers();
    this.loadBodegas();
    this.loadAllProducts();

    if (this.bodegas.length === 0) {
      this.bodegas.push({ name: 'Bodega Principal', products: [] });
      this.selectedBodega = this.bodegas[0];
      this.saveBodegas();
    } else {
      this.selectedBodega = this.bodegas[0];
    }
    this.filteredProducts = this.selectedBodega.products;
  }

  normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  productExists(code: string): boolean {
    const normalizedCode = this.normalizeCode(code);
    return this.selectedBodega.products.some(product => this.normalizeCode(product.code) === normalizedCode);
  }

  toUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  checkProductCode() {
    this.productCodeExists = this.productExists(this.newProduct.code);
  }

  loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
  }

  onSearchProduct(event: any) {
    this.searchProductTerm = event.target.value.toLowerCase();
    if (this.searchProductTerm) {
      this.filteredProducts = this.selectedBodega.products.filter(product =>
        product.code.toLowerCase().includes(this.searchProductTerm) ||
        product.description.toLowerCase().includes(this.searchProductTerm) ||
        product.name.toLowerCase().includes(this.searchProductTerm)
      );
    } else {
      this.filteredProducts = this.selectedBodega.products;
    }
  }

  onDeleteProduct(index: number) {
    this.selectedProductIndexToDelete = index;
    this.productToDelete = this.selectedBodega.products[index];
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal')!);
    confirmDeleteModal.show();
  }

  onConfirmDelete() {
    if (this.selectedProductIndexToDelete !== -1) {
      this.selectedBodega.products.splice(this.selectedProductIndexToDelete, 1);
      this.saveBodegas();
      this.selectedProductIndexToDelete = -1;
      this.productToDelete = null;
      const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')!);
      confirmDeleteModal?.hide();
    }
  }

  onUpdateProduct(index: number, product: Product) {
    this.selectedBodega.products[index] = product;
    this.saveBodegas();
  }

  onViewProductInfo(index: number) {
    this.selectedProduct = this.selectedBodega.products[index];
    const productInfoModal = new bootstrap.Modal(document.getElementById('productInfoModal')!);
    productInfoModal.show();
  }

  onEditProduct(index: number) {
    this.selectedProductIndexToEdit = index;
    this.selectedProductToEdit = { ...this.selectedBodega.products[index] };
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal')!);
    editProductModal.show();
  }

  loadBodegas() {
    const bodegas = localStorage.getItem('bodegas');
    if (bodegas) {
      this.bodegas = JSON.parse(bodegas);
    } else {
      this.bodegas = [];
    }
  } 

  saveBodegas() {
    localStorage.setItem('bodegas', JSON.stringify(this.bodegas));
  }

  loadAllProducts() {
    this.allProducts = this.bodegas.reduce((acc: Product[], bodega: Bodega) => {
      return acc.concat(bodega.products);
    }, []);
  }

  selectBodega(bodega: Bodega) {
    this.selectedBodega = bodega;
    this.filteredProducts = bodega.products;
  }

  onSaveEditProduct() {
    if (this.selectedProductToEdit && this.selectedProductIndexToEdit !== -1) {
      const editProductModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal')!);
      if (editProductModal) {
          editProductModal.hide();
          setTimeout(() => editProductModal.dispose(), 500);
      }
      this.onRequestModification();
    }
  }

  onAddProduct(form: NgForm) {
    form.form.markAllAsTouched();
    if (form.valid) {
      if (!this.productExists(this.newProduct.code)) {
        this.newProduct.code = this.normalizeCode(this.newProduct.code);
        const targetBodega = this.bodegas.find(b => b.name === this.newProduct.bodega);
        if (targetBodega) {
          targetBodega.products.push(this.newProduct);
          this.saveBodegas();
        }
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
          stock: 0,
          bodega: 'Bodega Principal'
        };
        const formElement = document.querySelector('form.needs-validation-product');
        if (formElement) {
          formElement.classList.remove('was-validated');
        }
        this.loadAllProducts(); // Recargar todos los productos después de agregar uno nuevo
      } else {
        alert('El código del producto ya existe. Por favor, ingrese un código diferente.');
      }
    } else {
      const formElement = document.querySelector('form.needs-validation-product');
      if (formElement) {
        formElement.classList.add('was-validated');
      }
    }
  }

  addBodega(form: NgForm) {
    if (this.newBodegaName) {
      this.bodegas.push({ name: this.newBodegaName, products: [] });
      this.newBodegaName = '';
      this.saveBodegas();
      const addBodegaModal = bootstrap.Modal.getInstance(document.getElementById('addBodegaModal')!);
      addBodegaModal?.hide();
    }
  }

  resetForm(form: NgForm, type:'product') {
    form.resetForm();
    if (type === 'product') {
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
        stock: 0,
        bodega: 'Bodega Principal'
      };
      this.productCodeExists = false;
    }
    const formElement = document.querySelector(`form.needs-validation-${type}`);
    if (formElement) {
      formElement.classList.remove('was-validated');
    }
  }

  onAddProductoToIngreso() {
    if (!this.selectedProduct) {
      alert('Por favor, seleccione un producto.');
      return;
    }

    const existingItem = this.ingresoItems.find(item => item.product.code === this.selectedProduct!.code);
    if (existingItem) {
      alert('El producto ya se encuentra en la tabla.');
      return;
    }

    this.ingresoItems.push({
      product: this.selectedProduct,
      cantidad: this.cantidadIngreso
    });
    this.cantidadIngreso = 1;
  }

  onEliminarItem(index: number) {
    this.ingresoItems.splice(index, 1);
  }

  onConfirmarIngreso() {
    this.ingresoItems.forEach(item => {
      const product = this.selectedBodega.products.find(p => p.code === item.product.code);
      if (product) {
        product.stock += item.cantidad;
        this.productService.updateProduct(this.products.indexOf(product), product);
        this.productService.addMovimiento({
          tipo: 'Ingreso',
          numero: this.registroNumeroIngreso,
          fecha: this.today,
          detalles: `Ingreso de ${item.cantidad} unidades de ${product.name}`,
          items: this.ingresoItems.map(i => ({
            code: i.product.code,
            name: i.product.name,
            description: i.product.description,
            cantidad: i.cantidad
          })),
          usuario: `${this.authService.getCurrentUser().firstName} ${this.authService.getCurrentUser().lastName}`
        });
      }
    });
    this.ingresoItems = [];
    this.productService.incrementNextIngresoNumber();
    this.registroNumeroIngreso = this.productService.getNextIngresoNumber();

    const ingresoBodegaModalElement = document.getElementById('ingresoBodegaModal');
    if (ingresoBodegaModalElement) {
        const ingresoBodegaModal = bootstrap.Modal.getInstance(ingresoBodegaModalElement);
        if (ingresoBodegaModal) {
            ingresoBodegaModal.hide();
            setTimeout(() => ingresoBodegaModal.dispose(), 500);
        }
    }
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
      this.cantidadSalida = 1;
    }
  }

  openAddBodegaModal() {
    const addBodegaModal = new bootstrap.Modal(document.getElementById('addBodegaModal')!);
    addBodegaModal.show();
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
          usuario: `${this.authService.getCurrentUser().firstName} ${this.authService.getCurrentUser().lastName}`
        });
      }
    });
    this.salidaItems = [];
    this.productService.incrementNextSalidaNumber();
    this.registroNumeroSalida = this.productService.getNextSalidaNumber();

    const salidaBodegaModalElement = document.getElementById('salidaBodegaModal');
    if (salidaBodegaModalElement) {
        const salidaBodegaModal = bootstrap.Modal.getInstance(salidaBodegaModalElement);
        if (salidaBodegaModal) {
            salidaBodegaModal.hide();
            setTimeout(() => salidaBodegaModal.dispose(), 500);
        }
    }
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

  onAddProductoToTraslado() {
    if (!this.selectedProductTraslado) {
      alert('Por favor, seleccione un producto.');
      return;
    }
  
    const existingItem = this.trasladoItems.find(item => item.product.code === this.selectedProductTraslado!.code);
    if (existingItem) {
      alert('El producto ya se encuentra en la tabla.');
      return;
    }
  
    this.trasladoItems.push({
      product: this.selectedProductTraslado,
    });
    this.selectedProductTraslado = null;
  }
  
  onEliminarItemTraslado(index: number) {
    this.trasladoItems.splice(index, 1);
  }
  
  onConfirmarTraslado() {
    if (!this.selectedBodegaOrigen || !this.selectedBodegaDestino || this.selectedBodegaOrigen === this.selectedBodegaDestino) {
      alert('Seleccione bodegas válidas.');
      return;
    }
  
    this.trasladoItems.forEach(item => {
      const productInOrigen = this.selectedBodegaOrigen!.products.find(p => p.code === item.product.code);
      if (productInOrigen) {
        const productInDestino = this.selectedBodegaDestino!.products.find(p => p.code === item.product.code);
        if (productInDestino) {
          productInDestino.stock += productInOrigen.stock;
        } else {
          this.selectedBodegaDestino!.products.push({
            ...item.product,
            stock: productInOrigen.stock
          });
        }
        productInOrigen.stock = 0;
      }
    });
  
    this.selectedBodegaOrigen!.products = this.selectedBodegaOrigen!.products.filter(product => product.stock > 0);
  
    this.productService.addMovimiento({
      tipo: 'Traslado',
      numero: this.productService.getNextSalidaNumber(),
      fecha: this.today,
      detalles: `Traslado de productos de ${this.selectedBodegaOrigen.name} a ${this.selectedBodegaDestino.name}`,
      bodegaOrigen: this.selectedBodegaOrigen.name,
      bodegaDestino: this.selectedBodegaDestino.name,
      items: this.trasladoItems.map(item => ({
        code: item.product.code,
        name: item.product.name,
        description: item.product.description,
        cantidad: item.product.stock
      })),
      usuario: `${this.authService.getCurrentUser().firstName} ${this.authService.getCurrentUser().lastName}`
    });
  
    this.saveBodegas();
    this.trasladoItems = [];
    this.selectedBodegaOrigen = null;
    this.selectedBodegaDestino = null;
  
    const trasladoBodegaModalElement = document.getElementById('trasladoBodegaModal');
    if (trasladoBodegaModalElement) {
      const trasladoBodegaModal = bootstrap.Modal.getInstance(trasladoBodegaModalElement);
      if (trasladoBodegaModal) {
        trasladoBodegaModal.hide();
        setTimeout(() => trasladoBodegaModal.dispose(), 500);
      }
    }
  }

  onRequestModification() {
    const currentUser = this.authService.getCurrentUser();
    const modificationRequest: ModificationRequest = {
      originalProduct: this.selectedProductToEdit!,
      requestedChanges: { ...this.selectedProductToEdit },
      status: 'pending',
      requestedBy: `${currentUser.firstName} ${currentUser.lastName}`
    };

    const modificationRequests = JSON.parse(localStorage.getItem('modificationRequests') || '[]');
    modificationRequests.push(modificationRequest);
    localStorage.setItem('modificationRequests', JSON.stringify(modificationRequests));

    alert('Solicitud de modificación enviada.');
  }
}
