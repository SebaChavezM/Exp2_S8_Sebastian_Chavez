import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProveedorService } from '../service/proveedor.service';
import { Proveedor } from '../models/proveedor.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProveedorComponent implements OnInit {
  /** Lista de proveedores */
  proveedores: Proveedor[] = [];
  /** Proveedor seleccionado para edición */
  selectedProveedor: Proveedor | null = null;

  /** Nuevo proveedor a agregar */
  newProveedor: Proveedor = {
    nombre: '',
    rut: '',
    direccion: '',
    comuna: '',
    telefono: '',
    contacto: ''
  };

  /**
   * Método de inicialización del componente.
   * Carga la lista de proveedores desde el almacenamiento local.
   * @returns {void}
   */
  ngOnInit(): void {
    const storedProveedores = localStorage.getItem('proveedores');
    if (storedProveedores) {
      this.proveedores = JSON.parse(storedProveedores);
    }
  }

  /**
   * Agrega un nuevo proveedor a la lista de proveedores.
   * @param {NgForm} form - El formulario de entrada.
   * @returns {void}
   */
  addProveedor(form: NgForm): void {
    form.form.markAllAsTouched();
    if (form.valid) {
      this.newProveedor.rut = this.formatRUT(this.newProveedor.rut);

      if (this.proveedores.some(p => p.rut === this.newProveedor.rut)) {
        alert('El RUT del proveedor ya existe. Por favor, ingrese un RUT diferente.');
      } else {
        this.proveedores.push(this.newProveedor);
        this.saveProveedores();
        this.newProveedor = {
          nombre: '',
          rut: '',
          direccion: '',
          comuna: '',
          telefono: '',
          contacto: ''
        };
        form.resetForm();
      }
    }
  }

  /**
   * Guarda la lista de proveedores en el almacenamiento local.
   * @returns {void}
   */
  saveProveedores(): void {
    localStorage.setItem('proveedores', JSON.stringify(this.proveedores));
  }

  /**
   * Selecciona un proveedor para edición.
   * @param {Proveedor} proveedor - El proveedor a seleccionar.
   * @returns {void}
   */
  selectProveedor(proveedor: Proveedor): void {
    this.selectedProveedor = { ...proveedor };
  }

  /**
   * Actualiza la información de un proveedor seleccionado.
   * @returns {void}
   */
  updateProveedor(): void {
    if (this.selectedProveedor) {
      const index = this.proveedores.findIndex(p => p.rut === this.selectedProveedor!.rut);
      if (index !== -1) {
        this.proveedores[index] = this.selectedProveedor;
        this.saveProveedores();
      }
      this.selectedProveedor = null;
    }
  }

  /**
   * Elimina un proveedor de la lista de proveedores.
   * @param {string} rut - El RUT del proveedor a eliminar.
   * @returns {void}
   */
  deleteProveedor(rut: string): void {
    this.proveedores = this.proveedores.filter(p => p.rut !== rut);
    this.saveProveedores();
  }

  /**
   * Formatea un RUT agregando puntos y guión.
   * @param {string} rut - El RUT a formatear.
   * @returns {string} - El RUT formateado.
   */
  formatRUT(rut: string): string {
    rut = rut.replace(/[.-]/g, '');
    if (rut.length > 1) {
      rut = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + rut.slice(-1);
    }
    return rut;
  }
}
