import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserManagementComponent } from './user-management.component';
import { FormsModule, NgForm, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../service/user.service';
import { of } from 'rxjs';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userService: UserService;

  const mockUserService = {
    getUsers: jasmine.createSpy('getUsers').and.returnValue(of([
      { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'password', role: 'User' }
    ])),
    addUser: jasmine.createSpy('addUser').and.returnValue(Promise.resolve()),
    updateUser: jasmine.createSpy('updateUser').and.returnValue(Promise.resolve()),
    deleteUser: jasmine.createSpy('deleteUser').and.returnValue(Promise.resolve())
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, UserManagementComponent],
      providers: [{ provide: UserService, useValue: mockUserService }]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(userService.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(1);
  });

  it('should filter users based on search term', () => {
    component.searchUserTerm = 'test';
    component.onSearchUser();
    expect(component.filteredUsers.length).toBe(1);
  });

  it('should delete user', async () => {
    component.selectedUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'password', role: 'User' };
    await component.onConfirmDeleteUser();
    expect(userService.deleteUser).toHaveBeenCalledWith('1');
  });
});
