import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { UserService, User } from '../service/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class UserManagementComponent implements OnInit {
  newUser: User = { firstName: '', lastName: '', email: '', password: '', role: 'User' };
  repeatPassword: string = '';
  registerError: string = '';
  registerSuccess: string = '';
  users: User[] = [];
  filteredUsers: User[] = [];
  searchUserTerm: string = '';
  selectedUser: User = { firstName: '', lastName: '', email: '', password: '', role: 'User' };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  onRegister(form: NgForm): void {
    if (form.valid) {
      if (this.newUser.password !== this.repeatPassword) {
        this.registerError = 'Las contraseñas no coinciden.';
        return;
      }

      const existingUser = this.users.find(user => user.email === this.newUser.email);
      if (existingUser) {
        this.registerError = 'El usuario ya existe. Por favor, intente con otro email.';
        this.registerSuccess = '';
        return;
      }

      this.userService.addUser(this.newUser).then(() => {
        this.registerSuccess = 'Usuario registrado exitosamente.';
        this.registerError = '';
        this.loadUsers();
        form.resetForm();
        const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal')!);
        userModal?.hide();
      });
    }
  }

  onSearchUser(): void {
    if (this.searchUserTerm) {
      this.filteredUsers = this.users.filter(user =>
        user.firstName.toLowerCase().includes(this.searchUserTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchUserTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchUserTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchUserTerm.toLowerCase())
      );
    } else {
      this.filteredUsers = this.users;
    }
  }

  openUserModal(): void {
    const userModal = new bootstrap.Modal(document.getElementById('userModal')!);
    userModal.show();
  }

  onSaveUser(form: NgForm): void {
    form.form.markAllAsTouched();
    if (form.valid) {
      if (this.newUser.password !== this.repeatPassword) {
        this.registerError = 'Las claves no coinciden.';
        return;
      }

      const existingUser = this.users.find(user => user.email === this.newUser.email);
      if (existingUser) {
        this.registerError = 'El usuario ya existe. Por favor, intente con otro correo.';
        this.registerSuccess = '';
        return;
      }

      this.userService.addUser(this.newUser).then(() => {
        this.registerSuccess = 'Usuario registrado exitosamente.';
        this.registerError = '';
        this.loadUsers();
        this.resetForm(form, 'user');
      });
    } else {
      this.registerError = 'Por favor complete todos los campos correctamente.';
      const formElement = document.querySelector('form.needs-validation-user');
      if (formElement) {
        formElement.classList.add('was-validated');
      }
    }
  }

  viewUser(user: User): void {
    this.selectedUser = user;
    const userInfoModal = new bootstrap.Modal(document.getElementById('userInfoModal')!);
    userInfoModal.show();
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal')!);
    editUserModal.show();
  }

  onSaveEditUser(form: NgForm): void {
    if (form.valid) {
      this.userService.updateUser(this.selectedUser).then(() => {
        this.loadUsers();
        const editUserModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal')!);
        editUserModal?.hide();
      });
    }
  }

  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('editPassword') as HTMLInputElement;
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
    } else {
      passwordField.type = 'password';
    }
  }

  deleteUser(user: User): void {
    this.selectedUser = user;
    const confirmDeleteUserModal = new bootstrap.Modal(document.getElementById('confirmDeleteUserModal')!);
    confirmDeleteUserModal.show();
  }

  onConfirmDeleteUser(): void {
    this.userService.deleteUser(this.selectedUser.id!).then(() => {
      this.loadUsers();
      const confirmDeleteUserModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteUserModal')!);
      confirmDeleteUserModal?.hide();
    });
  }

  resetForm(form: NgForm, type: 'user' | 'product'): void {
    form.resetForm();
    if (type === 'user') {
      this.newUser = { firstName: '', lastName: '', email: '', password: '', role: 'User' };
      this.repeatPassword = '';
      this.registerError = '';
      this.registerSuccess = '';
    }
    const formElement = document.querySelector(`form.needs-validation-${type}`);
    if (formElement) {
      formElement.classList.remove('was-validated');
    }
  }
}
