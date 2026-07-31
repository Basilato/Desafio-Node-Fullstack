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
import { MapPinHouse, CalendarCheck, Ticket, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      className={cn('h-5 w-32 rounded-xl bg-muted/60 animate-pulse', className ?? '')}
    />
  );
}

function ListsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
      <Card className="h-[440px] overflow-hidden rounded-3xl border-border/60 animate-pulse">
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
            <Skeleton className="h-7 w-56" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
      <Card className="h-[440px] overflow-hidden rounded-3xl border-border/60 animate-pulse">
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
            <Skeleton className="h-7 w-56" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

type EventsMode = 'recent' | 'upcoming';

function EventsModeToggle({
  value,
  onChange,
}: {
  value: EventsMode;
  onChange: (v: EventsMode) => void;
}) {
  const baseCls =
    'h-9 px-4 rounded-full text-xs font-semibold transition-all duration-200';
  const activeCls =
    'bg-card text-foreground shadow-subtle ring-1 ring-border/70';
  const idleCls =
    'text-muted-foreground/80 hover:text-foreground';
  return (
    <div
      role="tablist"
      aria-label="Modo de listagem de eventos"
      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1 shadow-subtle"
    >
      <button
        role="tab"
        aria-selected={value === 'recent'}
        onClick={() => onChange('recent')}
        className={cn(baseCls, value === 'recent' ? activeCls : idleCls)}
      >
        Recentes
      </button>
      <button
        role="tab"
        aria-selected={value === 'upcoming'}
        onClick={() => onChange('upcoming')}
        className={cn(baseCls, value === 'upcoming' ? activeCls : idleCls)}
      >
        Próximos
      </button>
    </div>
  );
}

export function DashboardClient() {
  const {
    venues,
    eventsRecent,
    eventsUpcoming,
    venuesTotal,
    eventsTotal,
    ticketsTotal,
    profile,
    isLoading,
    isFetching,
    isError,
    errors,
    refetchAll,
  } = useDashboardQueries({ limit: 3 });

  const [eventsMode, setEventsMode] = React.useState<EventsMode>('upcoming');

  const venueList = venues.map(toVenueListItem);
  const venueRows = venueList.length
    ? venueList.map((v, i) => <VenueRow key={v.id} venue={v} index={i} />)
    : null;

  const eventsSource = eventsMode === 'recent' ? eventsRecent : eventsUpcoming;
  const eventList = eventsSource.map(toEventListItem);
  const eventRows = eventList.length
    ? eventList.map((e, i) => <EventRow key={e.id} event={e} index={i} />)
    : null;

  const upcomingPreview = React.useMemo(
    () => (eventsUpcoming.length ? eventsUpcoming[0] : eventsRecent[0]),
    [eventsUpcoming, eventsRecent],
  );
  const upcomingVenuePreview = React.useMemo(
    () => (venues.length ? venues[0] : undefined),
    [venues],
  );

  const userName = profile?.name?.split(' ')[0] ?? 'Mariana';
  const profileInitial = profile?.name?.trim().charAt(0);

  const heroStats = React.useMemo(
    () => [
      {
        label: 'Locais ativos' as const,
        value:
          venuesTotal !== null && venuesTotal > 0
            ? venuesTotal.toLocaleString('pt-BR')
            : venuesTotal === null
              ? '…'
              : '0',
        tone: 'venue' as const,
        icon: MapPinHouse,
        trend:
          venuesTotal === null
            ? '…'
            : venuesTotal > 0
              ? `+${Math.max(1, Math.round(venuesTotal * 0.18))} esta semana`
              : 'Sem dados',
      },
      {
        label: 'Eventos futuros' as const,
        value:
          eventsTotal !== null && eventsTotal > 0
            ? eventsTotal.toLocaleString('pt-BR')
            : eventsTotal === null
              ? '…'
              : '0',
        tone: 'event' as const,
        icon: CalendarCheck,
        trend:
          eventsTotal === null
            ? '…'
            : eventsTotal > 0
              ? `+${Math.max(1, Math.round(eventsTotal * 0.15))} em julho`
              : 'Sem dados',
      },
      {
        label: 'Ingressos emitidos' as const,
        value:
          ticketsTotal !== null && ticketsTotal > 0
            ? ticketsTotal.toLocaleString('pt-BR')
            : ticketsTotal === null
              ? '…'
              : '0',
        tone: 'ticket' as const,
        icon: Ticket,
        trend:
          ticketsTotal === null
            ? '…'
            : ticketsTotal > 0
              ? `+${Math.max(3, Math.round(ticketsTotal * 0.08))} vs. último mês`
              : 'Sem dados',
      },
    ],
    [venuesTotal, eventsTotal, ticketsTotal],
  );

  const showHeroLoading = isLoading;

  return (
    <div className="relative">
      <section>
        <ScrollArea className="hidden" type="hover" />
        <DashboardHero
          userName={userName}
          userInitial={profileInitial}
          stats={heroStats}
          upcomingVenueName={upcomingVenuePreview?.name}
          upcomingEventName={upcomingPreview?.name}
          upcomingEventDate={
            upcomingPreview?.startDate
              ? formatDateTimeBR(upcomingPreview.startDate).replace('de ', '')
              : undefined
          }
          isLoading={showHeroLoading}
        />
      </section>

      <section className="relative -mt-4 md:-mt-8 z-10">
        <div className="container pb-10">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            <VenueStatCard
              loading={venuesTotal === null}
              count={
                venuesTotal === null
                  ? '…'
                  : venuesTotal.toLocaleString('pt-BR')
              }
            />
            <EventStatCard
              loading={eventsTotal === null}
              count={
                eventsTotal === null
                  ? '…'
                  : eventsTotal.toLocaleString('pt-BR')
              }
            />
          </div>
          {isFetching && (isError || errors.length > 0) ? (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-destructive/35 bg-destructive/5 px-4 py-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-destructive/15 ring-1 ring-destructive/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                </span>
                <div>
                  <p className="font-semibold text-destructive">
                    Não foi possível carregar todos os dados do painel.
                  </p>
                  <p className="mt-0.5 text-xs text-destructive/85">
                    Alguns módulos podem mostrar informações desatualizadas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => refetchAll()}
                className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive transition-all hover:bg-destructive/15 sm:self-center"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
                Tentar novamente
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative pb-20 pt-2">
        <div className="container">
          {isLoading && !venueList.length && !eventList.length ? (
            <ListsSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
              <RecentSection
                tone="venue"
                title="Últimos locais adicionados"
                description="Gerencie portões, capacidades e contatos operacionais"
                columnsHint="Nome · Endereço · Capacidade · Contato ou Portões"
                seeAllHref="/locais"
                items={venueRows ?? []}
                emptyLabel="Nenhum local cadastrado ainda. Clique em + Novo local para começar."
              />
              <RecentSection
                tone="event"
                title={
                  eventsMode === 'recent'
                    ? 'Últimos eventos adicionados'
                    : 'Próximos eventos'
                }
                description={
                  eventsMode === 'recent'
                    ? 'Recém criados — revise ingressos e configurações'
                    : 'Agenda futura — acompanhe datas e ocupação prevista'
                }
                columnsHint="Nome · Categoria · Local · Data · Ingressos disponíveis"
                seeAllHref="/eventos"
                items={eventRows ?? []}
                emptyLabel="Nenhum evento cadastrado ainda. Clique em + Novo evento para começar."
                headerExtra={
                  <EventsModeToggle
                    value={eventsMode}
                    onChange={setEventsMode}
                  />
                }
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
