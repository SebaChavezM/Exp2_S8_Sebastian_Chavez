export interface OrdenCompra {
  numero: number;
  proveedor: Proveedor | null;
  fecha: string;
  items: OrdenCompraItem[];
  totalNeto: number;
  iva: number;
  total: number;
  estado: string;
  formaPago: string;
  plazoEntrega: number;
  generadoPor: string;
  centroCosto: string;
  numeroCotizacion: string;
  numeroOEVDGG: string;
  documentoTipo: string;
  pedidoFabrica: string;
  solicitadoPor: string;
  nota: string;
  pdfUrl?: string;  // Agregar esta línea
}

export interface OrdenCompraItem {
  item: number;
  codigo: string;
  descripcion: string;
  descuento: number;
  tipoMoneda: string;
  cantidad: number;
  unidad: string;
  precio: number;
  total: number;
  plazoEntrega: number;
  fechaEntregaEstimada: string;
  documentoTipo: string;
  pedidoFabrica: string;
  bodega?: string;
  recepcionada?: number;
  factura?: string;
}


import { Proveedor } from './proveedor.model';

