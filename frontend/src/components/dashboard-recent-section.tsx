import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SectionTone = 'venue' | 'event';

const toneStyles: Record<SectionTone, {
  card: string;
  titleBar: string;
  titleDot: string;
  cta: string;
}> = {
  venue: {
    card: 'onentree-card-glow border-emerald-500/10 bg-onentree-surface/50',
    titleBar: 'bg-onentree-venue-muted/20 text-onentree-venue-foreground',
    titleDot: 'bg-emerald-400 shadow-[0_0_16px] shadow-emerald-400/60',
    cta: 'text-emerald-300 hover:text-emerald-200 hover:bg-emerald-300/5',
  },
  event: {
    card: 'onentree-card-glow border-rose-500/10 bg-onentree-surface/50',
    titleBar: 'bg-onentree-event-muted/20 text-onentree-event-foreground',
    titleDot: 'bg-rose-400 shadow-[0_0_16px] shadow-rose-400/60',
    cta: 'text-rose-300 hover:text-rose-200 hover:bg-rose-300/5',
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
}: RecentSectionProps) {
  const s = toneStyles[tone];
  const hasItems = items.length > 0;
  return (
    <Card
      className={cn(
        'rounded-3xl overflow-hidden border backdrop-blur-sm transition-shadow',
        s.card,
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
              s.titleBar,
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', s.titleDot)} />
            {title}
          </div>
          {description && (
            <p className="hidden sm:block text-sm text-muted-foreground truncate max-w-[24ch]">
              {description}
            </p>
          )}
        </div>
        <Button asChild variant="ghost" size="sm" className={cn('gap-1.5 rounded-full h-9 px-4 font-semibold', s.cta)}>
          <Link href={seeAllHref}>
            {seeAllLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-5 space-y-2.5">
        {hasItems ? (
          <div className="space-y-2.5">{items}</div>
        ) : (
          <div className="text-sm text-muted-foreground py-10 text-center border border-dashed rounded-2xl border-white/10">
            {emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
