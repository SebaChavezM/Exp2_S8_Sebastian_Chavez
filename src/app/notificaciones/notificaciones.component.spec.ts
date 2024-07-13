import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificacionesComponent } from './notificaciones.component';
import { AuthService } from '../auth/auth.service';
import { ProductService, Product } from '../service/product.service';
import { NotificationService } from '../service/notificacion.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('NotificacionesComponent', () => {
  let component: NotificacionesComponent;
  let fixture: ComponentFixture<NotificacionesComponent>;
  let mockAuthService: any;
  let mockProductService: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockAuthService = {
      isBodega: jasmine.createSpy('isBodega').and.returnValue(true)
    };

    mockProductService = {
      getNotifications: jasmine.createSpy('getNotifications').and.returnValue([
        { id: 1, status: 'pending', message: 'Test Notification 1', solicitadaPor: 'User 1', productoOriginal: {}, cambiosSolicitados: {} },
        { id: 2, status: 'accepted', message: 'Test Notification 2', solicitadaPor: 'User 2', productoOriginal: {}, cambiosSolicitados: {} }
      ]),
      updateProduct: jasmine.createSpy('updateProduct'),
      updateNotificationStatus: jasmine.createSpy('updateNotificationStatus'),
      updateNotifications: jasmine.createSpy('updateNotifications')
    };

    mockNotificationService = {
      setPendingCount: jasmine.createSpy('setPendingCount')
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NotificacionesComponent // Importamos el componente standalone directamente
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ProductService, useValue: mockProductService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with notifications and set isBodega', () => {
    component.ngOnInit();
    expect(component.notifications.length).toBe(2);
    expect(component.isBodega).toBe(true);
  });

  it('should update pending notifications count', () => {
    component.loadNotifications();
    expect(component.pendingNotificationsCount).toBe(1);
    expect(mockNotificationService.setPendingCount).toHaveBeenCalledWith(1);
  });

  it('should open modal with selected notification', () => {
    const notification = { id: 1, status: 'pending', message: 'Test Notification 1', solicitadaPor: 'User 1', productoOriginal: {}, cambiosSolicitados: {} };
    component.openModal(notification);
    expect(component.selectedNotification).toBe(notification);
  });

  it('should accept modification and update notifications', () => {
    const notification = { id: 1, status: 'pending', message: 'Test Notification 1', solicitadaPor: 'User 1', productoOriginal: { code: '123' }, cambiosSolicitados: { name: 'New Name' } };
    component.selectedNotification = notification;
    component.acceptModification();
    expect(mockProductService.updateProduct).toHaveBeenCalledWith('123', { name: 'New Name' });
    expect(mockProductService.updateNotificationStatus).toHaveBeenCalledWith(1, 'accepted');
    expect(component.selectedNotification.status).toBe('accepted');
    expect(mockProductService.updateNotifications).toHaveBeenCalledWith(component.notifications);
  });

  it('should reject modification and update notifications', () => {
    const notification = { id: 1, status: 'pending', message: 'Test Notification 1', solicitadaPor: 'User 1', productoOriginal: {}, cambiosSolicitados: {} };
    component.selectedNotification = notification;
    component.rejectModification();
    expect(mockProductService.updateNotificationStatus).toHaveBeenCalledWith(1, 'rejected');
    expect(component.selectedNotification.status).toBe('rejected');
    expect(mockProductService.updateNotifications).toHaveBeenCalledWith(component.notifications);
  });

  it('should detect field changes correctly', () => {
    const notification = { id: 1, status: 'pending', message: 'Test Notification 1', solicitadaPor: 'User 1', productoOriginal: { name: 'Old Name' }, cambiosSolicitados: { name: 'New Name' } };
    component.selectedNotification = notification;
    expect(component.hasChanged('name')).toBe(true);
    expect(component.hasChanged('code')).toBe(false);
  });

  it('should translate status correctly', () => {
    expect(component.translateStatus('pending')).toBe('Pendiente');
    expect(component.translateStatus('accepted')).toBe('Aceptado');
    expect(component.translateStatus('rejected')).toBe('Rechazado');
    expect(component.translateStatus(undefined)).toBe('');
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('pending')).toBe('text-warning');
    expect(component.getStatusClass('accepted')).toBe('text-success');
    expect(component.getStatusClass('rejected')).toBe('text-danger');
    expect(component.getStatusClass(undefined)).toBe('');
  });
});
