'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEventsList } from '@/hooks/use-events-list';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreateEventForm,
  UpdateEventForm,
} from '@/components/forms/create-event-form';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import {
  Plus,
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Ticket,
  Clock,
  PartyPopper,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CategoryBadge,
  CATEGORY_META,
  type EventCategoryKey,
} from '@/components/category-badge';
import type { EventRecent } from '@/lib/api/events';
import { useQuery } from '@tanstack/react-query';
import { listVenues } from '@/lib/api/venues';
import { useDeleteEvent } from '@/hooks/use-event';

const PAGE_SIZE = 8;

function formatDateTime(iso: string) {
  return Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(iso))
    .replace('.', '');
}

export default function EventsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<EventCategoryKey | ''>('');
  const [venueId, setVenueId] = React.useState('');
  const [upcomingOnly, setUpcomingOnly] = React.useState(true);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EventRecent | null>(null);
  const [deleting, setDeleting] = React.useState<EventRecent | null>(null);

  const router = useRouter();
  const deleteEvent = useDeleteEvent();

  const {
    items: events,
    meta,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useEventsList({
    page,
    perPage: PAGE_SIZE,
    search,
    venueId: venueId || undefined,
    category,
    upcomingOnly,
  });

  const venuesQ = useQuery({
    queryKey: ['venues', 'select-choices'] as const,
    queryFn: () => listVenues({ page: 1, perPage: 200 }),
    staleTime: 1000 * 60 * 10,
  });
  const venueChoices = venuesQ.data?.items ?? [];

  const startIdx = events.length ? (meta.page - 1) * PAGE_SIZE + 1 : 0;
  const endIdx = Math.min(meta.page * PAGE_SIZE, meta.total);

  return (
    <div className="container py-8 space-y-8">
      <header className="flex flex-col gap-5">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground font-semibold inline-flex items-center gap-1.5">
            <PartyPopper className="h-3.5 w-3.5 text-primary" />
            Eventos
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/40 to-primary-foreground/15 ring-1 ring-white/10">
                <CalendarDays className="h-4.5 w-4.5 text-rose-100" />
              </span>
              Agenda de eventos
            </h1>
            <p className="text-muted-foreground">
              Crie e gerencie shows, jogos, festivais e tudo mais que vai movimentar os locais
              da Localis.
            </p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/90 text-white shadow-lg shadow-soft"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Novo evento
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/50 to-primary-foreground/15">
                    <PartyPopper className="h-4 w-4 text-rose-50" />
                  </span>
                  Novo evento
                </SheetTitle>
                <SheetDescription>
                  Preencha os dados abaixo. Conflitos de agenda com outros eventos no mesmo local
                  serão detectados automaticamente.
                </SheetDescription>
              </SheetHeader>
              <CreateEventForm
                defaultVenueId={venueId}
                onSuccess={() => setSheetOpen(false)}
                onCancel={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <Card className="rounded-3xl border-white/5 overflow-hidden">
        <CardHeader className="pb-4 pt-5 space-y-4 border-b border-border/50">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              Busca e filtros
            </CardTitle>
            <CardDescription>
              Combine os filtros abaixo para encontrar exatamente o evento que você precisa.
            </CardDescription>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Buscar evento</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Nome ou descrição…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </Label>

            <Label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Categoria</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as EventCategoryKey | '');
                  setPage(1);
                }}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  !category && 'text-muted-foreground',
                )}
              >
                <option value="">Todas as categorias</option>
                {Object.entries(CATEGORY_META).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Label>

            <Label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Local</span>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <select
                  value={venueId}
                  disabled={venuesQ.isLoading}
                  onChange={(e) => {
                    setVenueId(e.target.value);
                    setPage(1);
                  }}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    !venueId && 'text-muted-foreground',
                  )}
                >
                  <option value="">
                    {venuesQ.isLoading ? 'Carregando…' : 'Todos os locais'}
                  </option>
                  {venueChoices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </Label>

            <Label className="flex flex-col gap-1.5 sm:justify-end">
              <span className="text-xs font-medium text-muted-foreground">&nbsp;</span>
              <button
                type="button"
                role="switch"
                aria-checked={upcomingOnly}
                onClick={() => {
                  setUpcomingOnly((v) => !v);
                  setPage(1);
                }}
                className={cn(
                  'inline-flex h-10 items-center gap-2.5 rounded-md border border-input bg-background px-3 text-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 select-none',
                )}
              >
                <span
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300',
                    upcomingOnly
                      ? 'bg-gradient-to-r from-primary to-primary/90 shadow-inner'
                      : 'bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300',
                      upcomingOnly ? 'translate-x-4' : 'translate-x-0.5',
                    )}
                  />
                </span>
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-semibold">Apenas futuros</span>
              </button>
            </Label>
          </div>
          <Separator className="hidden lg:block" />
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[26%] pl-6">Evento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Término</TableHead>
                <TableHead>Ingressos</TableHead>
                <TableHead className="w-[60px] pr-6 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !events.length
                ? Array.from({ length: Math.min(5, PAGE_SIZE) }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : null}
              {!isLoading && events.length === 0 ? (
                <EmptyRow
                  title={
                    search || category || venueId
                      ? isError
                        ? 'Erro ao buscar eventos'
                        : 'Nenhum evento corresponde aos filtros'
                      : 'Nenhum evento cadastrado ainda'
                  }
                  description={
                    search || category || venueId
                      ? isError
                        ? 'Clique em "Tentar novamente" para recarregar.'
                        : 'Limpe algum filtro ou cadastre um novo evento.'
                      : 'Clique em "+ Novo evento" para criar o primeiro evento da agenda.'
                  }
                  cta={
                    isError
                      ? { label: 'Tentar novamente', onClick: () => refetch() }
                      : search || category || venueId
                        ? {
                            label: 'Limpar filtros',
                            onClick: () => {
                              setSearch('');
                              setCategory('');
                              setVenueId('');
                              setUpcomingOnly(true);
                              setPage(1);
                            },
                          }
                        : { label: '+ Novo evento', onClick: () => setSheetOpen(true) }
                  }
                />
              ) : null}
              {events.map((e) => (
                <EventTr
                  key={e.id}
                  event={e}
                  onView={() => router.push(`/eventos/${e.id}`)}
                  onEdit={() => setEditing(e)}
                  onDelete={() => setDeleting(e)}
                />
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              {events.length ? (
                <>
                  Exibindo <strong className="text-foreground">{startIdx}</strong> a{' '}
                  <strong className="text-foreground">{endIdx}</strong> de{' '}
                  <strong className="text-foreground">{meta.total.toLocaleString('pt-BR')}</strong>{' '}
                  eventos
                </>
              ) : (
                isLoading ? 'Carregando agenda…' : 'Nenhum item a exibir.'
              )}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background p-1 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 px-3 gap-1.5"
                disabled={meta.page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Badge
                variant="outline"
                className="rounded-full h-7 border-border text-xs font-mono mx-1 sm:mx-2 px-3 bg-muted/40"
              >
                Página {meta.page} / {Math.max(1, meta.totalPages)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 px-3 gap-1.5"
                disabled={meta.page >= meta.totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="sm:max-w-xl flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/50 to-primary-foreground/15">
                <Pencil className="h-4 w-4 text-rose-50" />
              </span>
              Editar evento
            </SheetTitle>
            <SheetDescription>
              Ajuste os dados do evento. Conflitos de agenda com outros eventos no mesmo local
              serão detectados automaticamente após salvar.
            </SheetDescription>
          </SheetHeader>
          {editing && (
            <UpdateEventForm
              initialData={editing}
              onSuccess={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir evento"
        description={
          deleting ? (
            <>
              Tem certeza que deseja excluir{' '}
              <strong className="text-foreground">{deleting.name}</strong>? Essa ação não pode
              ser desfeita. Ingressos emitidos também serão removidos.
            </>
          ) : (
            ''
          )
        }
        itemLabel={deleting?.name ?? ''}
        confirmButtonLabel="Excluir evento"
        tone="danger"
        onConfirm={async () => {
          if (!deleting) return;
          await deleteEvent.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}

function EventTr({
  event,
  onView,
  onEdit,
  onDelete,
}: {
  event: EventRecent;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tickets = event._count?.tickets ?? event.venue?.capacity;
  return (
    <TableRow className="group h-[64px]">
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/30 via-primary/20 to-primary-foreground/15 ring-1 ring-white/10 grid place-items-center">
            <PartyPopper className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate max-w-[26ch]">{event.name}</p>
            {event.createdBy?.email && (
              <p className="text-xs text-muted-foreground truncate max-w-[34ch]">
                por {event.createdBy.name}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <CategoryBadge category={event.category ?? 'OUTRO'} size="sm" />
      </TableCell>
      <TableCell className="text-muted-foreground">
        <div className="flex items-center gap-1.5 max-w-[24ch]">
          <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate text-foreground">{event.venue?.name ?? '—'}</p>
            {event.venue?.city && (
              <p className="text-xs truncate text-muted-foreground">
                {event.venue.city}
                {event.venue.state ? ` · ${event.venue.state}` : ''}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 max-w-[22ch]">
          <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="font-mono text-xs">{formatDateTime(event.startDate)}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <span className="font-mono text-xs">{formatDateTime(event.endDate)}</span>
      </TableCell>
      <TableCell>
        {typeof tickets === 'number' ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Ticket className="h-3.5 w-3.5 text-primary" />
            {tickets.toLocaleString('pt-BR')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="pr-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-60 group-hover:opacity-100 transition-opacity"
              aria-label="Ações para evento"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={onView}>
              <Eye className="h-4 w-4 text-primary" /> Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={onEdit}>
              <Pencil className="h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-primary focus:text-primary focus:bg-primary/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i} className={cn(i === 0 && 'pl-6', i === 6 && 'pr-6')}>
          <div
            className="h-5 rounded-lg bg-white/5 animate-pulse"
            style={{ width: 40 + (i * 29) % 160 }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

function EmptyRow({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: { label: string; onClick: () => void };
}) {
  return (
    <TableRow>
      <TableCell className="pl-6" colSpan={7}>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 my-2 bg-muted/20">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary-foreground/10 ring-1 ring-white/10 grid place-items-center">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center space-y-1.5 max-w-md">
            <p className="font-bold tracking-tight">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {cta && (
            <Button
              size="sm"
              onClick={cta.onClick}
              className="mt-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/90 text-white shadow-lg shadow-soft"
            >
              {cta.label}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
