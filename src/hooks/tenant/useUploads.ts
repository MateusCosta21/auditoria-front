import { useMutation } from '@tanstack/react-query';
import { uploadsService } from '@/services/tenant/uploads';

export function useUploadPhoto() {
  return useMutation({
    mutationFn: (file: File) => uploadsService.uploadPhoto(file),
  });
}
