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
  user: User = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: ''
  };
  editMode: boolean = false;
  profilePicturePreview: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      this.profilePicturePreview = currentUser.profilePicture || 'assets/img/fondos/profile picture.webp';
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  onSaveUserProfile(form: NgForm) {
    if (form.valid) {
      this.authService.updateCurrentUser(this.user);
      this.authService.updateUserInList(this.user);
      this.toggleEditMode();
    }
  }

  onProfilePictureChange(event: any) {
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