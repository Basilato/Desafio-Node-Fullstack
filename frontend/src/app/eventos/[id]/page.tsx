'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEvent, useDeleteEvent } from '@/hooks/use-event';
import { UpdateEventForm } from '@/components/forms/create-event-form';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { EventCapacityCard } from '@/components/event-capacity-card';
import { IssueTicketSheet } from '@/components/issue-ticket-sheet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  PartyPopper,
  Home as HomeIcon,
  MapPin,
  CalendarDays,
  Clock,
  UserCircle2,
  Pencil,
  Trash2,
  Ticket,
  Users,
  ChevronRight,
  Building2,
  ArrowRight,
  AtSign,
  Plus,
} from 'lucide-react';
import { CategoryBadge } from '@/components/category-badge';
import { EventTicketGateTabs } from '@/components/event-ticket-gate-tabs';

function formatBRDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
      .format(new Date(iso))
      .replace('.', '');
  } catch {
    return iso;
  }
}

function formatBRShort(iso: string) {
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

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params?.id ?? null;

  const [editing, setEditing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [issuing, setIssuing] = React.useState(false);

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
  }, [eventId]);

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
    data: event,
    isLoading: loadingEvent,
    isError: errorEvent,
    refetch: refetchEvent,
  } = useEvent(eventId);

  const deleteEvent = useDeleteEvent();

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
          href="/eventos"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <PartyPopper className="h-3.5 w-3.5 text-localis-event" />
          Eventos
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-semibold inline-flex items-center gap-1.5 max-w-[40ch] truncate">
          <CalendarDays className="h-3.5 w-3.5 text-localis-event" />
          {loadingEvent ? 'Carregando…' : event?.name ?? 'Evento não encontrado'}
        </span>
      </nav>

      {loadingEvent && <LoadingState />}
      {errorEvent && (
        <ErrorState
          title="Não foi possível carregar este evento"
          description="Verifique a conexão ou tente novamente."
          onRetry={() => refetchEvent()}
        />
      )}
      {!loadingEvent && !errorEvent && event && (
        <>
          {/* Hero + CTA */}
          <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-localis-event/20 via-localis-event/5 to-transparent ring-1 ring-white/5">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-localis-event/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
            <div className="relative p-6 sm:p-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-localis-event via-localis-event/80 to-rose-900/70 ring-1 ring-white/15 grid place-items-center shadow-xl shadow-rose-900/20">
                  <PartyPopper className="h-8 w-8 text-rose-50" strokeWidth={2.1} />
                </div>
                <div className="min-w-0 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate max-w-[32ch]">
                      {event.name}
                    </h1>
                    <CategoryBadge category={event.category} size="lg" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-localis-event" />
                      <span className="font-mono text-foreground/90">
                        {formatBRShort(event.startDate)}
                      </span>
                      <span className="opacity-40">→</span>
                      <span className="font-mono text-foreground/90">
                        {formatBRShort(event.endDate)}
                      </span>
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed pt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 lg:shrink-0 flex-wrap">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-localis-event to-rose-600 hover:from-localis-event hover:to-rose-500 text-white shadow-lg shadow-rose-900/20"
                  onClick={() => setIssuing(true)}
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Emitir ingresso
                </Button>
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

          {/* Ocupação + criador */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {eventId ? (
                <EventCapacityCard eventId={eventId} />
              ) : null}
            </div>

            {/* Criador */}
            <Card className="rounded-3xl border-white/5 overflow-hidden">
              <CardHeader className="pb-4 pt-5 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-localis-event/10 text-localis-event ring-1 ring-localis-event/20">
                    <UserCircle2 className="h-3.5 w-3.5" />
                  </span>
                  Criado por
                </CardTitle>
                <CardDescription>Responsável pelo cadastro.</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {event.createdBy ? (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 flex items-start gap-3.5">
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-localis-event/30 via-localis-event/15 to-rose-900/15 ring-1 ring-white/5 grid place-items-center">
                      <UserCircle2 className="h-6 w-6 text-rose-300" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <p className="font-semibold tracking-tight truncate">
                        {event.createdBy.name}
                      </p>
                      <Link
                        href={`mailto:${event.createdBy.email}`}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground truncate max-w-[28ch]"
                      >
                        <AtSign className="h-3.5 w-3.5 text-localis-event shrink-0" />
                        <span className="font-mono truncate">{event.createdBy.email}</span>
                      </Link>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-localis-event/80 bg-localis-event/10 ring-1 ring-localis-event/20 rounded-full px-2 py-0.5 inline-block mt-1">
                        {event.createdBy.role || 'Usuário'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <EmptyBox
                    icon={<UserCircle2 className="h-5 w-5 text-muted-foreground" />}
                    title="Sem informações de criador"
                    description="Dados do criador não disponíveis."
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Local vinculado + Datas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Local vinculado */}
            <Card className="rounded-3xl border-white/5 lg:col-span-2 overflow-hidden">
              <CardHeader className="pb-4 pt-5 border-b border-border/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-localis-venue/10 text-localis-venue ring-1 ring-localis-venue/20">
                      <Building2 className="h-3.5 w-3.5" />
                    </span>
                    Local do evento
                  </CardTitle>
                  <CardDescription>Espaço onde a apresentação acontece.</CardDescription>
                </div>
                {event.venue?.id && (
                  <Link href={`/locais/${event.venue.id}`} className="shrink-0">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-localis-venue to-emerald-600 hover:from-localis-venue hover:to-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                    >
                      Ver local <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {event.venue ? (
                  <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-localis-venue/10 via-transparent to-transparent p-5 flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-localis-venue/70 via-localis-venue/50 to-emerald-900/50 ring-1 ring-white/10 grid place-items-center">
                      <MapPin className="h-7 w-7 text-emerald-100" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="font-bold text-lg tracking-tight truncate max-w-[28ch]">
                          {event.venue.name}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <Users className="h-3.5 w-3.5 text-localis-venue" />
                          Capacidade:{' '}
                          <span className="font-mono text-foreground">
                            {event.venue.capacity.toLocaleString('pt-BR')}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {event.venue.city && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-localis-venue" />
                            {event.venue.city}
                            {event.venue.state ? ` · ${event.venue.state}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyBox
                    icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
                    title="Local não informado"
                    description="Este evento não está vinculado a um local."
                  />
                )}
              </CardContent>
            </Card>

            {/* Datas e horários */}
            <Card className="rounded-3xl border-white/5 overflow-hidden">
              <CardHeader className="pb-4 pt-5 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-localis-event/10 text-localis-event ring-1 ring-localis-event/20">
                    <Clock className="h-3.5 w-3.5" />
                  </span>
                  Datas e horários
                </CardTitle>
                <CardDescription>Programação completa do evento.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <TimeBlock
                  icon={<CalendarDays className="h-4 w-4 text-localis-event" />}
                  label="Início"
                  value={formatBRDateTime(event.startDate)}
                />
                <TimeBlock
                  icon={<Clock className="h-4 w-4 text-localis-event" />}
                  label="Término"
                  value={formatBRDateTime(event.endDate)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Tipos de ingresso + Portões (Pilar 5) */}
          <EventTicketGateTabs venueId={event.venue?.id ?? null} />
        </>
      )}

      {/* Editar sheet */}
      <Sheet open={editing} onOpenChange={(o) => !o && setEditing(false)}>
        <SheetContent className="sm:max-w-xl flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-localis-event/70 to-rose-900/60">
                <Pencil className="h-4 w-4 text-rose-50" />
              </span>
              Editar evento
            </SheetTitle>
            <SheetDescription>
              Ajuste os dados do evento. Conflitos de agenda com outros eventos no
              mesmo local serão detectados após salvar.
            </SheetDescription>
          </SheetHeader>
          {event && (
            <UpdateEventForm
              initialData={event}
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
        title="Excluir evento"
        description={
          event ? (
            <>
              Tem certeza que deseja excluir{' '}
              <strong className="text-foreground">{event.name}</strong>? Essa ação
              não pode ser desfeita. Ingressos emitidos também serão removidos.
            </>
          ) : (
            ''
          )
        }
        itemLabel={event?.name ?? ''}
        confirmButtonLabel="Excluir evento"
        tone="danger"
        onConfirm={async () => {
          if (!event) return;
          await deleteEvent.mutateAsync(event.id);
        }}
      />

      {/* Emitir ingresso sheet */}
      {eventId ? (
        <IssueTicketSheet
          open={issuing}
          onOpenChange={setIssuing}
          eventId={eventId}
        />
      ) : null}
    </div>
  );
}

function TimeBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex items-start gap-3">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-localis-event/10 text-localis-event ring-1 ring-localis-event/20 grid place-items-center">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          {label}
        </p>
        <p className="font-mono text-sm font-semibold text-foreground leading-snug break-words">
          {value}
        </p>
      </div>
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
        <div className="h-56 rounded-3xl border border-white/5 bg-muted/10 animate-pulse lg:col-span-2" />
        <div className="h-56 rounded-3xl border border-white/5 bg-muted/10 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-48 rounded-3xl border border-white/5 bg-muted/10 animate-pulse lg:col-span-2" />
        <div className="h-48 rounded-3xl border border-white/5 bg-muted/10 animate-pulse" />
      </div>
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
          <PartyPopper className="h-6 w-6" />
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
