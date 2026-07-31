import {
  Sparkles,
  CalendarCheck,
  MapPinHouse,
  Ticket,
  TrendingUp,
  Clock,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type StatsArray = Array<{
  label: string;
  value: string;
  icon: typeof CalendarCheck;
  tone: 'venue' | 'event' | 'ticket';
  trend?: string;
}>;

interface DashboardHeroProps {
  userName?: string;
  userInitial?: string;
  tagline?: string;
  stats?: StatsArray;
  upcomingVenueName?: string;
  upcomingEventName?: string;
  upcomingEventDate?: string;
  isLoading?: boolean;
}

const toneClass: Record<StatsArray[number]['tone'], {
  chipBg: string;
  chipText: string;
  chipRing: string;
  iconBox: string;
  iconColor: string;
  dot: string;
}> = {
  venue: {
    chipBg: 'bg-accent/8',
    chipText: 'text-accent',
    chipRing: 'ring-accent/20',
    iconBox: 'bg-accent/10 ring-accent/20',
    iconColor: 'text-accent',
    dot: 'bg-accent',
  },
  event: {
    chipBg: 'bg-primary/8',
    chipText: 'text-primary',
    chipRing: 'ring-primary/20',
    iconBox: 'bg-primary/10 ring-primary/20',
    iconColor: 'text-primary',
    dot: 'bg-primary',
  },
  ticket: {
    chipBg: 'bg-chart-3/8',
    chipText: 'text-chart-3',
    chipRing: 'ring-chart-3/20',
    iconBox: 'bg-chart-3/10 ring-chart-3/20',
    iconColor: 'text-chart-3',
    dot: 'bg-chart-3',
  },
};

export function DashboardHero({
  userName = 'Mariana',
  userInitial,
  tagline = 'Monitore eventos, locais e ocupação em tempo real.',
  stats,
  upcomingVenueName = 'Carregando…',
  upcomingEventName = 'Carregando…',
  upcomingEventDate = 'em breve',
  isLoading = false,
}: DashboardHeroProps) {
  const initial = (userInitial ?? userName?.trim().charAt(0) ?? 'U').toUpperCase();
  const defaultStats: StatsArray = [
    { label: 'Locais ativos', value: '12', icon: MapPinHouse, tone: 'venue', trend: '+2 nesta semana' },
    { label: 'Eventos futuros', value: '28', icon: CalendarCheck, tone: 'event', trend: '+5 em julho' },
    { label: 'Ingressos emitidos', value: '1.482', icon: Ticket, tone: 'ticket', trend: '+18% vs. último mês' },
  ];
  const items = stats ?? defaultStats;
  const occupancyWidth =
    upcomingEventName && upcomingVenueName ? 72 : 12;

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-faint [background-size:24px_24px] opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <div className="absolute left-1/2 top-0 h-[420px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/16 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute right-[-8%] top-8 h-[320px] w-[320px] rounded-full bg-gradient-to-br from-accent/14 to-transparent blur-3xl" />
      </div>

      <div className="container pt-10 pb-12 md:pt-14 md:pb-16 relative">
        <div className="animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-subtle backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Painel Operacional · Atualizado agora
            <span className="h-3 w-px bg-border/80" />
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>

        <div className="grid items-start gap-10 pt-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <div className="animate-fade-in-up space-y-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20 blur-2xl opacity-70"
                />
                <div className="relative h-20 w-20 rounded-2xl p-[1.5px] bg-gradient-to-br from-primary via-primary/85 to-accent shadow-pop">
                  <div className="flex h-full w-full items-center justify-center rounded-[calc(1.5rem-1.5px)] bg-background/95 backdrop-blur">
                    <Avatar className="h-16 w-16 rounded-xl">
                      <AvatarFallback
                        className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-3xl font-extrabold tracking-tight text-foreground"
                      >
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span
                  aria-label="Online"
                  className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-full bg-success text-success-foreground ring-4 ring-background shadow-pop"
                >
                  <span className="block h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                </span>
              </div>

              <div className="min-w-0 space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="tabular-nums">Quinta-feira, 30 de julho</span>
                </div>
                <h1 className="text-[2rem] leading-[1.05] font-extrabold tracking-tight sm:text-[2.6rem] md:text-5xl">
                  Olá,{' '}
                  <span className="bg-gradient-to-r from-primary via-primary to-chart-5 bg-clip-text text-transparent">
                    {userName}
                  </span>
                  <span className="ml-1.5">👋</span>
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  {tagline}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {items.map(({ label, value, icon: Icon, tone, trend }) => {
                const t = toneClass[tone];
                return (
                  <article
                    key={label}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-4 py-4 shadow-subtle backdrop-blur-sm',
                      'transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-border hover:shadow-pop',
                    )}
                  >
                    <div aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100')} />
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1', t.iconBox)}>
                        <Icon className={cn('h-5 w-5')} strokeWidth={2.25} />
                      </div>
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1', t.chipBg, t.chipText, t.chipRing)}>
                        <TrendingUp className="h-3 w-3" />
                        {trend ?? 'Estável'}
                      </span>
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
                          {label}
                        </p>
                      </div>
                      <p className="tabular-nums text-[2rem] font-black leading-none tracking-tight">
                        {value}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside aria-hidden={isLoading} className="animate-fade-in">
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-pop backdrop-blur-md">
              <div className="relative flex items-center justify-between border-b border-border/70 bg-muted/40 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/80 ring-1 ring-destructive/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/90 ring-1 ring-warning/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success ring-1 ring-success/30" />
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  eventos.app/dashboard
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-4">
                    <div aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
                    <MapPinHouse className="h-5 w-5 text-accent" strokeWidth={2.25} />
                    <div className="mt-6 space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/90">
                        Próximo local
                      </p>
                      <p
                        className={cn(
                          'truncate text-base font-bold leading-tight text-foreground',
                          isLoading && 'animate-pulse opacity-75',
                        )}
                      >
                        {upcomingVenueName}
                      </p>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
                    <div aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/12 blur-2xl" />
                    <CalendarCheck className="h-5 w-5 text-primary" strokeWidth={2.25} />
                    <div className="mt-6 space-y-1">
                      <p
                        className={cn(
                          'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/90',
                          isLoading && 'animate-pulse opacity-75',
                        )}
                      >
                        {upcomingEventDate || 'Em definição'}
                      </p>
                      <p
                        className={cn(
                          'truncate text-base font-bold leading-tight text-foreground',
                          isLoading && 'animate-pulse opacity-75',
                        )}
                      >
                        {upcomingEventName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-chart-3/18 to-chart-4/12 text-chart-3 ring-1 ring-chart-3/20">
                        <Ticket className="h-4 w-4" strokeWidth={2.25} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/90">
                          Ocupação hoje
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground/80">
                          Ingressos emitidos x capacidade
                        </p>
                      </div>
                    </div>
                    <span className={cn('tabular-nums text-2xl font-black leading-none text-foreground', isLoading && 'animate-pulse opacity-70')}>
                      {isLoading ? '…%' : `${occupancyWidth}%`}
                    </span>
                  </div>

                  <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-chart-5 to-chart-3 transition-[width] duration-700 ease-out-quint',
                        isLoading && 'opacity-75',
                      )}
                      style={{ width: `${isLoading ? 20 : occupancyWidth}%` }}
                    />
                    <div className="absolute inset-y-0 left-0 w-full bg-[repeating-linear-gradient(90deg,transparent_0_14px,color-mix(in_oklab,var(--background)_14%,transparent)_14px_15px)] opacity-40" />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-muted-foreground/90">
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Próximos 7 dias
                    </div>
                    <button className="group inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-foreground/90 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                      Ver detalhes
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
