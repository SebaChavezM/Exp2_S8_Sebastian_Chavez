import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProveedorService } from '../service/proveedor.service';
import { Proveedor } from '../models/proveedor.model';
import { OrdenCompraService } from '../service/orden-compra.service';
import { OrdenCompra, OrdenCompraItem } from '../models/orden-compra.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-orden-compra',
  templateUrl: './orden-compra.component.html',
  styleUrls: ['./orden-compra.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class OrdenCompraComponent implements OnInit {
  proveedores: Proveedor[] = [];
  newOrdenCompra: OrdenCompra = {
    numero: this.generarNumeroOC(),
    proveedor: null,
    fecha: new Date().toISOString().substring(0, 10),
    items: [],
    totalNeto: 0,
    iva: 0,
    total: 0,
    estado: 'Pendiente de Factura',
    formaPago: '',
    plazoEntrega: 0,
    generadoPor: 'Admin User',
    centroCosto: '',
    numeroCotizacion: '',
    numeroOEVDGG: ''
  };
  selectedProveedor: Proveedor | null = null;
  pdfUrl: SafeResourceUrl | null = null;

  constructor(
    private proveedorService: ProveedorService,
    private ordenCompraService: OrdenCompraService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const storedProveedores = localStorage.getItem('proveedores');
    if (storedProveedores) {
      this.proveedores = JSON.parse(storedProveedores);
    }
  }

  generarNumeroOC(): number {
    const currentOrdenes = this.ordenCompraService.getOrdenesCompra();
    return currentOrdenes.length > 0 ? currentOrdenes[currentOrdenes.length - 1].numero + 1 : 1;
  }

  addItem() {
    this.newOrdenCompra.items.push({
      item: this.newOrdenCompra.items.length + 1,
      codigo: '',
      descripcion: '',
      descuento: 0,
      tipoMoneda: 'CLP',
      cantidad: 1,
      unidad: '',
      precio: 0,
      total: 0,
      plazoEntrega: 0,
      fechaEntregaEstimada: ''
    });
  }

  removeItem(index: number) {
    this.newOrdenCompra.items.splice(index, 1);
    this.updateItems();
  }

  updateItems() {
    this.newOrdenCompra.items.forEach((item, index) => {
      item.item = index + 1;
      item.total = item.precio * item.cantidad - item.descuento;
      this.calcularFechaEntrega(item);
    });
    this.calculateTotal();
  }

  calculateTotal() {
    const totalNeto = this.newOrdenCompra.items.reduce((sum, item) => sum + item.total, 0);
    this.newOrdenCompra.totalNeto = totalNeto;
    this.newOrdenCompra.iva = totalNeto * 0.19; // Assuming 19% IVA
    this.newOrdenCompra.total = totalNeto + this.newOrdenCompra.iva;
  }

  calcularFechaEntrega(item: OrdenCompraItem) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + item.plazoEntrega * 7);
    item.fechaEntregaEstimada = fecha.toISOString().substring(0, 10);
  }

  calcularFechaEntregaGlobal() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + this.newOrdenCompra.plazoEntrega * 7);
    this.newOrdenCompra.items.forEach(item => {
      item.fechaEntregaEstimada = fecha.toISOString().substring(0, 10);
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.newOrdenCompra.proveedor = this.selectedProveedor;
      this.ordenCompraService.addOrdenCompra(this.newOrdenCompra);
      this.resetForm(form);
    }
  }

  resetForm(form: NgForm) {
    form.resetForm();
    this.newOrdenCompra = {
      numero: this.generarNumeroOC(),
      proveedor: null,
      fecha: new Date().toISOString().substring(0, 10),
      items: [],
      totalNeto: 0,
      iva: 0,
      total: 0,
      estado: 'Pendiente de Factura',
      formaPago: '',
      plazoEntrega: 0,
      generadoPor: 'Admin User',
      centroCosto: '',
      numeroCotizacion: '',
      numeroOEVDGG: ''
    };
    this.selectedProveedor = null;
  }

  previsualizarPDF() {
    const doc = new jsPDF();
  
    // Encabezado izquierdo
    doc.setFontSize(10);
    doc.text('PRAXA INGENIERIA SPA', 14, 14);
    doc.text('RUT: 76.751.421-2', 14, 18);
    doc.text('Uno Norte N°180 Logistock Bodega 2', 14, 22);
    doc.text('San Pedro de la Paz', 14, 26);
    doc.text('praxaingenieria.com', 14, 30);
  
    // Encabezado derecho
    doc.setFillColor(22, 160, 133);  // Color verde
    doc.rect(150, 10, 50, 20, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255); // Color blanco
    doc.text('RUT: 76.751.421-2', 155, 16);
    doc.text('ORDEN DE COMPRA', 155, 22);
    doc.text(`N° ${this.newOrdenCompra.numero}`, 155, 28);
  
    // Restaurar color para el contenido
    doc.setTextColor(0, 0, 0);
  
    // Crear las filas de la tabla
    const providerInfo = [
      [
        { content: 'PROVEEDOR', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } },
        { content: 'RUT', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } },
        { content: 'FECHA', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } }
      ],
      [
        { content: this.selectedProveedor?.nombre || '', styles: { fontSize: 10, textColor: [0, 0, 0] } },
        { content: this.selectedProveedor?.rut || '', styles: { fontSize: 10, textColor: [0, 0, 0] } },
        { content: this.newOrdenCompra.fecha, styles: { fontSize: 10, textColor: [0, 0, 0] } }
      ],
      [
        { content: 'DIRECCIÓN', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } },
        { content: 'COMUNA', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } },
        { content: 'TELÉFONO', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } }
      ],
      [
        { content: this.selectedProveedor?.direccion || '', styles: { fontSize: 10, textColor: [0, 0, 0] } },
        { content: this.selectedProveedor?.comuna || '', styles: { fontSize: 10, textColor: [0, 0, 0] } },
        { content: this.selectedProveedor?.telefono || '', styles: { fontSize: 10, textColor: [0, 0, 0] } }
      ],
      [
        { content: 'CONTACTO', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } },
        { content: 'FORMA DE PAGO', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } },
        { content: 'CENTRO DE COSTO', styles: { fontSize: 6, fontStyle: 'bold', textColor: [128, 128, 128] } }
      ],
      [
        { content: this.selectedProveedor?.contacto || '', styles: { fontSize: 10, textColor: [0, 0, 0] } },
        { content: this.newOrdenCompra.formaPago, styles: { fontSize: 10, textColor: [0, 0, 0] } },
        { content: this.newOrdenCompra.centroCosto, styles: { fontSize: 10, textColor: [0, 0, 0] } }
      ]
    ];
  
    // Generar la tabla
    (doc as any).autoTable({
      startY: 40,
      body: providerInfo,
      styles: { cellPadding: 2, valign: 'middle' },
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' }
      }
    });
  
    // Items
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Item', 'Código', 'Descripción', 'Descuento', 'Moneda', 'Cantidad', 'Unidad', 'Precio', 'Total', 'Plazo de Entrega (semanas)', 'Fecha de Entrega Estimada']],
      body: this.newOrdenCompra.items.map(item => [
        item.item,
        item.codigo,
        item.descripcion,
        item.descuento,
        item.tipoMoneda,
        item.cantidad,
        item.unidad,
        item.precio,
        item.total,
        item.plazoEntrega,
        item.fechaEntregaEstimada
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    });
  
    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Precio Neto: ${this.newOrdenCompra.totalNeto}`, 14, finalY);
    doc.text(`IVA: ${this.newOrdenCompra.iva}`, 14, finalY + 6);
    doc.text(`Total: ${this.newOrdenCompra.total}`, 14, finalY + 12);
  
    // Convertir a URL y mostrar
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
  }
  
}
