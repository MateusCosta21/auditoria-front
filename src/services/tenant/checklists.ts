import { getTenantApi } from '../api-client';
import type { ChecklistListResponse, ChecklistDetail, SaveChecklistRequest } from '@/types/api';

export interface ChecklistListParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const checklistsService = {
  async list(params?: ChecklistListParams): Promise<ChecklistListResponse> {
    const api = getTenantApi();
    const response = await api.get<ChecklistListResponse>('/checklists', { params });
    return response.data;
  },

  async getById(id: number): Promise<ChecklistDetail> {
    const api = getTenantApi();
    const response = await api.get<ChecklistDetail>(`/checklists/${id}`);
    return response.data;
  },

  async create(data: SaveChecklistRequest): Promise<ChecklistDetail> {
    const api = getTenantApi();
    const response = await api.post<ChecklistDetail>('/checklists', data);
    return response.data;
  },

  async update(id: number, data: SaveChecklistRequest): Promise<ChecklistDetail> {
    const api = getTenantApi();
    const response = await api.put<ChecklistDetail>(`/checklists/${id}`, data);
    return response.data;
  },

  async duplicate(id: number): Promise<ChecklistDetail> {
    const api = getTenantApi();
    const response = await api.post<ChecklistDetail>(`/checklists/${id}/duplicate`);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    const api = getTenantApi();
    await api.delete(`/checklists/${id}`);
  },
};
