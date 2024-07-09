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
  /** Nuevo usuario a ser registrado */
  newUser: User = { id: '', firstName: '', lastName: '', email: '', password: '', role: 'User' };
  /** Repetición de la contraseña del nuevo usuario */
  repeatPassword: string = '';
  /** Mensaje de error durante el registro */
  registerError: string = '';
  /** Mensaje de éxito durante el registro */
  registerSuccess: string = '';
  /** Lista de todos los usuarios */
  users: User[] = [];
  /** Lista de usuarios filtrados */
  filteredUsers: User[] = [];
  /** Término de búsqueda para filtrar usuarios */
  searchUserTerm: string = '';
  /** Usuario seleccionado para ver o editar */
  selectedUser: User = { id: '', firstName: '', lastName: '', email: '', password: '', role: 'User' };

  /**
   * Constructor del componente.
   * @param {UserService} userService - Servicio de usuarios.
   */
  constructor(private userService: UserService) {}

  /**
   * Inicializa el componente cargando los usuarios existentes.
   * @returns {void}
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga los usuarios desde el servicio.
   * @returns {void}
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  /**
   * Maneja el registro de un nuevo usuario.
   * @param {NgForm} form - Formulario del nuevo usuario.
   * @returns {void}
   */
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

      this.newUser.id = this.generateUserId(); // Genera un ID único

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

  /**
   * Genera un ID único para un usuario.
   * @returns {string} ID único generado.
   */
  generateUserId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Filtra los usuarios según el término de búsqueda.
   * @returns {void}
   */
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

  /**
   * Abre el modal para agregar un nuevo usuario.
   * @returns {void}
   */
  openUserModal(): void {
    const userModal = new bootstrap.Modal(document.getElementById('userModal')!);
    userModal.show();
  }

  /**
   * Guarda un nuevo usuario.
   * @param {NgForm} form - Formulario del nuevo usuario.
   * @returns {void}
   */
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

      this.newUser.id = this.generateUserId(); // Genera un ID único

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

  /**
   * Muestra la información de un usuario.
   * @param {User} user - Usuario seleccionado.
   * @returns {void}
   */
  viewUser(user: User): void {
    this.selectedUser = user;
    const userInfoModal = new bootstrap.Modal(document.getElementById('userInfoModal')!);
    userInfoModal.show();
  }

  /**
   * Edita la información de un usuario.
   * @param {User} user - Usuario a editar.
   * @returns {void}
   */
  editUser(user: User): void {
    this.selectedUser = { ...user };
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal')!);
    editUserModal.show();
  }

  /**
   * Guarda los cambios de un usuario editado.
   * @param {NgForm} form - Formulario del usuario editado.
   * @returns {void}
   */
  onSaveEditUser(form: NgForm): void {
    if (form.valid) {
      this.userService.updateUser(this.selectedUser).then(() => {
        this.loadUsers();
        const editUserModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal')!);
        editUserModal?.hide();
      });
    }
  }

  /**
   * Alterna la visibilidad de la contraseña.
   * @returns {void}
   */
  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('editPassword') as HTMLInputElement;
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
    } else {
      passwordField.type = 'password';
    }
  }

  /**
   * Elimina un usuario seleccionado.
   * @param {User} user - Usuario a eliminar.
   * @returns {void}
   */
  deleteUser(user: User): void {
    this.selectedUser = user;
    const confirmDeleteUserModal = new bootstrap.Modal(document.getElementById('confirmDeleteUserModal')!);
    confirmDeleteUserModal.show();
  }

  /**
   * Confirma la eliminación de un usuario.
   * @returns {void}
   */
  onConfirmDeleteUser(): void {
    this.userService.deleteUser(this.selectedUser.id!).then(() => {
      this.loadUsers();
      const confirmDeleteUserModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteUserModal')!);
      confirmDeleteUserModal?.hide();
    });
  }

  /**
   * Restablece el formulario y los mensajes de error o éxito.
   * @param {NgForm} form - Formulario a restablecer.
   * @param {'user' | 'product'} type - Tipo de formulario.
   * @returns {void}
   */
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
