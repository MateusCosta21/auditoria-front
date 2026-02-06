import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nonConformitiesService, NonConformityListParams } from '@/services/tenant/nonConformities';

export function useNonConformities(params?: NonConformityListParams) {
  return useQuery({
    queryKey: ['tenant', 'non-conformities', params],
    queryFn: () => nonConformitiesService.list(params),
  });
}

export function useUpdateNonConformity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      nonConformitiesService.update(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'non-conformities'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', 'dashboard'] });
    },
  });
}
