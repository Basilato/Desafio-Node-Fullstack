import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2.5 select-none focus-visible:outline-none',
        className,
      )}
      aria-label="Localis — Ir para a página inicial"
    >
      <span
        aria-hidden="true"
        className="relative grid place-items-center h-9 w-9 rounded-xl
          bg-gradient-to-br from-localis-event via-localis-event-muted to-localis-venue-muted
          shadow-glow text-white shrink-0 transition-transform duration-300
          group-hover:scale-105"
      >
        <Building2 className="h-5 w-5" strokeWidth={2.25} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
      </span>
      <span className="flex items-baseline font-extrabold tracking-tight text-[1.42rem] leading-none">
        <span className="localis-gradient-text">Loc</span>
        <span className="text-foreground">alis</span>
        <span
          aria-hidden="true"
          className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-localis-venue shadow-[0_0_14px] shadow-localis-venue/60 translate-y-[-4px]"
        />
      </span>
    </Link>
  );
}
