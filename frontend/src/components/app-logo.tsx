import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg p-1 -m-1',
        className,
      )}
      aria-label="Event OS — Ir para a página inicial"
    >
      <span
        aria-hidden="true"
        className="relative grid place-items-center h-9 w-9 rounded-xl
          bg-gradient-to-br from-primary via-primary to-accent
          shadow-glow text-white shrink-0 transition-all duration-300
          group-hover:scale-[1.04] group-hover:shadow-glow/60"
      >
        <CalendarCheck className="h-5 w-5" strokeWidth={2.25} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </span>
      <span className="flex items-baseline font-extrabold tracking-tight text-[1.42rem] leading-none">
        <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">Event</span>
        <span className="text-foreground">OS</span>
        <span
          aria-hidden="true"
          className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_14px] shadow-accent/60 translate-y-[-4px]"
        />
      </span>
    </Link>
  );
}
