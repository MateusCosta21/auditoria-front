import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditsService, AuditListParams } from '@/services/tenant/audits';
import type { CreateAuditRequest, AnswerPayload } from '@/types/api';

export function useAudits(params?: AuditListParams) {
  return useQuery({
    queryKey: ['tenant', 'audits', params],
    queryFn: () => auditsService.list(params),
  });
}

export function useAudit(id: number | undefined) {
  return useQuery({
    queryKey: ['tenant', 'audits', id],
    queryFn: () => auditsService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAuditRequest) => auditsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'audits'] });
    },
  });
}

export function useUpdateAnswers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answers }: { id: number; answers: AnswerPayload[] }) =>
      auditsService.updateAnswers(id, answers),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'audits', variables.id] });
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answers }: { id: number; answers: AnswerPayload[] }) =>
      auditsService.saveDraft(id, answers),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'audits', variables.id] });
    },
  });
}

export function useFinalizeAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => auditsService.finalize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'audits'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', 'dashboard'] });
    },
  });
}
