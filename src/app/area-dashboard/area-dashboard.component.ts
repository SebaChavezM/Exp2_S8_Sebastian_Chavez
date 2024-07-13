import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import * as bootstrap from 'bootstrap';
import { ProductService, Product, Movimiento } from '../service/product.service';
import { ProyectosService } from '../service/proyecto.service';
import { BulkUploadComponent } from "../bulk-upload/bulk-upload.component";

/**
 * Representa una bodega en la aplicación.
 * @interface Bodega
 */
interface Bodega {
  /** El nombre de la bodega. */
  name: string;
  /** Lista de productos en la bodega. */
  products: Product[];
}

/**
 * Representa un proyecto en la aplicación.
 * @interface Proyecto
 */
interface Proyecto {
  /** El tipo de proyecto. */
  tipo: string;
  /** El número de identificación del proyecto. */
  numero: string;
  /** El nombre del proyecto. */
  nombre: string;
  /** El estado actual del proyecto (opcional). */
  estado?: string;
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
  imports: [FormsModule, CommonModule, BulkUploadComponent]
})
export class AreaDashboardComponent implements OnInit {
  /** Lista de productos disponibles. */
  products: Product[] = [];
  /** Lista de todos los productos combinados de todas las bodegas. */
  allProducts: Product[] = [];
  /** Lista de productos filtrados para mostrar. */
  filteredProducts: Product[] = [];
  /** Historial de movimientos de productos. */
  historial: Movimiento[] = [];
  /** Índice del producto seleccionado para eliminar. */
  selectedProductIndexToDelete: number = -1;
  /** Índice del producto seleccionado para editar. */
  selectedProductIndexToEdit: number = -1;
  /** Producto seleccionado actualmente. */
  selectedProduct: Product | null = null;
  /** Producto seleccionado actualmente para salida. */
  selectedProductSalida: Product | null = null;
  /** Lista de todas las bodegas. */
  bodegas: Bodega[] = [];
  /** Bodega seleccionada actualmente. */
  selectedBodega: Bodega = { name: 'Bodega Principal', products: [] };
  /** Nombre de la nueva bodega a agregar. */
  newBodegaName: string = '';
  /** Término de búsqueda para filtrar productos. */
  searchProductTerm: string = '';
  /** Nuevo producto a agregar. */
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
  /** Lista de ítems de ingreso. */
  ingresoItems: any[] = [];
  /** Lista de ítems de salida. */
  salidaItems: any[] = [];
  /** Cantidad de ingreso. */
  cantidadIngreso: number = 1;
  /** Cantidad de salida. */
  cantidadSalida: number = 1;
  /** Tipo de documento para la salida. */
  tipoDocumento: string = '';
  /** Número de documento para la salida. */
  numeroDocumento: string = '';
  /** Motivo de la salida. */
  motivoSalida: string = '';
  /** Número de registro de ingreso. */
  registroNumeroIngreso: number = 0;
  /** Número de registro de salida. */
  registroNumeroSalida: number = 0;
  /** Fecha actual en formato de cadena. */
  today: string = '';
  /** Movimiento seleccionado actualmente. */
  selectedMovimiento: Movimiento | null = null;
  /** Producto seleccionado actualmente para edición. */
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
  /** Producto a eliminar. */
  productToDelete: Product | null = null;
  /** Indica si el código del producto ya existe. */
  productCodeExists: boolean = false;
  /** Mensaje de error en el registro. */
  registerError: string = '';
  /** Mensaje de éxito en el registro. */
  registerSuccess: string = '';
  /** Lista de ítems de traslado. */
  trasladoItems: any[] = [];
  /** Bodega de origen seleccionada para traslado. */
  selectedBodegaOrigen: Bodega | null = null;
  /** Bodega de destino seleccionada para traslado. */
  selectedBodegaDestino: Bodega | null = null;
  /** Producto seleccionado actualmente para traslado. */
  selectedProductTraslado: Product | null = null;
  /** Término de búsqueda en el historial. */
  searchHistorialTerm: string = '';
  /** Lista de movimientos filtrados en el historial. */
  filteredHistorial: Movimiento[] = [];
  /** Filtro para mostrar ingresos en el historial. */
  filterIngreso: boolean = true;
  /** Filtro para mostrar salidas en el historial. */
  filterSalida: boolean = true;
  /** Filtro para mostrar traslados en el historial. */
  filterTraslado: boolean = true;
  /** Proyecto relacionado actualmente. */
  relatedProject: Proyecto | null = null;
  /** Lista de proyectos. */
  projects: Proyecto[] = [];

  /**
   * Constructor del componente.
   * @param {ProductService} productService - Servicio de productos.
   * @param {AuthService} authService - Servicio de autenticación.
   * @param {ProyectosService} proyectosService - Servicio de proyectos.
   * @param {ChangeDetectorRef} cdr - Servicio de detección de cambios.
   */
  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private proyectosService: ProyectosService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Inicializa el componente y carga datos necesarios.
   * @returns {void}
   */
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

  /**
   * Normaliza el código del producto.
   * @param {any} code - Código del producto.
   * @returns {string} - Código normalizado.
   */
  normalizeCode(code: any): string {
    return typeof code === 'string' ? code.trim().toUpperCase() : '';
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
   * Abre el modal del usuario.
   * @returns {void}
   */
  openUserModal(): void {
    const userModal = new bootstrap.Modal(document.getElementById('userModal')!);
    userModal.show();
  }

  /**
   * Alterna la visibilidad de la contraseña.
   * @returns {void}
   */
  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('editPassword') as HTMLInputElement;
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
    } else {
      passwordField.type = 'password';
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
    if (this.productToDelete) {
      this.productService.deleteProductByCode(this.productToDelete.code);
      this.productToDelete = null;
      this.selectedProductIndexToDelete = -1;
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
   * Edita un producto existente.
   * @param {number} index - Índice del producto a editar.
   * @returns {void}
   */
  onEditProduct(index: number): void {
    this.selectedProductIndexToEdit = index;
    this.selectedProductToEdit = { ...this.selectedBodega.products[index] };
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal')!);
    editProductModal.show();
  }

  /**
   * Carga las bodegas del almacenamiento local.
   * @returns {void}
   */
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

  /**
   * Guarda las bodegas en el almacenamiento local.
   * @returns {void}
   */
  saveBodegas(): void {
    localStorage.setItem('bodegas', JSON.stringify(this.bodegas));
  }

  /**
   * Actualiza los productos de cada bodega.
   * @returns {void}
   */
  updateBodegaProducts(): void {
    this.bodegas.forEach(bodega => {
      bodega.products = this.products.filter(product => product.bodega === bodega.name);
    });
    this.filteredProducts = this.selectedBodega.products;
  }

  /**
   * Añade un producto a una bodega.
   * @param {Product} product - Producto a añadir.
   * @returns {void}
   */
  addProductToBodega(product: Product): void {
    const targetBodega = this.bodegas.find(b => b.name === product.bodega);
    if (targetBodega && !targetBodega.products.some(p => p.code === product.code)) {
      targetBodega.products.push(product);
      this.saveBodegas();
    }
  }

  /**
   * Carga todos los productos desde el servicio de productos.
   * @returns {void}
   */
  loadAllProducts(): void {
    const products = this.productService.getAllProducts();
    this.allProducts = products;
    this.filteredProducts = products.filter(product => product.bodega === this.selectedBodega.name);
    this.cdr.detectChanges();
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
   * Añade un nuevo producto.
   * @param {NgForm} form - Formulario de producto.
   * @returns {void}
   */
  onAddProduct(form: NgForm): void {
    form.form.markAllAsTouched();
    if (form.valid) {
      if (!this.productExists(this.newProduct.code)) {
        this.newProduct.code = this.normalizeCode(this.newProduct.code);

        // Asegurarse de que todos los campos necesarios están llenos
        if (!this.newProduct.name) {
          alert('El nombre del producto es requerido.');
          return;
        }

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

  /**
   * Añade una nueva bodega.
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
   * @param {'user' | 'product'} type - Tipo de formulario.
   * @returns {void}
   */
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

  /**
   * Añade un producto a la lista de ingreso.
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
    this.saveBodegas();

    const ingresoBodegaModalElement = document.getElementById('ingresoBodegaModal');
    if (ingresoBodegaModalElement) {
      const ingresoBodegaModal = bootstrap.Modal.getInstance(ingresoBodegaModalElement);
      if (ingresoBodegaModal) {
        ingresoBodegaModal.hide();
        setTimeout(() => {
          ingresoBodegaModal.dispose();
          // Asegurarse de que todos los estilos relacionados con el modal sean eliminados
          document.body.classList.remove('modal-open');
          document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        }, 500);
      }
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
   * Añade un producto a la lista de salida.
   * @returns {void}
   */
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

  /**
   * Confirma la salida de productos.
   * @returns {void}
   */
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

    // Cierre del modal
    const salidaBodegaModalElement = document.getElementById('salidaBodegaModal');
    if (salidaBodegaModalElement) {
      const modalInstance = bootstrap.Modal.getInstance(salidaBodegaModalElement);
      if (modalInstance) {
        modalInstance.hide();
        setTimeout(() => {
          modalInstance.dispose();
          salidaBodegaModalElement.classList.remove('show');
          document.body.classList.remove('modal-open');
          document.querySelector('.modal-backdrop')?.remove();
        }, 500);
      }
    }
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
   * Carga los proyectos del almacenamiento local.
   * @returns {void}
   */
  loadProjects(): void {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      this.projects = JSON.parse(storedProjects);
    }
  }

  /**
   * Realiza la búsqueda en el historial.
   * @returns {void}
   */
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
   * Añade un producto a la lista de traslado.
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
          productInDestino.stock += item.product.stock;
        } else {
          this.selectedBodegaDestino!.products.push({
            ...item.product,
            stock: item.product.stock,
            bodega: this.selectedBodegaDestino!.name // Asegúrate de actualizar el nombre de la bodega
          });
        }
        productInOrigen.stock -= item.product.stock;
      }
    });

    this.selectedBodegaOrigen!.products = this.selectedBodegaOrigen!.products.filter(product => product.stock > 0);

    // Guardar los cambios en el servicio de productos
    this.productService.saveProductsToLocalStorage(this.bodegas.flatMap(b => b.products));

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

    this.trasladoItems = [];
    this.selectedBodegaOrigen = null;
    this.selectedBodegaDestino = null;

    const trasladoBodegaModalElement = document.getElementById('trasladoBodegaModal');
    if (trasladoBodegaModalElement) {
      const trasladoBodegaModal = bootstrap.Modal.getInstance(trasladoBodegaModalElement);
      if (trasladoBodegaModal) {
        trasladoBodegaModal.hide();
        setTimeout(() => {
          trasladoBodegaModal.dispose();
          this.resetModalState();
        }, 500);
      }
    }
  }

  /**
   * Restablece el estado del modal.
   * @returns {void}
   */
  resetModalState(): void {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }
}
