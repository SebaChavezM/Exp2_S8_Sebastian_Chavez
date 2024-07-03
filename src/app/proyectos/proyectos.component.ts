import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

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
  proyectos: Proyecto[] = [];
  filteredProyectos: Proyecto[] = [];
  searchTerm: string = '';
  newProyecto: Proyecto = { tipo: '', numero: '', nombre: '', estado: 'Activa' };

  ngOnInit(): void {
    this.loadProyectos();
  }

  loadProyectos(): void {
    const proyectos = localStorage.getItem('proyectos');
    if (proyectos) {
      this.proyectos = JSON.parse(proyectos);
      this.filteredProyectos = this.proyectos;
    }
  }

  saveProyectos(): void {
    localStorage.setItem('proyectos', JSON.stringify(this.proyectos));
  }

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

  openModal(): void {
    this.newProyecto = { tipo: '', numero: '', nombre: '', estado: 'Activa' };
    const modal = new bootstrap.Modal(document.getElementById('proyectoModal')!);
    modal.show();
  }

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

  editProyecto(proyecto: Proyecto): void {
    this.newProyecto = { ...proyecto };
    const modal = new bootstrap.Modal(document.getElementById('proyectoModal')!);
    modal.show();
  }

  deleteProyecto(proyecto: Proyecto): void {
    this.proyectos = this.proyectos.filter(p => p !== proyecto);
    this.saveProyectos();
    this.loadProyectos();
  }

  changeEstado(proyecto: Proyecto, estado: string): void {
    proyecto.estado = estado;
    this.saveProyectos();
    this.loadProyectos();
  }
}
