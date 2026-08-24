import { apiClient } from './client';
import { AdminStats } from './types';

export async function getAdminStats() {
  const { data } = await apiClient.get<AdminStats>('/admin/stats');
  return data;
}
