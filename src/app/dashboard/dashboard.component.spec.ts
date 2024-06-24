import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../auth/auth.service';
import { ProductService } from '../service/product.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const productSpy = jasmine.createSpyObj('ProductService', ['products$', 'historial$', 'getNextIngresoNumber', 'getNextSalidaNumber', 'updateProduct', 'addMovimiento', 'incrementNextIngresoNumber', 'incrementNextSalidaNumber']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        FormsModule,
        CommonModule,
        RouterTestingModule
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

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
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

  it('should filter users based on search term', () => {
    component.users = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'Password123!', role: 'Admin' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'Password123!', role: 'User' }
    ];

    component.searchUserTerm = 'john';
    component.onSearchUser();
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].firstName).toBe('John');

    component.searchUserTerm = '';
    component.onSearchUser();
    expect(component.filteredUsers.length).toBe(2);
  });

  it('should add new user', () => {
    const mockForm = {
      valid: true,
      resetForm: () => {},
      form: {
        markAllAsTouched: jasmine.createSpy('markAllAsTouched')
      }
    } as unknown as NgForm;

    component.newUser = { id: '3', firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', password: 'Password123!', role: 'User' };
    component.repeatPassword = 'Password123!';
    component.users = [];

    component.onSaveUser(mockForm);
    expect(component.users.length).toBe(1);
    expect(component.users[0].firstName).toBe('Alice');
  });

  it('should add a product to ingreso items', () => {
    const product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    component.selectedProduct = product;
    component.cantidadIngreso = 5;
    
    component.onAddProductoToIngreso();
    expect(component.ingresoItems.length).toBe(1);
    expect(component.ingresoItems[0].product).toEqual(product);
    expect(component.ingresoItems[0].cantidad).toBe(5);
  });

  it('should confirm ingreso and update stock', () => {
    const product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    component.selectedBodega.products.push(product);
    component.ingresoItems.push({ product: product, cantidad: 5 });
    authServiceSpy.getCurrentUser.and.returnValue({ firstName: 'Admin', lastName: 'User' });

    component.onConfirmarIngreso();
    expect(product.stock).toBe(15);
    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(product.code, product);
    expect(productServiceSpy.addMovimiento).toHaveBeenCalled();
  });

  it('should delete user', () => {
    const user = { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'Password123!', role: 'Admin' };
    component.users.push(user);
    component.selectedUser = user;

    component.onConfirmDeleteUser();
    expect(component.users.length).toBe(0);
    expect(localStorage.getItem('users')).toBe(JSON.stringify([]));
  });

  it('should confirm salida and update stock', () => {
    const product = { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 10, bodega: 'Bodega Principal' };
    component.selectedBodega.products.push(product);
    component.salidaItems.push({ product: product, cantidad: 5, tipoDocumento: 'VD', numeroDocumento: '12345' });
    authServiceSpy.getCurrentUser.and.returnValue({ firstName: 'Admin', lastName: 'User' });

    component.onConfirmarSalida();
    expect(product.stock).toBe(5);
    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(product.code, product);
    expect(productServiceSpy.addMovimiento).toHaveBeenCalled();
  });

  it('should handle product search correctly', () => {
    component.selectedBodega.products = [
      { code: 'P001', name: 'Product 1', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 0, bodega: 'Bodega Principal' },
      { code: 'P002', name: 'Product 2', description: '', model: '', brand: '', material: '', color: '', family: '', value: 0, currency: '', unit: '', location: '', stock: 0, bodega: 'Bodega Principal' }
    ];

    component.searchProductTerm = 'P001';
    component.onSearchProduct({ target: { value: 'P001' } });
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].code).toBe('P001');
  });
});
