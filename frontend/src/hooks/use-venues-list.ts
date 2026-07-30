'use client';

import * as React from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listVenues } from '@/lib/api/venues';

export interface UseVenuesListOptions {
  page?: number;
  perPage?: number;
  search?: string;
  enabled?: boolean;
}

export function useVenuesList({
  page = 1,
  perPage = 10,
  search = '',
  enabled = true,
}: UseVenuesListOptions = {}) {
  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const queryKey = [
    'venues',
    'list',
    { page, perPage, search: debouncedSearch },
  ] as const;

  const q = useQuery({
    queryKey,
    queryFn: () =>
      listVenues({
        page,
        perPage,
        search: debouncedSearch || undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    ...q,
    items: q.data?.items ?? [],
    meta: q.data?.meta ?? {
      page,
      perPage,
      total: 0,
      totalPages: 0,
    },
    debouncedSearch,
  };
}

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
