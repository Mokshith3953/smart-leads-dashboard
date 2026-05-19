import api from './axios';
import { ApiResponse, Lead, LeadFilters, LeadStats } from '../types';

interface LeadsResponse {
  data: Lead[];
  pagination: ApiResponse['pagination'];
}

export const leadsApi = {
  getAll: (filters: LeadFilters = {}) =>
    api.get<ApiResponse<Lead[]>>('/leads', { params: filters }),

  getById: (id: string) => api.get<ApiResponse<Lead>>(`/leads/${id}`),

  create: (data: Partial<Lead>) => api.post<ApiResponse<Lead>>('/leads', data),

  update: (id: string, data: Partial<Lead>) => api.put<ApiResponse<Lead>>(`/leads/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/leads/${id}`),

  getStats: () => api.get<ApiResponse<LeadStats>>('/leads/stats'),

  exportCSV: (filters: Omit<LeadFilters, 'page' | 'sort'> = {}) =>
    api.get('/leads/export', { params: filters, responseType: 'blob' }),
};

export type { LeadsResponse };
