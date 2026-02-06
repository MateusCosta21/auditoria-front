import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantUsersService, TenantUserListParams } from '@/services/tenant/users';
import type { CreateTenantUserRequest, UpdateTenantUserRequest } from '@/types/api';

export function useTenantUsers(params?: TenantUserListParams) {
  return useQuery({
    queryKey: ['tenant', 'users', params],
    queryFn: () => tenantUsersService.list(params),
  });
}

export function useCreateTenantUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantUserRequest) => tenantUsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'users'] });
    },
  });
}

export function useUpdateTenantUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantUserRequest }) =>
      tenantUsersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'users'] });
    },
  });
}
