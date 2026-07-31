'use client';

import { useQueries } from '@tanstack/react-query';
import {
  getEventsRecent,
  getEventsUpcoming,
  getEventsStatsCount,
  getEventsStatsTickets,
  type EventRecent,
} from '@/lib/api/events';
import {
  getVenuesRecent,
  getVenuesStatsCount,
  type VenueRecent,
} from '@/lib/api/venues';
import { getProfile, type LoggedUser } from '@/lib/api/auth';

export interface UseDashboardQueriesOptions {
  limit?: number;
}

export interface DashboardQueriesResult {
  venues: VenueRecent[];
  eventsRecent: EventRecent[];
  eventsUpcoming: EventRecent[];
  venuesTotal: number | null;
  eventsTotal: number | null;
  ticketsTotal: number | null;
  profile: LoggedUser | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errors: Error[];
  refetchAll: () => void;
}

export function useDashboardQueries({
  limit = 3,
}: UseDashboardQueriesOptions = {}): DashboardQueriesResult {
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
        queryKey: ['events', 'upcoming', limit] as const,
        queryFn: () => getEventsUpcoming(limit),
        staleTime: 60_000,
        placeholderData: [],
      },
      {
        queryKey: ['venues', 'stats', 'count'] as const,
        queryFn: () => getVenuesStatsCount(),
        staleTime: 2 * 60_000,
        placeholderData: undefined,
      },
      {
        queryKey: ['events', 'stats', 'count'] as const,
        queryFn: () => getEventsStatsCount(),
        staleTime: 2 * 60_000,
        placeholderData: undefined,
      },
      {
        queryKey: ['events', 'stats', 'tickets'] as const,
        queryFn: () => getEventsStatsTickets(),
        staleTime: 2 * 60_000,
        placeholderData: undefined,
      },
      {
        queryKey: ['auth', 'profile'] as const,
        queryFn: () => getProfile(),
        staleTime: 5 * 60_000,
      },
    ],
    combine: (results) => {
      const [
        venuesQ,
        eventsRecentQ,
        eventsUpcomingQ,
        venuesCountQ,
        eventsCountQ,
        ticketsCountQ,
        profileQ,
      ] = results;
      return {
        venues: venuesQ.data ?? [],
        eventsRecent: eventsRecentQ.data ?? [],
        eventsUpcoming: eventsUpcomingQ.data ?? [],
        venuesTotal: venuesCountQ.data?.total ?? null,
        eventsTotal: eventsCountQ.data?.total ?? null,
        ticketsTotal: ticketsCountQ.data?.total ?? null,
        profile: (profileQ.data ?? null) as LoggedUser | null,
        isLoading: results.some((r) => r.isLoading),
        isFetching: results.some((r) => r.isFetching),
        isError: results.some((r) => r.isError),
        errors: results.map((r) => r.error).filter(Boolean) as Error[],
        refetchAll: () => results.forEach((r) => r.refetch()),
      };
    },
  });
}
