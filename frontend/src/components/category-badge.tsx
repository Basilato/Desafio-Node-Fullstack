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
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset whitespace-nowrap transition-all duration-150',
  {
    variants: {
      tone: {
        futebol:
          'bg-[color-mix(in_oklab,var(--cat-futebol)_14%,transparent)] text-[var(--cat-futebol)] ring-[color-mix(in_oklab,var(--cat-futebol)_35%,transparent)]',
        show:
          'bg-[color-mix(in_oklab,var(--cat-show)_16%,transparent)] text-[var(--cat-show)] ring-[color-mix(in_oklab,var(--cat-show)_40%,transparent)]',
        teatro:
          'bg-[color-mix(in_oklab,var(--cat-teatro)_16%,transparent)] text-[var(--cat-teatro)] ring-[color-mix(in_oklab,var(--cat-teatro)_40%,transparent)]',
        festival:
          'bg-[color-mix(in_oklab,var(--cat-festival)_16%,transparent)] text-[var(--cat-festival)] ring-[color-mix(in_oklab,var(--cat-festival)_40%,transparent)]',
        esporte:
          'bg-[color-mix(in_oklab,var(--cat-esporte)_16%,transparent)] text-[var(--cat-esporte)] ring-[color-mix(in_oklab,var(--cat-esporte)_40%,transparent)]',
        outro:
          'bg-muted text-muted-foreground ring-border/60',
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
