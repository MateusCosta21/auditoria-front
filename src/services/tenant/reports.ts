import { getTenantApi } from '../api-client';
import type { ReportListResponse } from '@/types/api';

export interface ReportListParams {
  search?: string;
  checklist?: string;
  unit?: string;
  score_range?: string;
  page?: number;
  per_page?: number;
}

export const reportsService = {
  async list(params?: ReportListParams): Promise<ReportListResponse> {
    const api = getTenantApi();
    const response = await api.get<ReportListResponse>('/reports', { params });
    return response.data;
  },

  async downloadAuditPdf(auditId: number): Promise<Blob> {
    const api = getTenantApi();
    const response = await api.get(`/reports/${auditId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadConsolidatedPdf(params?: ReportListParams): Promise<Blob> {
    const api = getTenantApi();
    const response = await api.get('/reports/consolidated/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
