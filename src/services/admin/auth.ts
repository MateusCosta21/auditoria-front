import { adminApi, ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from '../api-client';
import type { Admin, AdminLoginResponse } from '@/types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const adminAuthService = {
  async login(credentials: LoginCredentials): Promise<AdminLoginResponse> {
    const response = await adminApi.post<AdminLoginResponse>('/admin/auth/login', credentials);

    // Store token and user data
    localStorage.setItem(ADMIN_TOKEN_KEY, response.data.access_token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.data.admin));

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await adminApi.post('/admin/auth/logout');
    } finally {
      // Always clear local storage
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    }
  },

  async getMe(): Promise<Admin> {
    const response = await adminApi.get<{ admin: Admin }>('/admin/me');
    return response.data.admin;
  },

  getStoredUser(): Admin | null {
    const userData = localStorage.getItem(ADMIN_USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
