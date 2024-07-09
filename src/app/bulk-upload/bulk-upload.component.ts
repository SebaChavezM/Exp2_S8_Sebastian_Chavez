import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ProductService, Product } from '../service/product.service';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css'],
  standalone: true,
  imports: [CommonModule]
})
/**
 * Componente para la carga masiva de productos desde un archivo Excel.
 * 
 * @class BulkUploadComponent
 */
export class BulkUploadComponent {
  /**
   * Vista previa de los productos cargados desde el archivo.
   * 
   * @type {Product[]}
   * @memberof BulkUploadComponent
   */
  productsPreview: Product[] = [];

  /**
   * Mensajes de error encontrados durante el procesamiento del archivo.
   * 
   * @type {string[]}
   * @memberof BulkUploadComponent
   */
  errorMessages: string[] = [];

  /**
   * Indicador para deshabilitar el botón de confirmación.
   * 
   * @type {boolean}
   * @memberof BulkUploadComponent
   */
  disableConfirmButton = false;

  /**
   * Crea una instancia de BulkUploadComponent.
   * 
   * @param {ProductService} productService Servicio de productos.
   * @memberof BulkUploadComponent
   */
  constructor(private productService: ProductService) { }

  /**
   * Maneja el cambio de archivo y procesa su contenido.
   * 
   * @param {Event} event Evento de cambio de archivo.
   * @memberof BulkUploadComponent
   */
  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      this.processData(data);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  /**
   * Procesa los datos leídos del archivo Excel.
   * 
   * @param {any} data Datos leídos del archivo Excel.
   * @memberof BulkUploadComponent
   */
  processData(data: any): void {
    this.productsPreview = [];
    this.errorMessages = [];
    this.disableConfirmButton = false;
    const validBodegas = new Set(this.productService.getAllBodegas().map((b: string) => b.toUpperCase()));

    const products = this.productService.getAllProducts().map(p => p.code.toUpperCase());
    const newProductCodes = new Set<string>();

    for (let i = 1; i < data.length; ++i) {
      const row = data[i];
      if (row.length >= 14) {
        const product: Product = {
          code: row[0].trim().toUpperCase(),
          name: row[1].trim().toUpperCase(),
          description: row[2].trim().toUpperCase(),
          model: row[3].trim().toUpperCase(),
          brand: row[4].trim().toUpperCase(),
          material: row[5].trim().toUpperCase(),
          color: row[6].trim().toUpperCase(),
          family: row[7].trim().toUpperCase(),
          value: Number(row[8]),
          currency: row[9].trim().toUpperCase(),
          unit: row[10].trim().toUpperCase(),
          location: row[11].trim().toUpperCase(),
          stock: Number(row[12]),
          bodega: row[13].trim().toUpperCase()
        };

        if (products.includes(product.code)) {
          this.errorMessages.push(`Código duplicado encontrado: ${product.code}`);
        }

        if (newProductCodes.has(product.code)) {
          this.errorMessages.push(`Código duplicado en archivo: ${product.code}`);
        }

        if (!validBodegas.has(product.bodega)) {
          this.errorMessages.push(`Bodega no válida: ${product.bodega}`);
        }

        if (product.value < 0) {
          this.errorMessages.push(`Valor negativo en producto: ${product.code}`);
        }

        if (product.stock < 0) {
          this.errorMessages.push(`Stock negativo en producto: ${product.code}`);
        }

        if (this.errorMessages.length === 0) {
          this.productsPreview.push(product);
        }

        newProductCodes.add(product.code);
      } else {
        this.errorMessages.push(`Fila ${i + 1} tiene menos de 14 columnas, no se agregará.`);
      }
    }

    if (this.errorMessages.length > 0) {
      this.disableConfirmButton = true;
    }
  }

  /**
   * Confirma la carga masiva de productos.
   * 
   * @memberof BulkUploadComponent
   */
  confirmBulkUpload(): void {
    if (this.errorMessages.length === 0) {
      this.productService.addProducts(this.productsPreview);
      this.resetModal();
    }
  }

  /**
   * Limpia el archivo seleccionado y los datos de vista previa.
   * 
   * @memberof BulkUploadComponent
   */
  clearFile(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.value = '';
    this.productsPreview = [];
    this.errorMessages = [];
    this.disableConfirmButton = false;
  }

  /**
   * Reinicia el modal de carga.
   * 
   * @memberof BulkUploadComponent
   */
  resetModal(): void {
    this.clearFile();
    const modal = document.querySelector('.modal.show') as HTMLElement;
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }
}
