import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoOcComponent } from './listado-oc.component';

describe('ListadoOcComponent', () => {
  let component: ListadoOcComponent;
  let fixture: ComponentFixture<ListadoOcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoOcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoOcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
