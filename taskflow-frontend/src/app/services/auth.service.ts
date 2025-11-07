import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) { }

  // Register new user
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Login user
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        // Save token and user data to local storage
        this.storageService.saveToken(response.token);
        this.storageService.saveUser(response.user);
      })
    );
  }

  // Update user profile
  updateProfile(data: { name: string; email: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data).pipe(
      tap(response => {
        if (response.user) {
          this.storageService.saveUser(response.user);
        }
      })
    );
  }

  // Logout user
  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  // Get current user from API
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.storageService.isLoggedIn();
  }

  // Get user from storage
  getUser(): User | null {
    return this.storageService.getUser();
  }

  // Get token from storage
  getToken(): string | null {
    return this.storageService.getToken();
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  // Change password
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, data);
  }

  // Update stored user (helper method)
  updateStoredUser(user: User): void {
    this.storageService.saveUser(user);
  }
}