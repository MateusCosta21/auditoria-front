import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsService, ReportListParams } from '@/services/tenant/reports';
import { downloadBlob } from '@/lib/utils';

export function useReports(params?: ReportListParams) {
  return useQuery({
    queryKey: ['tenant', 'reports', params],
    queryFn: () => reportsService.list(params),
  });
}

export function useDownloadAuditPdf() {
  return useMutation({
    mutationFn: (auditId: string) => reportsService.downloadAuditPdf(auditId),
    onSuccess: (blob, auditId) => {
      downloadBlob(blob, `auditoria-${auditId}.pdf`);
    },
  });
}

export function useDownloadConsolidatedPdf() {
  return useMutation({
    mutationFn: (params?: ReportListParams) => reportsService.downloadConsolidatedPdf(params),
    onSuccess: (blob) => {
      downloadBlob(blob, 'relatorio-consolidado.pdf');
    },
  });
}
