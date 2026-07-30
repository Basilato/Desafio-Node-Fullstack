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
import { CategoryBadge, type EventCategoryKey } from '@/components/category-badge';

/* ---------- Venues (Locais) ---------- */

export interface VenueListItem {
  id: string;
  name: string;
  address: string;
  cityState?: string;
  /** Gate identifiers (A, B, C... ou 3,4,5,6...) ou email fallback */
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
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className="group animate-fade-in-up
        flex items-center justify-between gap-3 px-4 sm:px-5 py-4 rounded-2xl
        border border-white/5 bg-white/[0.03] hover:bg-white/[0.06]
        transition-all duration-200 hover:border-white/10 hover:-translate-y-0.5
        hover:shadow-soft"
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-1">
        <div
          className="hidden sm:grid place-items-center h-11 w-11 shrink-0 rounded-xl
            bg-onentree-venue/15 ring-1 ring-onentree-venue/30 text-onentree-venue-foreground"
          aria-hidden="true"
        >
          <MapPin className="h-5 w-5 text-emerald-300" />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 items-center min-w-0">
          <div className="min-w-0">
            <p className="font-semibold truncate text-foreground leading-5">
              {venue.name}
            </p>
            {venue.cityState && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {venue.cityState}
              </p>
            )}
          </div>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="min-w-0 text-sm text-muted-foreground">
                  <p className="truncate line-clamp-1">{venue.address}</p>
                  {venue.capacity && (
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5 inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> Capacidade {venue.capacity.toLocaleString('pt-BR')} lugares
                    </p>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={8}
                className="max-w-xs border-white/10 bg-background/95 backdrop-blur-xl text-xs"
              >
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground">{venue.name}</p>
                  <p className="text-muted-foreground">{venue.address}</p>
                  {venue.capacity && (
                    <p className="text-muted-foreground">
                      Capacidade: {venue.capacity.toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="min-w-0 flex md:justify-end">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold',
                'bg-onentree-venue/15 text-onentree-venue-foreground/90 ring-1 ring-inset ring-onentree-venue/30',
              )}
              title={venue.email ? `Contato: ${venue.email}` : 'Portões liberados'}
            >
              {venue.email ? (
                <>
                  <Mail className="h-3 w-3 opacity-80" />
                  <span className="truncate max-w-[200px]">{venue.email}</span>
                </>
              ) : (
                <span className="truncate tracking-wide font-mono">{venue.gatesOrContact}</span>
              )}
            </span>
          </div>
        </div>
      </div>
      <RowActions href={`/locais/${venue.id}`} type="venue" />
    </div>
  );
}

/* ---------- Events (Eventos) ---------- */

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
  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className="group animate-fade-in-up
        flex items-center justify-between gap-3 px-4 sm:px-5 py-4 rounded-2xl
        border border-white/5 bg-white/[0.03] hover:bg-white/[0.06]
        transition-all duration-200 hover:border-white/10 hover:-translate-y-0.5
        hover:shadow-soft"
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-1">
        <div
          className="hidden sm:grid place-items-center h-11 w-11 shrink-0 rounded-xl
            bg-onentree-event/15 ring-1 ring-onentree-event/30"
          aria-hidden="true"
        >
          <Calendar className="h-5 w-5 text-rose-300" />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 items-center min-w-0">
          <div className="min-w-0 space-y-1">
            <p className="font-semibold truncate text-foreground leading-5">
              {event.name}
            </p>
            <CategoryBadge category={event.category} size="sm" />
          </div>
          <div className="hidden md:block h-8 w-px bg-white/5 self-stretch" />
          <div className="min-w-0 flex md:justify-end md:items-center gap-4 flex-wrap md:flex-nowrap">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="min-w-0 text-sm">
                    <p className="font-medium text-foreground truncate">
                      {event.venueName}
                    </p>
                    {event.dateLabel && (
                      <p className="text-xs text-muted-foreground truncate inline-flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" /> {event.dateLabel}
                      </p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={8}
                  className="max-w-xs border-white/10 bg-background/95 backdrop-blur-xl text-xs"
                >
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground">{event.name}</p>
                    <p className="text-muted-foreground">Local: {event.venueName}</p>
                    {event.dateLabel && (
                      <p className="text-muted-foreground">Data: {event.dateLabel}</p>
                    )}
                    {event.ticketsAvailable !== undefined && (
                      <p className="text-muted-foreground">
                        Ingressos disponíveis: {event.ticketsAvailable.toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {event.ticketsAvailable !== undefined && (
              <span
                className={cn(
                  'shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold',
                  event.ticketsAvailable > 0
                    ? 'bg-success/15 text-success ring-1 ring-inset ring-success/30'
                    : 'bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/30',
                )}
              >
                <Users className="h-3 w-3 opacity-80" />
                {event.ticketsAvailable.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </div>
      <RowActions href={`/eventos/${event.id}`} type="event" />
    </div>
  );
}

/* ---------- Actions (3-points menu) ---------- */

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
          variant="ghost"
          size="icon"
          aria-label={`Ações para ${type === 'venue' ? 'local' : 'evento'}`}
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground
            opacity-60 group-hover:opacity-100 hover:bg-white/5 transition-opacity"
        >
          <EllipsisVertical className="h-4.5 w-4.5" strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 border-white/10 bg-background/95 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          {type === 'venue' ? 'Local' : 'Evento'}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
            <Link href={href}>
              <Eye className="mr-2 h-4 w-4" /> Ver detalhes
              <DropdownMenuShortcut>⌘⏎</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
            <Link href={`${href}/editar`}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-white/5">
            <Copy className="mr-2 h-4 w-4" /> Duplicar
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
            <a href={href} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Abrir em nova aba
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
