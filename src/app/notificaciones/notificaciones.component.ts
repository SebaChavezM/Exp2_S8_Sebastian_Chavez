import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

interface Product {
  code: string;
  name: string;
  description: string;
  model: string;
  brand: string;
  material: string;
  color: string;
  family: string;
  value: number;
  currency: string;
  unit: string;
  location: string;
  stock: number;
  bodega: string;
}

interface ModificationRequest {
  originalProduct: Product;
  requestedChanges: Partial<Product>;
  status: 'pending' | 'accepted' | 'rejected';
  requestedBy: string;
  responseMessage?: string;
}

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class NotificacionesComponent implements OnInit {
  modificationRequests: ModificationRequest[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadModificationRequests();
  }

  loadModificationRequests() {
    this.modificationRequests = JSON.parse(localStorage.getItem('modificationRequests') || '[]');
  }

  acceptModification(request: ModificationRequest) {
    request.status = 'accepted';
    this.saveModificationRequests();
    this.updateProduct(request.originalProduct, request.requestedChanges);
    alert('Modificación aceptada.');
  }

  rejectModification(request: ModificationRequest) {
    request.status = 'rejected';
    this.saveModificationRequests();
    alert('Modificación rechazada.');
  }

  saveModificationRequests() {
    localStorage.setItem('modificationRequests', JSON.stringify(this.modificationRequests));
  }

  updateProduct(originalProduct: Product, changes: Partial<Product>) {
    const products = JSON.parse(localStorage.getItem('bodegas') || '[]');
    const bodega = products.find((b: any) => b.name === originalProduct.bodega);
    const productIndex = bodega.products.findIndex((p: Product) => p.code === originalProduct.code);

    if (productIndex !== -1) {
      bodega.products[productIndex] = { ...originalProduct, ...changes };
      localStorage.setItem('bodegas', JSON.stringify(products));
    }
  }
}
