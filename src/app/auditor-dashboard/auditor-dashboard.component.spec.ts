import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditorDashboardComponent } from './auditor-dashboard.component';
import { ProductService, Product } from '../service/product.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import * as bootstrap from 'bootstrap';

describe('AuditorDashboardComponent', () => {
  let component: AuditorDashboardComponent;
  let fixture: ComponentFixture<AuditorDashboardComponent>;
  let mockProductService: any;

  const mockProducts: Product[] = [
    {
      code: '001',
      name: 'Product 1',
      description: 'Description 1',
      model: 'Model 1',
      brand: 'Brand 1',
      material: 'Material 1',
      color: 'Color 1',
      family: 'Family 1',
      value: 100,
      currency: 'USD',
      unit: 'Unit 1',
      location: 'Location 1',
      stock: 10,
      bodega: 'Bodega 1'
    },
    {
      code: '002',
      name: 'Product 2',
      description: 'Description 2',
      model: 'Model 2',
      brand: 'Brand 2',
      material: 'Material 2',
      color: 'Color 2',
      family: 'Family 2',
      value: 200,
      currency: 'USD',
      unit: 'Unit 2',
      location: 'Location 2',
      stock: 20,
      bodega: 'Bodega 2'
    }
  ];

  beforeEach(async () => {
    mockProductService = {
      products$: of(mockProducts),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, AuditorDashboardComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    component.ngOnInit();
    expect(component.products.length).toBe(2);
    expect(component.filteredProducts.length).toBe(2);
  });

  it('should filter products by search term', () => {
    component.onSearchProduct({ target: { value: 'Product 1' } });

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Product 1');
  });

  it('should reset filtered products if search term is empty', () => {
    component.onSearchProduct({ target: { value: '' } });

    expect(component.filteredProducts.length).toBe(2);
  });

  it('should set selectedProduct and show modal on onViewProductInfo', () => {
    const spy = spyOn(bootstrap.Modal.prototype, 'show').and.callThrough();

    component.onViewProductInfo(0);

    expect(component.selectedProduct).toEqual(mockProducts[0]);
    expect(spy).toHaveBeenCalled();
  });
});
