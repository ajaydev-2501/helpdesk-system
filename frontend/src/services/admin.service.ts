import { apiClient } from './api';
import {
  AdminTicketStats,
  AdminTicketQueryParams,
  PaginatedTicketsResponse,
  Ticket,
  Status,
} from '@/types';

export const adminService = {
  /**
   * Fetch aggregate ticket statistics from backend (Admin only)
   */
  async getTicketStats(): Promise<AdminTicketStats> {
    const response = await apiClient.get<AdminTicketStats>('/admin/tickets/stats');
    return response.data;
  },

  /**
   * Fetch paginated tickets list with filters and search (Admin only)
   */
  async getTickets(params?: AdminTicketQueryParams): Promise<PaginatedTicketsResponse> {
    const cleanParams: Record<string, string | number> = {};

    if (params?.page) cleanParams.page = params.page;
    if (params?.limit) cleanParams.limit = params.limit;
    if (params?.status) cleanParams.status = params.status;
    if (params?.priority) cleanParams.priority = params.priority;
    if (params?.search) cleanParams.search = params.search;
    if (params?.sortBy) cleanParams.sortBy = params.sortBy;
    if (params?.sortOrder) cleanParams.sortOrder = params.sortOrder;

    const response = await apiClient.get<PaginatedTicketsResponse>('/admin/tickets', {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Update the status of any ticket as an administrator
   */
  async updateTicketStatus(id: string, status: Status): Promise<Ticket> {
    const response = await apiClient.patch<Ticket>(`/admin/tickets/${id}/status`, {
      status,
    });
    return response.data;
  },
};
