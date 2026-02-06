import { getTenantApi } from '../api-client';
import type {
  TenantUserListResponse,
  TenantUserListItem,
  CreateTenantUserRequest,
  UpdateTenantUserRequest,
} from '@/types/api';

export interface TenantUserListParams {
  search?: string;
  role?: 'admin' | 'auditor' | 'user';
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export const tenantUsersService = {
  async list(params?: TenantUserListParams): Promise<TenantUserListResponse> {
    const api = getTenantApi();
    const response = await api.get<TenantUserListResponse>('/users', { params });
    return response.data;
  },

  async create(data: CreateTenantUserRequest): Promise<TenantUserListItem> {
    const api = getTenantApi();
    const response = await api.post<{ user: TenantUserListItem }>('/users', data);
    return response.data.user;
  },

  async update(id: string, data: UpdateTenantUserRequest): Promise<TenantUserListItem> {
    const api = getTenantApi();
    const response = await api.put<{ user: TenantUserListItem }>(`/users/${id}`, data);
    return response.data.user;
  },
};
