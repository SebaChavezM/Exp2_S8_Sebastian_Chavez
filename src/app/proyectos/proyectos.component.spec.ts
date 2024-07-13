import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProyectosComponent } from './proyectos.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

describe('ProyectosComponent', () => {
  let component: ProyectosComponent;
  let fixture: ComponentFixture<ProyectosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, ProyectosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProyectosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load proyectos from local storage on init', () => {
    const storedProyectos = [
      { tipo: 'Tipo 1', numero: '001', nombre: 'Proyecto 1', estado: 'Activa' }
    ];
    localStorage.setItem('proyectos', JSON.stringify(storedProyectos));

    component.ngOnInit();

    expect(component.proyectos.length).toBe(1);
    expect(component.proyectos[0].nombre).toBe('Proyecto 1');
  });

  it('should save proyectos to local storage', () => {
    spyOn(localStorage, 'setItem');
    component.proyectos = [{ tipo: 'Tipo 1', numero: '001', nombre: 'Proyecto 1', estado: 'Activa' }];

    component.saveProyectos();

    expect(localStorage.setItem).toHaveBeenCalledWith('proyectos', JSON.stringify(component.proyectos));
  });

  it('should filter proyectos based on searchTerm', () => {
    component.proyectos = [
      { tipo: 'Tipo 1', numero: '001', nombre: 'Proyecto 1', estado: 'Activa' },
      { tipo: 'Tipo 2', numero: '002', nombre: 'Proyecto 2', estado: 'Inactiva' }
    ];
    component.searchTerm = 'Proyecto 1';

    component.onSearch();

    expect(component.filteredProyectos.length).toBe(1);
    expect(component.filteredProyectos[0].nombre).toBe('Proyecto 1');
  });

  it('should open modal and reset newProyecto', () => {
    spyOn(bootstrap.Modal.prototype, 'show');
    component.openModal();

    expect(component.newProyecto).toEqual({ tipo: '', numero: '', nombre: '', estado: 'Activa' });
    expect(bootstrap.Modal.prototype.show).toHaveBeenCalled();
  });

  it('should edit a proyecto', () => {
    spyOn(bootstrap.Modal.prototype, 'show');
    const proyecto = { tipo: 'Tipo 1', numero: '001', nombre: 'Proyecto 1', estado: 'Activa' };

    component.editProyecto(proyecto);

    expect(component.newProyecto).toEqual(proyecto);
    expect(bootstrap.Modal.prototype.show).toHaveBeenCalled();
  });

  it('should delete a proyecto', () => {
    component.proyectos = [
      { tipo: 'Tipo 1', numero: '001', nombre: 'Proyecto 1', estado: 'Activa' },
      { tipo: 'Tipo 2', numero: '002', nombre: 'Proyecto 2', estado: 'Inactiva' }
    ];

    component.deleteProyecto(component.proyectos[0]);

    expect(component.proyectos.length).toBe(1);
    expect(component.proyectos[0].nombre).toBe('Proyecto 2');
  });

  it('should change estado of a proyecto', () => {
    component.proyectos = [
      { tipo: 'Tipo 1', numero: '001', nombre: 'Proyecto 1', estado: 'Activa' }
    ];

    component.changeEstado(component.proyectos[0], 'Inactiva');

    expect(component.proyectos[0].estado).toBe('Inactiva');
  });
});
