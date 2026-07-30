import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Music2,
  Theater,
  PartyPopper,
  Medal,
  Grid3x3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type EventCategoryKey =
  | 'FUTEBOL'
  | 'SHOW'
  | 'TEATRO'
  | 'FESTIVAL'
  | 'ESPORTE'
  | 'OUTRO';

export interface CategoryMetaItem {
  label: string;
  icon: LucideIcon;
  tone: 'futebol' | 'show' | 'teatro' | 'festival' | 'esporte' | 'outro';
}

export const CATEGORY_META: Record<EventCategoryKey, CategoryMetaItem> = {
  FUTEBOL: { label: 'Futebol', icon: Trophy, tone: 'futebol' },
  SHOW: { label: 'Show', icon: Music2, tone: 'show' },
  TEATRO: { label: 'Teatro', icon: Theater, tone: 'teatro' },
  FESTIVAL: { label: 'Festival', icon: PartyPopper, tone: 'festival' },
  ESPORTE: { label: 'Esporte', icon: Medal, tone: 'esporte' },
  OUTRO: { label: 'Outro', icon: Grid3x3, tone: 'outro' },
};

const categoryBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset whitespace-nowrap transition-transform duration-200 hover:-translate-y-0.5',
  {
    variants: {
      tone: {
        futebol:
          'bg-[hsl(var(--cat-futebol)/0.14)] text-[hsl(var(--cat-futebol))] ring-[hsl(var(--cat-futebol)/0.35)]',
        show:
          'bg-[hsl(var(--cat-show)/0.16)] text-[hsl(var(--cat-show))] ring-[hsl(var(--cat-show)/0.4)]',
        teatro:
          'bg-[hsl(var(--cat-teatro)/0.16)] text-[hsl(var(--cat-teatro))] ring-[hsl(var(--cat-teatro)/0.4)]',
        festival:
          'bg-[hsl(var(--cat-festival)/0.16)] text-[hsl(var(--cat-festival))] ring-[hsl(var(--cat-festival)/0.4)]',
        esporte:
          'bg-[hsl(var(--cat-esporte)/0.16)] text-[hsl(var(--cat-esporte))] ring-[hsl(var(--cat-esporte)/0.4)]',
        outro:
          'bg-muted text-muted-foreground ring-border',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-[10px]',
        default: 'px-3 py-1 text-xs',
        lg: 'px-3.5 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      tone: 'outro',
      size: 'default',
    },
  },
);

export interface CategoryBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof categoryBadgeVariants> {
  category: EventCategoryKey;
  showIcon?: boolean;
}

export function CategoryBadge({
  category,
  tone,
  size,
  showIcon = true,
  className,
  ...rest
}: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const finalTone = (tone ?? meta.tone) as NonNullable<VariantProps<typeof categoryBadgeVariants>['tone']>;
  const extra = rest as React.HTMLAttributes<HTMLSpanElement>;
  return (
    <Badge
      variant="outline"
      className={cn('border-0 p-0 bg-transparent shadow-none', className)}
      {...extra}
    >
      <span className={categoryBadgeVariants({ tone: finalTone, size })}>
        {showIcon && <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />}
        {meta.label}
      </span>
    </Badge>
  );
}
