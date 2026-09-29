import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { AdminTicketQueryParams, Status } from '@/types';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  tickets: () => [...adminKeys.all, 'tickets'] as const,
  ticketsList: (params?: AdminTicketQueryParams) => [...adminKeys.tickets(), params] as const,
};

/**
 * Hook to retrieve live database ticket statistics for administrators
 */
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getTicketStats(),
    staleTime: 15 * 1000,
  });
}

/**
 * Hook to retrieve a paginated and filtered list of all tickets for administrators
 */
export function useAdminTickets(params?: AdminTicketQueryParams) {
  return useQuery({
    queryKey: adminKeys.ticketsList(params),
    queryFn: () => adminService.getTickets(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to update the status of any ticket as an administrator
 */
export function useAdminUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      adminService.updateTicketStatus(id, status),
    onSuccess: () => {
      // Invalidate both admin and general ticket queries to maintain total consistency
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
