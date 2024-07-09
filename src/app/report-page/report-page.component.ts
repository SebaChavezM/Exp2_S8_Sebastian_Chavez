import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportService } from '../service/report.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ReportComponent {
  /** Tipos de reportes disponibles */
  reportTypes = [
    { value: 'generalInventory', label: 'Inventario General' },
    { value: 'inventoryMovements', label: 'Movimientos de Inventario' },
    { value: 'lowStock', label: 'Productos con Bajo Stock' },
    { value: 'inventoryByWarehouse', label: 'Inventario por Bodega' },
    { value: 'bestSellingProducts', label: 'Productos Más Vendidos' },
    { value: 'obsoleteProducts', label: 'Productos Obsoletos' },
    { value: 'inventoryTurnover', label: 'Rotación de Inventario' },
    { value: 'inventoryDiscrepancies', label: 'Discrepancias de Inventario' },
    { value: 'inventoryCosts', label: 'Costos de Inventario' },
    { value: 'inventoryAudit', label: 'Auditoría de Inventario' }
  ];

  /** Tipo de reporte seleccionado */
  selectedReportType: string = '';
  /** Parámetros del reporte */
  reportParams: any = {};
  /** Datos del reporte */
  reportData: any[] = [];
  /** Encabezados del reporte */
  reportHeaders: string[] = [];

  /**
   * Constructor del componente.
   * @param {ReportService} reportService - Servicio de reportes.
   */
  constructor(private reportService: ReportService) { }

  /**
   * Genera el reporte basado en el tipo de reporte seleccionado y los parámetros proporcionados.
   * @returns {void}
   */
  generateReport(): void {
    if (!this.selectedReportType) {
      alert('Seleccione un tipo de reporte');
      return;
    }

    this.reportData = this.reportService.generateReport(this.selectedReportType, this.reportParams).map(row => {
      const newRow: { [key: string]: any } = {};
      Object.keys(row).forEach(key => {
        newRow[key.toLowerCase()] = row[key];
      });
      return newRow;
    });
    this.reportHeaders = this.reportService.getReportHeaders(this.selectedReportType);
  }

  /**
   * Descarga el reporte generado en formato Excel.
   * @returns {void}
   */
  downloadExcel(): void {
    if (this.reportData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.reportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `${this.selectedReportType}.xlsx`);
  }

  /**
   * Restablece los parámetros y los datos del reporte.
   * @returns {void}
   */
  resetParams(): void {
    this.reportParams = {};
    this.reportData = [];
    this.reportHeaders = [];
  }
}
