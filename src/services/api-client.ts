import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://admin.meusistema.localhost:8050/api';
const TENANT_BASE_DOMAIN = import.meta.env.VITE_TENANT_BASE_DOMAIN || 'meusistema.localhost';
const TENANT_API_PORT = import.meta.env.VITE_TENANT_API_PORT || '8050';

// Storage keys
export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_USER_KEY = 'admin_user';
export const TENANT_TOKEN_KEY = 'tenant_token';
export const TENANT_USER_KEY = 'tenant_user';

// Create axios instance for admin API
export const adminApi: AxiosInstance = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Create axios instance for tenant API
export const createTenantApi = (tenantSlug: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: `http://${tenantSlug}.${TENANT_BASE_DOMAIN}:${TENANT_API_PORT}/api`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Add auth interceptor
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TENANT_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add error interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(TENANT_TOKEN_KEY);
        localStorage.removeItem(TENANT_USER_KEY);
        window.location.href = '/tenant/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Add auth interceptor to admin API
adminApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error interceptor to admin API
adminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Helper to extract error message from API response
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> };
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];
      return firstError?.[0] || data.message || 'Erro desconhecido';
    }
    return data?.message || error.message || 'Erro de conexão';
  }
  return 'Erro desconhecido';
};
