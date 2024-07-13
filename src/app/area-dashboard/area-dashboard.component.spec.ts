import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AreaDashboardComponent } from './area-dashboard.component';
import { ProductService } from '../service/product.service';
import { AuthService } from '../auth/auth.service';
import { ProyectosService } from '../service/proyecto.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { BulkUploadComponent } from '../bulk-upload/bulk-upload.component';

describe('AreaDashboardComponent', () => {
  let component: AreaDashboardComponent;
  let fixture: ComponentFixture<AreaDashboardComponent>;
  let mockProductService: any;
  let mockAuthService: any;
  let mockProyectosService: any;

  beforeEach(async () => {
    mockProductService = {
      products$: of([]),
      historial$: of([]),
      getNextIngresoNumber: jasmine.createSpy('getNextIngresoNumber').and.returnValue(1),
      getNextSalidaNumber: jasmine.createSpy('getNextSalidaNumber').and.returnValue(1),
      deleteProductByCode: jasmine.createSpy('deleteProductByCode').and.callFake((code: string) => {
        component.bodegas[0].products = component.bodegas[0].products.filter(p => p.code !== code);
      }),
      updateProduct: jasmine.createSpy('updateProduct'),
      addMovimiento: jasmine.createSpy('addMovimiento'),
      incrementNextIngresoNumber: jasmine.createSpy('incrementNextIngresoNumber'),
      incrementNextSalidaNumber: jasmine.createSpy('incrementNextSalidaNumber'),
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue([]),
      saveProductsToLocalStorage: jasmine.createSpy('saveProductsToLocalStorage')
    };

    mockAuthService = {
      getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ firstName: 'John', lastName: 'Doe' })
    };

    mockProyectosService = {
      proyectos$: of([])
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, BulkUploadComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ProyectosService, useValue: mockProyectosService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AreaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    spyOn(component, 'loadAllProducts').and.callThrough();
    component.ngOnInit();
    expect(component.loadAllProducts).toHaveBeenCalled();
  });

  it('should delete a product by code', () => {
    component.bodegas = [{
      name: 'Bodega Principal', 
      products: [{
        code: '123',
        name: 'Product 1',
        description: 'Description',
        model: 'Model',
        brand: 'Brand',
        material: 'Material',
        color: 'Color',
        family: 'Family',
        value: 100,
        currency: 'USD',
        unit: 'Unit',
        location: 'Location',
        stock: 10,
        bodega: 'Bodega Principal'
      }]
    }];
    component.selectedBodega = component.bodegas[0];
    component.productToDelete = { code: '123' } as any;

    component.onConfirmDelete();

    expect(mockProductService.deleteProductByCode).toHaveBeenCalledWith('123');
    expect(component.bodegas[0].products.length).toBe(0);
  });

  it('should select a bodega', () => {
    const bodega = { name: 'Bodega Secundaria', products: [] };
    component.bodegas = [component.selectedBodega, bodega];

    component.selectBodega(bodega);

    expect(component.selectedBodega).toBe(bodega);
    expect(component.filteredProducts).toBe(bodega.products);
  });

  it('should confirm product ingreso', () => {
    component.selectedBodega.products = [{ code: '123', name: 'Product 1', stock: 10 }] as any[];
    component.ingresoItems = [{ product: { code: '123', name: 'Product 1' }, cantidad: 5 }];
    component.selectedProduct = component.selectedBodega.products[0];

    component.onConfirmarIngreso();

    expect(component.selectedBodega.products[0].stock).toBe(15);
    expect(mockProductService.updateProduct).toHaveBeenCalledWith('123', component.selectedBodega.products[0]);
    expect(mockProductService.addMovimiento).toHaveBeenCalled();
  });
});
