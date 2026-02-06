import { getTenantApi } from '../api-client';
import type {
  AuditListResponse,
  AuditDetail,
  CreateAuditRequest,
  CreateAuditResponse,
  AnswerPayload,
  UpdateAnswersResponse,
  FinalizeAuditResponse,
} from '@/types/api';

export interface AuditListParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const auditsService = {
  async list(params?: AuditListParams): Promise<AuditListResponse> {
    const api = getTenantApi();
    const response = await api.get<AuditListResponse>('/audits', { params });
    return response.data;
  },

  async getById(id: number): Promise<AuditDetail> {
    const api = getTenantApi();
    const response = await api.get<AuditDetail>(`/audits/${id}`);
    return response.data;
  },

  async create(data: CreateAuditRequest): Promise<CreateAuditResponse> {
    const api = getTenantApi();
    const response = await api.post<CreateAuditResponse>('/audits', data);
    return response.data;
  },

  async updateAnswers(id: number, answers: AnswerPayload[]): Promise<UpdateAnswersResponse> {
    const api = getTenantApi();
    const response = await api.put<UpdateAnswersResponse>(`/audits/${id}/answers`, { answers });
    return response.data;
  },

  async saveDraft(id: number, answers: AnswerPayload[]): Promise<UpdateAnswersResponse> {
    const api = getTenantApi();
    const response = await api.put<UpdateAnswersResponse>(`/audits/${id}/save-draft`, { answers });
    return response.data;
  },

  async finalize(id: number): Promise<FinalizeAuditResponse> {
    const api = getTenantApi();
    const response = await api.post<FinalizeAuditResponse>(`/audits/${id}/finalize`);
    return response.data;
  },
};
