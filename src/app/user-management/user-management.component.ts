import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

/**
 * Interfaz para representar a un usuario.
 * @interface
 */
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class UserManagementComponent implements OnInit {
  newUser: User = { id: '', firstName: '', lastName: '', email: '', password: '', role: 'User' };
  repeatPassword: string = '';
  registerError: string = '';
  registerSuccess: string = '';
  users: User[] = [];
  filteredUsers: User[] = [];
  searchUserTerm: string = '';
  selectedUser: User = { id: '', firstName: '', lastName: '', email: '', password: '', role: 'User' };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    this.users = users;
    this.filteredUsers = users;
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

      this.users.push({ ...this.newUser });
      localStorage.setItem('users', JSON.stringify(this.users));
      this.registerSuccess = 'Usuario registrado exitosamente.';
      this.registerError = '';
      this.loadUsers();
      form.resetForm();
      const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal')!);
      userModal?.hide();
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

      this.users.push({ ...this.newUser });
      localStorage.setItem('users', JSON.stringify(this.users));
      this.registerSuccess = 'Usuario registrado exitosamente.';
      this.registerError = '';
      this.loadUsers();
      this.resetForm(form, 'user');
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
      const index = this.users.findIndex(u => u.id === this.selectedUser.id);
      if (index !== -1) {
        this.users[index] = { ...this.selectedUser };
        localStorage.setItem('users', JSON.stringify(this.users));
        this.loadUsers();
        const editUserModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal')!);
        editUserModal?.hide();
      }
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
    const index = this.users.findIndex(u => u.id === this.selectedUser.id);
    if (index > -1) {
      this.users.splice(index, 1);
      localStorage.setItem('users', JSON.stringify(this.users));
      this.loadUsers();
      const confirmDeleteUserModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteUserModal')!);
      confirmDeleteUserModal?.hide();
    }
  }

  resetForm(form: NgForm, type: 'user' | 'product'): void {
    form.resetForm();
    if (type === 'user') {
      this.newUser = { id: '', firstName: '', lastName: '', email: '', password: '', role: 'User' };
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
