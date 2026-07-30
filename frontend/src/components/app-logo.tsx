import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2.5 select-none focus-visible:outline-none',
        className,
      )}
      aria-label="OnEntrée — Ir para a página inicial"
    >
      <span
        aria-hidden="true"
        className="relative grid place-items-center h-9 w-9 rounded-xl
          bg-gradient-to-br from-onentree-event via-onentree-event-muted to-onentree-venue-muted
          shadow-glow text-white shrink-0 transition-transform duration-300
          group-hover:scale-105"
      >
        <UtensilsCrossed className="h-5 w-5" strokeWidth={2.25} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
      </span>
      <span className="flex items-baseline font-extrabold tracking-tight text-[1.42rem] leading-none">
        <span className="text-foreground">On</span>
        <span className="onentree-gradient-text">Entrée</span>
        <span
          aria-hidden="true"
          className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-onentree-venue shadow-[0_0_14px] shadow-onentree-venue/60 translate-y-[-4px]"
        />
      </span>
    </Link>
  );
}
