import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsService, ChecklistListParams } from '@/services/tenant/checklists';
import type { SaveChecklistRequest } from '@/types/api';

export function useChecklists(params?: ChecklistListParams) {
  return useQuery({
    queryKey: ['tenant', 'checklists', params],
    queryFn: () => checklistsService.list(params),
  });
}

export function useChecklist(id: string | undefined) {
  return useQuery({
    queryKey: ['tenant', 'checklists', id],
    queryFn: () => checklistsService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveChecklistRequest) => checklistsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'checklists'] });
    },
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SaveChecklistRequest }) =>
      checklistsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'checklists'] });
    },
  });
}

export function useDuplicateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistsService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'checklists'] });
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'checklists'] });
    },
  });
}
