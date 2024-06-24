import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AreaDashboardComponent } from './area-dashboard.component';
import { AuthService } from '../auth/auth.service';
import { ProductService, Product, Movimiento } from '../service/product.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import * as bootstrap from 'bootstrap';

interface Bodega {
  name: string;
  products: Product[];
}

describe('AreaDashboardComponent', () => {
  let component: AreaDashboardComponent;
  let fixture: ComponentFixture<AreaDashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const productSpy = jasmine.createSpyObj('ProductService', [
      'products$', 'historial$', 'getNextIngresoNumber', 'getNextSalidaNumber', 
      'updateProduct', 'addMovimiento', 'incrementNextIngresoNumber', 
      'incrementNextSalidaNumber'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        CommonModule,
        RouterTestingModule,
        AreaDashboardComponent // Importamos el componente standalone
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ProductService, useValue: productSpy }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;

    productServiceSpy.products$ = of([]);
    productServiceSpy.historial$ = of([]);
    productServiceSpy.getNextIngresoNumber.and.returnValue(1);
    productServiceSpy.getNextSalidaNumber.and.returnValue(1);

    fixture = TestBed.createComponent(AreaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    const products = [{ code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 0, bodega: 'Bodega Principal' }];
    productServiceSpy.products$ = of(products);
    component.ngOnInit();
    expect(component.products).toEqual(products);
  });

  it('should filter products based on search term', () => {
    component.selectedBodega.products = [
      { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 0, bodega: 'Bodega Principal' },
      { code: 'P002', name: 'Product 2', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 0, bodega: 'Bodega Principal' }
    ];

    component.searchProductTerm = 'P001';
    component.onSearchProduct({ target: { value: 'P001' } });
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].code).toBe('P001');
  });

  it('should add a product to ingreso items', () => {
    const product: Product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    component.selectedProduct = product;
    component.cantidadIngreso = 5;

    component.onAddProductoToIngreso();
    expect(component.ingresoItems.length).toBe(1);
    expect(component.ingresoItems[0].product).toEqual(product);
    expect(component.ingresoItems[0].cantidad).toBe(5);
  });

  it('should confirm ingreso and update stock', () => {
    const product: Product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    component.selectedBodega.products.push(product);
    component.ingresoItems.push({ product: product, cantidad: 10 });
    authServiceSpy.getCurrentUser.and.returnValue({ firstName: 'Admin', lastName: 'User' });

    productServiceSpy.updateProduct.and.callFake((code: string, updatedProduct: Partial<Product>) => {
      const index = component.selectedBodega.products.findIndex(p => p.code === code);
      if (index !== -1) {
        component.selectedBodega.products[index] = { ...component.selectedBodega.products[index], ...updatedProduct };
      }
    });

    component.onConfirmarIngreso();
    expect(product.stock).toBe(20); // Ajuste aquí
    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(product.code, product);
    expect(productServiceSpy.addMovimiento).toHaveBeenCalled();
  });

  it('should delete product', () => {
    const product: Product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    component.selectedBodega.products.push(product);
    component.onDeleteProduct(0);

    expect(component.selectedProductIndexToDelete).toBe(0);
    expect(component.productToDelete).toEqual(product); // Cambiar aquí de toBe a toEqual

    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal')!);
    confirmDeleteModal.show();
  });

  it('should confirm product deletion', () => {
    const product: Product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    component.selectedBodega.products.push(product);
    component.selectedProductIndexToDelete = 0;
    component.productToDelete = product;

    component.onConfirmDelete();
    expect(component.selectedBodega.products.length).toBe(0);
    expect(localStorage.getItem('bodegas')).toBe(JSON.stringify(component.bodegas));
  });

  it('should handle bodega selection', () => {
    const bodega1: Bodega = { name: 'Bodega Principal', products: [] };
    const bodega2: Bodega = { name: 'Bodega Secundaria', products: [] };

    component.bodegas = [bodega1, bodega2];
    component.selectBodega(bodega1);  // Ajustamos el nombre de la función

    expect(component.selectedBodega).toBe(bodega1);
  });

  it('should add new bodega', () => {
    component.loadBodegas(); // Asegurarse de que las bodegas se carguen primero
    const initialLength = component.bodegas.length;
    component.newBodegaName = 'Bodega Nueva';
    const form = { reset: () => {} } as NgForm;
    component.addBodega(form);  // Ajustamos el nombre de la función

    expect(component.bodegas.length).toBe(initialLength + 1);  // Ajustar el número esperado aquí
    const newBodega = component.bodegas.find(b => b.name === 'Bodega Nueva');
    expect(newBodega).toBeDefined();
    expect(newBodega?.name).toBe('Bodega Nueva');
    expect(localStorage.getItem('bodegas')).toBe(JSON.stringify(component.bodegas));
  });

  it('should add a product to salida items', () => {
    const product: Product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    component.products.push(product);
    component.salidaItems.push({ product: product, cantidad: 5 });
    component.tipoDocumento = 'VD';
    component.numeroDocumento = '12345';
    authServiceSpy.getCurrentUser.and.returnValue({ firstName: 'Admin', lastName: 'User' });

    component.onConfirmarSalida();
    expect(product.stock).toBe(5);
    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(product.code, product);
    expect(productServiceSpy.addMovimiento).toHaveBeenCalled();
  });

  it('should handle product traslado between bodegas', () => {
    const product: Product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    const bodegaOrigen: Bodega = { name: 'Bodega Origen', products: [product] };
    const bodegaDestino: Bodega = { name: 'Bodega Destino', products: [] };

    component.bodegas = [bodegaOrigen, bodegaDestino];
    component.selectedBodegaOrigen = bodegaOrigen;
    component.selectedBodegaDestino = bodegaDestino;
    component.selectedProductTraslado = product;
    authServiceSpy.getCurrentUser.and.returnValue({ firstName: 'Admin', lastName: 'User' });

    component.onAddProductoToTraslado();
    component.onConfirmarTraslado();

    expect(bodegaOrigen.products.length).toBe(0);
    expect(bodegaDestino.products.length).toBe(1);
    expect(bodegaDestino.products[0].code).toBe(product.code);
    expect(bodegaDestino.products[0].stock).toBe(10);
  });
});
