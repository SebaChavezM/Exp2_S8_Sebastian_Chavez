import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms'; // Añadir ReactiveFormsModule
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { ProductService, Product, Movimiento, PartialProduct } from '../service/product.service';
import { AuthService } from '../auth/auth.service';

/**
 * Interfaz para representar una bodega.
 * @interface
 */
interface Bodega {
  /**
   * Nombre de la bodega.
   * @type {string}
   */
  name: string;

  /**
   * Lista de productos almacenados en la bodega.
   * @type {Product[]}
   */
  products: Product[];
}


@Component({
  selector: 'app-bodega-dashboard',
  templateUrl: './bodega-dashboard.component.html',
  styleUrls: ['./bodega-dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule] // Añadir ReactiveFormsModule
})
/**
 * Componente del panel de control de la bodega.
 * @class
 * @implements {OnInit}
 */
export class BodegaDashboardComponent implements OnInit {
  /**
   * Lista de productos.
   * @type {Product[]}
   */
  products: Product[] = [];

  /**
   * Lista de todos los productos.
   * @type {Product[]}
   */
  allProducts: Product[] = [];

  /**
   * Lista de productos filtrados.
   * @type {Product[]}
   */
  filteredProducts: Product[] = [];

  /**
   * Historial de movimientos.
   * @type {Movimiento[]}
   */
  historial: Movimiento[] = [];

  /**
   * Índice del producto seleccionado para eliminar.
   * @type {number}
   */
  selectedProductIndexToDelete: number = -1;

  /**
   * Índice del producto seleccionado para editar.
   * @type {number}
   */
  selectedProductIndexToEdit: number = -1;

  /**
   * Producto seleccionado.
   * @type {Product | null}
   */
  selectedProduct: Product | null = null;

  /**
   * Producto seleccionado para salida.
   * @type {Product | null}
   */
  selectedProductSalida: Product | null = null;

  /**
   * Lista de bodegas.
   * @type {Bodega[]}
   */
  bodegas: Bodega[] = [];

  /**
   * Bodega seleccionada.
   * @type {Bodega}
   */
  selectedBodega: Bodega = { name: 'Bodega Principal', products: [] };

  /**
   * Nombre de la nueva bodega.
   * @type {string}
   */
  newBodegaName: string = '';

  /**
   * Término de búsqueda de productos.
   * @type {string}
   */
  searchProductTerm: string = '';

  /**
   * Nuevo producto a agregar.
   * @type {Product}
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

  /**
   * Lista de ítems de ingreso.
   * @type {any[]}
   */
  ingresoItems: any[] = [];

  /**
   * Lista de ítems de salida.
   * @type {any[]}
   */
  salidaItems: any[] = [];

  /**
   * Cantidad de productos a ingresar.
   * @type {number}
   */
  cantidadIngreso: number = 1;

  /**
   * Cantidad de productos a sacar.
   * @type {number}
   */
  cantidadSalida: number = 1;

  /**
   * Tipo de documento.
   * @type {string}
   */
  tipoDocumento: string = '';

  /**
   * Número de documento.
   * @type {string}
   */
  numeroDocumento: string = '';

  /**
   * Motivo de la salida.
   * @type {string}
   */
  motivoSalida: string = '';

  /**
   * Número de registro de ingreso.
   * @type {number}
   */
  registroNumeroIngreso: number = 0;

  /**
   * Número de registro de salida.
   * @type {number}
   */
  registroNumeroSalida: number = 0;

  /**
   * Fecha actual.
   * @type {string}
   */
  today: string = '';

  /**
   * Movimiento seleccionado.
   * @type {Movimiento | null}
   */
  selectedMovimiento: Movimiento | null = null;

  /**
   * Producto seleccionado para editar.
   * @type {Product}
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

  /**
   * Producto a eliminar.
   * @type {Product | null}
   */
  productToDelete: Product | null = null;

  /**
   * Indica si el código del producto ya existe.
   * @type {boolean}
   */
  productCodeExists: boolean = false;

  /**
   * Lista de ítems de traslado.
   * @type {any[]}
   */
  trasladoItems: any[] = [];

  /**
   * Bodega de origen seleccionada.
   * @type {Bodega | null}
   */
  selectedBodegaOrigen: Bodega | null = null;

  /**
   * Bodega de destino seleccionada.
   * @type {Bodega | null}
   */
  selectedBodegaDestino: Bodega | null = null;

  /**
   * Producto seleccionado para traslado.
   * @type {Product | null}
   */
  selectedProductTraslado: Product | null = null;

  /**
   * Producto original antes de editar.
   * @type {Product | null}
   */
  originalProduct: Product | null = null;

  /**
   * Constructor del componente.
   * @param {ProductService} productService - Servicio de productos.
   * @param {AuthService} authService - Servicio de autenticación.
   */
  constructor(private productService: ProductService, private authService: AuthService) {}

  /**
   * Método de inicialización del componente.
   * @returns {void}
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
   * @param {string} code - Código del producto.
   * @returns {string} - Código normalizado.
   */
  normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  /**
   * Verifica si un producto existe en la bodega seleccionada.
   * @param {string} code - Código del producto.
   * @returns {boolean} - Verdadero si el producto existe, falso en caso contrario.
   */
  productExists(code: string): boolean {
    const normalizedCode = this.normalizeCode(code);
    return this.selectedBodega.products.some(product => this.normalizeCode(product.code) === normalizedCode);
  }

  /**
   * Convierte el valor de entrada a mayúsculas.
   * @param {Event} event - Evento de entrada.
   * @returns {void}
   */
  toUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  /**
   * Verifica la existencia del código del producto.
   * @returns {void}
   */
  checkProductCode(): void {
    this.productCodeExists = this.productExists(this.newProduct.code);
  }

  /**
   * Carga los usuarios del almacenamiento local.
   * @returns {void}
   */
  loadUsers(): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
  }

  /**
   * Realiza la búsqueda de un producto.
   * @param {Event} event - Evento de búsqueda.
   * @returns {void}
   */
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

  /**
   * Abre el modal de confirmación para eliminar un producto.
   * @param {number} index - Índice del producto a eliminar.
   * @returns {void}
   */
  onDeleteProduct(index: number): void {
    this.selectedProductIndexToDelete = index;
    this.productToDelete = this.selectedBodega.products[index];
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal')!);
    confirmDeleteModal.show();
  }

  /**
   * Confirma la eliminación de un producto.
   * @returns {void}
   */
  onConfirmDelete(): void {
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
   * Actualiza un producto existente.
   * @param {number} index - Índice del producto a actualizar.
   * @param {Product} product - Datos del producto actualizados.
   * @returns {void}
   */
  onUpdateProduct(index: number, product: Product): void {
    this.selectedBodega.products[index] = product;
    this.saveBodegas();
  }

  /**
   * Visualiza la información de un producto.
   * @param {number} index - Índice del producto a visualizar.
   * @returns {void}
   */
  onViewProductInfo(index: number): void {
    this.selectedProduct = this.selectedBodega.products[index];
    const productInfoModal = new bootstrap.Modal(document.getElementById('productInfoModal')!);
    productInfoModal.show();
  }

  /**
   * Carga las bodegas del almacenamiento local.
   * @returns {void}
   */
  loadBodegas(): void {
    const bodegas = localStorage.getItem('bodegas');
    if (bodegas) {
      this.bodegas = JSON.parse(bodegas);
    } else {
      this.bodegas = [];
    }
  }

  /**
   * Guarda las bodegas en el almacenamiento local.
   * @returns {void}
   */
  saveBodegas(): void {
    localStorage.setItem('bodegas', JSON.stringify(this.bodegas));
  }

  /**
   * Carga todos los productos de todas las bodegas.
   * @returns {void}
   */
  loadAllProducts(): void {
    this.allProducts = this.bodegas.reduce((acc: Product[], bodega: Bodega) => {
      return acc.concat(bodega.products);
    }, []);
  }

  /**
   * Selecciona una bodega.
   * @param {Bodega} bodega - Bodega seleccionada.
   * @returns {void}
   */
  selectBodega(bodega: Bodega): void {
    this.selectedBodega = bodega;
    this.filteredProducts = bodega.products;
  }

  /**
   * Guarda los cambios en un producto editado.
   * @returns {void}
   */
  onSaveEditProduct(): void {
    if (this.selectedProductToEdit && this.selectedProductIndexToEdit !== -1) {
      const editProductModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal')!);
      if (editProductModal) {
        editProductModal.hide();
        setTimeout(() => editProductModal.dispose(), 500);
      }
      this.onRequestModification();
    }
  }

  /**
   * Agrega un nuevo producto.
   * @param {NgForm} form - Formulario de producto.
   * @returns {void}
   */
  onAddProduct(form: NgForm): void {
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

  /**
   * Agrega una nueva bodega.
   * @param {NgForm} form - Formulario de bodega.
   * @returns {void}
   */
  addBodega(form: NgForm): void {
    if (this.newBodegaName) {
      this.bodegas.push({ name: this.newBodegaName, products: [] });
      this.newBodegaName = '';
      this.saveBodegas();
      const addBodegaModal = bootstrap.Modal.getInstance(document.getElementById('addBodegaModal')!);
      addBodegaModal?.hide();
    }
  }

  /**
   * Restablece el formulario especificado.
   * @param {NgForm} form - Formulario a restablecer.
   * @param {'product'} type - Tipo de formulario.
   * @returns {void}
   */
  resetForm(form: NgForm, type: 'product'): void {
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
   * @returns {void}
   */
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

  /**
   * Elimina un ítem de la lista de ingreso.
   * @param {number} index - Índice del ítem a eliminar.
   * @returns {void}
   */
  onEliminarItem(index: number): void {
    this.ingresoItems.splice(index, 1);
  }

  /**
   * Confirma el ingreso de productos.
   * @returns {void}
   */
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
   * @returns {void}
   */
  onAddProductoToSalida(): void {
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
   * @returns {void}
   */
  openAddBodegaModal(): void {
    const addBodegaModal = new bootstrap.Modal(document.getElementById('addBodegaModal')!);
    addBodegaModal.show();
  }

  /**
   * Elimina un ítem de la lista de salida.
   * @param {number} index - Índice del ítem a eliminar.
   * @returns {void}
   */
  onEliminarItemSalida(index: number): void {
    this.salidaItems.splice(index, 1);
  }

  /**
   * Confirma la salida de productos.
   * @returns {void}
   */
  onConfirmarSalida(): void {
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
   * Abre el historial de movimientos.
   * @returns {void}
   */
  onAbrirHistorial(): void {
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }

  /**
   * Visualiza los detalles de un movimiento.
   * @param {Movimiento} movimiento - Movimiento a visualizar.
   * @returns {void}
   */
  onVerDetallesMovimiento(movimiento: Movimiento): void {
    this.selectedMovimiento = movimiento;
    const detalleMovimientoModal = new bootstrap.Modal(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal.show();
    const detalleHistorialModal = bootstrap.Modal.getInstance(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal?.hide();
  }

  /**
   * Vuelve al historial de movimientos.
   * @returns {void}
   */
  onVolverHistorial(): void {
    const detalleMovimientoModal = bootstrap.Modal.getInstance(document.getElementById('detalleMovimientoModal')!);
    detalleMovimientoModal?.hide();
    const detalleHistorialModal = new bootstrap.Modal(document.getElementById('detalleHistorialModal')!);
    detalleHistorialModal.show();
  }

  /**
   * Agrega un producto a la lista de traslado.
   * @returns {void}
   */
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

  /**
   * Elimina un ítem de la lista de traslado.
   * @param {number} index - Índice del ítem a eliminar.
   * @returns {void}
   */
  onEliminarItemTraslado(index: number): void {
    this.trasladoItems.splice(index, 1);
  }

  /**
   * Confirma el traslado de productos.
   * @returns {void}
   */
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

  /**
   * Solicita la modificación de un producto.
   * @returns {void}
   */
  onRequestModification(): void {
    if (!this.originalProduct) {
      return;
    }

    const cambiosSolicitados: any = {};

    if (this.selectedProductToEdit.name !== this.originalProduct.name) {
      cambiosSolicitados.name = this.selectedProductToEdit.name;
    }
    if (this.selectedProductToEdit.description !== this.originalProduct.description) {
      cambiosSolicitados.description = this.selectedProductToEdit.description;
    }
    if (this.selectedProductToEdit.model !== this.originalProduct.model) {
      cambiosSolicitados.model = this.selectedProductToEdit.model;
    }
    if (this.selectedProductToEdit.brand !== this.originalProduct.brand) {
      cambiosSolicitados.brand = this.selectedProductToEdit.brand;
    }
    if (this.selectedProductToEdit.material !== this.originalProduct.material) {
      cambiosSolicitados.material = this.selectedProductToEdit.material;
    }
    if (this.selectedProductToEdit.color !== this.originalProduct.color) {
      cambiosSolicitados.color = this.selectedProductToEdit.color;
    }
    if (this.selectedProductToEdit.family !== this.originalProduct.family) {
      cambiosSolicitados.family = this.selectedProductToEdit.family;
    }
    if (this.selectedProductToEdit.value !== this.originalProduct.value) {
      cambiosSolicitados.value = this.selectedProductToEdit.value;
    }
    if (this.selectedProductToEdit.currency !== this.originalProduct.currency) {
      cambiosSolicitados.currency = this.selectedProductToEdit.currency;
    }
    if (this.selectedProductToEdit.unit !== this.originalProduct.unit) {
      cambiosSolicitados.unit = this.selectedProductToEdit.unit;
    }
    if (this.selectedProductToEdit.location !== this.originalProduct.location) {
      cambiosSolicitados.location = this.selectedProductToEdit.location;
    }

    const modificationRequest = {
      id: new Date().getTime(),
      status: 'pending',
      message: 'Solicitud de modificación de producto',
      solicitadaPor: `${this.authService.getCurrentUser().firstName} ${this.authService.getCurrentUser().lastName}`,
      productoOriginal: this.originalProduct as PartialProduct,
      cambiosSolicitados: cambiosSolicitados
    };

    this.productService.addNotification(modificationRequest);

    const editProductModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal')!);
    editProductModal?.hide();
  }

  /**
   * Edita un producto existente.
   * @param {number} index - Índice del producto a editar.
   * @returns {void}
   */
  onEditProduct(index: number): void {
    this.selectedProductIndexToEdit = index;
    this.selectedProductToEdit = { ...this.selectedBodega.products[index] };
    this.originalProduct = { ...this.selectedBodega.products[index] }; // Guardar el producto original
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal')!);
    editProductModal.show();
  }
}
