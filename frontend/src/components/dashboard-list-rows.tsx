import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  EllipsisVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Eye,
  MapPin,
  Mail,
  Calendar,
  Users,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge, type EventCategoryKey } from '@/components/category-badge';

export interface VenueListItem {
  id: string;
  name: string;
  address: string;
  cityState?: string;
  gatesOrContact: string;
  email?: string;
  capacity?: number;
}

export function VenueRow({
  venue,
  index = 0,
}: {
  venue: VenueListItem;
  index?: number;
}) {
  return (
    <li
      style={{ animationDelay: `${index * 45}ms` }}
      className="group animate-fade-in-up"
    >
      <Link
        href={`/locais/${venue.id}`}
        className={cn(
          'flex items-center justify-between gap-3 rounded-2xl border border-transparent px-3.5 sm:px-4 py-3 transition-all duration-200 ease-out-expo',
          'hover:border-border/80 hover:bg-muted/40 hover:shadow-subtle',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div
            aria-hidden="true"
            className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 transition-transform duration-200 group-hover:scale-[1.04] sm:grid"
          >
            <MapPin className="h-5 w-5" strokeWidth={2.25} />
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-1 items-center gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
            <div className="min-w-0">
              <p className="truncate text-[0.95rem] font-semibold leading-5 text-foreground">
                {venue.name}
              </p>
              {venue.cityState && (
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/90">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{venue.cityState}</span>
                </div>
              )}
            </div>

            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="min-w-0 text-sm text-muted-foreground/90">
                    <p className="truncate line-clamp-1">{venue.address}</p>
                    {venue.capacity != null && venue.capacity > 0 && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80">
                        <Users className="h-3 w-3" />
                        Capacidade <span className="tabular-nums font-semibold text-foreground/80">{venue.capacity.toLocaleString('pt-BR')}</span> lugares
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className="max-w-xs border-border/60 bg-background/95 backdrop-blur text-[11px] font-medium leading-relaxed">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground">{venue.name}</p>
                    <p className="text-muted-foreground">{venue.address}</p>
                    {venue.capacity != null && venue.capacity > 0 && (
                      <p className="text-muted-foreground">
                        Capacidade: {venue.capacity.toLocaleString('pt-BR')} lugares
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex min-w-0 items-center md:justify-end">
              {venue.email ? (
                <Badge variant="outline" className="inline-flex items-center gap-1 rounded-full border-accent/25 bg-accent/8 px-2.5 py-1 text-[11px] font-semibold text-accent ring-1 ring-accent/15">
                  <Mail className="h-3 w-3 opacity-80" />
                  <span className="max-w-[200px] truncate">{venue.email}</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="inline-flex items-center gap-1 rounded-full border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-foreground/80 ring-1 ring-border/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="truncate tracking-wide font-mono">{venue.gatesOrContact}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground/80 transition-all duration-200 group-hover:scale-105 group-hover:bg-muted group-hover:text-foreground sm:grid">
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <RowActions href={`/locais/${venue.id}`} type="venue" />
        </div>
      </Link>
    </li>
  );
}

export interface EventListItem {
  id: string;
  name: string;
  category: EventCategoryKey;
  venueName: string;
  dateLabel?: string;
  ticketsAvailable?: number;
}

export function EventRow({
  event,
  index = 0,
}: {
  event: EventListItem;
  index?: number;
}) {
  const ok = event.ticketsAvailable !== undefined && event.ticketsAvailable > 0;
  const low = event.ticketsAvailable !== undefined && event.ticketsAvailable > 0 && event.ticketsAvailable <= 50;
  const toneCls =
    event.ticketsAvailable === undefined
      ? 'border-border/60 bg-muted/40 text-muted-foreground ring-border/50'
      : !ok
        ? 'border-destructive/25 bg-destructive/8 text-destructive ring-destructive/15'
        : low
          ? 'border-warning/30 bg-warning/10 text-warning ring-warning/20'
          : 'border-success/25 bg-success/10 text-success ring-success/15';

  return (
    <li
      style={{ animationDelay: `${index * 45}ms` }}
      className="group animate-fade-in-up"
    >
      <Link
        href={`/eventos/${event.id}`}
        className={cn(
          'flex items-center justify-between gap-3 rounded-2xl border border-transparent px-3.5 sm:px-4 py-3 transition-all duration-200 ease-out-expo',
          'hover:border-border/80 hover:bg-muted/40 hover:shadow-subtle',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div
            aria-hidden="true"
            className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-[1.04] sm:grid"
          >
            <Calendar className="h-5 w-5" strokeWidth={2.25} />
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-1 items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)_auto]">
            <div className="min-w-0 space-y-1.5">
              <p className="truncate text-[0.95rem] font-semibold leading-5 text-foreground">
                {event.name}
              </p>
              <CategoryBadge category={event.category} size="sm" />
            </div>

            <div className="hidden h-7 w-px self-stretch bg-border/70 md:block" />

            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-medium text-foreground/90">
                      {event.venueName}
                    </p>
                    {event.dateLabel && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/90">
                        <Calendar className="h-3 w-3" />
                        {event.dateLabel}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className="max-w-xs border-border/60 bg-background/95 backdrop-blur text-[11px] font-medium leading-relaxed">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground">{event.name}</p>
                    <p className="text-muted-foreground">Local: {event.venueName}</p>
                    {event.dateLabel && <p className="text-muted-foreground">Data: {event.dateLabel}</p>}
                    {event.ticketsAvailable !== undefined && (
                      <p className="text-muted-foreground">
                        Ingressos disponíveis: {event.ticketsAvailable.toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex min-w-0 items-center md:justify-end">
              {event.ticketsAvailable !== undefined && (
                <Badge variant="outline" className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1', toneCls)}>
                  <Users className="h-3 w-3 opacity-80" />
                  <span className="tabular-nums">{event.ticketsAvailable.toLocaleString('pt-BR')}</span>
                  <span className="opacity-70">disp.</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground/80 transition-all duration-200 group-hover:scale-105 group-hover:bg-muted group-hover:text-foreground sm:grid">
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </div>
          <RowActions href={`/eventos/${event.id}`} type="event" />
        </div>
      </Link>
    </li>
  );
}

function RowActions({
  href,
  type,
}: {
  href: string;
  type: 'venue' | 'event';
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={(e) => e.stopPropagation()}
          variant="ghost"
          size="icon"
          aria-label={`Ações para ${type === 'venue' ? 'local' : 'evento'}`}
          className="h-9 w-9 rounded-full text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <EllipsisVertical className="h-4.5 w-4.5" strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 border-border/60 bg-background/95 backdrop-blur-xl shadow-pop"
      >
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
          {type === 'venue' ? 'Local' : 'Evento'}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-muted/70">
            <Link href={href} onClick={(e) => e.stopPropagation()}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
              <DropdownMenuShortcut>⌘⏎</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-muted/70">
            <Link href={`${href}#editar`} scroll={true} onClick={(e) => e.stopPropagation()}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-muted/70">
            <Link href={href} onClick={(e) => e.stopPropagation()}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
              <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-muted/70">
            <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir em nova aba
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/60" />
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-destructive focus:bg-destructive/10">
          <Link href={`${href}#excluir`} scroll={true} onClick={(e) => e.stopPropagation()}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
