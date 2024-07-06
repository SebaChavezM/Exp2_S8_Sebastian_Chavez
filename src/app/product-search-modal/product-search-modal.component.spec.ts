import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSearchModalComponent } from './product-search-modal.component';

describe('ProductSearchModalComponent', () => {
  let component: ProductSearchModalComponent;
  let fixture: ComponentFixture<ProductSearchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSearchModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
