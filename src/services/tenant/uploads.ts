import { getTenantApi } from '../api-client';
import type { UploadPhotoResponse } from '@/types/api';

export const uploadsService = {
  async uploadPhoto(file: File): Promise<UploadPhotoResponse> {
    const api = getTenantApi();
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post<UploadPhotoResponse>('/uploads/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
