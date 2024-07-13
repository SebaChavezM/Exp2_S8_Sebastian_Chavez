import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedorComponent } from './proveedor.component';
import { ProveedorService } from '../service/proveedor.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Proveedor } from '../models/proveedor.model';
import { By } from '@angular/platform-browser';

describe('ProveedorComponent', () => {
  let component: ProveedorComponent;
  let fixture: ComponentFixture<ProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ProveedorComponent],
      providers: [ProveedorService]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load proveedores from local storage on init', () => {
    const storedProveedores = [
      { nombre: 'Proveedor 1', rut: '12345678-9', direccion: 'Direccion 1', comuna: 'Comuna 1', telefono: '123456789', contacto: 'Contacto 1' }
    ];
    localStorage.setItem('proveedores', JSON.stringify(storedProveedores));
    
    component.ngOnInit();
    
    expect(component.proveedores.length).toBe(1);
    expect(component.proveedores[0].nombre).toBe('Proveedor 1');
  });

  it('should save proveedores to local storage', () => {
    spyOn(localStorage, 'setItem');
    component.proveedores = [{ nombre: 'Proveedor 1', rut: '12345678-9', direccion: 'Direccion 1', comuna: 'Comuna 1', telefono: '123456789', contacto: 'Contacto 1' }];

    component.saveProveedores();

    expect(localStorage.setItem).toHaveBeenCalledWith('proveedores', JSON.stringify(component.proveedores));
  });

  it('should select a proveedor for editing', () => {
    const proveedor = { nombre: 'Proveedor 1', rut: '12345678-9', direccion: 'Direccion 1', comuna: 'Comuna 1', telefono: '123456789', contacto: 'Contacto 1' };
    component.selectProveedor(proveedor);

    expect(component.selectedProveedor).toEqual(proveedor);
  });

  it('should update a proveedor', () => {
    component.proveedores = [{ nombre: 'Proveedor 1', rut: '12345678-9', direccion: 'Direccion 1', comuna: 'Comuna 1', telefono: '123456789', contacto: 'Contacto 1' }];
    component.selectedProveedor = { nombre: 'Proveedor Updated', rut: '12345678-9', direccion: 'Direccion Updated', comuna: 'Comuna Updated', telefono: '987654321', contacto: 'Contacto Updated' };

    component.updateProveedor();

    expect(component.proveedores[0].nombre).toBe('Proveedor Updated');
    expect(component.selectedProveedor).toBeNull();
  });

  it('should delete a proveedor', () => {
    component.proveedores = [{ nombre: 'Proveedor 1', rut: '12345678-9', direccion: 'Direccion 1', comuna: 'Comuna 1', telefono: '123456789', contacto: 'Contacto 1' }];

    component.deleteProveedor('12345678-9');

    expect(component.proveedores.length).toBe(0);
  });

  it('should format RUT correctly', () => {
    const formattedRUT = component.formatRUT('123456789');
    expect(formattedRUT).toBe('12.345.678-9');
  });
});
