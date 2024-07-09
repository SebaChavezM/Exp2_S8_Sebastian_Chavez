import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

/**
 * Interface para representar un proyecto.
 * @interface
 */
interface Proyecto {
  tipo: string;
  numero: string;
  nombre: string;
  estado: string;
}

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ProyectosComponent implements OnInit {
  /** Lista de proyectos */
  proyectos: Proyecto[] = [];
  /** Lista de proyectos filtrados */
  filteredProyectos: Proyecto[] = [];
  /** Término de búsqueda para filtrar proyectos */
  searchTerm: string = '';
  /** Nuevo proyecto a agregar o editar */
  newProyecto: Proyecto = { tipo: '', numero: '', nombre: '', estado: 'Activa' };

  /**
   * Método de inicialización del componente.
   * Carga la lista de proyectos desde el almacenamiento local.
   * @returns {void}
   */
  ngOnInit(): void {
    this.loadProyectos();
  }

  /**
   * Carga los proyectos desde el almacenamiento local.
   * @returns {void}
   */
  loadProyectos(): void {
    const proyectos = localStorage.getItem('proyectos');
    if (proyectos) {
      this.proyectos = JSON.parse(proyectos);
      this.filteredProyectos = this.proyectos;
    }
  }

  /**
   * Guarda la lista de proyectos en el almacenamiento local.
   * @returns {void}
   */
  saveProyectos(): void {
    localStorage.setItem('proyectos', JSON.stringify(this.proyectos));
  }

  /**
   * Filtra la lista de proyectos basado en el término de búsqueda.
   * @returns {void}
   */
  onSearch(): void {
    if (this.searchTerm) {
      this.filteredProyectos = this.proyectos.filter(proyecto =>
        proyecto.tipo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        proyecto.numero.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        proyecto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredProyectos = this.proyectos;
    }
  }

  /**
   * Abre el modal para agregar o editar un proyecto.
   * @returns {void}
   */
  openModal(): void {
    this.newProyecto = { tipo: '', numero: '', nombre: '', estado: 'Activa' };
    const modal = new bootstrap.Modal(document.getElementById('proyectoModal')!);
    modal.show();
  }

  /**
   * Guarda un nuevo proyecto o actualiza un proyecto existente.
   * @param {NgForm} form - El formulario de entrada.
   * @returns {void}
   */
  onSaveProyecto(form: NgForm): void {
    if (form.valid) {
      this.proyectos.push({ ...this.newProyecto });
      this.saveProyectos();
      this.loadProyectos();
      form.resetForm();
      const modal = bootstrap.Modal.getInstance(document.getElementById('proyectoModal')!);
      modal?.hide();
    }
  }

  /**
   * Edita un proyecto existente.
   * @param {Proyecto} proyecto - El proyecto a editar.
   * @returns {void}
   */
  editProyecto(proyecto: Proyecto): void {
    this.newProyecto = { ...proyecto };
    const modal = new bootstrap.Modal(document.getElementById('proyectoModal')!);
    modal.show();
  }

  /**
   * Elimina un proyecto de la lista de proyectos.
   * @param {Proyecto} proyecto - El proyecto a eliminar.
   * @returns {void}
   */
  deleteProyecto(proyecto: Proyecto): void {
    this.proyectos = this.proyectos.filter(p => p !== proyecto);
    this.saveProyectos();
    this.loadProyectos();
  }

  /**
   * Cambia el estado de un proyecto.
   * @param {Proyecto} proyecto - El proyecto cuyo estado se va a cambiar.
   * @param {string} estado - El nuevo estado del proyecto.
   * @returns {void}
   */
  changeEstado(proyecto: Proyecto, estado: string): void {
    proyecto.estado = estado;
    this.saveProyectos();
    this.loadProyectos();
  }
}
