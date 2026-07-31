import Link from 'next/link';
import { type LucideIcon, ArrowUpRight, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StatCardTone = 'venue' | 'event';

interface DashboardStatCardProps {
  tone: StatCardTone;
  title: string;
  subtitle: string;
  count: number | string;
  delta?: string;
  deltaPositive?: boolean;
  ctaLabel: string;
  ctaHref: string;
  icon: LucideIcon;
  className?: string;
  sparkline?: number[];
  insights?: string;
  loading?: boolean;
}

const toneStyles: Record<StatCardTone, {
  accentBar: string;
  iconBox: string;
  iconColor: string;
  accentText: string;
  accentPillBg: string;
  accentPillRing: string;
  sparkline: string;
  cta: string;
  glow: string;
  headerPill: string;
}> = {
  venue: {
    accentBar: 'from-accent via-accent/60 to-accent/0',
    iconBox: 'bg-accent/10 text-accent ring-1 ring-accent/20',
    iconColor: 'text-accent',
    accentText: 'text-accent',
    accentPillBg: 'bg-accent/10',
    accentPillRing: 'ring-accent/25',
    sparkline: 'from-accent to-chart-2',
    cta: 'border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50',
    glow: 'from-accent/22 via-accent/8 to-transparent',
    headerPill: 'bg-accent/8 text-accent ring-1 ring-accent/25',
  },
  event: {
    accentBar: 'from-primary via-primary/60 to-primary/0',
    iconBox: 'bg-primary/10 text-primary ring-1 ring-primary/20',
    iconColor: 'text-primary',
    accentText: 'text-primary',
    accentPillBg: 'bg-primary/10',
    accentPillRing: 'ring-primary/25',
    sparkline: 'from-primary via-chart-5 to-chart-3',
    cta: 'border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50',
    glow: 'from-primary/22 via-primary/8 to-transparent',
    headerPill: 'bg-primary/8 text-primary ring-1 ring-primary/25',
  },
};

function Sparkline({ points, colorFrom }: { points: number[]; colorFrom: string }) {
  if (!points.length) return null;
  const w = 220;
  const h = 64;
  const min = Math.min(...points);
  const max = Math.max(...points) || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / (max - min || 1)) * (h - 14) - 7;
    return `${x},${y}`;
  });
  const areaCoords = `${coords.join(' ')} ${w},${h} 0,${h}`;
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="block"
    >
      <defs>
        <linearGradient id={`sparkFill-${colorFrom}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaCoords}
        fill={`url(#sparkFill-${colorFrom})`}
        className={colorFrom}
      />
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={colorFrom}
      />
      {points.slice(-1).map((_, i) => {
        const [x, y] = coords[coords.length - 1].split(',').map(Number);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth="2"
            className={colorFrom}
          />
        );
      })}
    </svg>
  );
}

export function DashboardStatCard({
  tone,
  title,
  subtitle,
  count,
  delta,
  deltaPositive = true,
  ctaLabel,
  ctaHref,
  icon: Icon,
  className,
  sparkline,
  insights,
  loading,
}: DashboardStatCardProps) {
  const s = toneStyles[tone];
  const sparkPoints = sparkline ?? [6, 9, 7, 12, 10, 14, 18, 16, 21, 20, 24, 28];

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-subtle transition-all duration-250 ease-out-expo',
        'hover:-translate-y-1 hover:border-border hover:shadow-pop',
        className,
      )}
    >
      <div aria-hidden="true" className={cn('pointer-events-none absolute -left-20 -top-24 h-64 w-80 rounded-full bg-gradient-to-br blur-3xl opacity-80', s.glow)} />
      <div aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r', s.accentBar)} />

      <div className="relative p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-transform duration-250 group-hover:scale-[1.04]', s.iconBox)}>
              <Icon className="h-7 w-7" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn(
                    'text-[1.35rem] font-extrabold tracking-tight leading-tight md:text-2xl',
                    loading && 'animate-pulse opacity-70',
                  )}
                >
                  {title}
                </h3>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
                    s.headerPill,
                    loading && 'opacity-50',
                  )}
                >
                  Módulo ativo
                </span>
              </div>
              <p
                className={cn(
                  'mt-1 max-w-md text-sm leading-relaxed text-muted-foreground/90',
                  loading && 'animate-pulse opacity-70',
                )}
              >
                {subtitle}
              </p>
            </div>
          </div>
          {delta && (
            <div
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-opacity',
                deltaPositive
                  ? 'bg-success/10 text-success ring-success/25'
                  : 'bg-destructive/10 text-destructive ring-destructive/25',
                loading && 'opacity-0',
              )}
            >
              <span className={cn('grid h-4 w-4 place-items-center rounded-full', deltaPositive ? 'bg-success/15' : 'bg-destructive/15')}>
                <ArrowUpRight
                  className={cn('h-3 w-3 transition-transform', deltaPositive ? '' : 'rotate-180')}
                  strokeWidth={2.5}
                />
              </span>
              {delta}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 items-end gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-2">
            <div className={cn('flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/90', loading && 'opacity-60')}>
              <span className="inline-block h-1.5 w-1.5 rounded-full currentColor" style={{ color: 'var(--ring)' }} />
              Total cadastrado
            </div>
            <div className="flex items-end gap-3">
              <p
                className={cn(
                  'tabular-nums text-[3.25rem] font-black leading-[0.9] tracking-tight md:text-[3.75rem] lg:text-[4.25rem]',
                  loading && 'inline-block rounded-xl bg-muted/50 min-w-[3ch] animate-pulse text-transparent select-none',
                )}
              >
                {count}
              </p>
              {insights && (
                <div
                  className={cn(
                    'mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition-opacity',
                    s.accentPillBg,
                    s.accentText,
                    s.accentPillRing,
                    loading && 'opacity-0',
                  )}
                >
                  {insights}
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button
                asChild
                size="lg"
                variant="outline"
                disabled={loading}
                aria-disabled={loading}
                className={cn(
                  'h-11 rounded-xl px-5 font-semibold shadow-sm transition-all',
                  'active:scale-[0.98]',
                  s.cta,
                )}
              >
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
                </Link>
              </Button>
            </div>
          </div>

          <div
            aria-hidden={loading}
            className={cn(
              'relative -mr-2 -mb-1 min-h-[96px] transition-opacity',
              loading && 'pointer-events-none opacity-0',
            )}
          >
            <Sparkline points={sparkPoints} colorFrom={s.iconColor} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
            <div className="pointer-events-none absolute right-0 top-2 h-10 w-16 rounded-full bg-gradient-to-l from-card to-transparent" />
          </div>
          {loading && (
            <div
              aria-hidden="true"
              className="absolute right-4 bottom-4 h-[96px] w-[calc(100%/2-1rem)] overflow-hidden rounded-2xl bg-muted/35 animate-pulse lg:h-[108px]"
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function VenueStatCard(props: Partial<DashboardStatCardProps> & { count: number | string }) {
  return (
    <DashboardStatCard
      tone="venue"
      title="Locais"
      subtitle="Gerencie portões, capacidade e dados operacionais de cada casa de show, estádio ou teatro."
      ctaLabel="Conferir locais"
      ctaHref="/locais"
      icon={MapPin}
      delta="+3 esta semana"
      deltaPositive
      insights="2 com alta ocupação"
      sparkline={[4, 6, 5, 7, 8, 9, 10, 11, 10, 11, 12, 12]}
      {...props}
    />
  );
}

export function EventStatCard(props: Partial<DashboardStatCardProps> & { count: number | string }) {
  return (
    <DashboardStatCard
      tone="event"
      title="Eventos"
      subtitle="Acompanhe agenda, emissão de ingressos e ocupação em tempo real."
      ctaLabel="Conferir eventos"
      ctaHref="/eventos"
      icon={Calendar}
      delta="+5 em julho"
      deltaPositive
      insights="4 próximos 7 dias"
      sparkline={[12, 14, 15, 16, 18, 20, 19, 21, 22, 25, 27, 28]}
      {...props}
    />
  );
}
