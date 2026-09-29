import { useQuery } from '@tanstack/react-query';
import { systemService } from '@/services/api';

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: () => systemService.getSystemInfo(),
    // Fetch once on mount; no background polling needed for a static system badge.
    staleTime: Infinity,
    retry: 1,
  });
}
