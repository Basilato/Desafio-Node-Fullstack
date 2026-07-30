import {
  UtensilsCrossed,
  Sparkles,
  CalendarCheck,
  MapPinHouse,
  Ticket,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';

type StatsArray = Array<{
  label: string;
  value: string;
  icon: typeof CalendarCheck;
  tone: 'venue' | 'event' | 'ticket';
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

export function DashboardHero({
  userName = 'Mariana',
  userInitial,
  tagline = 'Confira todos os seus eventos e locais em um só lugar!',
  stats,
  upcomingVenueName = 'Carregando…',
  upcomingEventName = 'Carregando…',
  upcomingEventDate = 'em breve',
  isLoading = false,
}: DashboardHeroProps) {
  const initial = (userInitial ?? userName?.trim().charAt(0) ?? 'U').toUpperCase();
  const defaultStats: StatsArray = [
    { label: 'Locais ativos', value: '12', icon: MapPinHouse, tone: 'venue' },
    { label: 'Eventos futuros', value: '28', icon: CalendarCheck, tone: 'event' },
    { label: 'Ingressos emitidos', value: '1.482', icon: Ticket, tone: 'ticket' },
  ];
  const items = stats ?? defaultStats;

  const toneClass: Record<StatsArray[number]['tone'], string> = {
    venue:
      'from-localis-venue-muted/60 to-localis-venue/30 ring-localis-venue/30 text-emerald-100',
    event:
      'from-localis-event-muted/60 to-localis-event/30 ring-localis-event/30 text-rose-100',
    ticket:
      'from-sky-600/40 to-indigo-700/30 ring-sky-400/30 text-sky-100',
  };

  return (
    <section className="relative">
      <div className="container pt-10 pb-14 md:pt-14 md:pb-20 relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="animate-fade-in-up space-y-7">
            <span
              aria-hidden="true"
              className="inline-flex items-center gap-2 text-xs font-medium
                px-3 py-1.5 rounded-full border border-white/10 bg-white/5
                text-muted-foreground backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Dashboard Localis · Visão geral da semana
            </span>

            <div className="flex items-start gap-5">
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-2 rounded-[1.75rem] blur-2xl opacity-60
                    bg-gradient-to-br from-localis-event/60 via-purple-600/30 to-localis-venue/60"
                  aria-hidden="true"
                />
                <div
                  className="relative h-24 w-24 rounded-[1.75rem] p-[2px]
                    bg-gradient-to-br from-localis-event via-fuchsia-500 to-localis-venue
                    shadow-2xl"
                >
                  <div className="h-full w-full rounded-[calc(1.75rem-2px)] bg-background flex items-center justify-center">
                    <Avatar className="h-20 w-20 rounded-[1.35rem]">
                      <AvatarFallback
                        className="h-full w-full rounded-[1.35rem]
                          bg-gradient-to-br from-localis-event-muted to-localis-venue-muted
                          text-foreground text-3xl font-extrabold"
                      >
                        <span className="relative">
                          <UtensilsCrossed
                            className="absolute -top-6 -right-5 h-6 w-6 text-emerald-300 drop-shadow"
                            strokeWidth={2.5}
                          />
                          {initial}
                        </span>
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span
                  className="absolute -bottom-1.5 -right-1.5 grid place-items-center
                    h-7 w-7 rounded-full bg-success text-success-foreground
                    ring-4 ring-background shadow-lg"
                  aria-label="Online"
                >
                  <span className="block h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                </span>
              </div>

              <div className="min-w-0 space-y-3">
                <p className="text-muted-foreground text-sm font-medium">
                  Quinta-feira, 30 de julho
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                  Olá,{' '}
                  <span className="localis-gradient-text">{userName}</span>
                  <span className="inline-block ml-2">👋</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                  {tagline}
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {items.map(({ label, value, icon: Icon, tone }) => (
                <li
                  key={label}
                  className={cn(
                    'group relative rounded-2xl p-4 ring-1 backdrop-blur-sm',
                    'bg-gradient-to-br',
                    toneClass[tone],
                    'transition-transform duration-300 hover:-translate-y-0.5',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="grid place-items-center h-10 w-10 rounded-xl
                        bg-white/10 ring-1 ring-inset ring-white/20"
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium opacity-80 truncate">
                        {label}
                      </p>
                      <p className="text-2xl font-extrabold tracking-tight truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden="true"
            className="relative hidden lg:block animate-fade-in"
          >
            <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-localis-event/30 via-purple-600/10 to-localis-venue/30 blur-3xl" />
            <div
              className="relative aspect-[4/3] rounded-[2rem] p-[1px]
                bg-gradient-to-br from-white/20 via-white/5 to-transparent
                shadow-2xl"
            >
              <div
                className="h-full w-full rounded-[calc(2rem-1px)] overflow-hidden
                  bg-gradient-to-br from-background via-localis-surface/50 to-background
                  border border-white/5"
              >
                <div className="flex flex-col h-full p-6 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-500/70" />
                      <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                      <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      localis.app/dashboard
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="rounded-2xl bg-gradient-to-br from-localis-venue-muted/50 to-localis-venue/30 p-4 flex flex-col justify-between ring-1 ring-white/5">
                      <MapPinHouse className="h-6 w-6 text-emerald-200" />
                      <div>
                        <p className="text-xs text-emerald-100/70">Próximo local</p>
                        <p
                          className={cn(
                            'font-bold text-emerald-50 truncate',
                            isLoading && 'animate-pulse opacity-75',
                          )}
                        >
                          {upcomingVenueName}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-localis-event-muted/50 to-localis-event/30 p-4 flex flex-col justify-between ring-1 ring-white/5">
                      <CalendarCheck className="h-6 w-6 text-rose-200" />
                      <div>
                        <p
                          className={cn(
                            'text-xs text-rose-100/70 truncate',
                            isLoading && 'animate-pulse opacity-75',
                          )}
                        >
                          {upcomingEventDate || 'Em definição'}
                        </p>
                        <p
                          className={cn(
                            'font-bold text-rose-50 truncate',
                            isLoading && 'animate-pulse opacity-75',
                          )}
                        >
                          {upcomingEventName}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 rounded-2xl p-4 border border-white/5 bg-white/[0.03] flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500/40 to-indigo-600/40 grid place-items-center ring-1 ring-white/10">
                        <Ticket className="h-5 w-5 text-sky-100" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Ocupação hoje</p>
                        <div className="mt-1.5 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full bg-gradient-to-r from-localis-event via-fuchsia-500 to-localis-venue transition-all duration-700',
                              isLoading && 'opacity-75',
                            )}
                            style={{
                              width: isLoading
                                ? '20%'
                                : upcomingEventName && upcomingVenueName
                                  ? '72%'
                                  : '12%',
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={cn(
                          'font-extrabold text-lg',
                          isLoading && 'animate-pulse opacity-60',
                        )}
                      >
                        {isLoading
                          ? '…%'
                          : upcomingEventName && upcomingVenueName
                            ? '72%'
                            : '12%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...values: (string | false | undefined | null)[]) {
  return values.filter(Boolean).join(' ');
}
