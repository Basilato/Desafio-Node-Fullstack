'use client';

import { useQueries } from '@tanstack/react-query';
import { getEventsRecent, getEventsStatsCount } from '@/lib/api/events';
import { getVenuesRecent, getVenuesStatsCount } from '@/lib/api/venues';

export interface UseDashboardQueriesOptions {
  limit?: number;
}

export function useDashboardQueries({ limit = 3 }: UseDashboardQueriesOptions = {}) {
  return useQueries({
    queries: [
      {
        queryKey: ['venues', 'recent', limit] as const,
        queryFn: () => getVenuesRecent(limit),
        staleTime: 60_000,
        placeholderData: [],
      },
      {
        queryKey: ['events', 'recent', limit] as const,
        queryFn: () => getEventsRecent(limit),
        staleTime: 60_000,
        placeholderData: [],
      },
      {
        queryKey: ['venues', 'stats', 'count'] as const,
        queryFn: () => getVenuesStatsCount(),
        staleTime: 2 * 60_000,
        placeholderData: { total: 0 },
      },
      {
        queryKey: ['events', 'stats', 'count'] as const,
        queryFn: () => getEventsStatsCount(),
        staleTime: 2 * 60_000,
        placeholderData: { total: 0 },
      },
    ],
    combine: (results) => {
      const [venuesQ, eventsQ, venuesCountQ, eventsCountQ] = results;
      return {
        venues: venuesQ.data ?? [],
        events: eventsQ.data ?? [],
        venuesTotal: venuesCountQ.data?.total ?? 0,
        eventsTotal: eventsCountQ.data?.total ?? 0,
        isLoading: results.some((r) => r.isLoading),
        isFetching: results.some((r) => r.isFetching),
        isError: results.some((r) => r.isError),
        errors: results.map((r) => r.error).filter(Boolean) as Error[],
        refetchAll: () => results.forEach((r) => r.refetch()),
      };
    },
  });
}
