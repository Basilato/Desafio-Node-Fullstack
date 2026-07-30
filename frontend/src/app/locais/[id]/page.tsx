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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
} from 'lucide-react';
import { CategoryBadge } from '@/components/category-badge';

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
          <Building2 className="h-3.5 w-3.5 text-localis-venue" />
          Locais
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-semibold inline-flex items-center gap-1.5 max-w-[40ch] truncate">
          <MapPin className="h-3.5 w-3.5 text-localis-venue" />
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
          <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-localis-venue/20 via-localis-venue/5 to-transparent ring-1 ring-white/5">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-localis-venue/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="relative p-6 sm:p-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-localis-venue via-localis-venue/80 to-emerald-900/70 ring-1 ring-white/15 grid place-items-center shadow-xl shadow-emerald-900/20">
                  <Building2 className="h-8 w-8 text-emerald-50" strokeWidth={2.1} />
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
                        <MapPin className="h-4 w-4 text-localis-venue" />
                        {venue.city}
                        {venue.state ? ` · ${venue.state}` : ''}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-localis-venue" />
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
                  className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/40"
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
            <Card className="rounded-3xl border-white/5 lg:col-span-2 overflow-hidden">
              <CardHeader className="pb-4 pt-5 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-localis-venue/10 text-localis-venue ring-1 ring-localis-venue/20">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  Ficha do local
                </CardTitle>
                <CardDescription>
                  Dados de endereço, contato e informações administrativas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                    value={`${venue.gates.length} ${venue.gates.length === 1 ? 'portão' : 'portões'}`}
                  />
                </dl>
              </CardContent>
            </Card>

            {/* Portões */}
            <Card className="rounded-3xl border-white/5 overflow-hidden">
              <CardHeader className="pb-4 pt-5 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-localis-venue/10 text-localis-venue ring-1 ring-localis-venue/20">
                    <DoorOpen className="h-3.5 w-3.5" />
                  </span>
                  Portões ({venue.gates.length})
                </CardTitle>
                <CardDescription>
                  Acessos disponíveis para entrada do público.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5 max-h-[480px] overflow-y-auto">
                {venue.gates.length === 0 ? (
                  <EmptyBox
                    icon={<DoorOpen className="h-5 w-5 text-muted-foreground" />}
                    title="Nenhum portão cadastrado"
                    description="Edite o local para incluir portões de acesso."
                  />
                ) : (
                  venue.gates.map((g) => (
                    <div
                      key={g.id}
                      className="group rounded-2xl border border-border/60 bg-muted/20 p-4 hover:bg-muted/30 hover:border-localis-venue/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-localis-venue/10 text-localis-venue ring-1 ring-localis-venue/30 font-mono font-bold text-xs shrink-0">
                          {g.identifier.toUpperCase()}
                        </span>
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-semibold leading-tight">{g.name}</p>
                          {g.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {g.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Eventos recentes neste local */}
          <Card className="rounded-3xl border-white/5 overflow-hidden">
            <CardHeader className="pb-4 pt-5 border-b border-border/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-localis-event/10 text-localis-event ring-1 ring-localis-event/20">
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
                      className="h-16 rounded-2xl border border-white/5 bg-muted/10 animate-pulse"
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
                        <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-localis-event-muted/60 via-localis-event/40 to-rose-900/40 ring-1 ring-white/10 grid place-items-center">
                          <PartyPopper className="h-5 w-5 text-rose-200" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold truncate max-w-[32ch]">{e.name}</p>
                            <CategoryBadge category={e.category} size="sm" />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-localis-event" />
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
                          className="hidden sm:inline-flex items-center gap-1 rounded-full border-border/70 text-muted-foreground group-hover:text-localis-event group-hover:border-localis-event/30 transition-colors"
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
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-localis-venue/70 to-emerald-900/60">
                <Pencil className="h-4 w-4 text-emerald-50" />
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
      <div className="h-11 w-11 rounded-2xl bg-muted/40 ring-1 ring-white/5 grid place-items-center">
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
      <div className="h-40 rounded-3xl border border-white/5 bg-muted/10 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-72 rounded-3xl border border-white/5 bg-muted/10 animate-pulse lg:col-span-2" />
        <div className="h-72 rounded-3xl border border-white/5 bg-muted/10 animate-pulse" />
      </div>
      <div className="h-80 rounded-3xl border border-white/5 bg-muted/10 animate-pulse" />
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
    <Card className="rounded-3xl border-rose-500/20">
      <CardContent className="p-10 flex flex-col items-center text-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-300 grid place-items-center ring-1 ring-rose-500/20">
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
