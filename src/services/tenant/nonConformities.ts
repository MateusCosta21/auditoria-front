import { getTenantApi } from '../api-client';
import type { NonConformityListResponse, NonConformityDetail } from '@/types/api';

export interface NonConformityListParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const nonConformitiesService = {
  async list(params?: NonConformityListParams): Promise<NonConformityListResponse> {
    const api = getTenantApi();
    const response = await api.get<NonConformityListResponse>('/non-conformities', { params });
    return response.data;
  },

  async getById(id: number): Promise<NonConformityDetail> {
    const api = getTenantApi();
    const response = await api.get<NonConformityDetail>(`/non-conformities/${id}`);
    return response.data;
  },

  async update(id: number, formData: FormData): Promise<NonConformityDetail> {
    const api = getTenantApi();
    const response = await api.patch<NonConformityDetail>(`/non-conformities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
