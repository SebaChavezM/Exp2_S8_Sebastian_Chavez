import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { ProductService, Product, Movimiento } from '../service/product.service';
import { AuthService } from '../auth/auth.service';

/**
 * Interfaz para la estructura de Bodega.
 * 
 * @interface Bodega
 */
interface Bodega {
  name: string;
  products: Product[];
}

/**
 * Componente del panel de control del área.
 * 
 * @export
 * @class AreaDashboardComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-area-dashboard',
  templateUrl: './area-dashboard.component.html',
  styleUrls: ['./area-dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AreaDashboardComponent implements OnInit {
  /**
   * Lista de productos.
   * 
   * @type {Product[]}
   * @memberof AreaDashboardComponent
   */
  products: Product[] = [];

  /**
   * Lista de todos los productos.
   * 
   * @type {Product[]}
   * @memberof AreaDashboardComponent
   */
  allProducts: Product[] = [];

  /**
   * Lista de productos filtrados.
   * 
   * @type {Product[]}
   * @memberof AreaDashboardComponent
   */
  filteredProducts: Product[] = [];

  /**
   * Historial de movimientos.
   * 
   * @type {Movimiento[]}
   * @memberof AreaDashboardComponent
   */
  historial: Movimiento[] = [];

  /**
   * Índice del producto seleccionado para eliminar.
   * 
   * @type {number}
   * @memberof AreaDashboardComponent
   */
  selectedProductIndexToDelete: number = -1;

  /**
   * Índice del producto seleccionado para editar.
   * 
   * @type {number}
   * @memberof AreaDashboardComponent
   */
  selectedProductIndexToEdit: number = -1;

  /**
   * Producto seleccionado.
   * 
   * @type {(Product | null)}
   * @memberof AreaDashboardComponent
   */
  selectedProduct: Product | null = null;

  /**
   * Producto seleccionado para salida.
   * 
   * @type {(Product | null)}
   * @memberof AreaDashboardComponent
   */
  selectedProductSalida: Product | null = null;

  /**
   * Lista de bodegas.
   * 
   * @type {Bodega[]}
   * @memberof AreaDashboardComponent
   */
  bodegas: Bodega[] = [];

  /**
   * Bodega seleccionada.
   * 
   * @type {Bodega}
   * @memberof AreaDashboardComponent
   */
  selectedBodega: Bodega = { name: 'Bodega Principal', products: [] };

  /**
   * Nombre de la nueva bodega.
   * 
   * @type {string}
   * @memberof AreaDashboardComponent
   */
  newBodegaName: string = '';

  /**
   * Término de búsqueda de productos.
   * 
   * @type {string}
   * @memberof AreaDashboardComponent
   */
  searchProductTerm: string = '';

  /**
   * Nuevo producto a agregar.
   * 
   * @type {Product}
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Producto seleccionado para editar.
   * 
   * @type {Product}
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Crea una instancia de AreaDashboardComponent.
   * 
   * @param {ProductService} productService Servicio de productos
   * @param {AuthService} authService Servicio de autenticación
   * @memberof AreaDashboardComponent
   */
  constructor(private productService: ProductService, private authService: AuthService) {}

  /**
   * Método que se ejecuta al inicializar el componente.
   * 
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Normaliza el código del producto.
   * 
   * @param {string} code Código del producto
   * @return {string} Código normalizado
   * @memberof AreaDashboardComponent
   */
  normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  /**
   * Verifica si un producto existe en la bodega seleccionada.
   * 
   * @param {string} code Código del producto
   * @return {boolean} Verdadero si el producto existe, falso en caso contrario
   * @memberof AreaDashboardComponent
   */
  productExists(code: string): boolean {
    const normalizedCode = this.normalizeCode(code);
    return this.selectedBodega.products.some(product => this.normalizeCode(product.code) === normalizedCode);
  }

  /**
   * Convierte el valor del input a mayúsculas.
   * 
   * @param {Event} event Evento de entrada
   * @memberof AreaDashboardComponent
   */
  toUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  /**
   * Verifica si el código del producto existe.
   * 
   * @memberof AreaDashboardComponent
   */
  checkProductCode() {
    this.productCodeExists = this.productExists(this.newProduct.code);
  }

  /**
   * Carga los usuarios desde el almacenamiento local.
   * 
   * @memberof AreaDashboardComponent
   */
  loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
  }

  /**
   * Filtra los productos según el término de búsqueda ingresado.
   * 
   * @param {any} event Evento de entrada de búsqueda
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Elimina el producto seleccionado.
   * 
   * @param {number} index Índice del producto a eliminar
   * @memberof AreaDashboardComponent
   */
  onDeleteProduct(index: number) {
    this.selectedProductIndexToDelete = index;
    this.productToDelete = this.selectedBodega.products[index];
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal')!);
    confirmDeleteModal.show();
  }

  /**
   * Confirma la eliminación del producto.
   * 
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Actualiza el producto en la bodega seleccionada.
   * 
   * @param {number} index Índice del producto a actualizar
   * @param {Product} product Producto a actualizar
   * @memberof AreaDashboardComponent
   */
  onUpdateProduct(index: number, product: Product) {
    this.selectedBodega.products[index] = product;
    this.saveBodegas();
  }

  /**
   * Muestra la información del producto seleccionado en un modal.
   * 
   * @param {number} index Índice del producto a ver
   * @memberof AreaDashboardComponent
   */
  onViewProductInfo(index: number) {
    this.selectedProduct = this.selectedBodega.products[index];
    const productInfoModal = new bootstrap.Modal(document.getElementById('productInfoModal')!);
    productInfoModal.show();
  }

  /**
   * Edita el producto seleccionado.
   * 
   * @param {number} index Índice del producto a editar
   * @memberof AreaDashboardComponent
   */
  onEditProduct(index: number) {
    this.selectedProductIndexToEdit = index;
    this.selectedProductToEdit = { ...this.selectedBodega.products[index] };
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal')!);
    editProductModal.show();
  }

  /**
   * Carga las bodegas desde el almacenamiento local.
   * 
   * @memberof AreaDashboardComponent
   */
  loadBodegas() {
    const bodegas = localStorage.getItem('bodegas');
    if (bodegas) {
      this.bodegas = JSON.parse(bodegas);
    } else {
      this.bodegas = [];
    }
  } 

  /**
   * Guarda las bodegas en el almacenamiento local.
   * 
   * @memberof AreaDashboardComponent
   */
  saveBodegas() {
    localStorage.setItem('bodegas', JSON.stringify(this.bodegas));
  }

  /**
   * Carga todos los productos de todas las bodegas.
   * 
   * @memberof AreaDashboardComponent
   */
  loadAllProducts() {
    this.allProducts = this.bodegas.reduce((acc: Product[], bodega: Bodega) => {
      return acc.concat(bodega.products);
    }, []);
  }

  /**
   * Selecciona una bodega.
   * 
   * @param {Bodega} bodega Bodega a seleccionar
   * @memberof AreaDashboardComponent
   */
  selectBodega(bodega: Bodega) {
    this.selectedBodega = bodega;
    this.filteredProducts = bodega.products;
  }

  /**
   * Guarda el producto editado.
   * 
   * @memberof AreaDashboardComponent
   */
  onSaveEditProduct() {
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

  /**
   * Agrega un nuevo producto a la bodega seleccionada.
   * 
   * @param {NgForm} form Formulario del producto
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Agrega una nueva bodega.
   * 
   * @param {NgForm} form Formulario de la bodega
   * @memberof AreaDashboardComponent
   */
  addBodega(form: NgForm) {
    if (this.newBodegaName) {
      this.bodegas.push({ name: this.newBodegaName, products: [] });
      this.newBodegaName = '';
      this.saveBodegas();
      const addBodegaModal = bootstrap.Modal.getInstance(document.getElementById('addBodegaModal')!);
      addBodegaModal?.hide();
    }
  }

  /**
   * Reinicia el formulario.
   * 
   * @param {NgForm} form Formulario a reiniciar
   * @param {'product'} type Tipo de formulario (producto)
   * @memberof AreaDashboardComponent
   */
  resetForm(form: NgForm, type: 'product') {
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

  /**
   * Agrega un producto a la lista de ingreso.
   * 
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Elimina un producto de la lista de ingreso.
   * 
   * @param {number} index Índice del producto a eliminar
   * @memberof AreaDashboardComponent
   */
  onEliminarItem(index: number) {
    this.ingresoItems.splice(index, 1);
  }

  /**
   * Confirma el ingreso de productos a la bodega.
   * 
   * @memberof AreaDashboardComponent
   */
  onConfirmarIngreso() {
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

    const ingresoBodegaModalElement = document.getElementById('ingresoBodegaModal');
    if (ingresoBodegaModalElement) {
        const ingresoBodegaModal = bootstrap.Modal.getInstance(ingresoBodegaModalElement);
        if (ingresoBodegaModal) {
            ingresoBodegaModal.hide();
            setTimeout(() => ingresoBodegaModal.dispose(), 500);
        }
    }
  }

  /**
   * Agrega un producto a la lista de salida.
   * 
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Muestra el modal para agregar una nueva bodega.
   * 
   * @memberof AreaDashboardComponent
   */
  openAddBodegaModal() {
    const addBodegaModal = new bootstrap.Modal(document.getElementById('addBodegaModal')!);
    addBodegaModal.show();
  }

  /**
   * Elimina un producto de la lista de salida.
   * 
   * @param {number} index Índice del producto a eliminar
   * @memberof AreaDashboardComponent
   */
  onEliminarItemSalida(index: number) {
    this.salidaItems.splice(index, 1);
  }

  /**
   * Confirma la salida de productos de la bodega.
   * 
   * @memberof AreaDashboardComponent
   */
  onConfirmarSalida() {
    this.salidaItems.forEach(item => {
      const product = this.products.find(p => p.code === item.product.code);
      if (product) {
        product.stock -= item.cantidad;
        this.productService.updateProduct(product.code, product);
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

  /**
   * Abre el historial de movimientos en un modal.
   * 
   * @memberof AreaDashboardComponent
   */
  onAbrirHistorial(): void {
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }

  /**
   * Muestra los detalles de un movimiento en un modal.
   * 
   * @param {Movimiento} movimiento Movimiento a ver
   * @memberof AreaDashboardComponent
   */
  onVerDetallesMovimiento(movimiento: Movimiento) {
    this.selectedMovimiento = movimiento;
    const detalleMovimientoModal = new bootstrap.Modal(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal.show();
    const detalleHistorialModal = bootstrap.Modal.getInstance(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal?.hide();
  }

  /**
   * Vuelve al historial de movimientos desde el modal de detalles.
   * 
   * @memberof AreaDashboardComponent
   */
  onVolverHistorial(): void {
    const detalleMovimientoModal = bootstrap.Modal.getInstance(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal?.hide();
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }

  /**
   * Agrega un producto a la lista de traslado.
   * 
   * @memberof AreaDashboardComponent
   */
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

  /**
   * Elimina un producto de la lista de traslado.
   * 
   * @param {number} index Índice del producto a eliminar
   * @memberof AreaDashboardComponent
   */
  onEliminarItemTraslado(index: number) {
    this.trasladoItems.splice(index, 1);
  }

  /**
   * Confirma el traslado de productos entre bodegas.
   * 
   * @memberof AreaDashboardComponent
   */
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
}
