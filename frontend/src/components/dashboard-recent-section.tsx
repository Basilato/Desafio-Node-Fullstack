import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight, MoreHorizontal, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type SectionTone = 'venue' | 'event';

const toneStyles: Record<SectionTone, {
  accent: string;
  accentBg: string;
  accentRing: string;
  accentText: string;
  createLabel: string;
  createHref: string;
  headerHint: string;
}> = {
  venue: {
    accent: 'bg-accent',
    accentBg: 'bg-accent/8',
    accentRing: 'ring-accent/25',
    accentText: 'text-accent',
    createLabel: 'Novo local',
    createHref: '/locais/novo',
    headerHint: 'Capacidade · Portões · Contato',
  },
  event: {
    accent: 'bg-primary',
    accentBg: 'bg-primary/8',
    accentRing: 'ring-primary/25',
    accentText: 'text-primary',
    createLabel: 'Novo evento',
    createHref: '/eventos/novo',
    headerHint: 'Local · Data · Ingressos',
  },
};

interface RecentSectionProps {
  tone: SectionTone;
  title: string;
  seeAllHref: string;
  seeAllLabel?: string;
  description?: string;
  emptyLabel?: string;
  items: ReactNode[];
  className?: string;
  headerExtra?: ReactNode;
  columnsHint?: string;
}

export function RecentSection({
  tone,
  title,
  seeAllHref,
  seeAllLabel = 'Ver todos',
  description,
  emptyLabel = 'Nenhum item cadastrado ainda.',
  items,
  className,
  headerExtra,
  columnsHint,
}: RecentSectionProps) {
  const s = toneStyles[tone];
  const hasItems = items.length > 0;
  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-subtle transition-all duration-200 hover:shadow-pop',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent opacity-0 transition-opacity group-hover:opacity-100',
        )}
      />

      <CardHeader className="flex flex-col gap-4 border-b border-border/60 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl ring-1', s.accentBg, s.accentRing)}>
              <span className={cn('h-2.5 w-2.5 rounded-full', s.accent)} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[1.1rem] font-extrabold tracking-tight md:text-xl">
                  {title}
                </h2>
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground" aria-label="Mais informações">
                        <MoreHorizontal className="h-4 w-4" strokeWidth={2.25} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-[28ch] text-[11px] font-medium leading-relaxed">
                      {columnsHint ?? s.headerHint}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {description && (
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground/90">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {headerExtra}
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              'h-9 rounded-full px-4 font-semibold ring-1 transition-all active:scale-[0.98]',
              'border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground',
              s.accentRing,
            )}
          >
            <Link href={s.createHref}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              {s.createLabel}
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              'h-9 rounded-full gap-1.5 px-4 font-semibold',
              s.accentText,
              'hover:bg-transparent hover:underline',
            )}
          >
            <Link href={seeAllHref}>
              {seeAllLabel}
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {hasItems ? (
          <ul className="space-y-2">{items}</ul>
        ) : (
          <div className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
            <div className={cn('grid h-12 w-12 place-items-center rounded-2xl ring-1', s.accentBg, s.accentRing)}>
              <Plus className={cn('h-5 w-5', s.accentText)} strokeWidth={2.25} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground/90">
                {emptyLabel}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground/90">
                Comece criando o primeiro registro — basta clicar no botão ao lado ou acessar a página dedicada.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn('mt-2 h-9 rounded-full px-4 font-semibold', 'border-border/80', s.accentText)}
            >
              <Link href={s.createHref}>
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                {s.createLabel}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
