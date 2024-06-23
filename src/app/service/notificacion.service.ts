// src/app/service/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private pendingCount = new BehaviorSubject<number>(0);
  pendingCount$ = this.pendingCount.asObservable();

  setPendingCount(count: number) {
    this.pendingCount.next(count);
  }
}
