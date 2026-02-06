import { getTenantApi, TENANT_TOKEN_KEY, TENANT_USER_KEY } from '../api-client';
import type { TenantUser, TenantLoginResponse } from '@/types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const tenantAuthService = {
  async login(credentials: LoginCredentials): Promise<TenantLoginResponse> {
    const api = getTenantApi();
    const response = await api.post<TenantLoginResponse>('/auth/login', credentials);

    localStorage.setItem(TENANT_TOKEN_KEY, response.data.access_token);
    localStorage.setItem(TENANT_USER_KEY, JSON.stringify(response.data.user));

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      const api = getTenantApi();
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TENANT_TOKEN_KEY);
      localStorage.removeItem(TENANT_USER_KEY);
    }
  },

  async getMe(): Promise<TenantUser> {
    const api = getTenantApi();
    const response = await api.get<{ user: TenantUser }>('/me');
    return response.data.user;
  },

  getStoredUser(): TenantUser | null {
    const userData = localStorage.getItem(TENANT_USER_KEY);
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
    return localStorage.getItem(TENANT_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
