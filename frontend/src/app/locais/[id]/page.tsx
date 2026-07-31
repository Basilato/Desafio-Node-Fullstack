'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useVenue, useDeleteVenue } from '@/hooks/use-venue';
import { useEventsList } from '@/hooks/use-events-list';
import { UpdateVenueForm } from '@/components/forms/create-venue-form';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Home as HomeIcon,
  Users,
  MapPin,
  DoorOpen,
  CalendarDays,
  Clock,
  Pencil,
  Trash2,
  ArrowRight,
  ChevronRight,
  PartyPopper,
  Plus,
  Search,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { CategoryBadge } from '@/components/category-badge';
import {
  useAssignGateAllowedTicketTypesMutation,
  useCreateGateMutation,
  useDeleteGateMutation,
  useGatesByVenue,
  useUpdateGateMutation,
} from '@/hooks/use-gates';
import { useTicketTypesList } from '@/hooks/use-ticket-types';
import type { GateSummary } from '@/lib/api/gates';
import type { TicketTypeSummary } from '@/lib/api/ticket-types';
import { TICKET_CATEGORY_LABELS, TicketCategoryKey } from '@/lib/api/ticket-types';
import { cn } from '@/lib/utils';

const createGateSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(120),
  identifier: z.string().min(1, 'Identificador obrigatório').max(16),
  description: z.string().max(255).optional().or(z.literal('')),
});

type CreateGateForm = z.infer<typeof createGateSchema>;

function categoryBadgeVariant(c: TicketCategoryKey):
  | 'default'
  | 'secondary'
  | 'outline' {
  switch (c) {
    case 'VIP':
      return 'default';
    case 'CORTESIA':
      return 'secondary';
    case 'MEIA':
      return 'outline';
    default:
      return 'outline';
  }
}

function formatBR(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
      .format(new Date(iso))
      .replace('.', '');
  } catch {
    return iso;
  }
}

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const venueId = params?.id ?? null;

  const [editing, setEditing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#editar') setEditing(true);
    if (hash === '#excluir') setDeleting(true);
    const onHashChange = () => {
      const h = window.location.hash;
      setEditing((curr) => curr || h === '#editar');
      setDeleting((curr) => curr || h === '#excluir');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [venueId]);

  React.useEffect(() => {
    if (!editing && window.location.hash === '#editar') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [editing]);

  React.useEffect(() => {
    if (!deleting && window.location.hash === '#excluir') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [deleting]);

  const {
    data: venue,
    isLoading: loadingVenue,
    isError: errorVenue,
    refetch: refetchVenue,
  } = useVenue(venueId);

  const {
    items: venueEvents,
    isLoading: loadingEvents,
    meta,
  } = useEventsList({
    page: 1,
    perPage: 5,
    venueId: venueId ?? undefined,
    upcomingOnly: false,
  });

  const deleteVenue = useDeleteVenue();
  const ticketTypes = useTicketTypesList(!!venue);
  const gates = useGatesByVenue(venue?.id ?? null, { enabled: !!venue });
  const createGateMut = useCreateGateMutation();
  const updateGateMut = useUpdateGateMutation();
  const deleteGateMut = useDeleteGateMutation();

  const [gateSearch, setGateSearch] = React.useState('');
  const [gateDialogMode, setGateDialogMode] = React.useState<
    { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; item: GateSummary }
  >({ mode: 'closed' });
  const [gateDeleting, setGateDeleting] = React.useState<GateSummary | null>(null);

  const filteredGates = React.useMemo(() => {
    const items = gates.data?.items ?? [];
    if (!gateSearch.trim()) return items;
    const q = gateSearch.toLowerCase();
    return items.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.identifier.toLowerCase().includes(q) ||
        (g.description ?? '').toLowerCase().includes(q),
    );
  }, [gates.data, gateSearch]);

  const totalAllowedReleases = React.useMemo<number>(() => {
    const items = gates.data?.items ?? [];
    return items.reduce(
      (acc, g) => acc + (g.ticketTypes?.length ?? 0),
      0,
    );
  }, [gates.data]);

  return (
    <div className="container py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <HomeIcon className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <Link
          href="/locais"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <Building2 className="h-3.5 w-3.5 text-accent" />
          Locais
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-semibold inline-flex items-center gap-1.5 max-w-[40ch] truncate">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          {loadingVenue ? 'Carregando…' : venue?.name ?? 'Local não encontrado'}
        </span>
      </nav>

      {loadingVenue && <LoadingState />}
      {errorVenue && (
        <ErrorState
          title="Não foi possível carregar este local"
          description="Verifique a conexão ou tente novamente."
          onRetry={() => refetchVenue()}
        />
      )}
      {!loadingVenue && !errorVenue && venue && (
        <>
          {/* Hero + CTA */}
          <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent ring-1 ring-border/40">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
            <div className="relative p-6 sm:p-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-accent via-accent/80 to-accent-foreground/15 ring-1 ring-white/15 grid place-items-center shadow-xl shadow-soft">
                  <Building2 className="h-8 w-8 text-accent-foreground" strokeWidth={2.1} />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate max-w-[32ch]">
                      {venue.name}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    {venue.city && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-accent" />
                        {venue.city}
                        {venue.state ? ` · ${venue.state}` : ''}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-accent" />
                      Capacidade de{' '}
                      <strong className="text-foreground">
                        {venue.capacity.toLocaleString('pt-BR')}
                      </strong>{' '}
                      pessoas
                    </span>
                  </div>
                  {venue.description && (
                    <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed pt-1">
                      {venue.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 lg:shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 hover:border-white/20"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-1.5" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Excluir
                </Button>
              </div>
            </div>
          </section>

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ficha e contato */}
            <Card className="rounded-3xl border-border/40 overflow-hidden">
              <CardHeader className="pb-4 pt-5 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  Ficha do local
                </CardTitle>
                <CardDescription>
                  Dados de endereço, contato e informações administrativas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <dl className="grid grid-cols-1 gap-4 text-sm">
                  <InfoRow label="Endereço" value={venue.address ?? '—'} />
                  <InfoRow
                    label="Cidade / UF"
                    value={
                      venue.city
                        ? `${venue.city}${venue.state ? ` · ${venue.state}` : ''}`
                        : '—'
                    }
                  />
                  <InfoRow label="CEP" value={venue.zipCode ?? '—'} />
                  <InfoRow
                    label="Capacidade"
                    value={`${venue.capacity.toLocaleString('pt-BR')} pessoas`}
                  />
                  <InfoRow
                    label="E-mail"
                    value={venue.email ?? '—'}
                    href={venue.email ? `mailto:${venue.email}` : undefined}
                    mono={false}
                  />
                  <InfoRow
                    label="Telefone"
                    value={venue.phone ?? '—'}
                    href={venue.phone ? `tel:${venue.phone}` : undefined}
                  />
                  <InfoRow
                    label="Eventos vinculados"
                    value={
                      typeof venue._count?.events === 'number'
                        ? `${venue._count.events} ${venue._count.events === 1 ? 'evento' : 'eventos'}`
                        : meta.total > 0
                          ? `${meta.total} eventos`
                          : 'Sem eventos'
                    }
                  />
                  <InfoRow
                    label="Portões de acesso"
                    value={`${(gates.data?.items ?? []).length} ${(gates.data?.items ?? []).length === 1 ? 'portão' : 'portões'} · ${totalAllowedReleases} ${totalAllowedReleases === 1 ? 'liberação' : 'liberações'}`}
                  />
                </dl>
              </CardContent>
            </Card>

            {/* CRUD Portões + liberações */}
            <Card className="rounded-3xl border-border/40 lg:col-span-2 overflow-hidden">
              <CardHeader className="pb-4 pt-5 border-b border-border/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/20">
                      <DoorOpen className="h-3.5 w-3.5" />
                    </span>
                    Portões e acesso
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {gates.data?.items?.length ?? 0} cadastrados
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Crie portões (catracas) e libere quais tipos de ingresso podem
                    entrar por cada um deles.
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="relative flex-1 sm:max-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      autoComplete="off"
                      placeholder="Buscar portão por nome ou ID"
                      value={gateSearch}
                      onChange={(e) => setGateSearch(e.target.value)}
                      className="pl-8 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => setGateDialogMode({ mode: 'create' })}
                    className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent hover:to-accent/90 text-white shadow-lg shadow-soft whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Novo portão
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-4">
                {gates.isLoading && (ticketTypes.isFetching || ticketTypes.isLoading) ? (
                  <GatesSkeleton />
                ) : (gates.data?.items?.length ?? 0) === 0 ? (
                  <EmptyBox
                    icon={<DoorOpen className="h-5 w-5 text-muted-foreground" />}
                    title="Nenhum portão cadastrado"
                    description="Clique em Novo portão para criar catracas/entradas para o público."
                  />
                ) : filteredGates.length === 0 ? (
                  <EmptyBox
                    icon={<Search className="h-5 w-5 text-muted-foreground" />}
                    title="Nenhum portão na busca"
                    description="Tente outro termo, ou limpe o campo de busca."
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredGates.map((g) => (
                      <GateRow
                        key={g.id}
                        venueId={venue.id}
                        item={g}
                        allTicketTypes={ticketTypes.data?.items ?? []}
                        onEdit={() => setGateDialogMode({ mode: 'edit', item: g })}
                        onDelete={() => setGateDeleting(g)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Eventos recentes neste local */}
          <Card className="rounded-3xl border-border/40 overflow-hidden">
            <CardHeader className="pb-4 pt-5 border-b border-border/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </span>
                  Eventos neste local
                </CardTitle>
                <CardDescription>
                  Últimos eventos programados para este espaço.
                </CardDescription>
              </div>
              <Link href="/eventos" className="shrink-0">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Ver agenda completa <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loadingEvents && !venueEvents.length ? (
                <div className="p-8 space-y-2.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl border border-border/40 bg-muted/10 animate-pulse"
                      style={{ opacity: 0.6 + (i * 0.12) % 0.35 }}
                    />
                  ))}
                </div>
              ) : venueEvents.length === 0 ? (
                <div className="p-10">
                  <EmptyBox
                    icon={<PartyPopper className="h-5 w-5 text-muted-foreground" />}
                    title="Nenhum evento programado aqui"
                    description="Crie um novo evento vinculado a este local para começar."
                  />
                </div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {venueEvents.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/eventos/${e.id}`)}
                        className="w-full text-left p-5 sm:p-6 flex items-start gap-4 hover:bg-muted/20 transition-colors group"
                      >
                        <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/20 to-primary-foreground/15 ring-1 ring-white/10 grid place-items-center">
                          <PartyPopper className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold truncate max-w-[32ch]">{e.name}</p>
                            <CategoryBadge category={e.category} size="sm" />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              Início:{' '}
                              <span className="font-mono text-foreground/90">
                                {formatBR(e.startDate)}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              Término:{' '}
                              <span className="font-mono text-foreground/90">
                                {formatBR(e.endDate)}
                              </span>
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="hidden sm:inline-flex items-center gap-1 rounded-full border-border/70 text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors"
                        >
                          Ver detalhes <ArrowRight className="h-3.5 w-3.5" />
                        </Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Editar sheet */}
      <Sheet open={editing} onOpenChange={(o) => !o && setEditing(false)}>
        <SheetContent className="sm:max-w-xl flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent/50 to-accent-foreground/15">
                <Pencil className="h-4 w-4 text-accent-foreground" />
              </span>
              Editar local
            </SheetTitle>
            <SheetDescription>
              Altere os dados cadastrais ou os portões de acesso. Alterações são
              salvas imediatamente.
            </SheetDescription>
          </SheetHeader>
          {venue && (
            <UpdateVenueForm
              initialData={venue}
              onSuccess={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Excluir dialog */}
      <ConfirmDeleteDialog
        open={deleting}
        onOpenChange={(o) => !o && setDeleting(false)}
        title="Excluir local"
        description={
          venue ? (
            <>
              Tem certeza que deseja excluir{' '}
              <strong className="text-foreground">{venue.name}</strong>? Essa ação
              não pode ser desfeita. Portões de acesso também serão removidos.
            </>
          ) : (
            ''
          )
        }
        itemLabel={venue?.name ?? ''}
        confirmButtonLabel="Excluir local"
        tone="danger"
        onConfirm={async () => {
          if (!venue) return;
          await deleteVenue.mutateAsync(venue.id);
        }}
      />

      {/* Gate Dialog (create/edit) */}
      <GateDialog
        open={gateDialogMode.mode !== 'closed'}
        onOpenChange={(o) => !o && setGateDialogMode({ mode: 'closed' })}
        initial={gateDialogMode.mode === 'edit' ? gateDialogMode.item : null}
        venueId={venue?.id ?? null}
      />

      {/* Delete Gate */}
      <ConfirmDeleteDialog
        open={!!gateDeleting}
        onOpenChange={(o) => !o && setGateDeleting(null)}
        title="Excluir portão"
        description={
          gateDeleting ? (
            <>
              Tem certeza que deseja excluir o portão{' '}
              <strong className="text-foreground">{gateDeleting.name}</strong>? As
              liberações de tipos de ingresso serão removidas junto.
            </>
          ) : (
            ''
          )
        }
        itemLabel={
          gateDeleting ? `${gateDeleting.identifier} · ${gateDeleting.name}` : ''
        }
        confirmButtonLabel="Excluir portão"
        tone="danger"
        onConfirm={async () => {
          if (!gateDeleting) return;
          await deleteGateMut.mutateAsync({
            id: gateDeleting.id,
            venueId: gateDeleting.venueId,
          });
          setGateDeleting(null);
        }}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
  mono = true,
}: {
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </dt>
      <dd
        className={
          'text-sm font-medium text-foreground leading-relaxed break-words min-h-[20px] ' +
          (mono ? 'font-mono text-[13px]' : '')
        }
      >
        {href ? (
          <Link href={href} className="hover:underline underline-offset-4">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function EmptyBox({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-10 px-5 bg-muted/15">
      <div className="h-11 w-11 rounded-2xl bg-muted/40 ring-1 ring-border/40 grid place-items-center">
        {icon}
      </div>
      <div className="text-center space-y-1.5 max-w-sm">
        <p className="font-bold tracking-tight text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-40 rounded-3xl border border-border/40 bg-muted/10 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-72 rounded-3xl border border-border/40 bg-muted/10 animate-pulse lg:col-span-2" />
        <div className="h-72 rounded-3xl border border-border/40 bg-muted/10 animate-pulse" />
      </div>
      <div className="h-80 rounded-3xl border border-border/40 bg-muted/10 animate-pulse" />
    </div>
  );
}

function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <Card className="rounded-3xl border-primary/20">
      <CardContent className="p-10 flex flex-col items-center text-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary grid place-items-center ring-1 ring-primary/20">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <p className="font-bold tracking-tight">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="border-border hover:bg-muted"
        >
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}

function GatesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-10 rounded-md" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function GateDialog({
  open,
  onOpenChange,
  initial,
  venueId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: GateSummary | null;
  venueId: string | null;
}) {
  const isEdit = !!initial;
  const createMut = useCreateGateMutation();
  const updateMut = useUpdateGateMutation();

  const form = useForm<CreateGateForm>({
    resolver: zodResolver(createGateSchema),
    defaultValues: {
      name: initial?.name ?? '',
      identifier: initial?.identifier ?? '',
      description: initial?.description ?? '',
    },
    mode: 'onTouched',
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      name: initial?.name ?? '',
      identifier: initial?.identifier ?? '',
      description: initial?.description ?? '',
    });
  }, [open, initial, form]);

  const busy = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: CreateGateForm) {
    if (!venueId) return;
    if (isEdit && initial) {
      await updateMut.mutateAsync({
        id: initial.id,
        payload: {
          name: values.name,
          identifier: values.identifier,
          description: values.description || undefined,
        },
      });
    } else {
      await createMut.mutateAsync({
        venueId,
        payload: {
          name: values.name,
          identifier: values.identifier,
          description: values.description || undefined,
        },
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent-foreground/15">
              <DoorOpen className="h-4 w-4 text-accent-foreground" />
            </span>
            {isEdit ? 'Editar portão' : 'Novo portão'}
          </DialogTitle>
          <DialogDescription>
            O identificador aparece nas catracas e bilheterias (ex: A1, Pista Sul, VIP).
            Deve ser único dentro do mesmo local.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="g-name">Nome *</Label>
              <Input
                id="g-name"
                placeholder="Ex: Portão Principal, Catraca A, Acesso VIP"
                {...form.register('name')}
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-primary">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-id">Identificador *</Label>
              <Input
                id="g-id"
                className="font-mono uppercase tracking-wider"
                placeholder="Ex: A1"
                {...form.register('identifier')}
              />
              {form.formState.errors.identifier ? (
                <p className="text-xs text-primary">
                  {form.formState.errors.identifier.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-desc">Descrição (opcional)</Label>
            <textarea
              id="g-desc"
              rows={3}
              placeholder="Ex: Acesso pela rua lateral, aceita ingressos VIP e Camarote"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register('description')}
            />
            {form.formState.errors.description ? (
              <p className="text-xs text-primary">
                {String(form.formState.errors.description.message ?? '')}
              </p>
            ) : null}
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={busy || !form.formState.isValid || !venueId}
              className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent hover:to-accent/90 text-white shadow-lg shadow-soft"
            >
              {busy ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar portão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GateRow({
  venueId,
  item,
  allTicketTypes,
  onEdit,
  onDelete,
}: {
  venueId: string;
  item: GateSummary;
  allTicketTypes: TicketTypeSummary[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const assignMut = useAssignGateAllowedTicketTypesMutation();
  const allowedIdsRef = React.useMemo(
    () => new Set((item.ticketTypes ?? []).map((t) => t.ticketType.id)),
    [item.ticketTypes],
  );
  const [selected, setSelected] = React.useState<Set<string>>(allowedIdsRef);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    setSelected(allowedIdsRef);
    setDirty(false);
  }, [allowedIdsRef]);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDirty(true);
  }

  async function save() {
    await assignMut.mutateAsync({
      venueId,
      gateId: item.id,
      ticketTypeIds: Array.from(selected),
    });
    setDirty(false);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/10 overflow-hidden">
      <div className="p-4 flex items-start gap-3 justify-between flex-wrap">
        <div className="min-w-0 flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-accent/40 via-accent/30 to-accent-foreground/15 grid place-items-center ring-1 ring-white/10">
            <DoorOpen className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="font-mono text-accent border-accent/30 bg-accent/10"
              >
                {item.identifier}
              </Badge>
              <p className="font-bold tracking-tight truncate max-w-[28ch]">
                {item.name}
              </p>
            </div>
            {item.description ? (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
                {item.description}
              </p>
            ) : null}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {Array.from(selected).length === 0 ? (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  Sem tipos liberados
                </Badge>
              ) : (
                Array.from(selected).map((id) => {
                  const t = allTicketTypes.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <Badge
                      key={id}
                      variant={categoryBadgeVariant(
                        t.category as TicketCategoryKey,
                      )}
                      className="text-[10px]"
                    >
                      {t.name}
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 px-2.5"
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 px-2.5 text-primary hover:text-primary hover:bg-primary/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Excluir
          </Button>
        </div>
      </div>

      <Separator />

      <div className="px-4 py-4 sm:px-5 sm:py-4 space-y-3 bg-gradient-to-br from-transparent via-transparent to-accent/5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            Tipos liberados neste portão
          </Label>
          {dirty ? (
            <Button
              size="sm"
              type="button"
              onClick={() => void save()}
              disabled={assignMut.isPending}
              className="h-8 px-3 bg-accent hover:bg-accent/90 text-white shadow-md shadow-soft"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {assignMut.isPending ? 'Salvando…' : 'Salvar liberações'}
            </Button>
          ) : (
            <Badge variant="outline" className="text-[10px] uppercase">
              Alterações são automáticas · basta clicar
            </Badge>
          )}
        </div>
        {allTicketTypes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/15 p-4 text-center">
            <p className="text-xs font-semibold tracking-tight mb-0.5">
              Nenhum tipo de ingresso criado
            </p>
            <p className="text-[11px] text-muted-foreground">
              Primeiro crie tipos de ingresso (Inteira, VIP, Meia, etc).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allTicketTypes.map((tt) => {
              const checked = selected.has(tt.id);
              return (
                <label
                  key={tt.id}
                  className={cn(
                    'group flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all',
                    checked
                      ? 'border-accent ring-2 ring-accent/25 bg-accent/8'
                      : 'border-border/60 bg-background/20 hover:bg-muted/30 hover:border-white/15',
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-muted/20 text-accent focus:ring-accent cursor-pointer accent-accent"
                    checked={checked}
                    onChange={() => toggleOne(tt.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold tracking-tight truncate">
                        {tt.name}
                      </p>
                      <Badge
                        variant={categoryBadgeVariant(
                          tt.category as TicketCategoryKey,
                        )}
                        className="text-[9px] uppercase font-mono"
                      >
                        {TICKET_CATEGORY_LABELS[
                          tt.category as TicketCategoryKey
                        ] ?? tt.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {tt.description
                        ? tt.description.length > 90
                          ? tt.description.slice(0, 87) + '…'
                          : tt.description
                        : 'Sem descrição'}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
