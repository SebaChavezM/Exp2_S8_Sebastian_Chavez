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
  proveedores: Proveedor[] = [];
  selectedProveedor: Proveedor | null = null;

  newProveedor: Proveedor = {
    nombre: '',
    rut: '',
    direccion: '',
    comuna: '',
    telefono: '',
    contacto: ''
  };

  ngOnInit(): void {
    const storedProveedores = localStorage.getItem('proveedores');
    if (storedProveedores) {
      this.proveedores = JSON.parse(storedProveedores);
    }
  }

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

  saveProveedores(): void {
    localStorage.setItem('proveedores', JSON.stringify(this.proveedores));
  }

  selectProveedor(proveedor: Proveedor): void {
    this.selectedProveedor = { ...proveedor };
  }

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

  deleteProveedor(rut: string): void {
    this.proveedores = this.proveedores.filter(p => p.rut !== rut);
    this.saveProveedores();
  }

  formatRUT(rut: string): string {
    rut = rut.replace(/[.-]/g, '');
    if (rut.length > 1) {
      rut = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + rut.slice(-1);
    }
    return rut;
  }
}
