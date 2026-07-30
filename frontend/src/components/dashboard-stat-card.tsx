import Link from 'next/link';
import { type LucideIcon, ArrowUpRight, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StatCardTone = 'venue' | 'event';

interface DashboardStatCardProps {
  tone: StatCardTone;
  title: string;
  subtitle: string;
  count: string | number;
  delta?: string;
  ctaLabel: string;
  ctaHref: string;
  icon: LucideIcon;
  className?: string;
}

const toneStyles: Record<StatCardTone, {
  wrapper: string;
  iconBox: string;
  button: string;
  accent: string;
  label: string;
}> = {
  venue: {
    wrapper:
      'bg-gradient-to-br from-localis-venue-muted via-localis-venue to-emerald-950/70 text-localis-venue-foreground',
    iconBox:
      'bg-white/10 text-emerald-100 ring-1 ring-inset ring-white/15',
    button:
      'bg-white text-localis-venue hover:bg-emerald-50 shadow-soft hover:-translate-y-0.5',
    accent: 'from-emerald-300/40 to-transparent',
    label: 'bg-white/10 text-emerald-100',
  },
  event: {
    wrapper:
      'bg-gradient-to-br from-localis-event-muted via-localis-event to-rose-950/70 text-localis-event-foreground',
    iconBox:
      'bg-white/10 text-rose-100 ring-1 ring-inset ring-white/15',
    button:
      'bg-white text-localis-event hover:bg-rose-50 shadow-soft hover:-translate-y-0.5',
    accent: 'from-rose-300/40 to-transparent',
    label: 'bg-white/10 text-rose-100',
  },
};

export function DashboardStatCard({
  tone,
  title,
  subtitle,
  count,
  delta,
  ctaLabel,
  ctaHref,
  icon: Icon,
  className,
}: DashboardStatCardProps) {
  const s = toneStyles[tone];
  return (
    <article
      className={cn(
        'localis-card-glow group relative overflow-hidden rounded-3xl p-6 md:p-7',
        'shadow-2xl transition-all duration-500 hover:shadow-[0_24px_80px_-30px] hover:-translate-y-1',
        s.wrapper,
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-70 bg-gradient-to-br',
          s.accent,
        )}
      />
      <div className="relative flex flex-col h-full gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'grid place-items-center h-14 w-14 rounded-2xl shrink-0',
                s.iconBox,
              )}
            >
              <Icon className="h-7 w-7" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {title}
              </h3>
              <p className="text-sm md:text-base opacity-85 mt-1 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0',
                s.label,
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              {delta}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-4 mt-1">
          <div className="min-w-0">
            <p className="text-sm opacity-70 font-medium">Total</p>
            <p className="text-5xl md:text-6xl font-black tracking-tight mt-1 leading-none">
              {count}
            </p>
          </div>
          <Button asChild size="lg" className={cn('rounded-xl font-semibold transition-all', s.button)}>
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
            </Link>
          </Button>
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
      subtitle="Confira todos os locais cadastrados!"
      ctaLabel="Conferir locais"
      ctaHref="/locais"
      icon={MapPin}
      delta="+3 esta semana"
      {...props}
    />
  );
}

export function EventStatCard(props: Partial<DashboardStatCardProps> & { count: number | string }) {
  return (
    <DashboardStatCard
      tone="event"
      title="Eventos"
      subtitle="Confira todos os eventos cadastrados!"
      ctaLabel="Conferir eventos"
      ctaHref="/eventos"
      icon={Calendar}
      delta="+5 em julho"
      {...props}
    />
  );
}
