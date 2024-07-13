import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileComponent } from './user-profile-component.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let authService: AuthService;

  const mockAuthService = {
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'User',
      password: 'password',
      profilePicture: 'assets/img/fondos/profile-picture.webp'
    }),
    updateCurrentUser: jasmine.createSpy('updateCurrentUser'),
    updateUserInList: jasmine.createSpy('updateUserInList')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent, FormsModule, CommonModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(component.user).toEqual({
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'User',
      password: 'password',
      profilePicture: 'assets/img/fondos/profile-picture.webp'
    });
    expect(component.profilePicturePreview).toBe('assets/img/fondos/profile-picture.webp');
  });

  it('should toggle edit mode', () => {
    expect(component.editMode).toBe(false);
    component.toggleEditMode();
    expect(component.editMode).toBe(true);
    component.toggleEditMode();
    expect(component.editMode).toBe(false);
  });

  it('should not save user profile if form is invalid', () => {
    const form = new NgForm([], []);
    spyOnProperty(form.form, 'valid').and.returnValue(false);

    component.onSaveUserProfile(form);

    expect(authService.updateCurrentUser).not.toHaveBeenCalled();
    expect(authService.updateUserInList).not.toHaveBeenCalled();
  });

});
