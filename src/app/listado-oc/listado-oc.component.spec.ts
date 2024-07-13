import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoOcComponent } from './listado-oc.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { OrdenCompraService } from '../service/orden-compra.service';
import { ProductService } from '../service/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ListadoOcComponent', () => {
  let component: ListadoOcComponent;
  let fixture: ComponentFixture<ListadoOcComponent>;
  let mockOrdenCompraService: any;
  let mockModalService: any;
  let mockProductService: any;

  beforeEach(async () => {
    mockOrdenCompraService = {
      getOrdenesCompra: jasmine.createSpy('getOrdenesCompra').and.returnValue([]),
      updateOrdenCompra: jasmine.createSpy('updateOrdenCompra')
    };

    mockModalService = {
      open: jasmine.createSpy('open'),
      dismissAll: jasmine.createSpy('dismissAll')
    };

    mockProductService = {
      getAllBodegas: jasmine.createSpy('getAllBodegas').and.returnValue([]),
      updateStock: jasmine.createSpy('updateStock')
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        NgbModalModule,
        ListadoOcComponent // Aquí importamos el componente standalone directamente
      ],
      providers: [
        { provide: OrdenCompraService, useValue: mockOrdenCompraService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: ProductService, useValue: mockProductService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoOcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with ordenesCompra and bodegas on init', () => {
    component.ngOnInit();
    expect(mockOrdenCompraService.getOrdenesCompra).toHaveBeenCalled();
    expect(mockProductService.getAllBodegas).toHaveBeenCalled();
    expect(component.ordenesCompra).toEqual([]);
    expect(component.bodegas).toEqual([]);
  });

  it('should open PDF in new tab', () => {
    const ordenCompra = { pdfUrl: 'http://example.com' } as any;
    spyOn(window, 'open');
    component.verPDF(ordenCompra);
    expect(window.open).toHaveBeenCalledWith('http://example.com', '_blank');
  });

  it('should update order state to Completa', () => {
    const item = { cantidad: 10, recepcionada: 10, factura: 'Factura 1' } as any;
    component.selectedOrdenCompra = { items: [item], estado: '' } as any;

    component.actualizarEstadoOrdenCompra();
    if (component.selectedOrdenCompra) {
      expect(component.selectedOrdenCompra.estado).toBe('Completa');
    }
  });

  it('should update order state to Parcial', () => {
    const item1 = { cantidad: 10, recepcionada: 5 } as any;
    const item2 = { cantidad: 10, recepcionada: 0 } as any;
    component.selectedOrdenCompra = { items: [item1, item2], estado: '' } as any;

    component.actualizarEstadoOrdenCompra();
    if (component.selectedOrdenCompra) {
      expect(component.selectedOrdenCompra.estado).toBe('Parcial');
    }
  });

  it('should save changes', () => {
    const item1 = { factura: null } as any;
    const item2 = { factura: 'Factura 2' } as any;
    component.selectedOrdenCompra = { numero: '123', items: [item1, item2] } as any;
    component.factura = 'Nueva Factura';

    component.guardarCambios();
    expect(item1.factura).toBe('Nueva Factura');
    expect(item2.factura).toBe('Factura 2');
    expect(mockOrdenCompraService.updateOrdenCompra).toHaveBeenCalledWith('123', component.selectedOrdenCompra);
  });
});
