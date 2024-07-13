import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { LoginComponent } from './login.component';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      login: jasmine.createSpy('login')
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        LoginComponent // Importamos el componente standalone directamente
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set loginError if authService.login returns false', () => {
    const form = { valid: true } as NgForm;
    component.email = 'test@example.com';
    component.password = 'wrongpassword';

    mockAuthService.login.and.returnValue(false);

    component.onSubmit(form);

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(component.loginError).toBe('Credenciales incorrectas');
  });

  it('should not call authService.login on form submit if form is invalid', () => {
    const form = { valid: false } as NgForm;
    component.onSubmit(form);

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should verify email and set emailValid to false if email is not found', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify([{ email: 'user@example.com' }]));
    component.recoveryEmail = 'notfound@example.com';

    component.verifyEmail();

    expect(component.emailValid).toBeFalse();
    expect(component.emailError).toBe('Este correo no pertenece a la empresa.');
  });

  it('should verify email and show next step if email is found', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify([{ email: 'user@example.com' }]));
    spyOn(component, 'showStep');
    component.recoveryEmail = 'user@example.com';

    component.verifyEmail();

    expect(component.emailValid).toBeTrue();
    expect(component.showStep).toHaveBeenCalledWith(2);
  });

  it('should send notification and call showStep if form is valid and user is adult', () => {
    const form = { valid: true, form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') } } as any;
    spyOn(localStorage, 'getItem').and.returnValue('[]');
    spyOn(localStorage, 'setItem');
    spyOn(window, 'alert');
    spyOn(component, 'showStep');

    component.recoveryEmail = 'user@example.com';
    component.fullName = 'Test User';
    component.birthDate = '2000-01-01';
    component.workArea = 'IT';
    component.supervisor = 'Supervisor';
    component.isAdult = true;

    component.sendNotification(form);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Notificación enviada al administrador.');
    expect(component.showStep).toHaveBeenCalledWith(3);
  });

  it('should mark all form controls as touched if form is invalid or user is not adult', () => {
    const form = { valid: false, form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') } } as any;
    component.sendNotification(form);

    expect(form.form.markAllAsTouched).toHaveBeenCalled();
  });

  it('should validate age correctly', () => {
    const event = { target: { value: '2000-01-01' } };
    component.validateAge(event);

    expect(component.isAdult).toBeTrue();
  });

  it('should invalidate age if user is under 18', () => {
    const event = { target: { value: '2010-01-01' } };
    component.validateAge(event);

    expect(component.isAdult).toBeFalse();
  });

  it('should reset modal fields correctly', () => {
    spyOn(component, 'showStep');

    component.resetModal();

    expect(component.recoveryEmail).toBe('');
    expect(component.fullName).toBe('');
    expect(component.birthDate).toBe('');
    expect(component.workArea).toBe('');
    expect(component.supervisor).toBe('');
    expect(component.emailError).toBe('');
    expect(component.emailValid).toBeTrue();
    expect(component.isAdult).toBeTrue();
    expect(component.showStep).toHaveBeenCalledWith(1);
  });
});
