import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InicioComponent } from './inicio.component';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('InicioComponent', () => {
  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ role: 'Admin' }),
      isRoleAllowed: jasmine.createSpy('isRoleAllowed').and.returnValue(true)
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, InicioComponent], // Importando el componente standalone aquí
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user role and welcome message on init', () => {
    component.ngOnInit();
    expect(component.userRole).toBe('Admin');
    expect(component.welcomeMessage).toBe('Bienvenido');
    expect(component['intervalId']).toBeDefined();
  });

  it('should clear interval on destroy', () => {
    component.ngOnInit();
    spyOn(window, 'clearInterval');
    component.ngOnDestroy();
    expect(window.clearInterval).toHaveBeenCalledWith(component['intervalId']);
  });

  it('should navigate to the correct dashboard based on user role', () => {
    component.navigateToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-dashboard']);

    mockAuthService.getCurrentUser.and.returnValue({ role: 'Área' });
    component.navigateToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/area-dashboard']);

    mockAuthService.getCurrentUser.and.returnValue({ role: 'Bodega' });
    component.navigateToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/bodega-dashboard']);

    mockAuthService.getCurrentUser.and.returnValue({ role: 'Auditor' });
    component.navigateToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auditor-dashboard']);
  });

  it('should navigate to specified page', () => {
    const page = '/some-page';
    component.navigateToPage(page);
    expect(mockRouter.navigate).toHaveBeenCalledWith([page]);
  });
});
