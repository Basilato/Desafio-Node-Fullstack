'use client';

import * as React from 'react';
import { DashboardHero } from '@/components/dashboard-hero';
import {
  VenueStatCard,
  EventStatCard,
} from '@/components/dashboard-stat-card';
import { RecentSection } from '@/components/dashboard-recent-section';
import {
  VenueRow,
  EventRow,
  type VenueListItem,
  type EventListItem,
} from '@/components/dashboard-list-rows';
import { useDashboardQueries } from '@/hooks/use-dashboard-queries';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPinHouse, CalendarCheck, Ticket } from 'lucide-react';
import type { EventCategoryKey } from '@/components/category-badge';
import type { VenueRecent } from '@/lib/api/venues';
import type { EventRecent } from '@/lib/api/events';

function formatDateTimeBR(iso: string | Date) {
  const d = new Date(iso);
  return Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(d)
    .replace('.', '');
}

function toVenueListItem(v: VenueRecent): VenueListItem {
  const identifiers = v.gates.map((g) => g.identifier).join(',');
  return {
    id: v.id,
    name: v.name,
    address: v.address,
    cityState: [v.city, v.state].filter(Boolean).join(' · ') || undefined,
    gatesOrContact: identifiers,
    email: v.email ?? undefined,
    capacity: v.capacity,
  };
}

function toEventListItem(e: EventRecent): EventListItem {
  return {
    id: e.id,
    name: e.name,
    category: (e.category ?? 'OUTRO') as EventCategoryKey,
    venueName: e.venue?.name ?? 'Local não informado',
    dateLabel: formatDateTimeBR(e.startDate),
    ticketsAvailable: e.venue?.capacity ?? undefined,
  };
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`h-5 w-32 rounded-xl bg-white/5 animate-pulse ${className ?? ''}`}
    />
  );
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
      <Card className="rounded-3xl overflow-hidden border-white/5 h-[220px] animate-pulse">
        <CardContent className="h-full bg-gradient-to-br from-onentree-venue-muted via-onentree-venue to-emerald-950/70" />
      </Card>
      <Card className="rounded-3xl overflow-hidden border-white/5 h-[220px] animate-pulse">
        <CardContent className="h-full bg-gradient-to-br from-onentree-event-muted via-onentree-event to-rose-950/70" />
      </Card>
    </div>
  );
}

function ListsSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
      <Card className="rounded-3xl border-white/5 overflow-hidden h-[420px] animate-pulse">
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between items-center gap-4 pb-4 border-b border-white/5">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-24 h-8" />
          </div>
          <Skeleton className="w-full h-16" />
          <Skeleton className="w-full h-16" />
          <Skeleton className="w-full h-16" />
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-white/5 overflow-hidden h-[420px] animate-pulse">
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between items-center gap-4 pb-4 border-b border-white/5">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-24 h-8" />
          </div>
          <Skeleton className="w-full h-16" />
          <Skeleton className="w-full h-16" />
          <Skeleton className="w-full h-16" />
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardClient() {
  const {
    venues,
    events,
    venuesTotal,
    eventsTotal,
    isLoading,
    isFetching,
    isError,
    errors,
    refetchAll,
  } = useDashboardQueries({ limit: 3 });

  const [showingRecentEvents, _setShowingRecentEvents] = React.useState<
    'recent' | 'upcoming'
  >('upcoming');

  React.useEffect(() => {
    if (showingRecentEvents === 'upcoming') {
      // Mantém consistência visual sem requisições extras por enquanto
    }
  }, [showingRecentEvents]);

  const venueList = venues.map(toVenueListItem);
  const eventList = events.map(toEventListItem);
  const venueRows = venueList.length
    ? venueList.map((v, i) => <VenueRow key={v.id} venue={v} index={i} />)
    : null;
  const eventRows = eventList.length
    ? eventList.map((e, i) => <EventRow key={e.id} event={e} index={i} />)
    : null;

  const heroStats = React.useMemo(
    () => [
      {
        label: 'Locais ativos' as const,
        value:
          venuesTotal > 0
            ? venuesTotal.toLocaleString('pt-BR')
            : isLoading
              ? '…'
              : '0',
        tone: 'venue' as const,
        icon: MapPinHouse,
      },
      {
        label: 'Eventos futuros' as const,
        value:
          eventsTotal > 0
            ? eventsTotal.toLocaleString('pt-BR')
            : isLoading
              ? '…'
              : '0',
        tone: 'event' as const,
        icon: CalendarCheck,
      },
      {
        label: 'Ingressos emitidos' as const,
        value: isLoading ? '…' : '1.482',
        tone: 'ticket' as const,
        icon: Ticket,
      },
    ],
    [venuesTotal, eventsTotal, isLoading],
  );

  const firstVenuePreview = venues[0];
  const firstEventPreview = events[0];

  return (
    <div className="relative">
      {/* Hero */}
      <section className="onentree-hero-bg">
        <ScrollArea className="hidden" type="hover" />
        <DashboardHero
          userName="Mariana"
          stats={heroStats}
          upcomingVenueName={firstVenuePreview?.name}
          upcomingEventName={firstEventPreview?.name}
          upcomingEventDate={
            firstEventPreview?.startDate
              ? formatDateTimeBR(firstEventPreview.startDate).replace('de ', '')
              : undefined
          }
          isLoading={isLoading}
        />
      </section>

      {/* Stat Cards */}
      <section className="relative -mt-10 md:-mt-16 z-10">
        <div className="container pb-10">
          {isLoading && !venuesTotal && !eventsTotal ? (
            <StatCardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
              <VenueStatCard count={venuesTotal} />
              <EventStatCard count={eventsTotal} />
            </div>
          )}
          {isFetching && (isError || errors.length) && (
            <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              ⚠️ Não foi possível carregar todos os dados.{' '}
              <button
                onClick={() => refetchAll()}
                className="underline underline-offset-2 font-semibold ml-1"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Recent lists */}
      <section className="relative pb-16 pt-4">
        <div className="container">
          {isLoading && !venueList.length && !eventList.length ? (
            <ListsSkeleton />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
              <RecentSection
                tone="venue"
                title="Últimos locais adicionados"
                description="Gerencie portões e capacidades"
                seeAllHref="/locais"
                items={venueRows ?? []}
                emptyLabel="Nenhum local cadastrado ainda. Clique em + Novo local para começar."
              />
              <RecentSection
                tone="event"
                title="Últimos Eventos adicionados"
                description="Confira ingressos e datas"
                seeAllHref="/eventos"
                items={eventRows ?? []}
                emptyLabel="Nenhum evento cadastrado ainda. Clique em + Novo evento para começar."
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
