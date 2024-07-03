import { Injectable } from '@angular/core';
import { Product, Movimiento } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  generateReport(reportType: string, params: any): any[] {
    const products = this.loadProductsFromLocalStorage();
    const historial = this.loadHistorialFromLocalStorage();
    switch (reportType) {
      case 'generalInventory':
        return products.map(product => ({
          code: product.code,
          name: product.name,
          description: product.description,
          model: product.model,
          brand: product.brand,
          material: product.material,
          color: product.color,
          family: product.family,
          value: product.value,
          currency: product.currency,
          unit: product.unit,
          location: product.location,
          stock: product.stock,
          bodega: product.bodega
        }));
      
      case 'inventoryMovements':
        return historial
          .filter(mov => new Date(mov.fecha) >= new Date(params.startDate) && new Date(mov.fecha) <= new Date(params.endDate))
          .map(mov => ({
            tipo: mov.tipo,
            numero: mov.numero,
            fecha: mov.fecha,
            documento: mov.documento || '',
            detalles: mov.detalles,
            items: mov.items.map(item => `${item.code} (${item.cantidad})`).join(', '),
            usuario: mov.usuario,
            bodegaOrigen: mov.bodegaOrigen || '',
            bodegaDestino: mov.bodegaDestino || ''
          }));
      
      case 'lowStock':
        return products
          .filter(product => product.stock < params.threshold)
          .map(product => ({
            code: product.code,
            name: product.name,
            description: product.description,
            stock: product.stock,
            bodega: product.bodega
          }));
      
      case 'inventoryByWarehouse':
        return products
          .filter(product => product.bodega === params.bodega)
          .map(product => ({
            code: product.code,
            name: product.name,
            description: product.description,
            stock: product.stock,
            bodega: product.bodega
          }));
      
      case 'bestSellingProducts':
        const salesCounts = historial
          .filter(mov => mov.tipo === 'Salida')
          .flatMap(mov => mov.items)
          .reduce((acc, item) => {
            acc[item.code] = (acc[item.code] || 0) + item.cantidad;
            return acc;
          }, {} as { [code: string]: number });

        return Object.entries(salesCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, params.topN)
          .map(([code, count]) => ({
            code,
            name: products.find(product => product.code === code)?.name || '',
            salesCount: count
          }));
      
      case 'obsoleteProducts':
        const recentMovements = new Set(historial
          .filter(mov => new Date(mov.fecha) >= new Date(params.cutoffDate))
          .flatMap(mov => mov.items.map(item => item.code)));

        return products
          .filter(product => product.stock > 0 && !recentMovements.has(product.code))
          .map(product => ({
            code: product.code,
            name: product.name,
            stock: product.stock,
            lastMovementDate: historial
              .filter(mov => mov.items.some(item => item.code === product.code))
              .map(mov => mov.fecha)
              .sort()
              .pop() || 'N/A'
          }));
      
      case 'inventoryTurnover':
        return products.map(product => ({
          code: product.code,
          name: product.name,
          stock: product.stock,
          averageStock: (product.stock + (params.initialStock[product.code] || 0)) / 2,
          turnover: product.value === 0 ? 0 : ((product.stock + (params.initialStock[product.code] || 0)) / 2) / product.value
        }));
      
      case 'inventoryDiscrepancies':
        return products
          .filter(product => product.stock !== params.physicalCounts[product.code])
          .map(product => ({
            code: product.code,
            name: product.name,
            expectedStock: product.stock,
            actualStock: params.physicalCounts[product.code],
            discrepancy: product.stock - params.physicalCounts[product.code]
          }));
      
      case 'inventoryCosts':
        return products.map(product => ({
          code: product.code,
          name: product.name,
          description: product.description,
          cost: product.value * product.stock,
          currency: product.currency,
          bodega: product.bodega
        }));
      
      case 'inventoryAudit':
        return products.map(product => ({
          code: product.code,
          name: product.name,
          description: product.description,
          stock: product.stock,
          bodega: product.bodega
        }));
      
      default:
        return [];
    }
  }

  getReportHeaders(reportType: string): string[] {
    switch (reportType) {
      case 'generalInventory':
        return ['code', 'name', 'description', 'model', 'brand', 'material', 'color', 'family', 'value', 'currency', 'unit', 'location', 'stock', 'bodega'];
      case 'inventoryMovements':
        return ['tipo', 'numero', 'fecha', 'documento', 'detalles', 'items', 'usuario', 'bodegaOrigen', 'bodegaDestino'];
      case 'lowStock':
        return ['code', 'name', 'description', 'stock', 'bodega'];
      case 'inventoryByWarehouse':
        return ['code', 'name', 'description', 'stock', 'bodega'];
      case 'bestSellingProducts':
        return ['code', 'name', 'salesCount'];
      case 'obsoleteProducts':
        return ['code', 'name', 'stock', 'lastMovementDate'];
      case 'inventoryTurnover':
        return ['code', 'name', 'stock', 'averageStock', 'turnover'];
      case 'inventoryDiscrepancies':
        return ['code', 'name', 'expectedStock', 'actualStock', 'discrepancy'];
      case 'inventoryCosts':
        return ['code', 'name', 'description', 'cost', 'currency', 'bodega'];
      case 'inventoryAudit':
        return ['code', 'name', 'description', 'stock', 'bodega'];
      default:
        return [];
    }
  }

  private loadProductsFromLocalStorage(): Product[] {
    return JSON.parse(localStorage.getItem('products')!) || [];
  }

  private loadHistorialFromLocalStorage(): Movimiento[] {
    return JSON.parse(localStorage.getItem('historial')!) || [];
  }
}
