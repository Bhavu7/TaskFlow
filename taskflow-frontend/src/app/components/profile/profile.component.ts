import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  profileForm = {
    name: '',
    email: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isEditingProfile = false;
  isChangingPassword = false;

  profileLoading = false;
  passwordLoading = false;

  profileMessage = '';
  profileError = '';
  passwordMessage = '';
  passwordError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this.profileForm = {
        name: this.user.name,
        email: this.user.email
      };
    }
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    this.profileMessage = '';
    this.profileError = '';
    if (!this.isEditingProfile) {
      this.loadUserProfile(); // Reset form
    }
  }

  updateProfile(): void {
    this.profileLoading = true;

    this.authService.updateProfile(this.profileForm).subscribe({
      next: (response) => {
        this.profileLoading = false;
        this.toastService.success('Profile Updated', 'Your profile has been updated successfully');
        this.isEditingProfile = false;

        if (response.user) {
          this.authService.updateStoredUser(response.user);
          this.user = response.user;
        }
      },
      error: (error) => {
        this.profileLoading = false;
        this.toastService.error('Update Failed', error.error?.message || 'Failed to update profile');
      }
    });
  }

  toggleChangePassword(): void {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordMessage = '';
    this.passwordError = '';
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastService.warning('Validation Error', 'New passwords do not match');
      return;
    }

    this.passwordLoading = true;

    const data = {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    };

    this.authService.changePassword(data).subscribe({
      next: (response) => {
        this.passwordLoading = false;
        this.toastService.success('Password Changed', 'Your password has been changed successfully');
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.isChangingPassword = false;
      },
      error: (error) => {
        this.passwordLoading = false;
        this.toastService.error('Change Failed', error.error?.message || 'Failed to change password');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
