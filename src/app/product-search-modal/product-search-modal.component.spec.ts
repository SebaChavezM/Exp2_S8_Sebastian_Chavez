import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSearchModalComponent } from './product-search-modal.component';
import { ProductService, Product } from '../service/product.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

describe('ProductSearchModalComponent', () => {
  let component: ProductSearchModalComponent;
  let fixture: ComponentFixture<ProductSearchModalComponent>;
  let mockProductService: any;
  let mockActiveModal: any;

  beforeEach(async () => {
    mockProductService = {
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue([
        { code: '001', name: 'Producto 1', description: 'Descripcion 1', model: '', brand: '', material: '', color: '', family: '', value: 10, currency: 'CLP', unit: 'pz', location: '', stock: 0, bodega: 'Bodega 1' },
        { code: '002', name: 'Producto 2', description: 'Descripcion 2', model: '', brand: '', material: '', color: '', family: '', value: 15, currency: 'CLP', unit: 'pz', location: '', stock: 0, bodega: 'Bodega 2' }
      ])
    };

    mockActiveModal = {
      close: jasmine.createSpy('close')
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, NgbModalModule, ProductSearchModalComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: NgbActiveModal, useValue: mockActiveModal }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all products on init', () => {
    component.ngOnInit();
    expect(component.products.length).toBe(2);
    expect(component.filteredProducts.length).toBe(2);
    expect(mockProductService.getAllProducts).toHaveBeenCalled();
  });

  it('should filter products based on search term', () => {
    component.ngOnInit();
    component.searchTerm = 'Producto 1';
    component.filterProducts();
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Producto 1');

    component.searchTerm = 'Producto';
    component.filterProducts();
    expect(component.filteredProducts.length).toBe(2);

    component.searchTerm = '003';
    component.filterProducts();
    expect(component.filteredProducts.length).toBe(0);
  });

  it('should apply filter based on event input', () => {
    component.ngOnInit();
    const event = { target: { value: 'Producto 1' } } as unknown as Event;
    component.applyFilter(event);
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Producto 1');

    const event2 = { target: { value: 'Producto' } } as unknown as Event;
    component.applyFilter(event2);
    expect(component.filteredProducts.length).toBe(2);
  });

  it('should select product and close modal', () => {
    const product = { code: '001', name: 'Producto 1', description: 'Descripcion 1', model: '', brand: '', material: '', color: '', family: '', value: 10, currency: 'CLP', unit: 'pz', location: '', stock: 0, bodega: 'Bodega 1' };
    component.selectProduct(product);
    expect(mockActiveModal.close).toHaveBeenCalledWith(product);
  });

  it('should add new product to the list', () => {
    component.ngOnInit();
    component.addProduct();
    expect(component.products.length).toBe(3);
    expect(component.products[2].name).toBe('Producto 3');
    expect(component.filteredProducts.length).toBe(3);
  });
});
