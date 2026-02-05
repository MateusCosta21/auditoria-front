import { adminApi } from '../api-client';
import type {
  Tenant,
  TenantListResponse,
  CreateTenantRequest,
  CreateTenantResponse,
  ToggleStatusResponse
} from '@/types/api';

export interface ListTenantsParams {
  search?: string;
  active?: boolean;
}

export const tenantsService = {
  async list(params?: ListTenantsParams): Promise<TenantListResponse> {
    const response = await adminApi.get<TenantListResponse>('/admin/tenants', { params });
    return response.data;
  },

  async getById(id: string): Promise<Tenant> {
    const response = await adminApi.get<Tenant>(`/admin/tenants/${id}`);
    return response.data;
  },

  async create(data: CreateTenantRequest): Promise<CreateTenantResponse> {
    const response = await adminApi.post<CreateTenantResponse>('/admin/tenants', data);
    return response.data;
  },

  async toggleStatus(id: string): Promise<ToggleStatusResponse> {
    const response = await adminApi.patch<ToggleStatusResponse>(`/admin/tenants/${id}/toggle-status`);
    return response.data;
  },
};
