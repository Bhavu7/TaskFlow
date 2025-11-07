export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}