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

  selectedReportType: string = '';
  reportParams: any = {};
  reportData: any[] = [];
  reportHeaders: string[] = [];

  constructor(private reportService: ReportService) { }

  generateReport() {
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

  downloadExcel() {
    if (this.reportData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.reportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `${this.selectedReportType}.xlsx`);
  }

  resetParams() {
    this.reportParams = {};
    this.reportData = [];
    this.reportHeaders = [];
  }
}
