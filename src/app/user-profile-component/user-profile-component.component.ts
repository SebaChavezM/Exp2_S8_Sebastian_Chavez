import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  birthday?: string;
  address?: string;
  profilePicture?: string;
}

@Component({
  selector: 'app-user-profile-component',
  standalone: true,
  templateUrl: './user-profile-component.component.html',
  styleUrl: './user-profile-component.component.css',
  imports: [FormsModule, CommonModule]
})
export class UserProfileComponent implements OnInit {
  /** Datos del usuario */
  user: User = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: ''
  };
  /** Indica si el modo edición está activo */
  editMode: boolean = false;
  /** Vista previa de la imagen de perfil */
  profilePicturePreview: string = '';

  /**
   * Constructor del componente.
   * @param {AuthService} authService - Servicio de autenticación.
   */
  constructor(private authService: AuthService) {}

  /**
   * Inicializa el componente cargando los datos del usuario.
   * @returns {void}
   */
  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Carga los datos del usuario actual desde el servicio de autenticación.
   * @returns {void}
   */
  loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      this.profilePicturePreview = currentUser.profilePicture || 'assets/img/fondos/profile picture.webp';
    }
  }

  /**
   * Alterna el modo edición.
   * @returns {void}
   */
  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  /**
   * Guarda el perfil del usuario si el formulario es válido.
   * @param {NgForm} form - Formulario del perfil de usuario.
   * @returns {void}
   */
  onSaveUserProfile(form: NgForm): void {
    if (form.valid) {
      this.authService.updateCurrentUser(this.user);
      this.authService.updateUserInList(this.user);
      this.toggleEditMode();
    }
  }

  /**
   * Cambia la imagen de perfil del usuario.
   * @param {Event} event - Evento de cambio del input de archivo.
   * @returns {void}
   */
  onProfilePictureChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicturePreview = reader.result as string;
        this.user.profilePicture = this.profilePicturePreview;
      };
      reader.readAsDataURL(file);
    }
  }
}
