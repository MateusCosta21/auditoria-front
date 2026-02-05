// Admin types
export interface Admin {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  admin: Admin;
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  domain?: string;
  domains?: string[];
  data?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface TenantListResponse {
  data: Tenant[];
  total: number;
}

export interface CreateTenantRequest {
  tenant_name: string;
  tenant_slug: string;
  tenant_subdomain?: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface CreateTenantResponse {
  message: string;
  tenant_id: string;
  domain: string;
  tenant_db: string;
  admin_created: boolean;
}

export interface ToggleStatusResponse {
  message: string;
  is_active: boolean;
}

// Tenant User types (for tenant portal)
export interface TenantUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantLoginResponse {
  access_token: string;
  token_type: string;
  user: TenantUser;
}

// API Error
export interface ApiError {
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
