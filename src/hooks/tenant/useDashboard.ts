import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/tenant/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });
}

export function useComplianceByArea() {
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'compliance-by-area'],
    queryFn: () => dashboardService.getComplianceByArea(),
  });
}

export function useNcBySeverity() {
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'nc-by-severity'],
    queryFn: () => dashboardService.getNcBySeverity(),
  });
}

export function useRecentAudits(limit?: number) {
  return useQuery({
    queryKey: ['tenant', 'dashboard', 'recent-audits', limit],
    queryFn: () => dashboardService.getRecentAudits(limit),
  });
}
