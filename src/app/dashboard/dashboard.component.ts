import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { ProductService, Product, Movimiento } from '../service/product.service';
import { ProyectosService } from '../service/proyecto.service';
import { BulkUploadComponent } from '../bulk-upload/bulk-upload.component';
import * as bootstrap from 'bootstrap';

interface Bodega {
  name: string;
  products: Product[];
}

interface Proyecto {
  tipo: string;
  numero: string;
  nombre: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, BulkUploadComponent]
})
export class DashboardComponent implements OnInit {
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
  registerError: string = '';
  registerSuccess: string = '';
  trasladoItems: any[] = [];
  selectedBodegaOrigen: Bodega | null = null;
  selectedBodegaDestino: Bodega | null = null;
  selectedProductTraslado: Product | null = null;
  searchHistorialTerm: string = '';
  filteredHistorial: Movimiento[] = [];
  filterIngreso: boolean = true;
  filterSalida: boolean = true;
  filterTraslado: boolean = true;
  relatedProject: Proyecto | null = null;
  projects: Proyecto[] = [];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private proyectosService: ProyectosService) {}

ngOnInit(): void {
  this.productService.products$.subscribe(products => {
    this.products = products;
    this.updateBodegaProducts();
  });

  this.proyectosService.proyectos$.subscribe(projects => {
    this.projects = projects;
    console.log('Projects loaded:', this.projects);
  });

  this.productService.historial$.subscribe(historial => {
    this.historial = historial;
    this.filteredHistorial = historial;
  });

  this.today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  this.registroNumeroIngreso = this.productService.getNextIngresoNumber();
  this.registroNumeroSalida = this.productService.getNextSalidaNumber();
  this.loadBodegas();
  this.loadAllProducts();

  if (this.bodegas.length === 0) {
    this.bodegas.push({ name: 'BODEGA PRINCIPAL', products: [] }); // Normalize name to uppercase
    this.selectedBodega = this.bodegas[0];
    this.saveBodegas();
  } else {
    this.selectedBodega = this.bodegas[0];
  }
  this.filteredProducts = this.selectedBodega.products;
  this.selectedBodegaOrigen = this.bodegas.length > 0 ? this.bodegas[0] : null;
  this.selectedBodegaDestino = this.bodegas.length > 1 ? this.bodegas[1] : null; // Ensure there are at least 2 bodegas
}


  normalizeCode(code: any): string {
    return typeof code === 'string' ? code.trim().toUpperCase() : '';
  }

  productExists(code: string): boolean {
    const normalizedCode = this.normalizeCode(code);
    return this.selectedBodega.products.some(product => this.normalizeCode(product.code) === normalizedCode);
  }

  toUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  checkProductCode(): void {
    this.productCodeExists = this.productExists(this.newProduct.code);
  }

  onSearchProduct(event: any): void {
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

  openUserModal(): void {
    const userModal = new bootstrap.Modal(document.getElementById('userModal')!);
    userModal.show();
  }

  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('editPassword') as HTMLInputElement;
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
    } else {
      passwordField.type = 'password';
    }
  }

  

  onDeleteProduct(index: number): void {
    this.selectedProductIndexToDelete = index;
    this.productToDelete = this.selectedBodega.products[index];
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal')!);
    confirmDeleteModal.show();
  }

onConfirmDelete(): void {
  if (this.productToDelete) {
    this.productService.deleteProductByCode(this.productToDelete.code);
    this.productToDelete = null;
    this.selectedProductIndexToDelete = -1;
    const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')!);
    confirmDeleteModal?.hide();
  }
}

  onUpdateProduct(index: number, product: Product): void {
    this.selectedBodega.products[index] = product;
    this.saveBodegas();
  }

  onViewProductInfo(index: number): void {
    this.selectedProduct = this.selectedBodega.products[index];
    const productInfoModal = new bootstrap.Modal(document.getElementById('productInfoModal')!);
    productInfoModal.show();
  }

  onEditProduct(index: number): void {
    this.selectedProductIndexToEdit = index;
    this.selectedProductToEdit = { ...this.selectedBodega.products[index] };
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal')!);
    editProductModal.show();
  }

  loadBodegas(): void {
    const bodegas = localStorage.getItem('bodegas');
    if (bodegas) {
      this.bodegas = JSON.parse(bodegas).map((bodega: Bodega) => ({
        ...bodega,
        name: bodega.name.toUpperCase()
      }));
    } else {
      this.bodegas = [];
    }
    this.updateBodegaProducts();
  }

  saveBodegas(): void {
    localStorage.setItem('bodegas', JSON.stringify(this.bodegas));
  }

  updateBodegaProducts(): void {
    this.bodegas.forEach(bodega => {
      bodega.products = this.products.filter(product => product.bodega === bodega.name);
    });
    this.filteredProducts = this.selectedBodega.products;
  }

  addProductToBodega(product: Product): void {
    const targetBodega = this.bodegas.find(b => b.name === product.bodega);
    if (targetBodega && !targetBodega.products.some(p => p.code === product.code)) {
      targetBodega.products.push(product);
      this.saveBodegas();
    }
  }

  loadAllProducts(): void {
    this.allProducts = this.bodegas.reduce((acc: Product[], bodega: Bodega) => {
      return acc.concat(bodega.products);
    }, []);
  }

  selectBodega(bodega: Bodega): void {
    this.selectedBodega = bodega;
    this.filteredProducts = bodega.products;
  }

  onSaveEditProduct(): void {
    if (this.selectedProductToEdit && this.selectedProductIndexToEdit !== -1) {
      this.selectedProductToEdit.bodega = this.selectedBodega.name;
      this.selectedBodega.products[this.selectedProductIndexToEdit] = this.selectedProductToEdit;
      this.saveBodegas();
      this.selectedProductToEdit = {
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
      this.selectedProductIndexToEdit = -1;
      const editProductModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal')!);
      editProductModal?.hide();
    }
  }

onAddProduct(form: NgForm): void {
  form.form.markAllAsTouched();
  if (form.valid) {
    if (!this.productExists(this.newProduct.code)) {
      this.newProduct.code = this.normalizeCode(this.newProduct.code);
      const targetBodega = this.bodegas.find(b => b.name === this.newProduct.bodega);
      if (targetBodega) {
        targetBodega.products.push(this.newProduct);
        this.productService.addProduct(this.newProduct);
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
      this.loadAllProducts();
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

  addBodega(form: NgForm): void {
    if (this.newBodegaName) {
      this.bodegas.push({ name: this.newBodegaName, products: [] });
      this.newBodegaName = '';
      this.saveBodegas();
      const addBodegaModal = bootstrap.Modal.getInstance(document.getElementById('addBodegaModal')!);
      addBodegaModal?.hide();
    }
  }

  resetForm(form: NgForm, type: 'user' | 'product'): void {
    form.resetForm();
    if (type === 'user') {
      this.registerError = '';
      this.registerSuccess = '';
    } else if (type === 'product') {
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

  onAddProductoToIngreso(): void {
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

  onEliminarItem(index: number): void {
    this.ingresoItems.splice(index, 1);
  }

  onConfirmarIngreso(): void {
    this.ingresoItems.forEach(item => {
      const product = this.selectedBodega.products.find(p => p.code === item.product.code);
      if (product) {
        product.stock += item.cantidad;
        this.productService.updateProduct(product.code, product);
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
    this.saveBodegas();

    const ingresoBodegaModalElement = document.getElementById('ingresoBodegaModal');
    if (ingresoBodegaModalElement) {
      const ingresoBodegaModal = bootstrap.Modal.getInstance(ingresoBodegaModalElement);
      if (ingresoBodegaModal) {
        ingresoBodegaModal.hide();
        setTimeout(() => ingresoBodegaModal.dispose(), 500);
      }
    }
  }

  openAddBodegaModal(): void {
    const addBodegaModal = new bootstrap.Modal(document.getElementById('addBodegaModal')!);
    addBodegaModal.show();
  }

  onAddProductoToSalida(): void {
    if (!this.selectedProductSalida) {
      alert('Por favor, seleccione un producto.');
      return;
    }

    const existingItem = this.salidaItems.find(item => item.product.code === this.selectedProductSalida!.code);
    if (existingItem) {
      alert('El producto ya se encuentra en la tabla.');
      return;
    }

    this.salidaItems.push({
      product: this.selectedProductSalida,
      cantidad: this.cantidadSalida,
      tipoDocumento: this.tipoDocumento,
      numeroDocumento: this.numeroDocumento
    });
    this.cantidadSalida = 1;
  }

  onConfirmarSalida(): void {
    this.salidaItems.forEach(item => {
      const product = this.selectedBodega.products.find(p => p.code === item.product.code);
      if (product) {
        if (product.stock >= item.cantidad) {
          product.stock -= item.cantidad;
          this.productService.updateProduct(product.code, product);
          this.productService.addMovimiento({
            tipo: 'Salida',
            numero: this.registroNumeroSalida,
            fecha: this.today,
            documento: `${item.tipoDocumento} ${item.numeroDocumento}`,
            detalles: this.motivoSalida,
            items: [{
              code: item.product.code,
              name: item.product.name,
              description: item.product.description,
              cantidad: item.cantidad
            }],
            usuario: `${this.authService.getCurrentUser().firstName} ${this.authService.getCurrentUser().lastName}`
          });
        } else {
          alert(`La cantidad a retirar supera el stock disponible de ${product.name}.`);
        }
      }
    });
    this.salidaItems = [];
    this.productService.incrementNextSalidaNumber();
    this.registroNumeroSalida = this.productService.getNextSalidaNumber();
    this.saveBodegas();

    const salidaBodegaModalElement = document.getElementById('salidaBodegaModal');
    if (salidaBodegaModalElement) {
      const salidaBodegaModal = bootstrap.Modal.getInstance(salidaBodegaModalElement);
      if (salidaBodegaModal) {
        salidaBodegaModal.hide();
        setTimeout(() => salidaBodegaModal.dispose(), 500);
      }
    }
  }

  onEliminarItemSalida(index: number): void {
    this.salidaItems.splice(index, 1);
  }

  onAbrirHistorial(): void {
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }

  onVerDetallesMovimiento(movimiento: Movimiento): void {
    this.selectedMovimiento = movimiento;
    const detalleMovimientoModal = new bootstrap.Modal(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal.show();
    const detalleHistorialModal = bootstrap.Modal.getInstance(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal?.hide();
  }

  loadProjects(): void {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      this.projects = JSON.parse(storedProjects);
    }
  }

  onSearchHistorial(): void {
    this.relatedProject = null;
    const searchTerm = this.searchHistorialTerm.toLowerCase();
    console.log('Search Term:', searchTerm);

    if (searchTerm) {
      this.filteredHistorial = this.historial.filter((movimiento) => {
        const matchesTerm = movimiento.tipo.toLowerCase().includes(searchTerm) ||
          String(movimiento.numero).toLowerCase().includes(searchTerm) ||
          (movimiento.tipo === 'Salida' && movimiento.documento && movimiento.documento.toLowerCase().includes(searchTerm));

        const matchesFilter = (this.filterIngreso && movimiento.tipo === 'Ingreso') ||
          (this.filterSalida && movimiento.tipo === 'Salida') ||
          (this.filterTraslado && movimiento.tipo === 'Traslado');

        return matchesTerm && matchesFilter;
      });

      console.log('Filtered Historial:', this.filteredHistorial);

      this.relatedProject = this.projects.find((project: Proyecto) =>
        project.numero.toLowerCase().includes(searchTerm)
      ) || null;

      console.log('Related Project:', this.relatedProject);
    } else {
      this.filteredHistorial = this.historial.filter((movimiento) => {
        return (this.filterIngreso && movimiento.tipo === 'Ingreso') ||
          (this.filterSalida && movimiento.tipo === 'Salida') ||
          (this.filterTraslado && movimiento.tipo === 'Traslado');
      });

      console.log('Filtered Historial (no search term):', this.filteredHistorial);
    }
}

  onVolverHistorial(): void {
    const detalleMovimientoModal = bootstrap.Modal.getInstance(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal?.hide();
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }

  onAddProductoToTraslado(): void {
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

  onEliminarItemTraslado(index: number): void {
    this.trasladoItems.splice(index, 1);
  }

  onConfirmarTraslado(): void {
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
}
