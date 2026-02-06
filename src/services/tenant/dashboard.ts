import { getTenantApi } from '../api-client';
import type { DashboardStats, ComplianceByArea, NcBySeverity, AuditListItem } from '@/types/api';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const api = getTenantApi();
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getComplianceByArea(): Promise<ComplianceByArea[]> {
    const api = getTenantApi();
    const response = await api.get<ComplianceByArea[]>('/dashboard/compliance-by-area');
    return response.data;
  },

  async getNcBySeverity(): Promise<NcBySeverity> {
    const api = getTenantApi();
    const response = await api.get<NcBySeverity>('/dashboard/nc-by-severity');
    return response.data;
  },

  async getRecentAudits(limit?: number): Promise<AuditListItem[]> {
    const api = getTenantApi();
    const response = await api.get<AuditListItem[]>('/dashboard/recent-audits', {
      params: { limit },
    });
    return response.data;
  },
};
