import { apiClient } from './api';
import {
  Ticket,
  PaginatedTicketsResponse,
  TicketQueryParams,
  CreateTicketInput,
  UpdateTicketInput,
} from '@/types';

export const ticketsService = {
  /**
   * Fetch paginated list of user's tickets with optional search, status, and priority filters
   */
  async getTickets(params?: TicketQueryParams): Promise<PaginatedTicketsResponse> {
    const cleanParams: Record<string, string | number> = {};

    if (params?.page) cleanParams.page = params.page;
    if (params?.limit) cleanParams.limit = params.limit;
    if (params?.status) cleanParams.status = params.status;
    if (params?.priority) cleanParams.priority = params.priority;
    if (params?.category) cleanParams.category = params.category;
    if (params?.search) cleanParams.search = params.search;
    if (params?.sortBy) cleanParams.sortBy = params.sortBy;
    if (params?.sortOrder) cleanParams.sortOrder = params.sortOrder;

    const response = await apiClient.get<PaginatedTicketsResponse>('/tickets', {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Fetch a single ticket by its UUID
   */
  async getTicketById(id: string): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  /**
   * Create a new ticket
   */
  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const response = await apiClient.post<Ticket>('/tickets', input);
    return response.data;
  },

  /**
   * Update an existing ticket (status, priority, title, description, category)
   */
  async updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
    const response = await apiClient.patch<Ticket>(`/tickets/${id}`, input);
    return response.data;
  },

  /**
   * Delete a ticket
   */
  async deleteTicket(id: string): Promise<{ message: string; id: string }> {
    const response = await apiClient.delete<{ message: string; id: string }>(
      `/tickets/${id}`,
    );
    return response.data;
  },
};
