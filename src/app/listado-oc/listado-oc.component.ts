import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { OrdenCompraService } from '../service/orden-compra.service';
import { OrdenCompra, OrdenCompraItem } from '../models/orden-compra.model';
import { ProductService } from '../service/product.service';

@Component({
  selector: 'app-listado-oc',
  templateUrl: './listado-oc.component.html',
  styleUrls: ['./listado-oc.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule]
})
export class ListadoOcComponent implements OnInit {
  ordenesCompra: OrdenCompra[] = [];
  selectedOrdenCompra: OrdenCompra | null = null;
  selectedOrdenCompraItem: OrdenCompraItem | null = null;
  cantidadRecepcionada: number | null = null;
  cantidadPendiente: number | null = null;
  bodegas: string[] = [];
  factura: string | undefined;
  @ViewChild('detallesModal', { static: false }) detallesModal: any;
  @ViewChild('recepcionModal', { static: false }) recepcionModal: any;

  constructor(
    private ordenCompraService: OrdenCompraService,
    private modalService: NgbModal,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.ordenesCompra = this.ordenCompraService.getOrdenesCompra();
    this.bodegas = this.productService.getAllBodegas();
  }

  verPDF(ordenCompra: OrdenCompra): void {
    if (ordenCompra.pdfUrl) {
      window.open(ordenCompra.pdfUrl, '_blank');
    }
  }

  abrirModalDetalles(ordenCompra: OrdenCompra): void {
    this.selectedOrdenCompra = ordenCompra;
    this.modalService.open(this.detallesModal, { size: 'xl' });
  }

  abrirModalRecepcion(item: OrdenCompraItem): void {
    this.selectedOrdenCompraItem = item;
    this.cantidadRecepcionada = item.recepcionada || 0;
    this.cantidadPendiente = item.cantidad - (item.recepcionada || 0);
    this.modalService.open(this.recepcionModal);
  }

  confirmarRecepcion(): void {
    if (this.selectedOrdenCompraItem && this.cantidadRecepcionada !== null && this.cantidadPendiente !== null) {
      const item = this.selectedOrdenCompraItem;
      if (this.cantidadRecepcionada > this.cantidadPendiente || this.cantidadRecepcionada < 0) {
        alert('Cantidad recepcionada no válida');
        return;
      }
      item.recepcionada = (item.recepcionada || 0) + this.cantidadRecepcionada;
      if (item.recepcionada >= item.cantidad) {
        item.recepcionada = item.cantidad;
      }

      // Actualizar el inventario
      if (item.bodega) {
        this.productService.updateStock(item.codigo, item.bodega, this.cantidadRecepcionada);
      }

      this.actualizarEstadoOrdenCompra();
      this.modalService.dismissAll();
    }
  }

  actualizarEstadoOrdenCompra(): void {
    if (this.selectedOrdenCompra) {
      const allItemsRecepcionados = this.selectedOrdenCompra.items.every(item => item.recepcionada && item.recepcionada >= item.cantidad);
      const someItemsRecepcionados = this.selectedOrdenCompra.items.some(item => item.recepcionada && item.recepcionada > 0);

      if (allItemsRecepcionados) {
        if (this.selectedOrdenCompra.items.every(item => item.factura)) {
          this.selectedOrdenCompra.estado = 'Completa';
        } else {
          this.selectedOrdenCompra.estado = 'Pendiente de Factura';
        }
      } else if (someItemsRecepcionados) {
        this.selectedOrdenCompra.estado = 'Parcial';
      } else {
        this.selectedOrdenCompra.estado = 'Incompleta';
      }
    }
  }

  guardarCambios(): void {
    if (this.selectedOrdenCompra) {
      this.selectedOrdenCompra.items.forEach(item => {
        if (!item.factura) {
          item.factura = this.factura;
        }
      });
      this.ordenCompraService.updateOrdenCompra(this.selectedOrdenCompra.numero, this.selectedOrdenCompra);
    }
  }
}
