import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from '@/services/tickets.service';
import {
  TicketQueryParams,
  CreateTicketInput,
  UpdateTicketInput,
  Ticket,
} from '@/types';

export const ticketsKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketsKeys.all, 'list'] as const,
  list: (filters?: TicketQueryParams) => [...ticketsKeys.lists(), filters] as const,
  details: () => [...ticketsKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketsKeys.details(), id] as const,
  metrics: () => [...ticketsKeys.all, 'metrics'] as const,
};

/**
 * Hook to retrieve a paginated and filtered list of tickets
 */
export function useTickets(params?: TicketQueryParams) {
  return useQuery({
    queryKey: ticketsKeys.list(params),
    queryFn: () => ticketsService.getTickets(params),
    placeholderData: (previousData) => previousData, // Smooth pagination transitions
  });
}

/**
 * Hook to retrieve complete details for a single ticket
 */
export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketsKeys.detail(id),
    queryFn: () => ticketsService.getTicketById(id),
    enabled: Boolean(id),
    retry: 1,
  });
}

/**
 * Hook to calculate aggregate ticket statistics from the user's tickets
 */
export function useTicketMetrics() {
  return useQuery({
    queryKey: ticketsKeys.metrics(),
    queryFn: async () => {
      // Query tickets with a sufficient limit to compute dashboard statistics
      const response = await ticketsService.getTickets({ limit: 100 });
      const tickets = response.data;

      const total = response.meta.total;
      const open = tickets.filter((t) => t.status === 'OPEN').length;
      const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
      const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;

      return {
        total,
        open,
        inProgress,
        resolved,
      };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a new ticket with cache invalidation
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketInput) => ticketsService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
    },
  });
}

/**
 * Hook to update an existing ticket with cache invalidation and detail update
 */
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) =>
      ticketsService.updateTicket(id, data),
    onSuccess: (updatedTicket: Ticket) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.metrics() });
      queryClient.setQueryData(ticketsKeys.detail(updatedTicket.id), updatedTicket);
    },
  });
}

/**
 * Hook to delete a ticket with cache invalidation
 */
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketsService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
    },
  });
}
